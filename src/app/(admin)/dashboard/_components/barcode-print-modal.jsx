"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Printer,
  X,
  Tag,
  Layers,
  Plus,
  Minus,
  RefreshCw,
  Download,
  ShieldCheck,
  Package,
  CheckCircle2,
  Trash2,
  Search,
  ChevronDown
} from "lucide-react";

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

export function BarcodeSVG({ value, height = 24, barWidth = 1.05 }) {
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

// Helper to create batch entry object from product
function createBatchItem(prod, defaultQty = 1) {
  const title = prod.title || "Product";
  const pType = prod.productType || prod.product_type || "";
  const rawVariants = prod.variants && prod.variants.length > 0
    ? prod.variants
    : [{ size: "M", price: prod.price || 0, comparePrice: prod.comparePrice || 0, stock: 1, sku: "" }];

  const usedIds = new Set();
  const variantsList = rawVariants.map((v, idx) => {
    let randId = 3432 + idx;
    while (usedIds.has(randId)) {
      randId = Math.floor(1000 + Math.random() * 9000);
    }
    usedIds.add(randId);

    const sizeStr = v.size || v.option1 || v.title || `Size ${idx + 1}`;
    const defaultSKU = generateTOSSKUCode(title, sizeStr, randId);

    return {
      size: sizeStr,
      price: v.price || 0,
      comparePrice: v.comparePrice || v.compare_at_price || v.compare_price || 0,
      stock: v.stock || v.inventory?.quantity || 1,
      sku: (v.sku && v.sku.startsWith("TOS-")) ? v.sku : defaultSKU,
    };
  });

  const quantities = {};
  variantsList.forEach((_, idx) => {
    quantities[idx] = defaultQty;
  });

  return {
    id: prod.id || prod._id || prod.handle || String(Math.random()),
    product: prod,
    productTitle: title,
    productType: pType,
    variantsList,
    quantities,
  };
}

export function BarcodePrintModal({ product, allProducts = [], onClose, onUpdateVariants }) {
  if (!product && (!allProducts || allProducts.length === 0)) return null;

  const initialProd = product || allProducts[0];

  // Batch Queue List of Multiple Products/Designs
  const [batchList, setBatchList] = useState(() => [createBatchItem(initialProd, 1)]);
  const [activeBatchIndex, setActiveBatchIndex] = useState(0);
  const [printColumns, setPrintColumns] = useState(3);
  const [previewFilter, setPreviewFilter] = useState("all"); // "all" (Total Print) or "active" (Current Design)
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const [searchDesignQuery, setSearchDesignQuery] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAddDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeItem = batchList[activeBatchIndex] || batchList[0];

  // Update quantities for the current active design
  const updateQuantity = (variantIdx, delta) => {
    setBatchList((prev) => {
      const next = [...prev];
      const current = { ...next[activeBatchIndex] };
      const currentQty = { ...current.quantities };
      currentQty[variantIdx] = Math.max(0, (currentQty[variantIdx] || 0) + delta);
      current.quantities = currentQty;
      next[activeBatchIndex] = current;
      return next;
    });
  };

  const setAllQuantities = (qtyType) => {
    setBatchList((prev) => {
      const next = [...prev];
      const current = { ...next[activeBatchIndex] };
      const currentQty = {};
      current.variantsList.forEach((v, idx) => {
        if (qtyType === "stock") {
          currentQty[idx] = Math.max(1, Number(v.stock) || 1);
        } else if (qtyType === "zero") {
          currentQty[idx] = 0;
        } else {
          currentQty[idx] = 1;
        }
      });
      current.quantities = currentQty;
      next[activeBatchIndex] = current;
      return next;
    });
  };

  // Add another product to the batch queue
  const handleAddProductToBatch = (prod) => {
    const alreadyIdx = batchList.findIndex(
      (item) => item.id === (prod.id || prod._id || prod.handle)
    );
    if (alreadyIdx !== -1) {
      setActiveBatchIndex(alreadyIdx);
    } else {
      const newItem = createBatchItem(prod, 1);
      setBatchList((prev) => [...prev, newItem]);
      setActiveBatchIndex(batchList.length);
    }
    setIsAddDropdownOpen(false);
    setSearchDesignQuery("");
  };

  // Remove a product from the batch queue
  const handleRemoveBatchItem = (indexToRemove, e) => {
    e.stopPropagation();
    if (batchList.length <= 1) return;
    setBatchList((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (activeBatchIndex >= indexToRemove) {
      setActiveBatchIndex(Math.max(0, activeBatchIndex - 1));
    }
  };

  const regenerateActiveSKUs = () => {
    setBatchList((prev) => {
      const next = [...prev];
      const current = { ...next[activeBatchIndex] };
      const usedIds = new Set();
      current.variantsList = current.variantsList.map((v) => {
        let randId = Math.floor(1000 + Math.random() * 9000);
        while (usedIds.has(randId)) {
          randId = Math.floor(1000 + Math.random() * 9000);
        }
        usedIds.add(randId);
        return {
          ...v,
          sku: generateTOSSKUCode(current.productTitle, v.size, randId),
        };
      });
      next[activeBatchIndex] = current;
      return next;
    });
  };

  // Total labels across all batch items or current item
  const allStickersList = useMemo(() => {
    const list = [];
    const itemsToProcess = previewFilter === "active" ? [activeItem] : batchList;

    itemsToProcess.forEach((item) => {
      if (!item) return;
      item.variantsList.forEach((variant, vIdx) => {
        const count = item.quantities[vIdx] || 0;
        for (let i = 0; i < count; i++) {
          list.push({
            productTitle: item.productTitle,
            productType: item.productType,
            size: variant.size,
            price: variant.price,
            comparePrice: variant.comparePrice,
            sku: variant.sku,
          });
        }
      });
    });
    return list;
  }, [batchList, activeItem, previewFilter]);

  const totalBatchLabels = useMemo(() => {
    return batchList.reduce((sum, item) => {
      return sum + Object.values(item.quantities || {}).reduce((a, b) => a + Number(b || 0), 0);
    }, 0);
  }, [batchList]);

  // Available products to add that are not already in batch
  const availableToAdd = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    return allProducts.filter((p) => {
      const matchesSearch = !searchDesignQuery.trim() ||
        (p.title || "").toLowerCase().includes(searchDesignQuery.toLowerCase().trim()) ||
        (p.handle || "").toLowerCase().includes(searchDesignQuery.toLowerCase().trim());
      return matchesSearch;
    });
  }, [allProducts, searchDesignQuery]);

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

  // Render a complete high-resolution 2.5" × 1.5" sticker tag on canvas (300 DPI: 750 × 450 px)
  const drawStickerTagOnCanvas = (ctx, tag, x, y, width = 750, height = 450) => {
    const padX = width * 0.055;
    const innerW = width - padX * 2;

    // 1. Tag Card Background
    drawCanvasRoundedRect(ctx, x, y, width, height, 14);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#18181b";
    ctx.stroke();

    // 2. Product Title (Top Center)
    let curY = y + height * 0.085;
    ctx.fillStyle = "#18181b";
    ctx.font = `800 ${Math.round(width * 0.038)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let displayTitle = (tag.productTitle || "PRODUCT").toUpperCase();
    if (ctx.measureText(displayTitle).width > innerW) {
      while (displayTitle.length > 4 && ctx.measureText(displayTitle + "...").width > innerW) {
        displayTitle = displayTitle.slice(0, -1);
      }
      displayTitle += "...";
    }
    ctx.fillText(displayTitle, x + width / 2, curY);

    // 3. Category & Fabric Type
    curY += height * 0.048;
    const gsm = /oversize/i.test((tag.productTitle || "") + " " + (tag.productType || "")) ? "240" : "220";
    const catText = `100% COTTON · ${gsm} GSM`;
    ctx.fillStyle = "#71717a";
    ctx.font = `600 ${Math.round(width * 0.022)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText(catText, x + width / 2, curY);

    // 4. Size & Price Row
    curY += height * 0.042;
    const rowH = height * 0.105;
    const pillW = width * 0.32;

    // Size Pill (Left)
    drawCanvasRoundedRect(ctx, x + padX, curY, pillW, rowH, 8);
    ctx.fillStyle = "#f4f4f5";
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#e4e4e7";
    ctx.stroke();

    ctx.fillStyle = "#a1a1aa";
    ctx.font = `700 ${Math.round(width * 0.022)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText("SIZE", x + padX + pillW * 0.14, curY + rowH / 2);

    ctx.fillStyle = "#18181b";
    ctx.font = `900 ${Math.round(width * 0.048)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(tag.size || "M", x + padX + pillW * 0.68, curY + rowH / 2);

    // Price Block (Right)
    const priceRightX = x + width - padX;
    const hasMrp = Number(tag.comparePrice) > Number(tag.price);

    if (hasMrp) {
      const mrpStr = `MRP ₹${Number(tag.comparePrice).toLocaleString("en-IN")}`;
      ctx.fillStyle = "#a1a1aa";
      ctx.font = `500 ${Math.round(width * 0.023)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = "right";
      const mrpY = curY + rowH * 0.3;
      ctx.fillText(mrpStr, priceRightX, mrpY);

      // Strike-through line for MRP
      const mrpW = ctx.measureText(mrpStr).width;
      ctx.beginPath();
      ctx.moveTo(priceRightX - mrpW, mrpY);
      ctx.lineTo(priceRightX, mrpY);
      ctx.strokeStyle = "#a1a1aa";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Main Price
      ctx.fillStyle = "#18181b";
      ctx.font = `900 ${Math.round(width * 0.048)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillText(`₹${Number(tag.price).toLocaleString("en-IN")}`, priceRightX, curY + rowH * 0.76);
    } else {
      ctx.fillStyle = "#18181b";
      ctx.font = `900 ${Math.round(width * 0.052)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = "right";
      ctx.fillText(`₹${Number(tag.price).toLocaleString("en-IN")}`, priceRightX, curY + rowH / 2);
    }

    // 5. Code 128 Barcode (Crisp scannable height)
    curY += rowH + height * 0.045;
    const barcodeH = height * 0.32;
    const barcodeW = width * 0.78;
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

    // 6. SKU Monospace Box
    curY += barcodeH + height * 0.04;
    const skuH = height * 0.105;
    drawCanvasRoundedRect(ctx, x + padX, curY, innerW, skuH, 6);
    ctx.fillStyle = "#fafafa";
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#e4e4e7";
    ctx.stroke();

    ctx.fillStyle = "#3f3f46";
    ctx.font = `700 ${Math.round(width * 0.03)}px 'JetBrains Mono', 'Courier New', monospace`;
    ctx.textAlign = "center";
    ctx.fillText(tag.sku || "TOS-SKU", x + width / 2, curY + skuH / 2);

    // 7. Origin Footer (Crafted in India)
    curY += skuH + height * 0.055;
    const originText = "CRAFTED IN INDIA";
    ctx.fillStyle = "#a1a1aa";
    ctx.font = `700 ${Math.round(width * 0.02)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    const textW = ctx.measureText(originText).width;

    // Green Dot
    const dotX = x + width / 2 - textW / 2 - 6;
    ctx.beginPath();
    ctx.arc(dotX, curY, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = "#22c55e";
    ctx.fill();

    ctx.fillStyle = "#a1a1aa";
    ctx.textAlign = "left";
    ctx.fillText(originText, dotX + 6, curY);
  };

  // Download a single individual sticker label (2.5" × 1.5" @ 300 DPI: 750 × 450 px)
  const handleDownloadSingleLabel = (tag) => {
    const tagW = 750;
    const tagH = 450;
    const padding = 20;

    const canvas = document.createElement("canvas");
    canvas.width = tagW + padding * 2;
    canvas.height = tagH + padding * 2;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawStickerTagOnCanvas(ctx, tag, padding, padding, tagW, tagH);

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `tos-barcode-2.5x1.5-${(tag.productTitle || "product").toLowerCase().replace(/[^a-z0-9]/g, "-")}-size-${String(tag.size).toLowerCase()}.png`;
    link.click();
  };

  // Export full multi-label sheet as 300 DPI PNG (Total Print Sheet)
  const handleExportPNG = () => {
    if (allStickersList.length === 0) {
      alert("Please select at least 1 label copy in your print batch.");
      return;
    }

    const cols = printColumns;
    const rows = Math.ceil(allStickersList.length / cols);
    const tagW = 750;
    const tagH = 450;
    const gapX = 30;
    const gapY = 30;
    const margin = 36;

    const canvas = document.createElement("canvas");
    canvas.width = margin * 2 + cols * tagW + (cols - 1) * gapX;
    canvas.height = margin * 2 + rows * tagH + (rows - 1) * gapY;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    allStickersList.forEach((tag, idx) => {
      const colIdx = idx % cols;
      const rowIdx = Math.floor(idx / cols);
      const tagX = margin + colIdx * (tagW + gapX);
      const tagY = margin + rowIdx * (tagH + gapY);

      drawStickerTagOnCanvas(ctx, tag, tagX, tagY, tagW, tagH);
    });

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `tos-total-print-sheet-${batchList.length}-designs-${allStickersList.length}-labels.png`;
    link.click();
  };

  // Export full multi-label sheet as vector SVG (Total Print Vector Sheet)
  const handleExportSVG = () => {
    if (allStickersList.length === 0) {
      alert("Please select at least 1 label copy in your print batch.");
      return;
    }

    const cols = printColumns;
    const rows = Math.ceil(allStickersList.length / cols);
    const tagW = 240;
    const tagH = 144;
    const gap = 12;
    const margin = 16;
    const svgW = margin * 2 + cols * tagW + (cols - 1) * gap;
    const svgH = margin * 2 + rows * tagH + (rows - 1) * gap;

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}">
      <style>
        .card { fill: #ffffff; stroke: #18181b; stroke-width: 1.2; rx: 8; }
        .title { font-family: system-ui, sans-serif; font-weight: 800; font-size: 10px; fill: #18181b; text-anchor: middle; }
        .cat { font-family: system-ui, sans-serif; font-weight: 600; font-size: 6.5px; fill: #71717a; text-anchor: middle; letter-spacing: 0.6px; }
        .pill { fill: #f4f4f5; stroke: #e4e4e7; stroke-width: 0.8; rx: 4; }
        .pill-label { font-family: system-ui, sans-serif; font-weight: 700; font-size: 6px; fill: #a1a1aa; }
        .pill-val { font-family: system-ui, sans-serif; font-weight: 900; font-size: 11px; fill: #18181b; text-anchor: middle; }
        .mrp { font-family: system-ui, sans-serif; font-weight: 500; font-size: 6.5px; fill: #a1a1aa; text-decoration: line-through; text-anchor: end; }
        .price { font-family: system-ui, sans-serif; font-weight: 900; font-size: 12px; fill: #18181b; text-anchor: end; }
        .sku-box { fill: #fafafa; stroke: #e4e4e7; stroke-width: 0.8; rx: 4; }
        .sku-text { font-family: 'JetBrains Mono', monospace, Courier; font-weight: 600; font-size: 7.5px; fill: #3f3f46; text-anchor: middle; }
        .origin { font-family: system-ui, sans-serif; font-weight: 700; font-size: 5.5px; fill: #a1a1aa; text-anchor: middle; letter-spacing: 1px; }
      </style>
      <rect width="100%" height="100%" fill="#ffffff"/>`;

    allStickersList.forEach((tag, idx) => {
      const colIdx = idx % cols;
      const rowIdx = Math.floor(idx / cols);
      const x = margin + colIdx * (tagW + gap);
      const y = margin + rowIdx * (tagH + gap);

      const bars = generateCode128Bars(tag.sku);
      const barW = 180;
      const barH = 42;
      const unitW = barW / (bars ? bars.length : 1);
      const barStartX = x + (tagW - barW) / 2;
      let barsSvg = "";
      if (bars) {
        for (let b = 0; b < bars.length; b++) {
          if (bars[b] === "1") {
            barsSvg += `<rect x="${barStartX + b * unitW}" y="${y + 54}" width="${unitW + 0.1}" height="${barH}" fill="#000000"/>`;
          }
        }
      }

      const gsm = /oversize/i.test((tag.productTitle || "") + " " + (tag.productType || "")) ? "240" : "220";

      svgContent += `
        <g id="tag-${idx}">
          <rect class="card" x="${x}" y="${y}" width="${tagW}" height="${tagH}"/>
          <text class="title" x="${x + tagW / 2}" y="${y + 14}">${(tag.productTitle || "PRODUCT").toUpperCase()}</text>
          <text class="cat" x="${x + tagW / 2}" y="${y + 24}">100% COTTON · ${gsm} GSM</text>
          
          <!-- Size Pill -->
          <rect class="pill" x="${x + 12}" y="${y + 30}" width="65" height="18"/>
          <text class="pill-label" x="${x + 18}" y="${y + 42}">SIZE</text>
          <text class="pill-val" x="${x + 56}" y="${y + 44}">${tag.size}</text>

          <!-- Price -->
          ${Number(tag.comparePrice) > Number(tag.price) ? `<text class="mrp" x="${x + tagW - 12}" y="${y + 36}">MRP ₹${Number(tag.comparePrice).toLocaleString("en-IN")}</text>` : ""}
          <text class="price" x="${x + tagW - 12}" y="${y + (Number(tag.comparePrice) > Number(tag.price) ? 46 : 42)}">₹${Number(tag.price).toLocaleString("en-IN")}</text>

          <!-- Barcode -->
          ${barsSvg}

          <!-- SKU Box -->
          <rect class="sku-box" x="${x + 12}" y="${y + 102}" width="${tagW - 24}" height="17"/>
          <text class="sku-text" x="${x + tagW / 2}" y="${y + 114}">${tag.sku}</text>

          <!-- Origin -->
          <circle cx="${x + tagW / 2 - 36}" cy="${y + 130}" r="1.5" fill="#22c55e"/>
          <text class="origin" x="${x + tagW / 2 + 3}" y="${y + 132}">CRAFTED IN INDIA</text>
        </g>
      `;
    });

    svgContent += `</svg>`;

    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tos-total-print-sheet-${batchList.length}-designs-${allStickersList.length}-labels.svg`;
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
              <span className="barcode-modal-badge">• THE OUTLIERS STUDIO • BATCH PRINT STUDIO</span>
              <h2>
                Total Print Batch ({totalBatchLabels} {totalBatchLabels === 1 ? "Label" : "Labels"} · {batchList.length} {batchList.length === 1 ? "Design" : "Designs"})
              </h2>
            </div>
          </div>

          <div className="barcode-modal-header-actions">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePrint(); }}
              disabled={allStickersList.length === 0}
              className="barcode-print-btn"
              title="Print All Batched Labels"
            >
              <Printer size={18} /> Total Print ({allStickersList.length} {allStickersList.length === 1 ? "Label" : "Labels"})
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
            <span>Label Size:</span> <strong>2.5" × 1.5" (63.5 × 38.1 mm)</strong>
          </div>
          <div className="barcode-spec-pill">
            <span>Type:</span> <strong>Code 128 Standard</strong>
          </div>
          <div className="barcode-spec-pill border-emerald-300 bg-emerald-50 text-emerald-800 flex items-center gap-1">
            <ShieldCheck size={14} className="text-emerald-600" />
            <strong>GS1 / ISO Compliant</strong>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleExportSVG(); }}
              className="barcode-export-btn"
              title="Export Vector SVG for entire batch"
            >
              <Download size={13} /> SVG (Total Batch)
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleExportPNG(); }}
              className="barcode-export-btn highlight"
              title="Export 300 DPI PNG Sheet for entire batch"
            >
              <Download size={13} /> Download Total Sheet (300 DPI PNG)
            </button>
          </div>
        </div>

        {/* Multi-Design Batch Management & Size Counter Toolbar */}
        <div className="no-print barcode-modal-toolbar">

          {/* 1. Multi-Design Batch Queue Bar */}
          <div className="barcode-batch-queue-bar">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
              <Package size={14} /> Added Designs:
            </span>

            {batchList.map((item, idx) => {
              const itemTotal = Object.values(item.quantities || {}).reduce((a, b) => a + Number(b || 0), 0);
              const isActive = idx === activeBatchIndex;
              return (
                <div
                  key={item.id || idx}
                  onClick={() => setActiveBatchIndex(idx)}
                  className={`barcode-batch-chip ${isActive ? "active" : ""}`}
                  title={`Configure ${item.productTitle}`}
                >
                  <span>{item.productTitle}</span>
                  <span className="barcode-batch-chip-count">{itemTotal}</span>
                  {batchList.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleRemoveBatchItem(idx, e)}
                      className="barcode-batch-chip-remove"
                      title="Remove from batch"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              );
            })}

            {/* + Add Another Design Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}
                className="barcode-add-design-btn"
                title="Add another product design to this print batch"
              >
                <Plus size={14} /> Add Another Design <ChevronDown size={13} />
              </button>

              {isAddDropdownOpen && (
                <div className="barcode-design-dropdown">
                  <input
                    type="text"
                    placeholder="Search product to add..."
                    value={searchDesignQuery}
                    onChange={(e) => setSearchDesignQuery(e.target.value)}
                    className="barcode-design-search-input"
                    autoFocus
                  />
                  <div className="max-h-52 overflow-y-auto">
                    {availableToAdd.length > 0 ? (
                      availableToAdd.map((p) => (
                        <div
                          key={p.id || p._id || p.handle}
                          onClick={() => handleAddProductToBatch(p)}
                          className="barcode-design-option"
                        >
                          <span className="truncate">{p.title}</span>
                          <span className="text-[11px] text-neutral-400 font-bold">
                            {p.variants?.length || 1} sizes
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-xs text-neutral-400">
                        No other designs found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. Active Design Configuration Toolbar */}
          <div className="barcode-toolbar-presets">
            <div className="barcode-preset-group">
              <span className="barcode-preset-label">
                Configuring: <strong className="text-neutral-900">{activeItem.productTitle}</strong>
              </span>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAllQuantities("one"); }}
                className="barcode-preset-btn"
              >
                <Tag size={13} /> 1 Per Size
              </button>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAllQuantities("stock"); }}
                className="barcode-preset-btn"
              >
                <Layers size={13} /> Match Stock
              </button>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAllQuantities("zero"); }}
                className="barcode-preset-btn"
                title="Set all sizes of this design to 0"
              >
                Clear Sizes
              </button>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); regenerateActiveSKUs(); }}
                className="barcode-preset-btn highlight"
              >
                <RefreshCw size={13} /> Re-generate SKUs
              </button>
            </div>

            {/* Layout & Preview Mode Selectors */}
            <div className="barcode-preset-group">
              <span className="barcode-preset-label">Preview:</span>
              <button
                type="button"
                onClick={() => setPreviewFilter("all")}
                className={`barcode-preset-btn ${previewFilter === "all" ? "active font-bold" : ""}`}
                title="Preview total merged sheet from all designs"
              >
                Total Batch ({totalBatchLabels})
              </button>
              <button
                type="button"
                onClick={() => setPreviewFilter("active")}
                className={`barcode-preset-btn ${previewFilter === "active" ? "active font-bold" : ""}`}
                title="Preview only the currently selected design"
              >
                Current Design Only
              </button>

              <span className="barcode-preset-label ml-2">Sheet Cols:</span>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPrintColumns(3); }}
                className={`barcode-preset-btn ${printColumns === 3 ? "active font-bold" : ""}`}
                title="3 Columns - A4 Sheet"
              >
                3 Cols (A4)
              </button>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPrintColumns(2); }}
                className={`barcode-preset-btn ${printColumns === 2 ? "active font-bold" : ""}`}
                title="2 Columns"
              >
                2 Cols
              </button>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPrintColumns(1); }}
                className={`barcode-preset-btn ${printColumns === 1 ? "active font-bold" : ""}`}
                title="1 Column - Roll"
              >
                1 Col (Roll)
              </button>
            </div>
          </div>

          {/* 3. Size Quantity Counters for Active Design */}
          <div className="barcode-size-counters">
            {activeItem.variantsList.map((v, idx) => (
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
                  <span className="barcode-counter-num">{activeItem.quantities[idx] || 0}</span>
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDownloadSingleLabel({
                      productTitle: activeItem.productTitle,
                      productType: activeItem.productType,
                      size: v.size,
                      price: v.price,
                      comparePrice: v.comparePrice,
                      sku: v.sku,
                    });
                  }}
                  className="barcode-download-single-btn"
                  title={`Download single 2.5 x 1.5 in sticker for Size ${v.size}`}
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
            {allStickersList.map((tag, tagIdx) => (
              <div key={tagIdx} className="barcode-sticker-item-wrapper">
                <div className="barcode-sticker-tag">
                  {/* ── Product Title & Category ── */}
                  <div className="barcode-tag-header-area">
                    <div className="barcode-tag-title">{tag.productTitle}</div>
                    <div className="barcode-tag-category">
                      100% Cotton · {/oversize/i.test(tag.productTitle + " " + tag.productType) ? "240" : "220"} GSM
                    </div>
                  </div>

                  {/* ── Size & Price Row ── */}
                  <div className="barcode-tag-meta">
                    <div className="barcode-tag-size-pill">
                      <span className="barcode-tag-size-label">SIZE</span>
                      <span className="barcode-tag-size-value">{tag.size}</span>
                    </div>
                    <div className="barcode-tag-price-block">
                      {Number(tag.comparePrice) > Number(tag.price) && (
                        <span className="barcode-tag-mrp">
                          MRP ₹{Number(tag.comparePrice).toLocaleString("en-IN")}
                        </span>
                      )}
                      <span className="barcode-tag-price">₹{Number(tag.price).toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {/* ── Barcode ── */}
                  <div className="barcode-tag-svg">
                    <BarcodeSVG value={tag.sku} height={24} barWidth={1.05} />
                  </div>

                  {/* ── SKU + Made in India ── */}
                  <div className="barcode-tag-footer">
                    <div className="barcode-sku-box">{tag.sku}</div>
                    <div className="barcode-tag-origin">
                      <span className="barcode-origin-dot">●</span> Crafted in India
                    </div>
                  </div>
                </div>

                {/* ── Individual Tag Download Action (Outside Sticker Card) ── */}
                <div className="no-print barcode-item-actions">
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDownloadSingleLabel(tag); }}
                    className="barcode-tag-download-action"
                    title="Download 2.5 x 1.5 in (300 DPI) label"
                  >
                    <Download size={12} /> Download 2.5" × 1.5" PNG
                  </button>
                </div>
              </div>
            ))}

            {allStickersList.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 0", color: "#a1a1aa", width: "100%" }} className="no-print">
                <Tag size={40} style={{ margin: "0 auto 12px", strokeWidth: 1 }} />
                <p style={{ fontSize: "15px", fontWeight: 700, color: "#52525b" }}>No label copies selected in batch</p>
                <p style={{ fontSize: "13px", marginTop: "4px" }}>Select size quantities above or add another design to generate printable barcode tags.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
