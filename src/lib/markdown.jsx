import React from "react";

export const placeholders = {
  "[BUSINESS_NAME]": "THE OUTLIERS STUDIO PRIVATE LIMITED",
  "[BRAND_NAME]": "The Outliers Studio",
  "[REGISTERED_OFFICE_ADDRESS]": "Flat No. 402, 4th Floor, Block-A, Streetwear Residency, HSR Layout Sector 2, Bengaluru, Karnataka - 560102, India",
  "[WAREHOUSE_ADDRESS]": "Warehouse No. 12, Ground Floor, Industrial Logistics Park, Nelamangala Road, Bengaluru Rural, Karnataka - 562123, India",
  "[GSTIN]": "29AAAAA0000A1Z1",
  "[PAN]": "AAAAA0000A",
  "[CIN]": "U17299KA2026PTC123456",
  "[SUPPORT_PHONE]": "+91 73044 06772",
  "[SUPPORT_EMAIL]": "support@theoutliersstudio.com",
  "[GRIEVANCE_EMAIL]": "grievance@theoutliersstudio.com",
  "[NODAL_EMAIL]": "nodal@theoutliersstudio.com",
  "[WORKING_HOURS]": "Monday to Saturday, 10:00 AM to 7:00 PM (IST)",
  "[WEBSITE_URL]": "https://brand-two-mocha.vercel.app",
  "[INSTAGRAM_URL]": "https://instagram.com/theoutliersstudio"
};

export function parseMarkdownToJsx(text) {
  // Replace placeholders
  let processed = text;
  Object.keys(placeholders).forEach((key) => {
    processed = processed.replaceAll(key, placeholders[key]);
  });

  const lines = processed.split("\n");
  const elements = [];
  let currentList = [];
  let inList = false;
  let inTable = false;
  let tableHeaders = [];
  let tableRows = [];

  const parseInline = (str) => {
    let html = str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code class='bg-neutral-850 text-neutral-200 px-1.5 py-0.5 rounded text-xs font-mono border border-neutral-700'>$1</code>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<a href='$2' class='text-white hover:underline decoration-white font-semibold transition-colors'>$1</a>");
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  const flushList = (key) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={key} className="list-disc pl-6 my-6 space-y-2 text-neutral-300">
          {currentList}
        </ul>
      );
      currentList = [];
    }
    inList = false;
  };

  const flushTable = (key) => {
    if (tableHeaders.length > 0) {
      elements.push(
        <div key={key} className="overflow-x-auto my-8 border border-neutral-800 rounded-xl bg-neutral-950/40 backdrop-blur-md">
          <table className="min-w-full divide-y divide-neutral-800">
            <thead className="bg-neutral-900/50">
              <tr>
                {tableHeaders.map((h, idx) => (
                  <th key={idx} className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    {parseInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                  {row.map((col, cIdx) => (
                    <td key={cIdx} className="px-6 py-4 text-sm text-neutral-300">
                      {parseInline(col)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      tableHeaders = [];
    }
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === "") {
      continue;
    }

    // Handle horizontal rule
    if (line === "---") {
      flushList(`list-hr-${i}`);
      flushTable(`table-hr-${i}`);
      elements.push(<hr key={`hr-${i}`} className="my-10 border-neutral-800" />);
      continue;
    }

    // Handle Headings
    if (line.startsWith("# ")) {
      flushList(`list-h1-${i}`);
      flushTable(`table-h1-${i}`);
      elements.push(
        <h1 key={`h1-${i}`} className="text-4xl font-black tracking-tight text-white mt-12 mb-6">
          {parseInline(line.substring(2))}
        </h1>
      );
      continue;
    }
    if (line.startsWith("## ")) {
      flushList(`list-h2-${i}`);
      flushTable(`table-h2-${i}`);
      elements.push(
        <h2 key={`h2-${i}`} className="text-2xl font-extrabold text-white mt-10 mb-4 border-b border-neutral-800 pb-2.5">
          {parseInline(line.substring(3))}
        </h2>
      );
      continue;
    }
    if (line.startsWith("### ")) {
      flushList(`list-h3-${i}`);
      flushTable(`table-h3-${i}`);
      elements.push(
        <h3 key={`h3-${i}`} className="text-xl font-bold text-white mt-8 mb-3">
          {parseInline(line.substring(4))}
        </h3>
      );
      continue;
    }
    if (line.startsWith("#### ")) {
      flushList(`list-h4-${i}`);
      flushTable(`table-h4-${i}`);
      elements.push(
        <h4 key={`h4-${i}`} className="text-lg font-bold text-neutral-200 mt-6 mb-2">
          {parseInline(line.substring(5))}
        </h4>
      );
      continue;
    }

    // Handle Blockquotes & Alerts
    if (line.startsWith("> ")) {
      flushList(`list-quote-${i}`);
      flushTable(`table-quote-${i}`);
      const quoteContent = line.substring(2);
      if (quoteContent.startsWith("[!NOTE]")) {
        elements.push(
          <div key={`alert-note-${i}`} className="p-4 my-6 bg-neutral-900/60 border-l-4 border-blue-500 rounded-r-lg text-sm text-neutral-300">
            {parseInline(quoteContent.substring(7).trim())}
          </div>
        );
      } else if (quoteContent.startsWith("[!TIP]")) {
        elements.push(
          <div key={`alert-tip-${i}`} className="p-4 my-6 bg-neutral-900/60 border-l-4 border-emerald-500 rounded-r-lg text-sm text-neutral-300">
            {parseInline(quoteContent.substring(6).trim())}
          </div>
        );
      } else if (quoteContent.startsWith("[!IMPORTANT]") || quoteContent.startsWith("[!WARNING]") || quoteContent.startsWith("[!CAUTION]")) {
        const marker = quoteContent.startsWith("[!IMPORTANT]") ? 12 : 10;
        elements.push(
          <div key={`alert-warning-${i}`} className="p-4 my-6 bg-neutral-900/60 border-l-4 border-rose-500 rounded-r-lg text-sm text-neutral-300">
            {parseInline(quoteContent.substring(marker).trim())}
          </div>
        );
      } else {
        elements.push(
          <blockquote key={`quote-${i}`} className="pl-4 italic border-l-4 border-neutral-700 my-6 text-neutral-400">
            {parseInline(quoteContent)}
          </blockquote>
        );
      }
      continue;
    }

    // Handle Lists
    if (line.startsWith("- ") || line.startsWith("* ")) {
      flushTable(`table-list-${i}`);
      inList = true;
      currentList.push(
        <li key={`li-${i}-${currentList.length}`}>
          {parseInline(line.substring(2))}
        </li>
      );
      continue;
    }

    // Handle Tables
    if (line.startsWith("|")) {
      flushList(`list-table-${i}`);
      const cols = line.split("|").map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (line.includes(":---") || line.includes("---:")) {
        continue;
      }
      inTable = true;
      if (tableHeaders.length === 0) {
        tableHeaders = cols;
      } else {
        tableRows.push(cols);
      }
      continue;
    }

    // Handle normal paragraphs
    flushList(`list-p-${i}`);
    flushTable(`table-p-${i}`);
    elements.push(
      <p key={`p-${i}`} className="my-5 text-neutral-300 leading-relaxed font-light">
        {parseInline(line)}
      </p>
    );
  }

  // Flush any remaining structures
  flushList("list-final");
  flushTable("table-final");

  return <div className="prose prose-invert max-w-none">{elements}</div>;
}
