"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Plus, Trash2, Warehouse, X, Save } from "lucide-react";
import { adminApi } from "@/lib/api";

const blankVariant = (size = "M") => ({ size, price: "", stock: "0", sku: "" });
const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const CODE39_ENCODINGS = {
  '0': '101001101101', '1': '110100101011', '2': '101100101011', '3': '110110010101',
  '4': '101001101011', '5': '110100110101', '6': '101100110101', '7': '101001011011',
  '8': '110100101101', '9': '101100101101', 'A': '110101001011', 'B': '101101001011',
  'C': '110110100101', 'D': '101011001011', 'E': '110101100101', 'F': '101101100101',
  'G': '101010011011', 'H': '110101001101', 'I': '101101001101', 'J': '101011001101',
  'K': '110101010011', 'L': '101101010011', 'M': '110110101001', 'N': '101011010011',
  'O': '110101101001', 'P': '101101101001', 'Q': '101010110011', 'R': '110101011001',
  'S': '101101011001', 'T': '101011011001', 'U': '110010101011', 'V': '100110101011',
  'W': '110011010101', 'X': '100101101011', 'Y': '110010110101', 'Z': '100110110101',
  '-': '100101011011', '.': '110010101101', ' ': '100110101101', '*': '100101101101',
  '$': '100100100101', '/': '100100101001', '+': '100101001001', '%': '101001001001'
};

function generateCode39Bars(text) {
  const sanitized = ("*" + text.toUpperCase().replace(/[^A-Z0-9\-\.\ \$\/\+\%]/g, "") + "*").split("");
  let bitString = "";
  for (const char of sanitized) {
    const pattern = CODE39_ENCODINGS[char];
    if (pattern) {
      bitString += pattern + "0";
    }
  }
  return bitString;
}

function BarcodeSVG({ value }) {
  if (!value) return null;
  const bars = generateCode39Bars(value);
  const barWidth = 1.0;
  const height = 24;
  const totalWidth = bars.length * barWidth;

  return (
    <svg width={totalWidth} height={height} className="mt-1 block">
      {bars.split("").map((bit, idx) => (
        <rect
          key={idx}
          x={idx * barWidth}
          y={0}
          width={barWidth}
          height={height}
          fill={bit === "1" ? "#000" : "transparent"}
        />
      ))}
    </svg>
  );
}

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
          product.variants.map((v) => ({
            size: v.option1 || v.title,
            price: String(v.price),
            stock: String(v.inventory?.quantity || 0),
            sku: v.sku || "",
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
            <label className="wide">
              Collections
              <div className="flex flex-wrap gap-4 mt-1.5 p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg">
                {collections.map((col) => {
                  const isChecked = selectedCollectionIds.includes(col.id);
                  return (
                    <label key={col.id} className="flex items-center gap-2 text-sm font-semibold text-neutral-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSelectedCollectionIds((prev) =>
                            isChecked ? prev.filter((id) => id !== col.id) : [...prev, col.id]
                          );
                        }}
                        className="rounded border-neutral-300 text-[#df5c35] focus:ring-[#df5c35] h-4 w-4"
                      />
                      <span>{col.name}</span>
                    </label>
                  );
                })}
                {collections.length === 0 && (
                  <span className="text-neutral-400 text-xs">No collections configured</span>
                )}
              </div>
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
                  <strong>Main image</strong>
                  <span>Required</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => void setPrimaryImage(e.target.files)}
              />
            </label>
            <div className="image-preview-grid">
              {gallery.map((image, index) => (
                <div key={image.src} className="image-preview">
                  <img src={image.src} alt={image.altText} />
                  <button
                    type="button"
                    onClick={() =>
                      setGallery((current) =>
                        current.filter((_, i) => i !== index)
                      )
                    }
                  >
                    <Trash2 />
                  </button>
                </div>
              ))}
              {gallery.length < 8 && (
                <label className="image-gallery-upload">
                  <ImagePlus />
                  <span>Add image</span>
                  <small>{gallery.length}/8</small>
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
            <button
              type="button"
              className="admin-refresh-button"
              onClick={() => setVariants((current) => [...current, blankVariant("")])}
            >
              <Plus /> Add size
            </button>
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
              <span>SKU</span>
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
                      placeholder="Optional SKU"
                      className="flex-grow"
                    />
                    <button
                      type="button"
                      title="Generate SKU & Barcode"
                      onClick={() => updateVariant(index, "sku", generateRandomSKU(variant.size))}
                      className="admin-refresh-button shrink-0"
                      style={{ height: "38px", width: "38px", padding: 0, minWidth: 0, justifyContent: "center" }}
                    >
                      ⚡
                    </button>
                  </div>
                  {variant.sku && (
                    <div className="flex flex-col items-center mt-1 bg-white p-1 border border-neutral-200 rounded">
                      <BarcodeSVG value={variant.sku} />
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
    </form>
  );
}
