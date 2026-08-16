import "../globals.css";
import Script from "next/script";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import CountdownGate from "@/components/CountdownGate";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theoutliersstudio.com";
const BRAND_ICON_VERSION = "20260804_v4";
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "./",
  },
  title: {
    default: "The Outliers Studio | Premium Streetwear & Urban Clothing India",
    template: "%s | The Outliers Studio",
  },
  description:
    "Discover The Outliers Studio — India's premier luxury streetwear brand. Shop oversized t-shirts, graphic tees, cargos, co-ords & hoodies crafted for those who refuse to blend in.",
  keywords: [
    "The Outliers Studio",
    "Outliers Studio",
    "Outliers Clothing",
    "Tevar Fashion",
    "Tevar Streetwear",
    "streetwear india",
    "urban clothing india",
    "oversized t-shirts india",
    "oversized t shirts for men",
    "oversized t shirts for women",
    "luxury streetwear india",
    "premium streetwear brand",
    "graphic tees india",
    "oversized hoodies",
    "cargos india",
    "co-ord sets men",
    "aesthetic streetwear",
    "unisex streetwear",
    "baggy t-shirts",
    "trending streetwear brands",
    "buy oversized t-shirts online",
    "streetwear online store",
  ],
  authors: [{ name: "The Outliers Studio" }],
  creator: "The Outliers Studio",
  publisher: "The Outliers Studio",
  manifest: "/site.webmanifest",
  verification: {
    google: GOOGLE_SITE_VERIFICATION,
  },
  icons: {
    icon: [
      { url: `/favicon-96x96.png?v=${BRAND_ICON_VERSION}`, sizes: "96x96", type: "image/png" },
      { url: `/icon.svg?v=${BRAND_ICON_VERSION}`, type: "image/svg+xml" },
      { url: `/favicon.ico?v=${BRAND_ICON_VERSION}`, sizes: "any" },
      { url: `/icon.png?v=${BRAND_ICON_VERSION}`, sizes: "512x512", type: "image/png" },
    ],
    shortcut: [`/favicon.ico?v=${BRAND_ICON_VERSION}`],
    apple: [
      { url: `/apple-touch-icon.png?v=${BRAND_ICON_VERSION}`, sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "The Outliers Studio | Premium Streetwear & Urban Clothing",
    description:
      "The Outliers Studio is for those who refuse to blend in. We create premium streetwear that celebrates individuality, confidence, and the courage to choose your own path.",
    url: SITE_URL,
    siteName: "The Outliers Studio",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/seo-logo.svg`,
        width: 2484,
        height: 1110,
        alt: "The Outliers Studio - flame logo with wordmark",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Outliers Studio | Premium Streetwear",
    description:
      "The Outliers Studio is for those who refuse to blend in. We create premium streetwear that celebrates individuality, confidence, and the courage to choose your own path.",
    images: [`${SITE_URL}/seo-logo.svg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        "url": SITE_URL,
        "name": "The Outliers Studio",
        "alternateName": ["Outliers Studio", "The Outliers Studio Clothing"],
        "description": "The Outliers Studio is for those who refuse to blend in. We create premium streetwear that celebrates individuality, confidence, and the courage to choose your own path.",
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${SITE_URL}/collections?search={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        "name": "The Outliers Studio",
        "url": SITE_URL,
        "logo": {
          "@type": "ImageObject",
          "url": `${SITE_URL}/seo-logo.png?v=${BRAND_ICON_VERSION}`,
          "width": 512,
          "height": 512
        },
        "image": `${SITE_URL}/seo-logo.png?v=${BRAND_ICON_VERSION}`,
        "sameAs": [
          "https://www.instagram.com/theoutliersstudio"
        ]
      },
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/#sitelinks`,
        "name": "Main Collections",
        "itemListElement": [
          {
            "@type": "SiteNavigationElement",
            "position": 1,
            "name": "All Products",
            "url": `${SITE_URL}/collections/all`
          },
          {
            "@type": "SiteNavigationElement",
            "position": 2,
            "name": "Bestsellers",
            "url": `${SITE_URL}/collections/bestsellers`
          },
          {
            "@type": "SiteNavigationElement",
            "position": 3,
            "name": "New Arrivals",
            "url": `${SITE_URL}/collections/whats-new`
          },
          {
            "@type": "SiteNavigationElement",
            "position": 4,
            "name": "Retro Clothing",
            "url": `${SITE_URL}/collections/retro-clothing`
          }
        ]
      }
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="The Outliers Studio" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cause:wght@100..900&family=Sour+Gummy:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        <AuthProvider>
          <CartProvider>
            <CountdownGate>{children}</CountdownGate>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
