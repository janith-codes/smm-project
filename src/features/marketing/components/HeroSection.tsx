import Image from "next/image";

import { heroStats } from "../data";

function HeroStats() {
  return (
    <dl className="mt-10 grid max-w-xl grid-cols-3 gap-3 text-sm">
      {heroStats.map((stat) => (
        <div
          key={stat.label}
          className={`border-l-2 pl-3 ${stat.accentClassName}`}
        >
          <dt className="font-bold text-2xl">{stat.value}</dt>
          <dd className="text-black/60">{stat.label}</dd>
        </div>
      ))}
    </dl>
  );
}

function HeroPackagePreview() {
  return (
    <div className="absolute inset-x-5 bottom-5 rounded-md border border-white/30 bg-white/88 p-5 shadow-xl backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-black/55">
            Selected package
          </p>
          <p className="mt-1 text-2xl font-black">YouTube 1,000 views</p>
        </div>
        <span className="rounded-md bg-[#e9fff5] px-3 py-2 text-sm font-bold text-[#007a55]">
          Ready
        </span>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-md bg-[#f3f1eb] p-3">
          <p className="font-bold">LKR 1,250</p>
          <p className="mt-1 text-black/55">Price</p>
        </div>
        <div className="rounded-md bg-[#f3f1eb] p-3">
          <p className="font-bold">12-48h</p>
          <p className="mt-1 text-black/55">Delivery</p>
        </div>
        <div className="rounded-md bg-[#f3f1eb] p-3">
          <p className="font-bold">Manual</p>
          <p className="mt-1 text-black/55">Support</p>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-black/10 bg-[#f7f5ef]">
      <div className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:py-16">
        <div className="max-w-3xl">
          <p className="mb-5 inline-flex rounded-md border border-[#ff6b35]/30 bg-[#fff4ed] px-3 py-2 text-sm font-semibold text-[#9a3412]">
            Cheapest SMM services for every platform
          </p>
          <h1 className="max-w-4xl text-5xl font-black leading-[1.02] tracking-tight text-[#151515] sm:text-6xl lg:text-7xl">
            Best SMM panel services for YouTube, Instagram, Facebook and TikTok.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-black/68">
            Ryzera SMM helps creators, businesses, and page owners grow their
            online presence with affordable views, followers, likes, and
            subscribers. Choose a package, submit your link, and our support team
            will handle your order with care.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#order"
              className="inline-flex h-12 items-center justify-center rounded-md bg-[#ff6b35] px-6 text-base font-bold text-white shadow-[0_14px_35px_rgba(255,107,53,0.25)] transition hover:bg-[#e85d2e]"
            >
              Order YouTube views
            </a>
            <a
              href="#packages"
              className="inline-flex h-12 items-center justify-center rounded-md border border-black/15 bg-white px-6 text-base font-bold text-[#171717] transition hover:border-black/35"
            >
              View packages
            </a>
          </div>
          <HeroStats />
        </div>

        <div className="relative min-h-[520px] lg:min-h-[650px]">
          <Image
            src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1400&q=80"
            alt="Social media apps displayed on a smartphone"
            fill
            sizes="(min-width: 1024px) 48vw, 100vw"
            priority
            className="absolute inset-0 h-full w-full rounded-md object-cover shadow-2xl"
          />
          <HeroPackagePreview />
        </div>
      </div>
    </section>
  );
}
