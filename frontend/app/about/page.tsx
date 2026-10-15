import type { Metadata } from "next";
import Link from "next/link";
import { contactEmail } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "ToolHub is a free set of image, PDF, and developer tools at toolhub.grocoder.net.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">About ToolHub</h1>
      <div className="mt-6 space-y-4 leading-7 text-muted">
        <p>
          ToolHub is developed and maintained by <span className="font-semibold text-foreground">Grocoder Software Solutions</span>.
        </p>
        <p>
          ToolHub is a free website of small online tools: compress, convert, and resize images, merge or
          compress PDFs, format JSON, and generate passwords. It is published at toolhub.grocoder.net.
        </p>
        <p>
          Image and PDF tools send the file to the ToolHub API, return a download, and delete the temporary
          copy on a schedule. If you are signed in, that download can be saved on your account. JSON Formatter
          and Password Generator stay in the browser and do not upload what you paste or generate.
        </p>
        <p>
          The free server limit is 20 successful image or PDF operations per IP address per UTC day. Browser
          tools are not counted. Guides on the site explain formats, file size, and when to use each tool.
        </p>
        <p>
          Questions about the site, a file, or these pages can go to{" "}
          <a className="font-semibold text-accent-strong hover:underline" href={`mailto:${contactEmail}`}>
            {contactEmail}
          </a>
          . The <Link className="font-semibold text-accent-strong hover:underline" href="/contact">contact page</Link>{" "}
          lists the same address, and the{" "}
          <Link className="font-semibold text-accent-strong hover:underline" href="/privacy">privacy</Link> and{" "}
          <Link className="font-semibold text-accent-strong hover:underline" href="/cookie-policy">cookie</Link> pages
          explain what is stored.
        </p>
      </div>
    </article>
  );
}
