import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New order | Ryzera SMM",
  description: "Choose a service, enter your link and quantity, and submit your order.",
};

export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
