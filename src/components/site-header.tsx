import Link from "next/link";

import { currentUser } from "@/auth";
import { logoutAction } from "@/app/actions/auth";
import { Avatar } from "@/components/ui/avatar";
import { buttonClass } from "@/components/ui/button";

export async function SiteHeader() {
  const user = await currentUser();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur">
      <div className="page-shell flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-lg bg-brand text-base font-semibold text-brand-fg"
          >
            कौ
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold tracking-tight">Kausal Sangam</span>
            <span className="block text-[11px] text-muted">skill swap community</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-2">
          <Link href="/browse" className={buttonClass("ghost", "sm")}>
            Browse
          </Link>

          {user ? (
            <>
              <Link href="/dashboard" className={buttonClass("ghost", "sm")}>
                Dashboard
              </Link>
              <Link
                href="/dashboard/profile"
                className="ml-1 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                title={user.name ?? "Your profile"}
              >
                <Avatar name={user.name ?? "You"} src={user.image} size={32} />
              </Link>
              <form action={logoutAction}>
                <button type="submit" className={buttonClass("ghost", "sm")}>
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={buttonClass("secondary", "sm")}>
                Sign in
              </Link>
              <Link href="/register" className={buttonClass("primary", "sm")}>
                Join free
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
