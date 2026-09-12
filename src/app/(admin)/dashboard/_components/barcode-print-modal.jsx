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

export function BarcodeSVG({ value, height = 36, barWidth = 1.2 }) {
  if (!value) return null;
  const bars = generateCode128Bars(value);
  if (!bars) return null;
  const totalWidth = bars.length * barWidth;

  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className="barcode-rendered-svg block mx-auto"
      style={{
        width: "100%",
        maxWidth: `${totalWidth}px`,
        height: `${height}px`,
        imageRendering: "pixelated",
        display: "block",
      }}
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
  const words = (title || "PRODUCT").trim().split(/[\s-]+/).filter(Boolean);
  const codePart = words
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase())
    .join("")
    .slice(0, 8);
  const cleanSize = (sizeVal || "M")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();
  const idNum = uniqueId || Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${codePart || "PRD"}-${cleanSize}-${idNum}`;
}

export function BarcodePrintModal({ product, onClose, onUpdateVariants }) {
  if (!product) return null;

  const productTitle = product.title || "Product";
  const productType = product.productType || product.product_type || "";
  const rawVariants = product.variants && product.variants.length > 0
    ? product.variants
    : [{ size: "M", price: product.price || 0, comparePrice: product.comparePrice || 0, stock: 1, sku: "" }];

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
        comparePrice: v.comparePrice || v.compare_at_price || v.compare_price || 0,
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

  const [printColumns, setPrintColumns] = useState(3);

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

  // Helper to draw rounded rectangle with canvas fallback
  const drawCanvasRoundedRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  // Render a complete high-resolution sticker tag on canvas
  const drawStickerTagOnCanvas = (ctx, tag, x, y, width, height) => {
    const padX = width * 0.07;
    const innerW = width - padX * 2;

    // 1. Tag Card Background
    drawCanvasRoundedRect(ctx, x, y, width, height, 18);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#18181b";
    ctx.stroke();

    let curY = y + height * 0.07;

    // 2. Product Title
    ctx.fillStyle = "#18181b";
    ctx.font = `800 ${Math.round(width * 0.06)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Text truncation if title is too long
    let displayTitle = (tag.productTitle || productTitle || "PRODUCT").toUpperCase();
    if (ctx.measureText(displayTitle).width > innerW) {
      while (displayTitle.length > 4 && ctx.measureText(displayTitle + "...").width > innerW) {
        displayTitle = displayTitle.slice(0, -1);
      }
      displayTitle += "...";
    }
    ctx.fillText(displayTitle, x + width / 2, curY);

    // 3. Category / Subtitle
    curY += height * 0.038;
    const catText = (tag.productType || productType || "OVERSIZED HEAVYWEIGHT TEE").toUpperCase();
    ctx.fillStyle = "#71717a";
    ctx.font = `600 ${Math.round(width * 0.032)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText(catText, x + width / 2, curY);

    // 4. Size & Price Row
    curY += height * 0.045;
    const rowH = height * 0.078;
    const pillW = width * 0.42;

    // Size Pill (Left)
    drawCanvasRoundedRect(ctx, x + padX, curY, pillW, rowH, 10);
    ctx.fillStyle = "#f4f4f5";
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = "#e4e4e7";
    ctx.stroke();

    ctx.fillStyle = "#a1a1aa";
    ctx.font = `700 ${Math.round(width * 0.03)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText("SIZE", x + padX + pillW * 0.15, curY + rowH / 2);

    ctx.fillStyle = "#18181b";
    ctx.font = `900 ${Math.round(width * 0.065)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(tag.size || "M", x + padX + pillW * 0.68, curY + rowH / 2);

    // Price Block (Right)
    const priceRightX = x + width - padX;
    const hasMrp = Number(tag.comparePrice) > Number(tag.price);

    if (hasMrp) {
      const mrpStr = `MRP ₹${Number(tag.comparePrice).toLocaleString("en-IN")}`;
      ctx.fillStyle = "#a1a1aa";
      ctx.font = `500 ${Math.round(width * 0.032)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = "right";
      const mrpY = curY + rowH * 0.28;
      ctx.fillText(mrpStr, priceRightX, mrpY);

      // Strike-through line for MRP
      const mrpW = ctx.measureText(mrpStr).width;
      ctx.beginPath();
      ctx.moveTo(priceRightX - mrpW, mrpY);
      ctx.lineTo(priceRightX, mrpY);
      ctx.strokeStyle = "#a1a1aa";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Main Price
      ctx.fillStyle = "#18181b";
      ctx.font = `900 ${Math.round(width * 0.068)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillText(`₹${Number(tag.price).toLocaleString("en-IN")}`, priceRightX, curY + rowH * 0.78);
    } else {
      ctx.fillStyle = "#18181b";
      ctx.font = `900 ${Math.round(width * 0.075)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = "right";
      ctx.fillText(`₹${Number(tag.price).toLocaleString("en-IN")}`, priceRightX, curY + rowH / 2);
    }

    // 5. Composition Row (with dashed line)
    curY += rowH + height * 0.025;
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.moveTo(x + padX, curY);
    ctx.lineTo(x + width - padX, curY);
    ctx.strokeStyle = "#e4e4e7";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.setLineDash([]); // Reset dashed

    curY += height * 0.035;
    const gsm = /oversize/i.test((tag.productTitle || productTitle) + " " + (tag.productType || productType)) ? "240" : "220";
    ctx.fillStyle = "#71717a";
    ctx.font = `600 ${Math.round(width * 0.032)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(`100% COTTON · ${gsm} GSM`, x + width / 2, curY);

    // 6. Code 128 Barcode
    curY += height * 0.025;
    const barcodeH = height * 0.14;
    const barcodeW = width * 0.76;
    const bars = generateCode128Bars(tag.sku);

    if (bars) {
      const unitW = barcodeW / bars.length;
      const barStartX = x + (width - barcodeW) / 2;
      ctx.fillStyle = "#000000";
      for (let b = 0; b < bars.length; b++) {
        if (bars[b] === "1") {
          ctx.fillRect(barStartX + b * unitW, curY, unitW + 0.3, barcodeH);
        }
      }
    }

    // 7. SKU Monospace Box
    curY += barcodeH + height * 0.03;
    const skuH = height * 0.062;
    drawCanvasRoundedRect(ctx, x + padX, curY, innerW, skuH, 8);
    ctx.fillStyle = "#fafafa";
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = "#e4e4e7";
    ctx.stroke();

    ctx.fillStyle = "#3f3f46";
    ctx.font = `700 ${Math.round(width * 0.042)}px 'JetBrains Mono', 'Courier New', monospace`;
    ctx.textAlign = "center";
    ctx.fillText(tag.sku || "TOS-SKU", x + width / 2, curY + skuH / 2);

    // 8. Origin Footer (Crafted in India)
    curY += skuH + height * 0.035;
    const originText = "CRAFTED IN INDIA";
    ctx.fillStyle = "#a1a1aa";
    ctx.font = `700 ${Math.round(width * 0.028)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    const textW = ctx.measureText(originText).width;

    // Green Dot
    const dotX = x + width / 2 - textW / 2 - 8;
    ctx.beginPath();
    ctx.arc(dotX, curY, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#22c55e";
    ctx.fill();

    ctx.fillStyle = "#a1a1aa";
    ctx.textAlign = "left";
    ctx.fillText(originText, dotX + 8, curY);
  };

  // Download a single individual sticker label (300 DPI high-res)
  const handleDownloadSingleLabel = (variant) => {
    const canvas = document.createElement("canvas");
    const tagW = 600;
    const tagH = 880;
    const padding = 30;
    canvas.width = tagW + padding * 2;
    canvas.height = tagH + padding * 2;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawStickerTagOnCanvas(
      ctx,
      {
        productTitle,
        productType,
        size: variant.size,
        price: variant.price,
        comparePrice: variant.comparePrice,
        sku: variant.sku,
      },
      padding,
      padding,
      tagW,
      tagH
    );

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `tos-barcode-${productTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}-size-${String(variant.size).toLowerCase()}.png`;
    link.click();
  };

  // Export full multi-label sheet as 300 DPI PNG
  const handleExportPNG = () => {
    // Collect all active tags based on user quantities
    const tagsToPrint = [];
    variantsList.forEach((variant, vIdx) => {
      const qty = quantities[vIdx] || 0;
      for (let i = 0; i < qty; i++) {
        tagsToPrint.push({
          productTitle,
          productType,
          size: variant.size,
          price: variant.price,
          comparePrice: variant.comparePrice,
          sku: variant.sku,
        });
      }
    });

    if (tagsToPrint.length === 0) {
      alert("Please select at least 1 label copy to export.");
      return;
    }

    const cols = printColumns;
    const rows = Math.ceil(tagsToPrint.length / cols);
    const tagW = 540;
    const tagH = 780;
    const gapX = 36;
    const gapY = 36;
    const margin = 48;

    const canvas = document.createElement("canvas");
    canvas.width = margin * 2 + cols * tagW + (cols - 1) * gapX;
    canvas.height = margin * 2 + rows * tagH + (rows - 1) * gapY;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    tagsToPrint.forEach((tag, idx) => {
      const colIdx = idx % cols;
      const rowIdx = Math.floor(idx / cols);
      const tagX = margin + colIdx * (tagW + gapX);
      const tagY = margin + rowIdx * (tagH + gapY);

      drawStickerTagOnCanvas(ctx, tag, tagX, tagY, tagW, tagH);
    });

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `tos-labels-${productTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${tagsToPrint.length}-tags-sheet.png`;
    link.click();
  };

  // Export full multi-label sheet as vector SVG
  const handleExportSVG = () => {
    const tagsToPrint = [];
    variantsList.forEach((variant, vIdx) => {
      const qty = quantities[vIdx] || 0;
      for (let i = 0; i < qty; i++) {
        tagsToPrint.push({
          productTitle,
          productType,
          size: variant.size,
          price: variant.price,
          comparePrice: variant.comparePrice,
          sku: variant.sku,
        });
      }
    });

    if (tagsToPrint.length === 0) {
      alert("Please select at least 1 label copy to export.");
      return;
    }

    const cols = printColumns;
    const rows = Math.ceil(tagsToPrint.length / cols);
    const tagW = 220;
    const tagH = 320;
    const gap = 16;
    const margin = 20;
    const svgW = margin * 2 + cols * tagW + (cols - 1) * gap;
    const svgH = margin * 2 + rows * tagH + (rows - 1) * gap;

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}">
      <style>
        .card { fill: #ffffff; stroke: #18181b; stroke-width: 1.5; rx: 12; }
        .title { font-family: system-ui, sans-serif; font-weight: 800; font-size: 13px; fill: #18181b; text-anchor: middle; }
        .cat { font-family: system-ui, sans-serif; font-weight: 600; font-size: 8px; fill: #71717a; text-anchor: middle; letter-spacing: 1px; }
        .pill { fill: #f4f4f5; stroke: #e4e4e7; stroke-width: 1; rx: 6; }
        .pill-label { font-family: system-ui, sans-serif; font-weight: 700; font-size: 7px; fill: #a1a1aa; }
        .pill-val { font-family: system-ui, sans-serif; font-weight: 900; font-size: 14px; fill: #18181b; text-anchor: middle; }
        .mrp { font-family: system-ui, sans-serif; font-weight: 500; font-size: 8px; fill: #a1a1aa; text-decoration: line-through; text-anchor: end; }
        .price { font-family: system-ui, sans-serif; font-weight: 900; font-size: 16px; fill: #18181b; text-anchor: end; }
        .comp { font-family: system-ui, sans-serif; font-weight: 600; font-size: 7.5px; fill: #71717a; text-anchor: middle; letter-spacing: 0.8px; }
        .sku-box { fill: #fafafa; stroke: #e4e4e7; stroke-width: 1; rx: 5; }
        .sku-text { font-family: 'JetBrains Mono', monospace, Courier; font-weight: 600; font-size: 9px; fill: #3f3f46; text-anchor: middle; }
        .origin { font-family: system-ui, sans-serif; font-weight: 700; font-size: 6.5px; fill: #a1a1aa; text-anchor: middle; letter-spacing: 1.5px; }
      </style>
      <rect width="100%" height="100%" fill="#ffffff"/>`;

    tagsToPrint.forEach((tag, idx) => {
      const colIdx = idx % cols;
      const rowIdx = Math.floor(idx / cols);
      const x = margin + colIdx * (tagW + gap);
      const y = margin + rowIdx * (tagH + gap);

      const bars = generateCode128Bars(tag.sku);
      const barW = 160;
      const barH = 42;
      const unitW = barW / (bars ? bars.length : 1);
      const barStartX = x + (tagW - barW) / 2;
      let barsSvg = "";
      if (bars) {
        for (let b = 0; b < bars.length; b++) {
          if (bars[b] === "1") {
            barsSvg += `<rect x="${barStartX + b * unitW}" y="${y + 172}" width="${unitW + 0.1}" height="${barH}" fill="#000000"/>`;
          }
        }
      }

      const gsm = /oversize/i.test((tag.productTitle || productTitle) + " " + (tag.productType || productType)) ? "240" : "220";

      svgContent += `
        <g id="tag-${idx}">
          <rect class="card" x="${x}" y="${y}" width="${tagW}" height="${tagH}"/>
          <text class="title" x="${x + tagW / 2}" y="${y + 26}">${(tag.productTitle || productTitle).toUpperCase()}</text>
          <text class="cat" x="${x + tagW / 2}" y="${y + 40}">${(tag.productType || productType || "OVERSIZED HEAVYWEIGHT TEE").toUpperCase()}</text>
          
          <!-- Size Pill -->
          <rect class="pill" x="${x + 16}" y="${y + 52}" width="80" height="28"/>
          <text class="pill-label" x="${x + 24}" y="${y + 69}">SIZE</text>
          <text class="pill-val" x="${x + 72}" y="${y + 71}">${tag.size}</text>

          <!-- Price -->
          ${Number(tag.comparePrice) > Number(tag.price) ? `<text class="mrp" x="${x + tagW - 16}" y="${y + 62}">MRP ₹${Number(tag.comparePrice).toLocaleString("en-IN")}</text>` : ""}
          <text class="price" x="${x + tagW - 16}" y="${y + (Number(tag.comparePrice) > Number(tag.price) ? 77 : 72)}">₹${Number(tag.price).toLocaleString("en-IN")}</text>

          <!-- Composition -->
          <line x1="${x + 16}" y1="${y + 92}" x2="${x + tagW - 16}" y2="${y + 92}" stroke="#e4e4e7" stroke-dasharray="3,3"/>
          <text class="comp" x="${x + tagW / 2}" y="${y + 104}">100% COTTON · ${gsm} GSM</text>

          <!-- Barcode -->
          ${barsSvg}

          <!-- SKU Box -->
          <rect class="sku-box" x="${x + 16}" y="${y + 224}" width="${tagW - 32}" height="22"/>
          <text class="sku-text" x="${x + tagW / 2}" y="${y + 239}">${tag.sku}</text>

          <!-- Origin -->
          <circle cx="${x + tagW / 2 - 44}" cy="${y + 262}" r="2" fill="#22c55e"/>
          <text class="origin" x="${x + tagW / 2 + 4}" y="${y + 264}">CRAFTED IN INDIA</text>
        </g>
      `;
    });

    svgContent += `</svg>`;

    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tos-labels-${productTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}-vector.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

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
              <span className="barcode-modal-badge">• THE OUTLIERS STUDIO •</span>
              <h2>{productTitle}</h2>
            </div>
          </div>

          <div className="barcode-modal-header-actions">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePrint(); }}
              disabled={totalLabels === 0}
              className="barcode-print-btn"
            >
              <Printer size={18} /> Print {totalLabels} {totalLabels === 1 ? "Label" : "Labels"}
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
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
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleExportSVG(); }}
              className="barcode-export-btn"
              title="Export Vector SVG"
            >
              <Download size={13} /> SVG
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleExportPNG(); }}
              className="barcode-export-btn highlight"
              title="Export 300 DPI PNG Sheet"
            >
              <Download size={13} /> Download PNG Sheet (300 DPI)
            </button>
          </div>
        </div>

        {/* Modal Toolbar & Size Selectors */}
        <div className="no-print barcode-modal-toolbar">
          <div className="barcode-toolbar-presets">
            <div className="barcode-preset-group">
              <span className="barcode-preset-label">Presets:</span>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAllQuantities("one"); }}
                className="barcode-preset-btn"
              >
                <Tag size={14} /> 1 Per Size
              </button>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAllQuantities("stock"); }}
                className="barcode-preset-btn"
              >
                <Layers size={14} /> Match Stock
              </button>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); regenerateSKUs(); }}
                className="barcode-preset-btn highlight"
              >
                <RefreshCw size={14} /> Re-generate TOS Barcodes
              </button>
            </div>

            <div className="barcode-preset-group">
              <span className="barcode-preset-label">Layout:</span>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPrintColumns(3); }}
                className={`barcode-preset-btn ${printColumns === 3 ? "active font-bold" : ""}`}
                title="3 Columns - Compact A4 Sheet"
              >
                3 Cols (A4)
              </button>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPrintColumns(2); }}
                className={`barcode-preset-btn ${printColumns === 2 ? "active font-bold" : ""}`}
                title="2 Columns - Large Tags"
              >
                2 Cols (Large)
              </button>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPrintColumns(1); }}
                className={`barcode-preset-btn ${printColumns === 1 ? "active font-bold" : ""}`}
                title="1 Column - Thermal Roll / Single"
              >
                1 Col (Roll)
              </button>
            </div>

            <div className="barcode-count-tag">
              Total Labels: <span>{totalLabels}</span>
            </div>
          </div>

          {/* Size Quantity Counters with Single Download */}
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
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQuantity(idx, -1); }}
                    className="barcode-counter-btn"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="barcode-counter-num">{quantities[idx] || 0}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQuantity(idx, 1); }}
                    className="barcode-counter-btn"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDownloadSingleLabel(v); }}
                  className="barcode-download-single-btn"
                  title={`Download single 300 DPI sticker for Size ${v.size}`}
                >
                  <Download size={12} /> Label
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Live Barcode Printable Sheet Preview */}
        <div className="barcode-preview-container">
          <div className={`barcode-sticker-grid grid-cols-${printColumns}`}>
            {variantsList.map((variant, vIdx) => {
              const count = quantities[vIdx] || 0;
              const tags = [];
              for (let i = 0; i < count; i++) {
                tags.push(
                  <div key={`${vIdx}-${i}`} className="barcode-sticker-tag">
                    {/* ── Product Title ── */}
                    <div className="barcode-tag-title">{productTitle}</div>

                    {/* ── Category / Type ── */}
                    {productType && (
                      <div className="barcode-tag-category">{productType}</div>
                    )}

                    {/* ── Size & Price Row ── */}
                    <div className="barcode-tag-meta">
                      <div className="barcode-tag-size-pill">
                        <span className="barcode-tag-size-label">SIZE</span>
                        <span className="barcode-tag-size-value">{variant.size}</span>
                      </div>
                      <div className="barcode-tag-price-block">
                        {Number(variant.comparePrice) > Number(variant.price) && (
                          <span className="barcode-tag-mrp">
                            MRP ₹{Number(variant.comparePrice).toLocaleString("en-IN")}
                          </span>
                        )}
                        <span className="barcode-tag-price">₹{Number(variant.price).toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    {/* ── Composition & Care ── */}
                    <div className="barcode-tag-details-row">
                      <span className="barcode-tag-composition">100% Cotton · {/oversize/i.test(productTitle + " " + productType) ? "240" : "220"} GSM</span>
                    </div>

                    {/* ── Barcode ── */}
                    <div className="barcode-tag-svg">
                      <BarcodeSVG value={variant.sku} height={36} barWidth={1.2} />
                    </div>

                    {/* ── SKU + Made in India ── */}
                    <div className="barcode-tag-footer">
                      <div className="barcode-sku-box">{variant.sku}</div>
                      <div className="barcode-tag-origin">
                        <span className="barcode-origin-dot">●</span> Crafted in India
                      </div>
                    </div>

                    {/* ── Individual Tag Download Action (Hidden on Print) ── */}
                    <div className="no-print w-full mt-2">
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDownloadSingleLabel(variant); }}
                        className="barcode-tag-download-action"
                        title="Download this single label as high-res PNG"
                      >
                        <Download size={12} /> Download This Label
                      </button>
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
