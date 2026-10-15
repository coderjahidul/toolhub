import Link from "next/link";
import { CookieSettingsButton } from "@/components/CookieConsent";
import { publisherName } from "@/lib/site";
import { tools } from "@/lib/tools";

const groups = [
  { title: "Image", category: "image" },
  { title: "PDF", category: "pdf" },
  { title: "Developer", category: "developer" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-header text-header-muted">
      <div className="mx-auto grid w-full max-w-[1280px] gap-10 px-4 py-12 sm:px-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-base font-semibold text-white">ToolHub</p>
          <p className="mt-3 max-w-xs text-sm leading-6">
            Free image, PDF, and developer tools. Signed-in results can be saved. Anonymous uploads are not kept.
          </p>
        </div>
        {groups.map((group) => (
          <div key={group.category}>
            <p className="text-sm font-semibold text-white">{group.title}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {tools
                .filter((tool) => tool.category === group.category)
                .map((tool) => (
                  <li key={tool.slug}>
                    <Link href={`/tool/${tool.slug}`} className="hover:text-white">
                      {tool.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-3 px-4 py-5 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} ToolHub | Developed by{" "}
            <a href="https://grocoder.net/" className="font-semibold text-white" rel="noreferrer">
              {publisherName}
            </a>
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/about" className="hover:text-white">
              About
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>
            <Link href="/blog" className="hover:text-white">
              Guides
            </Link>
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/cookie-policy" className="hover:text-white">
              Cookies
            </Link>
            <CookieSettingsButton />
          </div>
        </div>
      </div>
    </footer>
  );
}
