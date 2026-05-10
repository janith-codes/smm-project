import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

import { authNavItems, navItems } from "../data";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-black/10 bg-[#f7f5ef]/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Ryzera SMM
        </Link>
        <div className="hidden items-center gap-7 text-sm font-medium text-black/70 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-black"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/order"
              className="rounded-lg px-2.5 py-2 text-xs font-bold text-black/80 hover:bg-black/5"
            >
              Services
            </Link>
            <Link
              href="/order"
              className="rounded-lg bg-[#ff6b35] px-2.5 py-2 text-xs font-bold text-white"
            >
              Order
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={authNavItems[0].href}
              className={buttonVariants({
                variant: "ghost",
                className: "px-3",
              })}
            >
              {authNavItems[0].label}
            </a>
            <a
              href={authNavItems[1].href}
              className={buttonVariants({
                variant: "default",
                className: "px-3 sm:px-4",
              })}
            >
              {authNavItems[1].label}
            </a>
          </div>
          <Link
            href="/order"
            className={buttonVariants({
              variant: "accent",
              className: "hidden px-4 lg:inline-flex",
            })}
          >
            Order now
          </Link>
        </div>
      </nav>
    </header>
  );
}
