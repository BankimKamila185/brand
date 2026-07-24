"use client";

import { useState } from "react";
import { Printer, X, Sparkles, Check, RefreshCw } from "lucide-react";

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

export function BarcodeSVG({ value, height = 30, barWidth = 1.1 }) {
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
          fill={bit === "1" ? "#000" : "transparent"}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="barcode-print-modal-content bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header (Hidden when printing) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Printer className="w-5 h-5 text-[#df5c35]" />
              Barcode Label Generator & Printer
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Print tags containing Product Name, Size, Price, and Auto-generated Barcode.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar (Hidden when printing) */}
        <div className="no-print p-4 bg-white border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap text-xs font-semibold text-neutral-700">
            <span>Label copies:</span>
            <button
              onClick={() => setAllQuantities("one")}
              className="px-2.5 py-1 bg-neutral-100 border border-neutral-300 rounded hover:bg-neutral-200 transition-colors"
            >
              1 Per Size
            </button>
            <button
              onClick={() => setAllQuantities("stock")}
              className="px-2.5 py-1 bg-neutral-100 border border-neutral-300 rounded hover:bg-neutral-200 transition-colors"
            >
              Match Stock Quantities
            </button>
            <button
              onClick={regenerateSKUs}
              className="px-2.5 py-1 bg-neutral-100 text-[#df5c35] border border-[#df5c35]/30 rounded hover:bg-[#fff0ea] transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Re-generate Barcode Codes
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-neutral-600">
              Total Tags: <span className="text-[#df5c35] font-extrabold">{totalLabels}</span>
            </span>
            <button
              onClick={handlePrint}
              disabled={totalLabels === 0}
              className="px-5 py-2.5 bg-[#df5c35] hover:bg-[#c94b26] text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Barcodes ({totalLabels})
            </button>
          </div>
        </div>

        {/* Variant Quantity Selector Bar (Hidden when printing) */}
        <div className="no-print px-6 py-3 bg-neutral-100/70 border-b border-neutral-200 flex flex-wrap gap-4 text-xs">
          {variantsList.map((v, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-neutral-300 shadow-2xs">
              <span className="font-bold text-neutral-800">{v.size}</span>
              <span className="text-neutral-400">|</span>
              <span className="text-neutral-600">₹{Number(v.price).toLocaleString("en-IN")}</span>
              <div className="flex items-center gap-1 ml-2 bg-neutral-100 rounded border border-neutral-300">
                <button
                  type="button"
                  onClick={() => updateQuantity(idx, -1)}
                  className="px-1.5 py-0.5 text-neutral-700 font-bold hover:bg-neutral-200 rounded-l"
                >
                  -
                </button>
                <span className="w-6 text-center font-bold text-neutral-900">{quantities[idx] || 0}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(idx, 1)}
                  className="px-1.5 py-0.5 text-neutral-700 font-bold hover:bg-neutral-200 rounded-r"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Live Barcode Printable Sheet Preview */}
        <div className="p-6 overflow-y-auto flex-grow bg-neutral-100/40">
          <div className="barcode-sticker-grid">
            {variantsList.map((variant, vIdx) => {
              const count = quantities[vIdx] || 0;
              const tags = [];
              for (let i = 0; i < count; i++) {
                tags.push(
                  <div key={`${vIdx}-${i}`} className="barcode-sticker-tag">
                    <div className="barcode-tag-brand">TEVAR</div>
                    <div className="barcode-tag-title">{productTitle}</div>
                    <div className="barcode-tag-meta">
                      <span>Size: <strong>{variant.size}</strong></span>
                      <span>Price: <strong>₹{Number(variant.price).toLocaleString("en-IN")}</strong></span>
                    </div>
                    <div className="barcode-tag-svg">
                      <BarcodeSVG value={variant.sku} height={32} barWidth={1.15} />
                    </div>
                    <div className="barcode-tag-code">{variant.sku}</div>
                  </div>
                );
              }
              return tags;
            })}

            {totalLabels === 0 && (
              <div className="col-span-full py-12 text-center text-neutral-400 no-print">
                Select label copies above to preview printable barcode stickers.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
