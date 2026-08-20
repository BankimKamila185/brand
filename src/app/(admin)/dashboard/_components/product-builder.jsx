"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Plus, Trash2, Warehouse, X, Save, Printer, Zap } from "lucide-react";
import { adminApi } from "@/lib/api";
import { BarcodePrintModal, BarcodeSVG, generateTOSSKUCode } from "./barcode-print-modal";

const blankVariant = (size = "M") => ({ size, price: "", comparePrice: "", stock: "0", sku: "" });

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const fileToImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.82) =>
  new Promise((resolve) => {
    if (!file) return resolve({ src: "", altText: "" });
    if (typeof file === "string") return resolve({ src: file, altText: "" });
    if (file.src) return resolve(file);

    const fileName = file.name || "Product Image";
    const reader = new FileReader();

    reader.onload = (e) => {
      const rawBase64 = e.target.result;
      if (!rawBase64) return resolve({ src: "", altText: fileName });

      // For standard size images (< 2MB), bypass canvas compression to avoid empty 760-byte canvas bugs
      if (file.size && file.size < 2 * 1024 * 1024) {
        return resolve({ src: rawBase64, altText: fileName });
      }

      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;
          if (!width || !height) {
            return resolve({ src: rawBase64, altText: fileName });
          }
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", quality);

          // Verify canvas produced valid data (> 2000 characters)
          if (dataUrl && dataUrl.length > 2000) {
            return resolve({ src: dataUrl, altText: fileName });
          }
          resolve({ src: rawBase64, altText: fileName });
        } catch {
          resolve({ src: rawBase64, altText: fileName });
        }
      };
      img.onerror = () => resolve({ src: rawBase64, altText: fileName });
      img.src = rawBase64;
    };

    reader.onerror = () => resolve({ src: "", altText: fileName });
    reader.readAsDataURL(file);
  });

function normalizeImageUrl(src) {
  if (!src || typeof src !== "string") return "";
  if (src.includes(".r2.cloudflarestorage.com/")) {
    const parts = src.split(".r2.cloudflarestorage.com/");
    const filename = parts[1] || "";
    return `https://pub-41f23aca788f4f3d8eb5a286adbb6f8d.r2.dev/${filename}`;
  }
  return src;
}

