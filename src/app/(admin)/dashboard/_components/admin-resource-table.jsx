"use client";

import { useEffect, useMemo, useState } from "react";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Pencil, Plus, RefreshCw, Trash2, X, Sparkles } from "lucide-react";
import { adminApi } from "@/lib/api";

const definitions = {
  products: { label: "Products", list: adminApi.products.list, create: adminApi.products.create, update: adminApi.products.update, remove: adminApi.products.remove, fields: ["title", "handle", "price"] },
  coupons: { label: "Coupons", list: adminApi.coupons.list, create: adminApi.coupons.create, update: adminApi.coupons.update, remove: adminApi.coupons.remove, fields: ["code", "value", "description"] },
  categories: { label: "Categories", list: adminApi.categories.list, create: adminApi.categories.create, update: adminApi.categories.update, remove: adminApi.categories.remove, fields: ["name", "slug"] },
  collections: { label: "Collections", list: adminApi.collections.list, create: adminApi.collections.create, update: adminApi.collections.update, remove: adminApi.collections.remove, fields: ["name", "handle"] },
};

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/^-+|-+$/g, "");
}

function formatError(err) {
  if (!err) return "";
  if (err.errors && typeof err.errors === "object") {
    const details = Object.entries(err.errors)
      .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
      .join("; ");
    if (details) return `${err.message || "Validation failed"} (${details})`;
  }
  return err.message || "An error occurred";
}

function rowData(resource, form) {
  const value = Object.fromEntries(new FormData(form));
  if (value.name && (!value.slug || !value.slug.trim())) {
    value.slug = slugify(value.name);
  } else if (value.slug) {
    value.slug = slugify(value.slug);
  }

  if (value.name && (!value.handle || !value.handle.trim())) {
    value.handle = slugify(value.name);
  } else if (value.handle) {
    value.handle = slugify(value.handle);
  }

  if (resource === "products") return { title: value.title, handle: value.handle || slugify(value.title), variants: [{ title: "Default", price: Number(value.price), stock: 0 }] };
  if (resource === "coupons") {
    return {
      code: value.code ? value.code.trim().toUpperCase() : "",
      discountType: value.discountType || "FLAT",
      value: Number(value.value),
      description: value.description ? value.description.trim() : null,
      isRecommended: value.isRecommended === "on" || value.isRecommended === "true" || value.isRecommended === true,
    };
  }
  return value;
}

