import type { Metadata } from "next";
import Link from "next/link";
import { contactEmail } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Email ToolHub about the site, a tool, or a privacy question.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Contact</h1>
      <div className="mt-6 space-y-4 leading-7 text-muted">
        <p>
          Email{" "}
          <a className="font-semibold text-accent-strong hover:underline" href={`mailto:${contactEmail}`}>
            {contactEmail}
          </a>{" "}
          for questions about a tool, an account, or these policies. Include the page address and, for a failed
          upload, the file type and size. Do not attach passwords or private documents.
        </p>
        <p>
          ToolHub does not offer phone support. A reply goes to the address you write from. For how files and
          ads are handled, read the <Link className="font-semibold text-accent-strong hover:underline" href="/privacy">privacy policy</Link> and the{" "}
          <Link className="font-semibold text-accent-strong hover:underline" href="/cookie-policy">cookie policy</Link>.
        </p>
      </div>
    </article>
  );
}
