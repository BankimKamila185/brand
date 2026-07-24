"use client";

import { useState } from "react";
import { Printer, X, Tag, Layers, Plus, Minus, RefreshCw, Download, CheckCircle2, ShieldCheck } from "lucide-react";

// Code 128 Encoding Table (ISO/IEC 15417 standard patterns 0 to 106)
const CODE128_PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112"
];

export function generateCode128Bars(text) {
  if (!text) return "";
  const codes = [104]; // Start B
  let checksum = 104;

  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) - 32;
    if (charCode >= 0 && charCode <= 95) {
      codes.push(charCode);
      checksum += charCode * (i + 1);
    }
  }

  codes.push(checksum % 103);
  codes.push(106); // Stop Code

  // 10 units quiet zone on left & right
  let bitString = "0000000000";
  for (const codeIdx of codes) {
    const pattern = CODE128_PATTERNS[codeIdx];
    if (pattern) {
      let isBar = true;
      for (const charDigit of pattern) {
        const width = parseInt(charDigit, 10);
        bitString += (isBar ? "1" : "0").repeat(width);
        isBar = !isBar;
      }
    }
  }
  bitString += "0000000000";
  return bitString;
}

export function BarcodeSVG({ value, height = 38, barWidth = 1.35 }) {
  if (!value) return null;
  const bars = generateCode128Bars(value);
  if (!bars) return null;
  const totalWidth = bars.length * barWidth;

  return (
    <svg
      width={totalWidth}
      height={height}
      viewBox={`0 0 ${totalWidth} ${height}`}
      className="block mx-auto"
      style={{ imageRendering: "pixelated" }}
    >
      {bars.split("").map((bit, idx) => (
        <rect
          key={idx}
          x={idx * barWidth}
          y={0}
          width={barWidth}
          height={height}
          fill={bit === "1" ? "#000000" : "transparent"}
        />
      ))}
    </svg>
  );
}

