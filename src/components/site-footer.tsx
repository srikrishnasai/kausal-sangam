import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="page-shell flex flex-col gap-3 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-medium text-fg">Kausal Sangam</span> — कौशल संगम, a confluence of
          skills. Trade what you know.
        </p>
        <div className="flex gap-4">
          <Link href="/browse" className="hover:text-fg">
            Browse members
          </Link>
          <Link href="/register" className="hover:text-fg">
            Join
          </Link>
        </div>
      </div>
    </footer>
  );
}
