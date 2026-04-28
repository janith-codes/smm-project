import type {
  FaqItem,
  HeroStat,
  OrderOption,
  ServicePackage,
  WorkflowStep,
} from "./types";

export const navItems = [
  { label: "Packages", href: "#packages" },
  { label: "Workflow", href: "#workflow" },
  { label: "FAQ", href: "#faq" },
] as const;

export const authNavItems = [
  { label: "Sign in", href: "/signin" },
  { label: "Sign up", href: "/signup" },
] as const;

export const heroStats: HeroStat[] = [
  {
    value: "4",
    label: "Main platforms",
    accentClassName: "border-[#00a676]",
  },
  {
    value: "24h",
    label: "Support reply",
    accentClassName: "border-[#2f80ed]",
  },
  {
    value: "Low",
    label: "Starter prices",
    accentClassName: "border-[#ff6b35]",
  },
];

export const servicePackages: ServicePackage[] = [
  {
    platform: "YouTube",
    name: "1,000 Views",
    price: "LKR 1,250",
    delivery: "12-48 hours",
    tag: "Best seller",
  },
  {
    platform: "Instagram",
    name: "1,000 Reel Views",
    price: "LKR 980",
    delivery: "6-36 hours",
    tag: "Low price",
  },
  {
    platform: "Facebook",
    name: "1,000 Video Views",
    price: "LKR 1,100",
    delivery: "12-48 hours",
    tag: "Popular",
  },
];

export const platformServices = [
  "YouTube views",
  "YouTube subscribers",
  "Instagram views",
  "Instagram followers",
  "Facebook page likes",
  "Facebook video views",
  "TikTok views",
  "TikTok followers",
] as const;

export const workflowSteps: WorkflowStep[] = [
  {
    description: "Choose the social media service that matches your account goal.",
  },
  {
    description: "Paste your public post, video, channel, or page link.",
  },
  {
    description: "Complete payment using your preferred available method.",
  },
  {
    description:
      "Our team starts the order and keeps you updated until delivery.",
  },
];

export const faqs: FaqItem[] = [
  {
    question: "What is an SMM service?",
    answer:
      "SMM services help increase social media activity such as views, followers, likes, subscribers, comments, and page engagement.",
  },
  {
    question: "Which platforms do you support?",
    answer:
      "We support popular platforms including YouTube, Instagram, Facebook, TikTok, and other social media channels on request.",
  },
  {
    question: "What details are needed for an order?",
    answer:
      "Select a service, add the public link, choose the quantity, complete the payment, and share a contact number for updates.",
  },
  {
    question: "How fast will my order start?",
    answer:
      "Most orders are reviewed quickly and start as soon as the payment and link details are confirmed by our support team.",
  },
];

export const orderServiceOptions: OrderOption[] = [
  { label: "YouTube - 1,000 views", value: "youtube-1000-views" },
  { label: "Instagram - 1,000 reel views", value: "instagram-1000-reel-views" },
  { label: "Facebook - 1,000 video views", value: "facebook-1000-video-views" },
  { label: "TikTok - 1,000 views", value: "tiktok-1000-views" },
];

export const paymentMethodOptions: OrderOption[] = [
  { label: "Bank transfer", value: "bank-transfer" },
  { label: "Card payment", value: "card-payment" },
  { label: "Cash deposit", value: "cash-deposit" },
];
