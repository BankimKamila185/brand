"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProductsIndexPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect /products to /collections/all for full catalogue view
    router.replace("/collections/all");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
      <div className="text-center py-20">
        <div style={{ width: 36, height: 36, border: "3px solid #e0e0e0", borderTopColor: "#222", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 16px" }} />
        <p className="text-neutral-600 font-semibold text-sm">Loading all products...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
