"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Plus, Trash2, Warehouse, X, Save, Printer, Zap } from "lucide-react";
import { adminApi } from "@/lib/api";
import { BarcodePrintModal, BarcodeSVG, generateSKUCode } from "./barcode-print-modal";

const blankVariant = (size = "M") => ({ size, price: "", stock: "0", sku: "" });
const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const fileToImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ src: reader.result, altText: file.name });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export function ProductBuilder({ product, onCreated, onClose }) {
  const isEdit = !!product;

  const generateRandomSKU = (sizeVal) => {
    const prefix = "TEVAR";
    const titleSlug = title ? slugify(title).slice(0, 8).toUpperCase() : "PROD";
    const sizePart = sizeVal ? sizeVal.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() : "M";
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${titleSlug}-${sizePart}-${rand}`;
  };

  const [title, setTitle] = useState("");
  const [handle, setHandle] = useState("");
  const [vendor, setVendor] = useState("The Outliers Studio");
  const [categoryId, setCategoryId] = useState("");
  const [productType, setProductType] = useState("");
  const [description, setDescription] = useState("");
  const [variants, setVariants] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [warehouseId, setWarehouseId] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);

  const autoGenerateAllSKUs = () => {
    setVariants((prev) =>
      prev.map((v, idx) => ({
        ...v,
        sku: generateSKUCode(title || "PRODUCT", v.size, idx),
      }))
    );
  };

  // Initialize form states
  useEffect(() => {
    if (isEdit && product) {
      setTitle(product.title || "");
      setHandle(product.handle || "");
      setVendor(product.vendor || "The Outliers Studio");
      setCategoryId(product.categoryId || product.category?.id || "");
      setProductType(product.productType || "");
      setDescription(product.description || "");
      setIsActive(product.isActive !== false);

      if (product.collections && product.collections.length > 0) {
        setSelectedCollectionIds(
          product.collections.map((c) => c.collection?.id || c.collectionId).filter(Boolean)
        );
      } else {
        setSelectedCollectionIds([]);
      }
      
      if (product.variants && product.variants.length > 0) {
        setVariants(
          product.variants.map((v, idx) => ({
            size: v.option1 || v.title,
            price: String(v.price),
            stock: String(v.inventory?.quantity || 0),
            sku: v.sku || generateSKUCode(product.title, v.option1 || v.title, idx),
          }))
        );
      } else {
        setVariants([blankVariant("S"), blankVariant("M"), blankVariant("L")]);
      }

      if (product.images && product.images.length > 0) {
        setMainImage(product.images[0]);
        setGallery(product.images.slice(1));
      } else {
        setMainImage(null);
        setGallery([]);
      }
    } else {
      setTitle("");
      setHandle("");
      setVendor("The Outliers Studio");
      setCategoryId("");
      setProductType("");
      setDescription("");
      setIsActive(true);
      setSelectedCollectionIds([]);
      setVariants([blankVariant("S"), blankVariant("M"), blankVariant("L")]);
      setMainImage(null);
      setGallery([]);
    }
  }, [product, isEdit]);

  // Load warehouses, categories and collections
  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        const [warehouseResult, categoryResult, collectionResult] = await Promise.all([
          adminApi.warehouses.list(),
          adminApi.categories.list(),
          adminApi.collections.list(),
        ]);
        const nextWarehouses = warehouseResult.data || [];
        setWarehouses(nextWarehouses);
        setWarehouseId(nextWarehouses[0]?.id || "");
        setCategories(categoryResult.data || []);
        setCollections(collectionResult.data || []);
      } catch {
        setMessage(
          "Unable to load catalog setup. Create a warehouse before assigning inventory."
        );
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const setPrimaryImage = async (files) => {
    if (files?.[0]) setMainImage(await fileToImage(files[0]));
  };

  const addGallery = async (files) => {
    const remaining = 8 - gallery.length;
    const next = await Promise.all(
      [...files].slice(0, remaining).map(fileToImage)
    );
    setGallery((current) => [...current, ...next]);
  };

  const updateVariant = (index, field, value) =>
    setVariants((current) =>
      current.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      )
    );

  const handleDeleteProduct = async () => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      await adminApi.products.remove(product.id);
      setMessage("Product deleted successfully.");
      onCreated?.();
    } catch (error) {
      setMessage(error.message || "Could not delete product.");
    } finally {
      setSaving(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!mainImage) return setMessage("Please add a main product image.");
    if (!warehouseId)
      return setMessage("Select a warehouse to assign size-level stock.");

    setSaving(true);
    setMessage("");

    const payload = {
      title,
      description,
      vendor,
      productType,
      categoryId: categoryId || undefined,
      collectionIds: selectedCollectionIds,
      isActive,
      tags: [],
      images: [mainImage, ...gallery],
      variants: variants.map((variant) => ({
        title: variant.size,
        option1: variant.size,
        sku: variant.sku || undefined,
        price: Number(variant.price),
        stock: Number(variant.stock),
        warehouseStocks: [
          { warehouseId, quantity: Number(variant.stock) },
        ],
      })),
      warehouseId,
    };

    try {
      if (isEdit) {
        await adminApi.products.update(product.id, payload);
        setMessage("Product updated successfully.");
      } else {
        await adminApi.products.create({
          ...payload,
          handle: handle || slugify(title),
        });
        setMessage("Product created successfully.");
      }
      onCreated?.();
    } catch (error) {
      setMessage(error.message || `Could not ${isEdit ? "update" : "create"} product.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="product-builder" onSubmit={submit}>
      <header className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">Catalog studio</p>
          <h1>{isEdit ? "Edit product" : "Add product"}</h1>
          <p>Set category, imagery, size-level prices, and stock location.</p>
        </div>
        <div className="product-builder-header-actions flex gap-2">
          <button
            className="admin-refresh-button flex items-center gap-1.5"
            type="button"
            onClick={() => setShowBarcodeModal(true)}
            title="Print Barcode Labels"
          >
            <Printer size={16} /> Barcode Labels
          </button>
          {isEdit && (
            <button
              className="admin-refresh-button text-red-600 border-red-200 hover:bg-red-50"
              type="button"
              onClick={handleDeleteProduct}
              disabled={saving}
            >
              <Trash2 size={16} /> Delete
            </button>
          )}
          {onClose && (
            <button className="admin-refresh-button" type="button" onClick={onClose}>
              <X size={16} /> Cancel
            </button>
          )}
          <button className="admin-primary-button" disabled={saving} type="submit">
            {saving ? (
              isEdit ? "Saving…" : "Creating…"
            ) : (
              <><Save size={16} /> {isEdit ? "Save product" : "Create product"}</>
            )}
          </button>
        </div>
      </header>

      {message && <p className="product-builder-message">{message}</p>}

      <div className="product-builder-grid">
        <section className="product-builder-card">
          <h2>Product details</h2>
          <div className="product-builder-fields">
            <label>
              Product name
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!handle && !isEdit) setHandle(slugify(e.target.value));
                }}
                required
              />
            </label>
            <label>
              Handle
              <input
                value={handle}
                onChange={(e) => setHandle(slugify(e.target.value))}
                required
                disabled={isEdit}
                title={isEdit ? "Handle cannot be changed after creation" : ""}
              />
            </label>
            <label>
              Category
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Choose a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Collections
              <select
                value={selectedCollectionIds[0] || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedCollectionIds(val ? [val] : []);
                }}
              >
                <option value="">Choose a collection</option>
                {collections.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Product type
              <input
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                placeholder="T-shirt, shirt…"
              />
            </label>
            <label>
              Brand
              <input
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                required
              />
            </label>
            <label className="wide">
              Description
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                placeholder="Describe the piece, fabric, fit, and care."
              />
            </label>
            <label className="wide flex flex-row items-center gap-2 cursor-pointer py-1.5 select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-neutral-300 text-[#df5c35] focus:ring-[#df5c35] h-4 w-4"
              />
              <span className="text-sm font-bold text-neutral-800">
                Visible in Shop (Active Status)
              </span>
            </label>
          </div>
        </section>

        <section className="product-builder-card">
          <div className="product-builder-card-title">
            <div>
              <h2>Product images</h2>
              <p>One main image and up to eight additional images.</p>
            </div>
          </div>
          <div className="image-upload-sections">
            <label className="image-main-upload">
              {mainImage ? (
                <img src={mainImage.src} alt="Main product" />
              ) : (
                <>
                  <ImagePlus />
                  <strong>Main product image</strong>
                  <span>Click to select file</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => void setPrimaryImage(e.target.files)}
              />
            </label>

            <div>
              <div className="image-preview-grid">
                {gallery.map((image, index) => (
                  <div key={index} className="image-preview">
                    <img src={image.src} alt={image.altText || `Gallery image ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() =>
                        setGallery((current) =>
                          current.filter((_, i) => i !== index)
                        )
                      }
                      aria-label="Remove image"
                    >
                      <Trash2 />
                    </button>
                  </div>
                ))}
              </div>

              {gallery.length < 8 && (
                <label className="image-gallery-upload mt-3">
                  <ImagePlus />
                  <span>Add gallery images</span>
                  <small>Up to {8 - gallery.length} more images</small>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => void addGallery(e.target.files)}
                  />
                </label>
              )}
            </div>
          </div>
        </section>

        <section className="product-builder-card product-variants">
          <div className="product-builder-card-title">
            <div>
              <h2>Size, price & quantity</h2>
              <p>Every size can have its own price and available quantity.</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                className="admin-refresh-button text-[#df5c35] border-[#df5c35]/30 hover:bg-[#fff0ea]"
                onClick={autoGenerateAllSKUs}
                title="Auto-generate SKUs for all sizes at once"
              >
                <Zap size={14} /> Auto-SKUs
              </button>
              <button
                type="button"
                className="admin-refresh-button"
                onClick={() => setShowBarcodeModal(true)}
                title="Generate & Print Barcodes"
              >
                <Printer size={14} /> Print Barcodes
              </button>
              <button
                type="button"
                className="admin-refresh-button"
                onClick={() => setVariants((current) => [...current, blankVariant("")])}
              >
                <Plus size={14} /> Add size
              </button>
            </div>
          </div>
          <div className="warehouse-select">
            <Warehouse />
            <label>
              Warehouse for this stock
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                required
              >
                <option value="">Choose warehouse</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name} ({warehouse.code})
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="variant-table">
            <div>
              <span>Size</span>
              <span>SKU / Code</span>
              <span>Price (₹)</span>
              <span>Quantity</span>
              <span />
            </div>
            {variants.map((variant, index) => (
              <div key={index}>
                <input
                  value={variant.size}
                  onChange={(e) => updateVariant(index, "size", e.target.value)}
                  required
                />
                <div className="flex flex-col gap-1">
                  <div className="flex gap-1 items-center">
                    <input
                      value={variant.sku}
                      onChange={(e) => updateVariant(index, "sku", e.target.value)}
                      placeholder="Product Barcode Code"
                      className="flex-grow font-mono text-xs"
                    />
                    <button
                      type="button"
                      title="Auto-generate Product Barcode Code"
                      onClick={() => updateVariant(index, "sku", generateSKUCode(title || "PRODUCT", variant.size, index))}
                      className="admin-refresh-button shrink-0 text-[#df5c35]"
                      style={{ height: "38px", width: "38px", padding: 0, minWidth: 0, justifyContent: "center" }}
                    >
                      ⚡
                    </button>
                  </div>
                  {variant.sku && (
                    <div className="flex flex-col items-center mt-1 bg-white p-1 border border-neutral-200 rounded">
                      <BarcodeSVG value={variant.sku} height={24} barWidth={1.0} />
                      <span className="text-[8px] text-neutral-500 font-mono mt-0.5">{variant.sku}</span>
                    </div>
                  )}
                </div>
                <input
                  type="number"
                  min="1"
                  value={variant.price}
                  onChange={(e) => updateVariant(index, "price", e.target.value)}
                  required
                />
                <input
                  type="number"
                  min="0"
                  value={variant.stock}
                  onChange={(e) => updateVariant(index, "stock", e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setVariants((current) =>
                      current.filter((_, i) => i !== index)
                    )
                  }
                  aria-label="Remove size"
                >
                  <Trash2 />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {showBarcodeModal && (
        <BarcodePrintModal
          product={{ title: title || "Product", variants }}
          onClose={() => setShowBarcodeModal(false)}
          onUpdateVariants={(updatedVariants) => {
            setVariants((prev) =>
              prev.map((v, idx) => ({
                ...v,
                sku: updatedVariants[idx]?.sku || v.sku,
              }))
            );
          }}
        />
      )}
    </form>
  );
}
