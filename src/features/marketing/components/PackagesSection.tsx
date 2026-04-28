import { servicePackages } from "../data";
import type { ServicePackage } from "../types";
import { SectionHeader } from "./SectionHeader";

function ServicePackageCard({ item }: { item: ServicePackage }) {
  return (
    <article className="rounded-md border border-black/10 bg-[#faf8f2] p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-black/50">
          {item.platform}
        </p>
        <span className="rounded-md bg-white px-3 py-1 text-xs font-bold text-[#9a3412]">
          {item.tag}
        </span>
      </div>
      <h3 className="mt-6 text-3xl font-black tracking-tight">{item.name}</h3>
      <p className="mt-5 text-4xl font-black text-[#ff6b35]">{item.price}</p>
      <p className="mt-3 text-sm font-medium text-black/58">
        Estimated delivery: {item.delivery}
      </p>
      <a
        href="#order"
        className="mt-7 inline-flex h-11 w-full items-center justify-center rounded-md bg-[#121212] text-sm font-bold text-white transition hover:bg-[#2a2a2a]"
      >
        Select package
      </a>
    </article>
  );
}

export function PackagesSection() {
  return (
    <section id="packages" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <SectionHeader
            eyebrow="Our services"
            title="Cheapest and best SMM packages for all social platforms."
          />
          <p className="max-w-md text-base leading-7 text-black/62">
            Get YouTube views, Instagram reel views, Facebook video views, TikTok
            engagement, and more from one trusted place with simple pricing.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {servicePackages.map((item) => (
            <ServicePackageCard
              key={`${item.platform}-${item.name}`}
              item={item}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
