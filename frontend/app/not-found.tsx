import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Page not found</h1>
      <p className="mt-3 text-muted">That tool or page is not part of this ToolHub release.</p>
      <Link href="/" className="mt-6 inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white">
        Back to tools
      </Link>
    </div>
  );
}
