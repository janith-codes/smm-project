import { FaqSection } from "./FaqSection";
import { HeroSection } from "./HeroSection";
import { OrderSection } from "./OrderSection";
import { PackagesSection } from "./PackagesSection";
import { PlatformServicesSection } from "./PlatformServicesSection";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { WorkflowSection } from "./WorkflowSection";

export function MarketingPage() {
  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#171717]">
      <SiteHeader />
      <HeroSection />
      <PackagesSection />
      <PlatformServicesSection />
      <OrderSection />
      <WorkflowSection />
      <FaqSection />
      <SiteFooter />
    </main>
  );
}
