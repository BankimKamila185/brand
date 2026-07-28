"use client";

import { useEffect, useMemo, useState } from "react";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";

import { adminApi } from "@/lib/api";

const definitions = {
  products: { label: "Products", list: adminApi.products.list, create: adminApi.products.create, update: adminApi.products.update, remove: adminApi.products.remove, fields: ["title", "handle", "price"] },
  coupons: { label: "Coupons", list: adminApi.coupons.list, create: adminApi.coupons.create, update: adminApi.coupons.update, remove: adminApi.coupons.remove, fields: ["code", "value"] },
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
  if (value.slug) value.slug = slugify(value.slug);
  if (value.handle) value.handle = slugify(value.handle);
  if (resource === "products") return { title: value.title, handle: value.handle, variants: [{ title: "Default", price: Number(value.price), stock: 0 }] };
  if (resource === "coupons") return { code: value.code, discountType: "PERCENTAGE", value: Number(value.value) };
  return value;
}

export function AdminResourceTable({ resource }) {
  const definition = definitions[resource];
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const singular = resource === "categories" ? "category" : resource.slice(0, -1);

  const load = async () => {
    setLoading(true);
    try { const result = await definition.list(); setRows(result.data || []); setError(""); } catch (err) { setError(formatError(err)); } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [resource]);

  const columns = useMemo(() => [
    ...definition.fields.map((field) => ({ accessorKey: field, header: field.replace(/([A-Z])/g, " $1") })),
    { id: "actions", header: "Actions", cell: ({ row }) => <div className="flex justify-end gap-2"><button className="admin-table-action" onClick={async () => { const key = resource === "products" ? "title" : resource === "coupons" ? "code" : "name"; const next = window.prompt(`Update ${key}`, row.original[key]); if (next) { try { const payload = { [key]: next }; if (resource === "categories" && key === "name") payload.slug = slugify(next); if (resource === "collections" && key === "name") payload.handle = slugify(next); await definition.update(row.original.id, payload); void load(); } catch (err) { setError(formatError(err)); } } }} aria-label="Edit record"><Pencil className="size-4" /></button><button className="admin-table-action text-red-500 hover:border-red-200 hover:bg-red-50" onClick={async () => { if (window.confirm(`Delete this ${singular}?`)) { try { await definition.remove(row.original.id); void load(); } catch (err) { setError(formatError(err)); } } }} aria-label="Delete record"><Trash2 className="size-4" /></button></div> },
  ], [definition, resource, singular]);

  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="admin-resource-page">
      <header className="admin-page-heading"><div><p className="admin-eyebrow">Catalog manager</p><h1>{definition.label}</h1><p>Create, update, and organize your store&apos;s {definition.label.toLowerCase()}.</p></div><button className="admin-refresh-button" onClick={() => void load()}><RefreshCw className="size-4" /> Refresh</button></header>

      <section className="admin-create-card">
        <div><p className="admin-eyebrow">Quick create</p><h2>New {singular}</h2><p>Add the essential details now; you can refine them later.</p></div>
        <form className="admin-create-form" onSubmit={async (event) => { event.preventDefault(); try { await definition.create(rowData(resource, event.currentTarget)); event.currentTarget.reset(); void load(); } catch (err) { setError(formatError(err)); } }}>
          {definition.fields.map((field) => <label key={field}><span>{field.replace(/([A-Z])/g, " $1")}</span><input name={field} placeholder={`Enter ${field}`} required /></label>)}
          <button type="submit" className="admin-primary-button"><Plus className="size-4" /> Create {singular}</button>
        </form>
      </section>

      <section className="admin-table-card">
        <div className="admin-table-card-header"><div><p className="admin-eyebrow">Directory</p><h2>All {definition.label}</h2></div><span>{loading ? "Loading…" : `${rows.length} records`}</span></div>
        {error && <div className="admin-error-message">{error}</div>}
        <div className="admin-table-scroll"><table className="admin-resource-table"><thead>{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead><tbody>{loading ? <tr><td colSpan={columns.length} className="admin-table-empty">Loading your {definition.label.toLowerCase()}…</td></tr> : table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => <tr key={row.id}>{row.getVisibleCells().map((cell) => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>) : <tr><td colSpan={columns.length} className="admin-table-empty">No {definition.label.toLowerCase()} yet. Create your first one above.</td></tr>}</tbody></table></div>
      </section>
    </div>
  );
}