export function AdminResourceTable({ resource }) {
  const definition = definitions[resource];
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingRow, setEditingRow] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const singular = resource === "categories" ? "category" : resource.slice(0, -1);

  const load = async () => {
    setLoading(true);
    try {
      const result = await definition.list();
      setRows(result.data || []);
      setError("");
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRecommend = async (id) => {
    try {
      await adminApi.coupons.toggleRecommend(id);
      await load();
    } catch (err) {
      setError(formatError(err));
    }
  };

  useEffect(() => {
    void load();
  }, [resource]);

  const columns = useMemo(() => {
    const baseCols = definition.fields.map((field) => ({
      accessorKey: field,
      header: field.replace(/([A-Z])/g, " $1"),
      cell: ({ getValue, row }) => {
        const val = getValue();
        if (resource === "coupons" && field === "code") {
          return (
            <span className="admin-coupon-code">
              {String(val)}
            </span>
          );
        }
        if (resource === "coupons" && field === "value") {
          const isFlat = row.original.discountType === "FLAT";
          const numVal = Number(val);
          return (
            <div className="admin-coupon-value">
              <span className="admin-coupon-value__amount">
                {isFlat ? `₹${numVal || val}` : `${numVal || val}%`}
              </span>
              <span className="admin-coupon-value__type">
                {isFlat ? "Flat Off" : "Discount"}
              </span>
            </div>
          );
        }
        if (resource === "coupons" && field === "description") {
          return val ? (
            <span className="admin-coupon-description">
              {String(val)}
            </span>
          ) : (
            <span className="admin-coupon-description is-empty">—</span>
          );
        }
        return (
          <span className="admin-table-value">
            {val !== undefined && val !== null && String(val).trim() !== "" ? String(val) : "—"}
          </span>
        );
      },
    }));

    if (resource === "coupons") {
      baseCols.push({
        id: "isRecommended",
        header: "Show in Cart?",
        cell: ({ row }) => {
          const isRec = Boolean(row.original.isRecommended);
          return (
            <button
              type="button"
              onClick={() => handleToggleRecommend(row.original.id)}
              className={`admin-coupon-status ${isRec ? "is-visible" : "is-hidden"}`}
              title={isRec ? "Click to hide from cart recommendations" : "Click to recommend in cart"}
            >
              <span className="admin-coupon-status__dot" />
              <span>{isRec ? "Visible in Cart" : "Hidden"}</span>
            </button>
          );
        },
      });
    }

    baseCols.push({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="admin-table-actions">
          <button
            type="button"
            className="admin-table-action"
            onClick={() => setEditingRow(row.original)}
            aria-label="Edit item"
            title="Edit item"
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            className="admin-table-action delete"
            onClick={async () => {
              if (window.confirm(`Delete this ${singular}?`)) {
                try {
                  await definition.remove(row.original.id);
                  void load();
                } catch (err) {
                  setError(formatError(err));
                }
              }
            }}
            aria-label="Delete record"
            title="Delete record"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ),
    });

    return baseCols;
  }, [definition, resource, singular]);

  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="admin-resource-page">
      <header className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">Catalog manager</p>
          <h1>{definition.label}</h1>
          <p>Create, update, and organize your store&apos;s {definition.label.toLowerCase()}.</p>
        </div>
        <button className="admin-refresh-button" onClick={() => void load()}>
          <RefreshCw className="size-4" /> Refresh
        </button>
      </header>

      <section className="admin-create-card">
        <div className="admin-create-header">
          <p className="admin-eyebrow">Quick create</p>
          <h2>New {singular}</h2>
          <p>Add the essential details now; you can refine them later.</p>
        </div>
        <form
          className="admin-create-form"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            try {
              const data = rowData(resource, form);
              await definition.create(data);
              if (form && typeof form.reset === "function") {
                form.reset();
              }
              await load();
            } catch (err) {
              setError(formatError(err));
            }
          }}
        >
          <div className="admin-create-fields">
            {resource === "coupons" && (
              <label className="admin-field-group">
                <span>Discount Type</span>
                <select
                  name="discountType"
                  defaultValue="FLAT"
                  className="admin-select"
                >
                  <option value="FLAT">Flat Amount (₹)</option>
                  <option value="PERCENTAGE">Percentage (%)</option>
                </select>
              </label>
            )}

            {definition.fields.map((field) => (
              <label key={field} className="admin-field-group">
                <span>{field === "value" && resource === "coupons" ? "Value (Amount / %)" : field.replace(/([A-Z])/g, " $1")}</span>
                <input
                  name={field}
                  placeholder={field === "value" && resource === "coupons" ? "e.g. 100 for ₹100 or 10 for 10%" : `Enter ${field}`}
                  required={field !== "description"}
                  className={resource === "coupons" && field === "code" ? "uppercase font-mono tracking-wider font-bold" : ""}
                />
              </label>
            ))}
          </div>

          <div className="admin-create-footer">
            {resource === "coupons" ? (
              <label className="admin-checkbox-row">
                <input
                  type="checkbox"
                  name="isRecommended"
                  defaultChecked={true}
                  className="admin-checkbox"
                />
                <Sparkles className="size-4 text-amber-500 shrink-0" />
                <span>Show in Cart & Recommend to Customers (1-Click Apply)</span>
              </label>
            ) : <div />}

            <button type="submit" className="admin-primary-button">
              <Plus className="size-4" /> Create {singular}
            </button>
          </div>
        </form>
      </section>

      <section className="admin-table-card">
        <div className="admin-table-card-header">
          <div>
            <p className="admin-eyebrow">Directory</p>
            <h2>All {definition.label}</h2>
          </div>
          <span>{loading ? "Loading…" : `${rows.length} records`}</span>
        </div>
        {error && <div className="admin-error-message">{error}</div>}
        <div className="admin-table-scroll">
          <table className="admin-resource-table">
            <thead>
              {table.getHeaderGroups().map((group) => (
                <tr key={group.id}>
                  {group.headers.map((header) => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="admin-table-empty">
                    Loading your {definition.label.toLowerCase()}…
                  </td>
                </tr>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="admin-table-empty">
                    No {definition.label.toLowerCase()} yet. Create your first one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ✏️ Edit Item Modal */}
      {editingRow && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setEditingRow(null)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-2 mb-1 text-neutral-900 dark:text-white font-extrabold text-lg">
              <Pencil className="size-5 text-[#df5c35]" />
              <h2>Edit item</h2>
            </div>
            <p className="text-xs text-neutral-500 mb-5">
              Update details for this {singular}. Click Save Changes when done.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSavingEdit(true);
                const formData = new FormData(e.currentTarget);
                const payload = Object.fromEntries(formData);

                if (payload.name && (!payload.slug || !payload.slug.trim())) {
                  payload.slug = slugify(payload.name);
                }
                if (payload.name && (!payload.handle || !payload.handle.trim())) {
                  payload.handle = slugify(payload.name);
                }
                if (resource === "coupons") {
                  if (payload.value) payload.value = Number(payload.value);
                  if (payload.code) payload.code = payload.code.trim().toUpperCase();
                  payload.isRecommended = formData.get("isRecommended") === "on";
                }
                if (resource === "products" && payload.price) {
                  payload.price = Number(payload.price);
                }

                try {
                  await definition.update(editingRow.id, payload);
                  setEditingRow(null);
                  void load();
                } catch (err) {
                  setError(formatError(err));
                } finally {
                  setSavingEdit(false);
                }
              }}
              className="flex flex-col gap-4"
            >
              {resource === "coupons" && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 capitalize">
                    Discount Type
                  </span>
                  <select
                    name="discountType"
                    defaultValue={editingRow.discountType || "FLAT"}
                    className="px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm outline-none focus:border-black dark:focus:border-white transition-colors"
                  >
                    <option value="FLAT">Flat Amount (₹)</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                  </select>
                </label>
              )}

              {definition.fields.map((field) => (
                <label key={field} className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 capitalize">
                    {field === "value" && resource === "coupons" ? "Value (Amount / %)" : field.replace(/([A-Z])/g, " $1")}
                  </span>
                  <input
                    name={field}
                    defaultValue={editingRow[field] || ""}
                    className={`px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm outline-none focus:border-black dark:focus:border-white transition-colors ${
                      resource === "coupons" && field === "code" ? "uppercase font-mono" : ""
                    }`}
                    required={field !== "description"}
                  />
                </label>
              ))}

              {resource === "coupons" && (
                <label className="flex items-center gap-2 text-xs font-bold text-neutral-800 dark:text-neutral-200 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    name="isRecommended"
                    defaultChecked={Boolean(editingRow.isRecommended)}
                    className="size-4 accent-black rounded cursor-pointer"
                  />
                  <span>Show in Cart & Recommend to Customers</span>
                </label>
              )}

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingRow(null)}
                  className="px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-bold rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2.5 bg-black text-white text-xs font-extrabold rounded-xl hover:bg-neutral-800 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {savingEdit ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
