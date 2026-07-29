export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://theoutliersstudio.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/dashboard/", "/profile/", "/checkout/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
