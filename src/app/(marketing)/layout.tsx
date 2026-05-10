import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ryzera SMM | Social Media Growth Packages",
  description:
    "Affordable SMM services for YouTube, Instagram, Facebook, TikTok, and more social media platforms.",
};

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="flex flex-col min-h-full">{children}</div>;
}
