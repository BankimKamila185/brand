"use client";

import { useEffect, useState } from "react";
import { MapPin, Pencil, Plus, Trash2, Warehouse, X } from "lucide-react";
import { adminApi } from "@/lib/api";

export function WarehouseManager() {
  const [warehouses, setWarehouses] = useState([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");

  // Edit Modal State
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const load = async () => {
    try {
      const result = await adminApi.warehouses.list();
      setWarehouses(result.data || []);
    } catch (error) {
      setMessage(error.message || "Could not load warehouses.");
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const create = async (event) => {
    event.preventDefault();
    try {
      await adminApi.warehouses.create({
        name,
        code: code.toUpperCase(),
        address: address || undefined,
      });
      setName("");
      setCode("");
      setAddress("");
      setMessage("Warehouse added successfully.");
      void load();
    } catch (error) {
      setMessage(error.message || "Could not create warehouse.");
    }
  };

  const startEditing = (warehouse) => {
    setEditingWarehouse(warehouse);
    setEditName(warehouse.name || "");
    setEditCode(warehouse.code || "");
    setEditAddress(warehouse.address || "");
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editingWarehouse) return;
    setSavingEdit(true);
    try {
      await adminApi.warehouses.update(editingWarehouse.id, {
        name: editName,
        code: editCode.toUpperCase(),
        address: editAddress || undefined,
      });
      setMessage("Warehouse updated successfully.");
      setEditingWarehouse(null);
      void load();
    } catch (error) {
      setMessage(error.message || "Could not update warehouse.");
    } finally {
      setSavingEdit(false);
    }
  };

  const removeWarehouse = async (id, warehouseName) => {
    if (!window.confirm(`Are you sure you want to delete warehouse "${warehouseName}"?`)) {
      return;
    }
    try {
      await adminApi.warehouses.remove(id);
      setMessage("Warehouse deleted.");
      void load();
    } catch (error) {
      setMessage(error.message || "Could not delete warehouse.");
    }
  };

  return (
    <div className="warehouse-manager">
      <header className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">Inventory locations</p>
          <h1>Warehouses</h1>
          <p>See how much product is available in each warehouse.</p>
        </div>
      </header>

      {message && <p className="product-builder-message mb-4">{message}</p>}

      <section className="warehouse-create-card">
        <div>
          <Warehouse />
          <h2>Add warehouse</h2>
          <p>Create a stock location before assigning quantities to a product.</p>
        </div>
        <form onSubmit={create}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Warehouse name"
            required
          />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Code, e.g. BLR-01"
            required
          />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address (optional)"
          />
          <button className="admin-primary-button">
            <Plus className="size-4" /> Add warehouse
          </button>
        </form>
      </section>

      <section className="warehouse-grid">
        {warehouses.map((warehouse) => {
          const total =
            warehouse.stocks?.reduce((sum, stock) => sum + stock.quantity, 0) || 0;
          return (
            <article key={warehouse.id} className="warehouse-card relative">
              <header className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <i>
                    <Warehouse />
                  </i>
                  <div>
                    <h2>{warehouse.name}</h2>
                    <span>{warehouse.code}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <strong className="text-sm font-bold text-neutral-800 mr-1">{total} units</strong>
                  <button
                    type="button"
                    onClick={() => startEditing(warehouse)}
                    className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-700 transition-colors cursor-pointer"
                    aria-label="Edit warehouse"
                    title="Edit warehouse"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeWarehouse(warehouse.id, warehouse.name)}
                    className="p-1.5 rounded-lg border border-neutral-200 hover:bg-red-50 hover:border-red-200 text-red-600 transition-colors cursor-pointer"
                    aria-label="Delete warehouse"
                    title="Delete warehouse"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </header>

              {warehouse.address && (
                <p className="mt-2 text-xs text-neutral-600 flex items-center gap-1">
                  <MapPin className="size-3.5" /> {warehouse.address}
                </p>
              )}

              <div className="warehouse-stock-list mt-3">
                {warehouse.stocks?.length ? (
                  warehouse.stocks.map((stock) => (
                    <div key={stock.id} className="flex justify-between text-xs py-1">
                      <span>
                        {stock.variant.product.title} ·{" "}
                        {stock.variant.option1 || stock.variant.title}
                      </span>
                      <b>{stock.quantity}</b>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-neutral-400 italic">No stock assigned yet.</span>
                )}
              </div>
            </article>
          );
        })}

        {!warehouses.length && (
          <div className="product-catalog-empty">
            <Warehouse />
            <h2>No warehouses yet</h2>
            <p>Add your first location to start tracking quantities.</p>
          </div>
        )}
      </section>

      {/* Edit Warehouse Modal */}
      {editingWarehouse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-neutral-100 flex flex-col gap-5 relative">
            <button
              type="button"
              onClick={() => setEditingWarehouse(null)}
              className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-md">
                <Warehouse className="size-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-neutral-900">
                  Edit Warehouse
                </h3>
                <p className="text-xs text-neutral-500 font-medium">
                  Update location details for {editingWarehouse.code}
                </p>
              </div>
            </div>

            <form onSubmit={saveEdit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1 text-xs font-bold text-neutral-700">
                Warehouse Name
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Bengaluru Central Hub"
                  required
                  className="p-3 rounded-xl border border-neutral-300 text-sm outline-none focus:border-neutral-900 transition-colors"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-bold text-neutral-700">
                Location Code
                <input
                  type="text"
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                  placeholder="e.g. BLR-01"
                  required
                  className="p-3 rounded-xl border border-neutral-300 text-sm uppercase outline-none focus:border-neutral-900 transition-colors"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-bold text-neutral-700">
                Address (Optional)
                <textarea
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Street, City, State, Pincode"
                  rows="3"
                  className="p-3 rounded-xl border border-neutral-300 text-sm outline-none focus:border-neutral-900 transition-colors"
                />
              </label>

              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingWarehouse(null)}
                  className="flex-1 py-3 px-4 rounded-xl border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md cursor-pointer disabled:opacity-50"
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