export function ProductBuilder({ product, onCreated, onClose }) {
  const isEdit = !!product;

  const [title, setTitle] = useState("");
  const [handle, setHandle] = useState("");
  const [vendor, setVendor] = useState("The Outliers Studio");
  const [categoryId, setCategoryId] = useState("");
  const [productType, setProductType] = useState("");
  const [description, setDescription] = useState("");
  const [careInstructions, setCareInstructions] = useState("");
  const [manufacturerDetails, setManufacturerDetails] = useState("");
  const [variants, setVariants] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [galleryUrl, setGalleryUrl] = useState("");
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
    const baseRand = Math.floor(1000 + Math.random() * 8000);
    setVariants((prev) =>
      prev.map((v, idx) => ({
        ...v,
        sku: generateTOSSKUCode(title || "PRODUCT", v.size, baseRand + idx),
      }))
    );
  };

  const [initialData, setInitialData] = useState(null);

  // Initialize form states
  useEffect(() => {
    let active = true;
    const populate = (data) => {
      if (!data) return;
      setInitialData(data);
      setTitle(data.title || "");
      setHandle(data.handle || "");
      setVendor(data.vendor || "The Outliers Studio");
      setCategoryId(data.categoryId || data.category?.id || "");
      setProductType(data.productType || "");
      setDescription(data.description || "");
      setCareInstructions(data.careInstructions || "");
      setManufacturerDetails(data.manufacturerDetails || "");
      setIsActive(data.isActive !== false);

      if (data.collections && data.collections.length > 0) {
        setSelectedCollectionIds(
          data.collections.map((c) => c.collection?.id || c.collectionId).filter(Boolean)
        );
      } else {
        setSelectedCollectionIds([]);
      }
      
      if (data.variants && data.variants.length > 0) {
        const randBase = Math.floor(1000 + Math.random() * 8000);
        setVariants(
          data.variants.map((v, idx) => ({
            size: v.option1 || v.title,
            price: String(v.price),
            comparePrice: v.comparePrice ? String(v.comparePrice) : "",
            stock: String(v.inventory?.quantity || 0),
            sku: (v.sku && v.sku.startsWith("TOS-")) ? v.sku : generateTOSSKUCode(data.title, v.option1 || v.title, randBase + idx),
          }))
        );
      } else {
        setVariants([blankVariant("S"), blankVariant("M"), blankVariant("L")]);
      }

      if (data.images && data.images.length > 0) {
        setMainImage(data.images[0]);
        setGallery(data.images.slice(1));
      } else {
        setMainImage(null);
        setGallery([]);
      }
    };

    if (isEdit && product) {
      populate(product);
      if (product.id) {
        adminApi.products.getById(product.id).then((res) => {
          if (active && res?.data) {
            populate(res.data);
          }
        }).catch(() => {});
      }
    } else {
      setTitle("");
      setHandle("");
      setVendor("The Outliers Studio");
      setCategoryId("");
      setProductType("");
      setDescription("");
      setCareInstructions("");
      setManufacturerDetails("");
      setIsActive(true);
      setSelectedCollectionIds([]);
      setVariants([blankVariant("S"), blankVariant("M"), blankVariant("L")]);
      setMainImage(null);
      setGallery([]);
    }

    return () => { active = false; };
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

function formatError(err) {
  if (!err) return "";
  if (err.errors && typeof err.errors === "object") {
    const details = Object.entries(err.errors)
      .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
      .join("; ");
    if (details) return `${err.message || "Error"} (${details})`;
  }
  return err.message || "An error occurred";
}

  const [showConfirmSaveModal, setShowConfirmSaveModal] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);

  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (!mainImage) return setMessage("Please add a main product image.");
    if (!warehouseId)
      return setMessage("Select a warehouse to assign size-level stock.");

    for (const v of variants) {
      if (v.price === "" || isNaN(Number(v.price)) || Number(v.price) < 0) {
        return setMessage(`Please enter a valid price for size ${v.size || "variant"}.`);
      }
    }

    const formattedImages = [mainImage, ...gallery]
      .filter(Boolean)
      .map((img, idx) => ({
        src: typeof img === "string" ? img : img.src || "",
        altText: (typeof img === "object" && img?.altText) ? img.altText : title,
        position: idx + 1,
      }))
      .filter((img) => img.src);

    const payload = {
      title,
      handle: handle || slugify(title),
      description,
      careInstructions,
      manufacturerDetails,
      vendor,
      productType,
      categoryId: categoryId || undefined,
      collectionIds: selectedCollectionIds,
      isActive,
      tags: [],
      images: formattedImages,
      variants: variants.map((variant, idx) => ({
        title: variant.size || "Default",
        option1: variant.size || "Default",
        sku: (variant.sku && variant.sku.trim()) || generateTOSSKUCode(title || "PRODUCT", variant.size, 3432 + idx),
        price: Number(variant.price) || 0,
        comparePrice: variant.comparePrice ? Number(variant.comparePrice) : null,
        stock: Number(variant.stock) || 0,
        warehouseStocks: [
          { warehouseId, quantity: Number(variant.stock) || 0 },
        ],
      })),
      warehouseId,
    };

    setPendingPayload(payload);
    setShowConfirmSaveModal(true);
  };

  const executeSave = async () => {
    if (!pendingPayload) return;
    setShowConfirmSaveModal(false);
    setSaving(true);
    setMessage("");

    try {
      if (isEdit) {
        await adminApi.products.update(product.id, pendingPayload);
        setMessage("Product updated successfully.");
      } else {
        await adminApi.products.create({
          ...pendingPayload,
          handle: handle || slugify(title),
        });
        setMessage("Product created successfully.");
      }
      onCreated?.();
    } catch (error) {
      setMessage(formatError(error) || `Could not ${isEdit ? "update" : "create"} product.`);
    } finally {
      setSaving(false);
      setPendingPayload(null);
    }
  };

  const getChangedFields = () => {
    if (!isEdit || !initialData) {
      return [{ label: "New Product", from: "None", to: "Creation" }];
    }

    const changes = [];

    // Title
    if (title.trim() !== (initialData.title || "").trim()) {
      changes.push({
        label: "Title / Name",
        from: initialData.title || "Untitled",
        to: title || "Untitled",
      });
    }

    // Handle
    if (handle.trim() !== (initialData.handle || "").trim()) {
      changes.push({
        label: "URL Slug / Handle",
        from: initialData.handle || "—",
        to: handle || "—",
      });
    }

    // Category
    const initialCatId = initialData.categoryId || initialData.category?.id || "";
    if (categoryId !== initialCatId) {
      const oldCat = categories.find((c) => c.id === initialCatId)?.name || "Uncategorized";
      const newCat = categories.find((c) => c.id === categoryId)?.name || "Uncategorized";
      changes.push({
        label: "Category",
        from: oldCat,
        to: newCat,
      });
    }

    // Collection
    const initialColIds = (initialData.collections || [])
      .map((c) => c.collection?.id || c.collectionId)
      .filter(Boolean);
    if (JSON.stringify(selectedCollectionIds.sort()) !== JSON.stringify(initialColIds.sort())) {
      const oldColNames = collections.filter((c) => initialColIds.includes(c.id)).map((c) => c.name).join(", ") || "None";
      const newColNames = collections.filter((c) => selectedCollectionIds.includes(c.id)).map((c) => c.name).join(", ") || "None";
      changes.push({
        label: "Collection",
        from: oldColNames,
        to: newColNames,
      });
    }

    // Product Type
    if (productType.trim() !== (initialData.productType || "").trim()) {
      changes.push({
        label: "Product Type",
        from: initialData.productType || "None",
        to: productType || "None",
      });
    }

    // Brand / Vendor
    if (vendor.trim() !== (initialData.vendor || "The Outliers Studio").trim()) {
      changes.push({
        label: "Brand / Vendor",
        from: initialData.vendor || "None",
        to: vendor || "None",
      });
    }

    // Status
    const initialIsActive = initialData.isActive !== false;
    if (isActive !== initialIsActive) {
      changes.push({
        label: "Status",
        from: initialIsActive ? "Active" : "Draft/Hidden",
        to: isActive ? "Active" : "Draft/Hidden",
      });
    }

    // Description
    if (description.trim() !== (initialData.description || "").trim()) {
      changes.push({
        label: "Description",
        from: "Previous details",
        to: "Updated details",
      });
    }

    // Care Instructions
    if (careInstructions.trim() !== (initialData.careInstructions || "").trim()) {
      changes.push({
        label: "Care Instructions",
        from: "Previous instructions",
        to: "Updated instructions",
      });
    }

    // Manufacturer Details
    if (manufacturerDetails.trim() !== (initialData.manufacturerDetails || "").trim()) {
      changes.push({
        label: "Manufacturer Details",
        from: "Previous details",
        to: "Updated details",
      });
    }

    // Variants & Stock & Prices
    const initialVars = initialData.variants || [];
    let variantsChanged = false;
    if (variants.length !== initialVars.length) {
      variantsChanged = true;
    } else {
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        const iv = initialVars[i];
        if (
          !iv ||
          String(v.price) !== String(iv.price) ||
          String(v.stock) !== String(iv.inventory?.quantity || 0) ||
          v.size !== (iv.option1 || iv.title)
        ) {
          variantsChanged = true;
          break;
        }
      }
    }
    if (variantsChanged) {
      changes.push({
        label: "Variants, Stock & Prices",
        from: `${initialVars.length} variant(s)`,
        to: `${variants.length} variant(s)`,
      });
    }

    // Images
    const initialImgCount = (initialData.images || []).length;
    const currentImgCount = [mainImage, ...gallery].filter(Boolean).length;
    if (currentImgCount !== initialImgCount) {
      changes.push({
        label: "Product Images",
        from: `${initialImgCount} image(s)`,
        to: `${currentImgCount} image(s)`,
      });
    }

    return changes;
  };

  const changedFieldsList = getChangedFields();

  return (
    <form className="product-builder" onSubmit={handleFormSubmit}>
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
              Handle (URL Slug)
              <input
                value={handle}
                onChange={(e) => setHandle(slugify(e.target.value))}
                required
                placeholder="product-handle"
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

            <label className="wide">
              Description / Product Details
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                placeholder="Describe the piece, story, fabric, fit, and features."
              />
            </label>
            <label className="wide">
              Care Instructions
              <textarea
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
                rows="3"
                placeholder="e.g. Wash inside out with similar colors; Do not tumble dry; Do not iron on print."
              />
            </label>
            <label className="wide">
              Manufacturer Details
              <textarea
                value={manufacturerDetails}
                onChange={(e) => setManufacturerDetails(e.target.value)}
                rows="3"
                placeholder="e.g. Manufactured & Marketed by: House of Outliers Fashion Pvt Ltd, Ground Floor, HSR Layout, Bengaluru, 560102"
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
            <div className="flex flex-col gap-2">
              <label className="image-main-upload cursor-pointer">
                {mainImage ? (
                  <img
                    src={normalizeImageUrl(mainImage.src)}
                    alt="Main product"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%23a1a1aa' viewBox='0 0 24 24'%3E%3Cpath d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E";
                    }}
                  />
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
            </div>

            <div>
              <div className="image-preview-grid">
                {gallery.map((image, index) => (
                  <div key={index} className="image-preview">
                    <img
                      src={normalizeImageUrl(image.src)}
                      alt="Gallery item"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%23a1a1aa' viewBox='0 0 24 24'%3E%3Cpath d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E";
                      }}
                    />
                    <button
                      type="button"
                      style={{ zIndex: 10 }}
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
                <div className="flex flex-col gap-2 mt-3">
                  <label className="image-gallery-upload cursor-pointer">
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
                </div>
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
              <span>Selling Price (₹)</span>
              <span>MRP (₹)</span>
              <span>Quantity</span>
              <span />
            </div>
            {variants.map((variant, index) => (
              <div key={index}>
                <input
                  value={variant.size}
                  onChange={(e) => updateVariant(index, "size", e.target.value)}
                  placeholder="Size"
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
                      onClick={() => updateVariant(index, "sku", generateTOSSKUCode(title || "PRODUCT", variant.size, 3432 + index))}
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
                  min="0"
                  value={variant.price}
                  onChange={(e) => updateVariant(index, "price", e.target.value)}
                  placeholder="Selling Price"
                  required
                />
                <input
                  type="number"
                  min="0"
                  value={variant.comparePrice}
                  onChange={(e) => updateVariant(index, "comparePrice", e.target.value)}
                  placeholder="MRP (Original)"
                />
                <input
                  type="number"
                  min="0"
                  value={variant.stock}
                  onChange={(e) => updateVariant(index, "stock", e.target.value)}
                  placeholder="Qty"
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
          product={{ title: title || "Product", productType, variants }}
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

      {/* Save Product Confirmation Modal (Yes / No with List of Changes) */}
      {showConfirmSaveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-neutral-100 flex flex-col items-center text-center gap-5 max-h-[85vh] overflow-y-auto">
            <div className="w-14 h-14 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-md flex-shrink-0">
              <Save className="w-7 h-7" />
            </div>

            <div className="flex flex-col gap-1 w-full">
              <h3 className="text-xl font-extrabold text-neutral-900">
                Confirm Product Changes
              </h3>
              <p className="text-xs text-neutral-500 font-medium">
                Do you want to save changes to product <strong className="text-neutral-900 font-bold">&quot;{title || "Untitled Product"}&quot;</strong>?
              </p>
            </div>

            {/* List of Modified Fields */}
            <div className="w-full bg-neutral-50 rounded-2xl p-4 border border-neutral-200/80 text-left flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Summary of Changes ({changedFieldsList.length}):
              </span>

              {changedFieldsList.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">No field values were modified.</p>
              ) : (
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                  {changedFieldsList.map((change, idx) => (
                    <div key={idx} className="flex flex-col text-xs bg-white p-2.5 rounded-xl border border-neutral-200/60 shadow-sm gap-0.5">
                      <span className="font-bold text-neutral-900 text-[11px] uppercase tracking-wider">{change.label}</span>
                      <div className="flex items-center gap-2 text-neutral-600 text-xs">
                        <span className="line-through text-neutral-400 font-medium">{change.from}</span>
                        <span className="text-neutral-400 font-bold">&rarr;</span>
                        <span className="font-bold text-emerald-600">{change.to}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full mt-1 select-none">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmSaveModal(false);
                  setPendingPayload(null);
                }}
                className="flex-1 py-3 px-4 rounded-xl border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                No, Cancel
              </button>
              <button
                type="button"
                onClick={executeSave}
                className="flex-1 py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md cursor-pointer"
              >
                Yes, Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