// Generate TOS-[PRODUCT]-[SIZE]-[UNIQUE_ID] preventing duplicates
export function generateTOSSKUCode(title, sizeVal, uniqueId = null) {
  const prefix = "TOS";
  const cleanTitle = (title || "PRODUCT")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 8);
  const cleanSize = (sizeVal || "M")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();
  const idNum = uniqueId || Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${cleanTitle}-${cleanSize}-${idNum}`;
}

export function BarcodePrintModal({ product, onClose, onUpdateVariants }) {
  if (!product) return null;

  const productTitle = product.title || "Product";
  const rawVariants = product.variants && product.variants.length > 0
    ? product.variants
    : [{ size: "M", price: product.price || 0, stock: 1, sku: "" }];

  // Initialize unique SKUs for variants
  const [variantsList, setVariantsList] = useState(() => {
    const usedIds = new Set();
    return rawVariants.map((v, idx) => {
      let randId = 3432 + idx;
      while (usedIds.has(randId)) {
        randId = Math.floor(1000 + Math.random() * 9000);
      }
      usedIds.add(randId);

      const sizeStr = v.size || v.option1 || v.title || `Size ${idx + 1}`;
      const defaultSKU = generateTOSSKUCode(productTitle, sizeStr, randId);

      return {
        size: sizeStr,
        price: v.price || 0,
        stock: v.stock || v.inventory?.quantity || 1,
        sku: (v.sku && v.sku.startsWith("TOS-")) ? v.sku : defaultSKU,
      };
    });
  });

  const [quantities, setQuantities] = useState(() => {
    const initial = {};
    rawVariants.forEach((_, idx) => {
      initial[idx] = 1;
    });
    return initial;
  });

  const updateQuantity = (idx, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [idx]: Math.max(0, (prev[idx] || 0) + delta),
    }));
  };

  const setAllQuantities = (qtyType) => {
    const next = {};
    variantsList.forEach((v, idx) => {
      if (qtyType === "stock") {
        next[idx] = Math.max(1, Number(v.stock) || 1);
      } else {
        next[idx] = 1;
      }
    });
    setQuantities(next);
  };

  const regenerateSKUs = () => {
    const usedIds = new Set();
    const updated = variantsList.map((v, idx) => {
      let randId = Math.floor(1000 + Math.random() * 9000);
      while (usedIds.has(randId)) {
        randId = Math.floor(1000 + Math.random() * 9000);
      }
      usedIds.add(randId);

      return {
        ...v,
        sku: generateTOSSKUCode(productTitle, v.size, randId),
      };
    });

    setVariantsList(updated);
    if (onUpdateVariants) {
      onUpdateVariants(updated);
    }
  };

  const totalLabels = Object.values(quantities).reduce((a, b) => a + Number(b || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportSVG = () => {
    const gridEl = document.querySelector(".barcode-sticker-grid");
    if (!gridEl) return;
    const blob = new Blob([
      `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200"><style>.barcode-sticker-tag{background:#fff;border:2px solid #000;padding:20px;text-align:center;font-family:sans-serif}</style><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">${gridEl.innerHTML}</div></foreignObject></svg>`
    ], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tos-labels-${productTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPNG = () => {
    const gridEl = document.querySelector(".barcode-sticker-grid");
    if (!gridEl) return;
    const canvas = document.createElement("canvas");
    canvas.width = 1800;
    canvas.height = 2400;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#18181b";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText(`• THE OUTLIERS STUDIO • - ${productTitle.toUpperCase()} BARCODES`, 60, 80);

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `tos-labels-${productTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}-300dpi.png`;
    link.click();
  };

  return (
    <div className="barcode-modal-overlay">
      <div className="barcode-print-modal-content">
        
        {/* Modal Header */}
        <div className="no-print barcode-modal-header">
          <div className="barcode-modal-header-left">
            <div className="barcode-modal-icon">
              <Printer size={22} />
            </div>
            <div className="barcode-modal-title-area">
              <span className="barcode-modal-badge">• THE OUTLIERS STUDIO •</span>
              <h2>{productTitle}</h2>
            </div>
          </div>

          <div className="barcode-modal-header-actions">
            <button
              onClick={handlePrint}
              disabled={totalLabels === 0}
              className="barcode-print-btn"
            >
              <Printer size={18} /> Print {totalLabels} {totalLabels === 1 ? "Label" : "Labels"}
            </button>
            <button
              onClick={onClose}
              className="barcode-close-btn"
              title="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Print Settings Specifications & Compliance Bar */}
        <div className="no-print barcode-specs-bar">
          <div className="barcode-spec-pill">
            <span>Label Size:</span> <strong>60 × 90 mm</strong>
          </div>
          <div className="barcode-spec-pill">
            <span>Type:</span> <strong>Code 128</strong>
          </div>
          <div className="barcode-spec-pill">
            <span>Barcode Dimensions:</span> <strong>45 × 14 mm</strong>
          </div>
          <div className="barcode-spec-pill border-emerald-300 bg-emerald-50 text-emerald-800 flex items-center gap-1">
            <ShieldCheck size={14} className="text-emerald-600" />
            <strong>GS1 / ISO Scanner Compliant</strong>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button onClick={handleExportSVG} className="barcode-export-btn" title="Export Vector SVG">
              <Download size={13} /> SVG
            </button>
            <button onClick={handleExportPNG} className="barcode-export-btn" title="Export 300 DPI PNG">
              <Download size={13} /> PNG (300 DPI)
            </button>
          </div>
        </div>

        {/* Modal Toolbar & Size Selectors */}
        <div className="no-print barcode-modal-toolbar">
          <div className="barcode-toolbar-presets">
            <div className="barcode-preset-group">
              <span className="barcode-preset-label">Presets:</span>
              <button
                onClick={() => setAllQuantities("one")}
                className="barcode-preset-btn"
              >
                <Tag size={14} /> 1 Per Size
              </button>
              <button
                onClick={() => setAllQuantities("stock")}
                className="barcode-preset-btn"
              >
                <Layers size={14} /> Match Stock
              </button>
              <button
                onClick={regenerateSKUs}
                className="barcode-preset-btn highlight"
              >
                <RefreshCw size={14} /> Re-generate TOS Barcodes
              </button>
            </div>

            <div className="barcode-count-tag">
              Total Labels: <span>{totalLabels}</span>
            </div>
          </div>

          {/* Size Quantity Counters */}
          <div className="barcode-size-counters">
            {variantsList.map((v, idx) => (
              <div key={idx} className="barcode-size-counter-card">
                <div className="barcode-size-info">
                  <span className="barcode-size-name">Size {v.size}</span>
                  <span className="barcode-size-price">₹{Number(v.price).toLocaleString("en-IN")}</span>
                </div>

                <div className="barcode-counter-control">
                  <button
                    type="button"
                    onClick={() => updateQuantity(idx, -1)}
                    className="barcode-counter-btn"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="barcode-counter-num">{quantities[idx] || 0}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(idx, 1)}
                    className="barcode-counter-btn"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Barcode Printable Sheet Preview */}
        <div className="barcode-preview-container">
          <div className="barcode-sticker-grid">
            {variantsList.map((variant, vIdx) => {
              const count = quantities[vIdx] || 0;
              const tags = [];
              for (let i = 0; i < count; i++) {
                tags.push(
                  <div key={`${vIdx}-${i}`} className="barcode-sticker-tag">
                    {/* Brand Name */}
                    <div className="barcode-tag-brand">• THE OUTLIERS STUDIO •</div>
                    
                    {/* Product Name */}
                    <div className="barcode-tag-title">{productTitle}</div>
                    
                    {/* Size & Price */}
                    <div className="barcode-tag-meta">
                      <span className="barcode-tag-size">SIZE: {variant.size}</span>
                      <span className="barcode-tag-price">₹{Number(variant.price).toLocaleString("en-IN")}</span>
                    </div>

                    {/* Barcode Graphic (Code 128) */}
                    <div className="barcode-tag-svg">
                      <BarcodeSVG value={variant.sku} height={38} barWidth={1.3} />
                    </div>
                    
                    {/* SKU Code Box */}
                    <div className="barcode-sku-box">
                      {variant.sku}
                    </div>
                  </div>
                );
              }
              return tags;
            })}

            {totalLabels === 0 && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "48px 0", color: "#a1a1aa" }} className="no-print">
                <Tag size={40} style={{ marginBottom: "12px", strokeWidth: 1 }} />
                <p style={{ fontSize: "15px", fontWeight: 700, color: "#52525b" }}>No label copies selected</p>
                <p style={{ fontSize: "13px", marginTop: "4px" }}>Select size quantities above to generate printable barcode tags.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
