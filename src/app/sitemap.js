export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://theoutliersstudio.com";

  // Core navigation pages for Google indexing & Sitelinks
  const staticPages = [
    "",
    "/collections",
    "/collections/all",
    "/collections/bestsellers",
    "/collections/whats-new",
    "/collections/retro-clothing",
    "/collections/outliers-k-aracter",
    "/collections/outliers-recommends",
    "/contact",
    "/policies/privacy-policy",
    "/policies/terms-and-conditions",
    "/policies/shipping-and-delivery",
    "/policies/return-cancellation-and-refund",
  ];

  return staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === "" || route.startsWith("/collections") ? "daily" : "monthly",
    priority: route === "" ? 1.0 : route.startsWith("/collections") ? 0.8 : 0.5,
  }));
}
