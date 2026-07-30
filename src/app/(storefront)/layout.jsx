import "../globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theoutliersstudio.com";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "The Outliers Studio | Premium Streetwear & Urban Clothing",
    template: "%s | The Outliers Studio",
  },
  description:
    "The Outliers Studio is for those who refuse to blend in. We create premium streetwear that celebrates individuality, confidence, and the courage to choose your own path.",
  keywords: [
    "The Outliers Studio",
    "Outliers Studio",
    "streetwear india",
    "urban clothing",
    "oversized t-shirts",
    "cargos",
    "co-ords",
    "premium streetwear",
  ],
  authors: [{ name: "The Outliers Studio" }],
  creator: "The Outliers Studio",
  publisher: "The Outliers Studio",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
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
        url: `${SITE_URL}/logo.png`,
        width: 652,
        height: 298,
        alt: "The Outliers Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Outliers Studio | Premium Streetwear",
    description:
      "The Outliers Studio is for those who refuse to blend in. We create premium streetwear that celebrates individuality, confidence, and the courage to choose your own path.",
    images: [`${SITE_URL}/logo.png`],
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
  verification: {
    google: "googlea6f8b2cef56fe132",
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
        "logo": `${SITE_URL}/icon-512.png`,
        "image": `${SITE_URL}/logo.png`,
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
        <link rel="icon" href="/icon.svg?v=10" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico?v=10" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png?v=10" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cause:wght@100..900&family=Sour+Gummy:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
