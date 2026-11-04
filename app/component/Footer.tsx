import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#17212b] px-6 py-10 text-white sm:px-10 lg:px-16">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-sm">
          <Link
            href="/"
            className="text-xl font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-300"
          >
            Briefy
          </Link>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Clear takeaways from the webpages you want to understand.
          </p>
        </div>

        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-200">
            <li>
              <a
                href="#sample-brief"
                className="transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-300"
              >
                Sample brief
              </a>
            </li>
            <li>
              <a
                href="#how-it-works"
                className="transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-300"
              >
                How it works
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="mx-auto mt-8 w-full max-w-7xl border-t border-white/15 pt-5 text-xs text-slate-400">
        &copy; 2026 Briefy
      </div>
    </footer>
  );
}
