import type { Metadata } from "next";
import Link from "next/link";
import { contactEmail } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms for using the free ToolHub image, PDF, and developer tools.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Terms</h1>
      <div className="mt-6 space-y-4 leading-7 text-muted">
        <p>
          ToolHub provides free utilities for images, PDFs, and small developer tasks. The free server limit is 20
          successful image or PDF operations per IP address per UTC day. Browser tools are not counted. Using the
          site means you accept these terms.
        </p>
        <p>
          Do not upload files you are not allowed to process. Do not send malware, executable files, or content
          that exceeds the posted size limits. ToolHub may reject a file that fails type checks. You are
          responsible for keeping a copy of anything you still need. Anonymous uploads are not a backup.
        </p>
        <p>
          Tools are provided as available. Output can differ from a desktop editor, especially for PNG
          compression, GIF frames, and PDF image downsampling. ToolHub is not liable for lost files, a rejected
          upload, or a result that does not match another program.
        </p>
        <p>
          Pages may show third-party ads after you accept cookies. Those ads are provided by Google AdSense under
          its own terms. ToolHub does not control the landing pages of ads. Advertising is described in the{" "}
          <Link className="font-semibold text-accent-strong hover:underline" href="/cookie-policy">cookie policy</Link>.
        </p>
        <p>
          Questions about these terms can go to{" "}
          <a className="font-semibold text-accent-strong hover:underline" href={`mailto:${contactEmail}`}>
            {contactEmail}
          </a>
          .
        </p>
      </div>
    </article>
  );
}
