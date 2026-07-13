"use client";

import { cn } from "@/lib/utils";

export function SimpleIcon({ icon, className, ...props }) {
  const { title, path } = icon;

  return (
    <svg
      viewBox="0 0 24 24"
      aria-label={title}
      aria-hidden="false"
      focusable="false"
      className={cn("size-5 fill-foreground", className)}
      {...props}
    >
      <title>{title}</title>
      <path d={path} />
    </svg>
  );
}
