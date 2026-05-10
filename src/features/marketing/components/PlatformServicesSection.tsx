import Link from "next/link";
import { platformServices } from "../data";
import { SectionHeader } from "./SectionHeader";

function serviceToPlatform(service: string): string {
  const s = service.toLowerCase();
  if (s.includes("youtube")) return "youtube";
  if (s.includes("instagram")) return "instagram";
  if (s.includes("facebook")) return "facebook";
  if (s.includes("tiktok")) return "tiktok";
  return "everything";
}

export function PlatformServicesSection() {
  return (
    <section className="bg-[#101010] py-20 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionHeader
          eyebrow="Best SMM services provider"
          title="Grow your business or social account with reliable SMM solutions."
          description="We provide social media marketing services for creators, shops, influencers, artists, and business pages that need more reach, stronger engagement, and better online visibility."
          eyebrowClassName="text-[#7dd3fc]"
          descriptionClassName="text-white/62"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {platformServices.map((service) => (
            <Link
              key={service}
              href={`/order?platform=${serviceToPlatform(service)}`}
              className="rounded-md border border-white/12 bg-white/[0.06] p-4 text-base font-semibold transition hover:border-[#7dd3fc]/40 hover:bg-white/[0.1]"
            >
              {service}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
