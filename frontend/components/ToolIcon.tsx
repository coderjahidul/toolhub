import type { ReactNode } from "react";

const icons: Record<string, ReactNode> = {
  "image-compressor": (
    <>
      <path d="M9 9 4 4M9 9H5M9 9V5" />
      <path d="m15 9 5-5M15 9h4M15 9V5" />
      <path d="m9 15-5 5M9 15H5M9 15v4" />
      <path d="m15 15 5 5M15 15h4M15 15v4" />
    </>
  ),
  "image-converter": (
    <>
      <path d="M7 7h8a3 3 0 0 1 0 6H9" />
      <path d="M7 17h8" />
      <path d="M6 5l2 2-2 2M18 15l-2 2 2 2" />
    </>
  ),
  "image-resizer": (
    <>
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
      <rect x="8" y="8" width="8" height="8" rx="1" />
    </>
  ),
  "pdf-merge": (
    <>
      <path d="M7 6h7l3 3v9H7z" />
      <path d="M14 6v3h3" />
      <path d="M5 10h7l3 3v7H5z" />
    </>
  ),
  "pdf-compress": (
    <>
      <path d="M7 4h7l3 3v13H7z" />
      <path d="M14 4v3h3" />
      <path d="M12 11v5M9.5 14.5 12 17l2.5-2.5" />
    </>
  ),
  "json-formatter": (
    <>
      <path d="M8 6c-2 0-3 1-3 3v1c0 1.5-1 2-2 2 1 0 2 .5 2 2v1c0 2 1 3 3 3" />
      <path d="M16 6c2 0 3 1 3 3v1c0 1.5 1 2 2 2-1 0-2 .5-2 2v1c0 2-1 3-3 3" />
    </>
  ),
  "password-generator": (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      <path d="M12 15v2" />
    </>
  ),
};

export function ToolIcon({ slug, className = "h-6 w-6" }: { slug: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      {icons[slug] ?? <rect x="4" y="4" width="16" height="16" rx="2" />}
    </svg>
  );
}
