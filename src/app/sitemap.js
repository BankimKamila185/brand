export default async function sitemap() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://theoutliersstudio.com";
  const backendUrl =
    process.env.BACKEND_URL || "http://localhost:4000";

  // Static core pages
  const staticPages = [
    { route: "", priority: 1.0, changeFrequency: "daily" },
    { route: "/collections", priority: 0.9, changeFrequency: "daily" },
    { route: "/collections/all", priority: 0.9, changeFrequency: "daily" },
    { route: "/collections/bestsellers", priority: 0.8, changeFrequency: "daily" },
    { route: "/collections/whats-new", priority: 0.8, changeFrequency: "daily" },
    { route: "/collections/retro-clothing", priority: 0.8, changeFrequency: "weekly" },
    { route: "/collections/outliers-k-aracter", priority: 0.8, changeFrequency: "weekly" },
    { route: "/collections/outliers-recommends", priority: 0.8, changeFrequency: "weekly" },
    { route: "/products", priority: 0.9, changeFrequency: "daily" },
    { route: "/categories", priority: 0.7, changeFrequency: "weekly" },
    { route: "/contact", priority: 0.5, changeFrequency: "monthly" },
    { route: "/policies/privacy-policy", priority: 0.3, changeFrequency: "yearly" },
    { route: "/policies/terms-and-conditions", priority: 0.3, changeFrequency: "yearly" },
    { route: "/policies/terms-of-service", priority: 0.3, changeFrequency: "yearly" },
    { route: "/policies/shipping-and-delivery", priority: 0.3, changeFrequency: "yearly" },
    { route: "/policies/return-cancellation-and-refund", priority: 0.3, changeFrequency: "yearly" },
  ];

  const staticEntries = staticPages.map(({ route, priority, changeFrequency }) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency,
    priority,
  }));

  // Dynamic product pages
  let productEntries = [];
  try {
    const res = await fetch(`${backendUrl}/api/products?limit=500&status=active`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const products = data?.data?.products || data?.products || data?.data || [];
      productEntries = products
        .filter((p) => p?.handle)
        .map((product) => ({
          url: `${baseUrl}/products/${product.handle}`,
          lastModified: product.updatedAt
            ? new Date(product.updatedAt).toISOString()
            : new Date().toISOString(),
          changeFrequency: "weekly",
          priority: 0.7,
        }));
    }
  } catch {
    // Silently skip if backend is unreachable at build time
  }

  // Dynamic collection pages
  let collectionEntries = [];
  try {
    const res = await fetch(`${backendUrl}/api/collections`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const collections = data?.data || data?.collections || [];
      collectionEntries = collections
        .filter((c) => c?.handle)
        .map((collection) => ({
          url: `${baseUrl}/collections/${collection.handle}`,
          lastModified: collection.updatedAt
            ? new Date(collection.updatedAt).toISOString()
            : new Date().toISOString(),
          changeFrequency: "weekly",
          priority: 0.8,
        }));
    }
  } catch {
    // Silently skip if backend is unreachable at build time
  }

  return [...staticEntries, ...productEntries, ...collectionEntries];
}
