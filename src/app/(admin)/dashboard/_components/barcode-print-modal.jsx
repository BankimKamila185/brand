"use client";

import { useState } from "react";
import { Printer, X, Tag, Layers, Plus, Minus, RefreshCw } from "lucide-react";

// Code 39 Barcode Generator Table
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

export function generateCode39Bars(text) {
  if (!text) return "";
  const sanitized = ("*" + String(text).toUpperCase().replace(/[^A-Z0-9\-\.\ \$\/\+\%]/g, "") + "*").split("");
  let bitString = "";
  for (const char of sanitized) {
    const pattern = CODE39_ENCODINGS[char];
    if (pattern) {
      bitString += pattern + "0";
    }
  }
  return bitString;
}

export function BarcodeSVG({ value, height = 36, barWidth = 1.25 }) {
  if (!value) return null;
  const bars = generateCode39Bars(value);
  if (!bars) return null;
  const totalWidth = bars.length * barWidth;

  return (
    <svg width={totalWidth} height={height} viewBox={`0 0 ${totalWidth} ${height}`} className="block mx-auto">
      {bars.split("").map((bit, idx) => (
        <rect
          key={idx}
          x={idx * barWidth}
          y={0}
          width={barWidth}
          height={height}
          fill={bit === "1" ? "#18181b" : "transparent"}
        />
      ))}
    </svg>
  );
}

export function generateSKUCode(title, sizeVal, index = 0) {
  const prefix = "TVR";
  const cleanTitle = (title || "PRODUCT")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 6);
  const cleanSize = (sizeVal || "M")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${cleanTitle}-${cleanSize}-${randNum}`;
}

export function BarcodePrintModal({ product, onClose, onUpdateVariants }) {
  if (!product) return null;

  const productTitle = product.title || "Product";
  const rawVariants = product.variants && product.variants.length > 0
    ? product.variants
    : [{ size: "M", price: product.price || 0, stock: 1, sku: "" }];

  const [variantsList, setVariantsList] = useState(() => {
    return rawVariants.map((v, idx) => ({
      size: v.size || v.option1 || v.title || `Size ${idx + 1}`,
      price: v.price || 0,
      stock: v.stock || v.inventory?.quantity || 1,
      sku: v.sku || generateSKUCode(productTitle, v.size || v.option1 || v.title, idx),
    }));
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
    const updated = variantsList.map((v, idx) => ({
      ...v,
      sku: generateSKUCode(productTitle, v.size, idx),
    }));
    setVariantsList(updated);
    if (onUpdateVariants) {
      onUpdateVariants(updated);
    }
  };

  const totalLabels = Object.values(quantities).reduce((a, b) => a + Number(b || 0), 0);

  const handlePrint = () => {
    window.print();
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
              <span className="barcode-modal-badge">Barcode Studio</span>
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
                <RefreshCw size={14} /> Re-generate Barcodes
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
                    <div className="barcode-tag-brand">• TEVAR •</div>
                    <div className="barcode-tag-title">{productTitle}</div>
                    
                    <div className="barcode-tag-meta">
                      <span>SIZE: <strong>{variant.size}</strong></span>
                      <span className="barcode-tag-price">₹{Number(variant.price).toLocaleString("en-IN")}</span>
                    </div>

                    <div className="barcode-tag-svg">
                      <BarcodeSVG value={variant.sku} height={38} barWidth={1.25} />
                    </div>
                    
                    <div className="barcode-tag-code">{variant.sku}</div>
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
