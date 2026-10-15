import type { Metadata } from "next";
import Link from "next/link";
import { contactEmail } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How ToolHub handles uploads, accounts, usage logs, and Google AdSense.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Privacy</h1>
      <div className="mt-6 space-y-4 leading-7 text-muted">
        <p>
          Image and PDF tools upload your file to the ToolHub API so it can be processed. The result is returned
          as a download. Temp files are deleted on a schedule. If you are signed in, the result is also stored on
          your account so you can download it later. Anonymous uploads are not kept.
        </p>
        <p>
          Each successful image or PDF operation stores a tool name, a hash of the IP address, the input size, and
          a timestamp. The raw IP address is not stored. That record enforces the free daily limit.
        </p>
        <p>
          An account stores the name, email, and password hash you submit, or the profile data returned by the
          sign-in provider. Saved files stay until you delete them or the account. The session token lives in
          local storage in your browser.
        </p>
        <p>
          JSON Formatter and Password Generator run in your browser. Their contents are not sent to ToolHub.
        </p>
        <h2 className="pt-2 text-2xl font-semibold tracking-tight text-foreground">Advertising</h2>
        <p>
          When ads are turned on and you accept cookies, pages load Google AdSense. Google may use cookies and
          similar storage to serve and measure ads. ToolHub does not receive the contents of those cookies. You
          can reject ads, change the choice later, and read the details in the{" "}
          <Link className="font-semibold text-accent-strong hover:underline" href="/cookie-policy">cookie policy</Link>.
        </p>
        <p>
          To ask for a correction or deletion of account data, email{" "}
          <a className="font-semibold text-accent-strong hover:underline" href={`mailto:${contactEmail}`}>
            {contactEmail}
          </a>
          . Anonymous usage hashes are not tied to a name, so they cannot be looked up from an email address.
        </p>
      </div>
    </article>
  );
}
