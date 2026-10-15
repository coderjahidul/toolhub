import type { Metadata } from "next";
import Link from "next/link";
import { contactEmail } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cookie policy",
  description: "How ToolHub uses a consent choice and how Google AdSense cookies work when you allow ads.",
  alternates: { canonical: "/cookie-policy" },
};

export default function CookiePolicyPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Cookie policy</h1>
      <div className="mt-6 space-y-4 leading-7 text-muted">
        <p>
          ToolHub does not set its own analytics or advertising cookies. A signed-in session is a token kept in
          your browser’s local storage, not a cookie. The site also stores your ad choice there under the name{" "}
          <span className="text-foreground">toolhub-ads-consent</span>. That value is either granted or denied, and
          it stays until you clear site data or use Cookie settings in the footer.
        </p>
        <h2 className="pt-2 text-2xl font-semibold tracking-tight text-foreground">Advertising cookies</h2>
        <p>
          If you choose Accept on the cookie banner, and ads are enabled, the page loads Google AdSense
          (pagead2.googlesyndication.com). Google may then set cookies such as IDE or DSID to show and measure
          ads, including on other sites that use Google advertising. Those cookies can last from a session up to
          about 13 months, depending on the cookie and your Google settings. If you choose Reject, ToolHub does
          not load the AdSense script.
        </p>
        <p>
          You can change the choice at any time with Cookie settings in the footer. You can also block
          third-party cookies in the browser, or review ad personalization at{" "}
          <a className="font-semibold text-accent-strong hover:underline" href="https://adssettings.google.com" rel="noreferrer">
            Google Ads Settings
          </a>
          . More about how Google uses data from sites that show its ads is in{" "}
          <a className="font-semibold text-accent-strong hover:underline" href="https://policies.google.com/technologies/ads" rel="noreferrer">
            Google’s advertising policy
          </a>
          .
        </p>
        <p>
          Questions about this page can go to{" "}
          <a className="font-semibold text-accent-strong hover:underline" href={`mailto:${contactEmail}`}>
            {contactEmail}
          </a>
          . File uploads and account data are described in the{" "}
          <Link className="font-semibold text-accent-strong hover:underline" href="/privacy">privacy policy</Link>.
        </p>
      </div>
    </article>
  );
}
