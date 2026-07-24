"use client";

import { useState } from "react";
import { Printer, X, Sparkles, RefreshCw, Tag, Layers, Plus, Minus } from "lucide-react";

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

export function BarcodeSVG({ value, height = 34, barWidth = 1.15 }) {
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

  // Track state for variants with auto-generated SKUs
  const [variantsList, setVariantsList] = useState(() => {
    return rawVariants.map((v, idx) => ({
      size: v.size || v.option1 || v.title || `Size ${idx + 1}`,
      price: v.price || 0,
      stock: v.stock || v.inventory?.quantity || 1,
      sku: v.sku || generateSKUCode(productTitle, v.size || v.option1 || v.title, idx),
    }));
  });

  // Quantity per variant for label copies
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 md:p-6 overflow-y-auto">
      <div className="barcode-print-modal-content bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header (Hidden when printing) */}
        <div className="no-print flex items-center justify-between px-6 py-5 border-b border-neutral-200 bg-neutral-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#df5c35] flex items-center justify-center text-white shadow-md">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold tracking-widest text-[#df5c35] uppercase bg-[#df5c35]/15 px-2 py-0.5 rounded-full border border-[#df5c35]/30">
                  Barcode Studio
                </span>
                <h2 className="text-lg font-bold text-white capitalize">{productTitle}</h2>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Print retail barcode hangtags & sticker labels
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              disabled={totalLabels === 0}
              className="px-6 py-2.5 bg-[#df5c35] hover:bg-[#c94b26] active:scale-95 text-white font-extrabold text-sm rounded-xl flex items-center gap-2 shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print {totalLabels} {totalLabels === 1 ? "Label" : "Labels"}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Quick Actions (Hidden when printing) */}
        <div className="no-print p-5 bg-neutral-50 border-b border-neutral-200 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap text-xs font-bold text-neutral-700">
              <span className="text-neutral-500 font-medium">Presets:</span>
              <button
                onClick={() => setAllQuantities("one")}
                className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg hover:border-neutral-400 hover:bg-neutral-100 transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Tag className="w-3.5 h-3.5 text-neutral-500" /> 1 Per Size
              </button>
              <button
                onClick={() => setAllQuantities("stock")}
                className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg hover:border-neutral-400 hover:bg-neutral-100 transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-neutral-500" /> Match Inventory Stock
              </button>
              <button
                onClick={regenerateSKUs}
                className="px-3 py-1.5 bg-[#fff0ea] text-[#df5c35] border border-[#df5c35]/30 rounded-lg hover:bg-[#ffe3d6] transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Re-generate Product Codes
              </button>
            </div>

            <div className="text-xs font-extrabold text-neutral-700 bg-white px-3.5 py-1.5 rounded-lg border border-neutral-200 shadow-2xs">
              Selected Tags: <span className="text-[#df5c35] font-black text-sm">{totalLabels}</span>
            </div>
          </div>

          {/* Size Quantity Counters */}
          <div className="flex flex-wrap gap-3 pt-2 border-t border-neutral-200/80">
            {variantsList.map((v, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 bg-white px-3.5 py-2 rounded-xl border border-neutral-200 shadow-2xs hover:border-neutral-300 transition-all min-w-[140px]"
              >
                <div>
                  <div className="font-extrabold text-neutral-900 text-xs">Size {v.size}</div>
                  <div className="text-[11px] text-[#df5c35] font-bold">₹{Number(v.price).toLocaleString("en-IN")}</div>
                </div>

                <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-lg border border-neutral-200">
                  <button
                    type="button"
                    onClick={() => updateQuantity(idx, -1)}
                    className="w-6 h-6 flex items-center justify-center text-neutral-700 font-bold hover:bg-white hover:text-black rounded transition-colors cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center font-black text-neutral-900 text-xs">{quantities[idx] || 0}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(idx, 1)}
                    className="w-6 h-6 flex items-center justify-center text-neutral-700 font-bold hover:bg-white hover:text-black rounded transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Barcode Printable Sheet Preview */}
        <div className="p-6 md:p-8 overflow-y-auto flex-grow bg-neutral-100/60">
          <div className="barcode-sticker-grid">
            {variantsList.map((variant, vIdx) => {
              const count = quantities[vIdx] || 0;
              const tags = [];
              for (let i = 0; i < count; i++) {
                tags.push(
                  <div key={`${vIdx}-${i}`} className="barcode-sticker-tag">
                    {/* Visual Tag Hole */}
                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-200 border border-neutral-300 mx-auto mb-1 no-print"></div>

                    <div className="barcode-tag-brand">• TEVAR •</div>
                    <div className="barcode-tag-title">{productTitle}</div>
                    
                    <div className="barcode-tag-meta">
                      <span>SIZE: <strong>{variant.size}</strong></span>
                      <span className="barcode-tag-price">₹{Number(variant.price).toLocaleString("en-IN")}</span>
                    </div>

                    <div className="barcode-tag-svg">
                      <BarcodeSVG value={variant.sku} height={36} barWidth={1.2} />
                    </div>
                    
                    <div className="barcode-tag-code">{variant.sku}</div>
                  </div>
                );
              }
              return tags;
            })}

            {totalLabels === 0 && (
              <div className="col-span-full py-16 text-center text-neutral-400 no-print flex flex-col items-center justify-center gap-2">
                <Tag className="w-10 h-10 text-neutral-300 stroke-1" />
                <p className="font-semibold text-neutral-600">No label copies selected</p>
                <p className="text-xs text-neutral-400">Increase size quantities above to generate printable barcode tags.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
