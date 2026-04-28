import { buttonVariants } from "@/components/ui/button";

import { authNavItems, navItems } from "../data";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-black/10 bg-[#f7f5ef]/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <a href="#" className="text-lg font-bold tracking-tight">
          Ryzera SMM
        </a>
        <div className="hidden items-center gap-7 text-sm font-medium text-black/70 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition hover:text-black"
            >
              {item.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-5">
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
          <a
            href="#order"
            className={buttonVariants({
              variant: "accent",
              className: "hidden px-4 lg:inline-flex",
            })}
          >
            Order now
          </a>
        </div>
      </nav>
    </header>
  );
}
