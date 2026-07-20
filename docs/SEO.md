# SEO & Metadata Guidelines - The Outliers Studio

This document defines the SEO titles, meta descriptions, OpenGraph attributes, and structured JSON-LD schema recommendations to optimize search engine ranking and social media click-through rates for **The Outliers Studio**.

---

## 1. Homepage Metadata

* **SEO Title**: `The Outliers Studio | Premium Oversized Streetwear India`
* **Meta Description**: `Shop premium oversized t-shirts, graphic hoodies, sweatshirts, and streetwear accessories at The Outliers Studio. Unique fits, heavy-weight cotton, and limited drops. Made for the bold. Free shipping in India above ₹999.`
* **OpenGraph (OG) Title**: `The Outliers Studio - Premium Streetwear drops`
* **OpenGraph (OG) Description**: `Ditch the standard. Explore our premium streetwear drops, oversized t-shirts, and structured outerwear. Free shipping and secure checkouts via Razorpay.`
* **OG Image**: URL pointing to standard campaign banner: `https://www.theoutliersstudio.com/images/og-homepage.jpg`
* **Canonical URL**: `https://www.theoutliersstudio.com`

---

## 2. Product Category Pages

### A. Oversized T-Shirts
* **SEO Title**: `Premium Oversized T-Shirts | The Outliers Studio`
* **Meta Description**: `Browse our collection of heavy-weight, drop-shoulder oversized graphic t-shirts. 100% premium Indian cotton, durable prints, and custom relaxed fits.`
* **Canonical URL**: `https://www.theoutliersstudio.com/shop/oversized-t-shirts`

### B. Hoodies & Sweatshirts
* **SEO Title**: `Oversized Hoodies & Sweatshirts | The Outliers Studio`
* **Meta Description**: `Stay warm in style. Shop heavy-weight cotton hoodies and sweatshirts with premium graphics, dropped shoulders, and double-stitch detailing.`
* **Canonical URL**: `https://www.theoutliersstudio.com/shop/hoodies-sweatshirts`

---

## 3. Product Detail Page (Dynamic Pattern)

* **SEO Title**: `[Product_Name] - Premium Streetwear | The Outliers Studio`
* **Meta Description**: `Buy the [Product_Name] online at The Outliers Studio. Featuring [Product_Color] [Product_Material], signature oversized fit, and [Product_Print_Type]. Check sizes & buy securely.`
* **OG Title**: `[Product_Name] | The Outliers Studio India`
* **OG Description**: `Shop the [Product_Name] today. Available in sizes S-XXL. Free shipping in India on orders over ₹999.`
* **Canonical URL**: `https://www.theoutliersstudio.com/products/[Product_Slug]`

---

## 4. Legal & Policy Pages

* **Privacy Policy SEO Title**: `Privacy Policy | DPDPA 2023 Compliant | The Outliers Studio`
* **Terms & Conditions SEO Title**: `Terms and Conditions | The Outliers Studio`
* **Shipping Policy SEO Title**: `Shipping & Delivery Timelines | The Outliers Studio`
* **Return & Refund Policy SEO Title**: `Returns, Refunds & Exchanges | The Outliers Studio`

---

## 5. JSON-LD Schema Structured Data (Next.js App Router Integration)

These JSON-LD blocks should be injected inside the `<head>` of the respective routes to enable Google Rich Snippets.

### A. Organization Schema (Inject on Homepage)
```json
{
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  "name": "The Outliers Studio",
  "legalName": "[BUSINESS_NAME]",
  "url": "https://www.theoutliersstudio.com",
  "logo": "https://www.theoutliersstudio.com/logo.png",
  "foundingDate": "2026",
  "sameAs": [
    "[INSTAGRAM_URL]"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "[SUPPORT_PHONE]",
    "contactType": "customer service",
    "email": "[SUPPORT_EMAIL]",
    "availableLanguage": ["English", "Hindi"]
  }
}
```

### B. Product Schema (Inject on Product Detail Pages)
```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "{{product.name}}",
  "image": [
    "{{product.image_url}}"
  ],
  "description": "{{product.description}}",
  "sku": "{{product.sku}}",
  "mpn": "{{product.mpn}}",
  "brand": {
    "@type": "Brand",
    "name": "The Outliers Studio"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://www.theoutliersstudio.com/products/{{product.slug}}",
    "priceCurrency": "INR",
    "price": "{{product.price}}",
    "priceValidUntil": "2027-12-31",
    "itemCondition": "https://schema.org/NewCondition",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "The Outliers Studio"
    }
  }
}
```
