import React from "react";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

const slugMap = {
  "privacy-policy": "Privacy-Policy.md",
  "terms-of-service": "Terms-and-Conditions.md",
  "terms-and-conditions": "Terms-and-Conditions.md",
  "shipping-policy": "Shipping-Policy.md",
  "refund-policy": "Refund-Policy.md",
  "return-policy": "Return-Policy.md",
  "exchange-policy": "Exchange-Policy.md",
  "cancellation-policy": "Cancellation-Policy.md",
  "cookie-policy": "Cookie-Policy.md",
  "payment-policy": "Payment-Policy.md",
  "pricing-policy": "Pricing-Policy.md",
  "intellectual-property": "Intellectual-Property.md",
  "disclaimer": "Disclaimer.md",
  "grievance-policy": "Grievance-Policy.md",
  "accessibility": "Accessibility.md",
  "about": "About.md",
  "about-us": "About.md",
  "faq": "FAQ.md"
};

const placeholders = {
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

export async function generateStaticParams() {
  return Object.keys(slugMap).map((slug) => ({ slug }));
}

function parseMarkdownToJsx(text) {
  // Replace placeholders
  let processed = text;
  Object.keys(placeholders).forEach((key) => {
    processed = processed.replaceAll(key, placeholders[key]);
  });

  const lines = processed.split("\n");
  const elements = [];
  let currentListItems = [];
  let currentListType = null; // 'ul' or 'ol'
  let tableHeaders = [];
  let tableRows = [];

  const parseInline = (str) => {
    let html = str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<a href='$2'>$1</a>");
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  const flushList = (key) => {
    if (currentListItems.length > 0 && currentListType) {
      if (currentListType === 'ul') {
        elements.push(
          <ul key={key}>
            {currentListItems}
          </ul>
        );
      } else if (currentListType === 'ol') {
        elements.push(
          <ol key={key}>
            {currentListItems}
          </ol>
        );
      }
      currentListItems = [];
      currentListType = null;
    }
  };

  const flushTable = (key) => {
      if (tableHeaders.length > 0) {
        elements.push(
          <div key={key} className="policy-table-wrap">
            <table>
              <thead>
                <tr>
                  {tableHeaders.map((h, idx) => (
                    <th key={idx}>
                      {parseInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((col, cIdx) => (
                      <td key={cIdx}>
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
      elements.push(<hr key={`hr-${i}`} />);
      continue;
    }

    // Handle Headings
    if (line.startsWith("# ")) {
      flushList(`list-h1-${i}`);
      flushTable(`table-h1-${i}`);
      elements.push(
        <h1 key={`h1-${i}`}>
          {parseInline(line.substring(2))}
        </h1>
      );
      continue;
    }
    if (line.startsWith("## ")) {
      flushList(`list-h2-${i}`);
      flushTable(`table-h2-${i}`);
      elements.push(
        <h2 key={`h2-${i}`}>
          {parseInline(line.substring(3))}
        </h2>
      );
      continue;
    }
    if (line.startsWith("### ")) {
      flushList(`list-h3-${i}`);
      flushTable(`table-h3-${i}`);
      elements.push(
        <h3 key={`h3-${i}`}>
          {parseInline(line.substring(4))}
        </h3>
      );
      continue;
    }
    if (line.startsWith("#### ")) {
      flushList(`list-h4-${i}`);
      flushTable(`table-h4-${i}`);
      elements.push(
        <h4 key={`h4-${i}`}>
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
          <div key={`alert-note-${i}`} className="policy-callout policy-callout--note">
            {parseInline(quoteContent.substring(7).trim())}
          </div>
        );
      } else if (quoteContent.startsWith("[!TIP]")) {
        elements.push(
          <div key={`alert-tip-${i}`} className="policy-callout policy-callout--tip">
            {parseInline(quoteContent.substring(6).trim())}
          </div>
        );
      } else if (quoteContent.startsWith("[!IMPORTANT]") || quoteContent.startsWith("[!WARNING]") || quoteContent.startsWith("[!CAUTION]")) {
        const marker = quoteContent.startsWith("[!IMPORTANT]") ? 12 : 10;
        elements.push(
          <div key={`alert-warning-${i}`} className="policy-callout policy-callout--warning">
            {parseInline(quoteContent.substring(marker).trim())}
          </div>
        );
      } else {
        elements.push(
          <blockquote key={`quote-${i}`}>
            {parseInline(quoteContent)}
          </blockquote>
        );
      }
      continue;
    }

    // Handle Unordered Lists (- or *)
    if (line.startsWith("- ") || line.startsWith("* ")) {
      // But check if it's actually an italic line (starts and ends with * but no space)
      // Wait, check: if it starts with * but is followed by non-space and ends with *, it's italic, not a list!
      // For now, handle only lines that start with "* " (with space) OR "- " as list items!
      flushTable(`table-ul-${i}`);
      if (currentListType !== 'ul') {
        flushList(`list-switch-ul-${i}`);
        currentListType = 'ul';
      }
      currentListItems.push(
        <li key={`li-${i}-${currentListItems.length}`}>
          {parseInline(line.substring(2))}
        </li>
      );
      continue;
    }

    // Handle Ordered Lists (digits followed by .)
    const orderedListMatch = line.match(/^\d+\.\s+/);
    if (orderedListMatch) {
      flushTable(`table-ol-${i}`);
      if (currentListType !== 'ol') {
        flushList(`list-switch-ol-${i}`);
        currentListType = 'ol';
      }
      currentListItems.push(
        <li key={`li-${i}-${currentListItems.length}`}>
          {parseInline(line.substring(orderedListMatch[0].length))}
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
      <p key={`p-${i}`}>
        {parseInline(line)}
      </p>
    );
  }

  // Flush any remaining structures
  flushList("list-final");
  flushTable("table-final");

  return <div className="policy-content">{elements}</div>;
}

export default async function DynamicPolicyPage({ params }) {
  const { slug } = await params;
  const fileName = slugMap[slug];

  if (!fileName) {
    notFound();
  }

  const filePath = path.join(process.cwd(), "docs", fileName);

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  
  // Extract a readable Title for navigation / breadcrumbs
  const firstLine = fileContent.split("\n")[0] || "";
  const pageTitle = firstLine.startsWith("# ") 
    ? firstLine.substring(2).split("-")[0].trim() 
    : slug.replace(/-/g, " ");

  return (
    <div className="policy-page">
      <AnnouncementBar />
      <Header />
      <main className="policy-main">
        <div className="policy-shell">
          <nav className="policy-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/policies/privacy-policy">
              Policies
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{pageTitle}</span>
          </nav>

          <section className="policy-document">
            <div className="policy-document__bar" aria-hidden="true" />
            {parseMarkdownToJsx(fileContent)}
          </section>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
