import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-[#101010] px-5 py-8 text-white sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-lg font-black">Ryzera SMM</p>
          <p className="mt-1 text-sm text-white/58">
            Affordable social media marketing services for fast online growth.
          </p>
        </div>
        <Link
          href="/order"
          className="inline-flex h-11 items-center justify-center rounded-md bg-white px-5 text-sm font-bold text-[#101010] transition hover:bg-[#f7f5ef]"
        >
          Place an order
        </Link>
      </div>
    </footer>
  );
}
