"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import "./globals.css";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Global Error Boundary caught an exception:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-white text-neutral-900 font-sans min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-900 flex items-center justify-center mx-auto mb-6 font-bold text-xl border border-neutral-200">
            !
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Something went wrong</h1>
          <p className="text-sm text-neutral-600 mb-6">
            An error occurred on the server. Click below to reload the page or return to safety.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="px-5 py-2.5 bg-black text-white font-bold text-xs uppercase tracking-wider rounded cursor-pointer hover:bg-neutral-800"
            >
              Reload Page
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 bg-white border border-neutral-300 text-neutral-900 font-bold text-xs uppercase tracking-wider rounded hover:bg-neutral-50"
            >
              Return Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
