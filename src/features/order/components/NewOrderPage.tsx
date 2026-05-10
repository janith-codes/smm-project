"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type CatalogProduct = {
  id: string;
  name: string;
  description: string | null;
  sellingRate: number | null;
  minOrder: number | null;
  maxOrder: number | null;
  serviceType: string | null;
  providerServiceId: string | null;
  category: {
    id: string;
    name: string;
    parent: { id: string; name: string } | null;
  } | null;
};

const PLATFORMS = [
  { id: "everything", label: "Everything", icon: "grid" },
  { id: "instagram", label: "Instagram", icon: "ig" },
  { id: "facebook", label: "Facebook", icon: "fb" },
  { id: "youtube", label: "YouTube", icon: "yt" },
  { id: "twitter", label: "Twitter / X", icon: "tw" },
  { id: "spotify", label: "Spotify", icon: "sp" },
  { id: "tiktok", label: "TikTok", icon: "tt" },
  { id: "linkedin", label: "LinkedIn", icon: "in" },
  { id: "telegram", label: "Telegram", icon: "tg" },
  { id: "discord", label: "Discord", icon: "dc" },
  { id: "traffic", label: "Website traffic", icon: "web" },
  { id: "other", label: "Others", icon: "more" },
] as const;

type PlatformId = (typeof PLATFORMS)[number]["id"];

const MAIN_PLATFORM_KEYS = [
  "instagram",
  "facebook",
  "youtube",
  "twitter",
  "x.com",
  "tiktok",
  "spotify",
  "linkedin",
  "telegram",
  "discord",
  "threads",
  "snapchat",
  "reddit",
  "pinterest",
  "twitch",
  "soundcloud",
  "website",
  "traffic",
  "web",
  "shopee",
  "onlyfans",
];

function haystack(p: CatalogProduct): string {
  const parts = [
    p.name,
    p.description ?? "",
    p.serviceType ?? "",
    p.category?.name ?? "",
    p.category?.parent?.name ?? "",
  ];
  return parts.join(" ").toLowerCase();
}

function matchesPlatform(p: CatalogProduct, platform: PlatformId): boolean {
  if (platform === "everything") return true;
  const h = haystack(p);
  if (platform === "other") {
    return !MAIN_PLATFORM_KEYS.some((k) => h.includes(k));
  }
  const map: Record<string, string[]> = {
    instagram: ["instagram", "insta ", " ig "],
    facebook: ["facebook", " fb "],
    youtube: ["youtube", " yt "],
    twitter: ["twitter", " x.com", "tweet"],
    spotify: ["spotify"],
    tiktok: ["tiktok"],
    linkedin: ["linkedin"],
    telegram: ["telegram"],
    discord: ["discord"],
    traffic: ["traffic", "website", "web visit", "seo"],
  };
  const keys = map[platform] ?? [platform];
  return keys.some((k) => h.includes(k));
}

function categoryLabel(c: NonNullable<CatalogProduct["category"]>): string {
  if (c.parent) return `${c.parent.name} — ${c.name}`;
  return c.name;
}

function parseDetailHints(description: string | null, serviceType: string | null): {
  startTime: string;
  speed: string;
  guarantee: string;
  avgTime: string;
} {
  const text = [description, serviceType].filter(Boolean).join(" · ");
  const lower = text.toLowerCase();
  const startMatch = text.match(/(\d+\s*[-–]\s*\d+\s*(?:min|hr|hour|sec)|instant|immediate)/i);
  const speedMatch = text.match(/([\d.,]+\s*[-–]\s*[\d.,]+\s*k\s*\/?\s*day|\d+k\s*\/\s*day)/i);
  return {
    startTime: startMatch?.[1]?.trim() || (lower.includes("instant") ? "Instant" : "—"),
    speed: speedMatch?.[1]?.trim() || "—",
    guarantee: /refill|lifetime|guarantee|non\s*drop/i.test(text)
      ? text.match(/refill|non\s*drop|no\s*refill|lifetime/gi)?.[0] ?? "See description"
      : "—",
    avgTime: "—",
  };
}

export function NewOrderPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [platform, setPlatform] = useState<PlatformId>("everything");
  const [categoryId, setCategoryId] = useState<string>("");
  const [productId, setProductId] = useState<string>("");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");
  const [searchId, setSearchId] = useState("");
  const [tab, setTab] = useState<"new" | "favorites">("new");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const q = searchParams.get("platform") as PlatformId | null;
    if (q && PLATFORMS.some((p) => p.id === q)) setPlatform(q);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch("/api/store/catalog");
        if (!res.ok) throw new Error("Failed to load catalog");
        const data = await res.json();
        if (!cancelled) setProducts(data.products ?? []);
      } catch {
        if (!cancelled) setLoadError("Could not load services. Please try again later.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const platformFiltered = useMemo(
    () => products.filter((p) => matchesPlatform(p, platform)),
    [products, platform]
  );

  const idFiltered = useMemo(() => {
    const q = searchId.trim().toLowerCase();
    if (!q) return platformFiltered;
    return platformFiltered.filter(
      (p) =>
        p.id.toLowerCase().includes(q) ||
        (p.providerServiceId && p.providerServiceId.toLowerCase().includes(q))
    );
  }, [platformFiltered, searchId]);

  const categoryOptions = useMemo(() => {
    const map = new Map<string, { id: string; label: string }>();
    for (const p of idFiltered) {
      if (!p.category) {
        map.set("__uncat__", { id: "__uncat__", label: "All services" });
        continue;
      }
      const id = p.category.id;
      if (!map.has(id)) map.set(id, { id, label: categoryLabel(p.category) });
    }
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [idFiltered]);

  useEffect(() => {
    if (!categoryOptions.length) {
      setCategoryId("");
      return;
    }
    if (!categoryOptions.some((c) => c.id === categoryId)) {
      setCategoryId(categoryOptions[0].id);
    }
  }, [categoryOptions, categoryId]);

  const servicesInCategory = useMemo(() => {
    if (!categoryId) return idFiltered;
    if (categoryId === "__uncat__") return idFiltered.filter((p) => !p.category);
    return idFiltered.filter((p) => p.category?.id === categoryId);
  }, [idFiltered, categoryId]);

  const selected = useMemo(
    () => products.find((p) => p.id === productId) ?? null,
    [products, productId]
  );

  useEffect(() => {
    if (servicesInCategory.length === 0) {
      setProductId("");
      return;
    }
    if (!servicesInCategory.some((p) => p.id === productId)) {
      setProductId(servicesInCategory[0].id);
    }
  }, [servicesInCategory, productId]);

  const qtyNum = parseInt(quantity.replace(/\D/g, ""), 10) || 0;
  const rate = selected?.sellingRate ?? 0;
  const charge = rate > 0 && qtyNum > 0 ? (qtyNum / 1000) * rate : 0;
  const min = selected?.minOrder ?? 1;
  const max = selected?.maxOrder ?? 1_000_000;
  const hints = selected ? parseDetailHints(selected.description, selected.serviceType) : null;

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!selected || qtyNum < min || qtyNum > max || !link.trim()) return;
      setSubmitted(true);
    },
    [selected, qtyNum, min, max, link]
  );

  return (
    <div className="min-h-screen bg-[#f7f5ef] text-[#171717]">
      <header className="sticky top-0 z-20 border-b border-black/10 bg-[#f7f5ef]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="text-lg font-bold tracking-tight text-gray-900">
            Ryzera SMM
          </Link>
          <nav className="flex items-center gap-2 text-sm font-medium">
            <Link href="/#packages" className="rounded-md px-3 py-2 text-black/70 hover:text-black transition">
              Packages
            </Link>
            <Link href="/order" className="rounded-md bg-[#ff6b35] px-4 py-2 text-white font-bold hover:bg-[#e85d2e] transition">
              New order
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
        <p className="text-center text-sm text-black/60">
          You are currently on: <span className="font-bold text-gray-900">New order</span>
        </p>
        <p className="mt-1 text-center text-xs text-black/50">
          Paste your public link, pick quantity, and submit. Our team confirms payment and places the order manually.
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-5 pb-12 sm:px-8">
        <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setPlatform(p.id);
                setCategoryId("");
                setProductId("");
              }}
              className={`rounded-md px-3 py-3 text-center text-xs font-bold transition sm:text-sm flex items-center justify-center gap-2 ${
                platform === p.id
                  ? "bg-[#ff6b35] text-white shadow-sm"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
            >
              {p.id === "everything" && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              )}
              {p.id === "instagram" && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth="2" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" strokeWidth="2" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
              {p.id === "facebook" && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              )}
              {p.id === "youtube" && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33 2.78 2.78 0 001.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.33 29 29 0 00-.46-5.33z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
                </svg>
              )}
              {p.id === "twitter" && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              )}
              {p.id === "spotify" && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-2.5-5c-1.5 0-3-1-3-2s1.5-2 3-2 3 1 3 2-1.5 2-3 2zm2.5-4c-2 0-4-1-4-2.5S8 8 10 8s4 1 4 2.5-2 2.5-4 2.5zm3-4.5c-2.5 0-5-1.5-5-3S8 4 10.5 4s5 1.5 5 3-2.5 3-5 3z" />
                </svg>
              )}
              {p.id === "tiktok" && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12a4 4 0 100 8 4 4 0 000-8z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 20V4a10 10 0 006 3v4a6 6 0 01-6-3" />
                </svg>
              )}
              {p.id === "linkedin" && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                  <circle cx="4" cy="4" r="2" strokeWidth="2" />
                </svg>
              )}
              {p.id === "telegram" && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              )}
              {p.id === "discord" && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 5a15.8 15.8 0 00-4-1.5 14.8 14.8 0 00-1 2 15.3 15.3 0 00-4 0 14.8 14.8 0 00-1-2 15.8 15.8 0 00-4 1.5C2 12 3 19 3 19a16.2 16.2 0 005 2.5 13.5 13.5 0 001.5-2.5 10.7 10.7 0 01-2-1s.5-.5 1-1c3 1.5 7 1.5 10 0 .5.5 1 1 1 1a10.7 10.7 0 01-2 1 13.5 13.5 0 001.5 2.5A16.2 16.2 0 0021 19s1-7-2-14z" />
                </svg>
              )}
              {p.id === "traffic" && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              )}
              {p.id === "other" && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              )}
              {p.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-md border border-black/10 bg-white py-20 text-center text-black/50">
            Loading services…
          </div>
        ) : loadError ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-8 text-center text-red-800">
            <p className="font-semibold">{loadError}</p>
            <p className="mt-2 text-sm">Import products in the admin panel first.</p>
            <Link href="/admin/import" className="mt-4 inline-block text-sm font-bold text-[#ff6b35] hover:text-[#e85d2e] underline">
              Open admin import
            </Link>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-8 text-center text-amber-950">
            <p className="font-semibold">No active services yet.</p>
            <p className="mt-2 text-sm">Add or import products from the admin panel.</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-md border border-black/10 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap gap-2 border-b border-black/5 pb-4">
                <button
                  type="button"
                  onClick={() => setTab("new")}
                  className={`inline-flex items-center gap-2 rounded-md px-6 py-2.5 text-sm font-bold transition-colors ${
                    tab === "new" ? "bg-[#ff6b35] text-white" : "border border-black/10 bg-[#faf8f2] text-black/70 hover:bg-[#f0eee8]"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  New order
                </button>
                <button
                  type="button"
                  onClick={() => setTab("favorites")}
                  className={`inline-flex items-center gap-2 rounded-md px-6 py-2.5 text-sm font-bold transition-colors ${
                    tab === "favorites" ? "bg-[#ff6b35] text-white" : "border border-black/10 bg-[#faf8f2] text-black/70 hover:bg-[#f0eee8]"
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                  </svg>
                  Favorites
                </button>
              </div>

              {tab === "favorites" ? (
                <p className="mt-6 text-center text-sm text-black/50">
                  Favorites coming soon — use New order for now.
                </p>
              ) : (
                <form onSubmit={onSubmit} className="mt-5 space-y-4">
                  <label className="block">
                    <span className="text-sm font-bold text-black/68">Search by ID</span>
                    <div className="relative mt-2">
                      <input
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        placeholder="Service ID…"
                        className="h-12 w-full rounded-md border border-black/12 bg-[#faf8f2] py-3 pl-10 pr-3 text-sm outline-none focus:border-[#ff6b35]"
                      />
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/40">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </span>
                    </div>
                  </label>

                  <label className="block">
                    <span className="text-sm font-bold text-black/68">Category</span>
                    <div className="relative mt-2">
                      <select
                        value={categoryId}
                        onChange={(e) => {
                          setCategoryId(e.target.value);
                          setProductId("");
                        }}
                        className="h-12 w-full appearance-none rounded-md border border-black/12 bg-[#faf8f2] pl-3 pr-10 text-sm font-medium outline-none focus:border-[#ff6b35]"
                      >
                        {categoryOptions.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black/40">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </div>
                  </label>

                  <label className="block">
                    <span className="flex items-center gap-2 text-sm font-bold text-black/68">
                      Service <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#ff6b35] text-[10px] text-white">#</span>
                    </span>
                    <div className="relative mt-2">
                      <select
                        value={productId}
                        onChange={(e) => setProductId(e.target.value)}
                        className="h-12 w-full appearance-none rounded-md border border-black/12 bg-[#faf8f2] pl-3 pr-10 text-sm outline-none focus:border-[#ff6b35]"
                      >
                        {servicesInCategory.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.providerServiceId ? `${p.providerServiceId} — ` : ""}
                            {p.name}
                            {p.sellingRate != null ? ` — $${p.sellingRate} / 1000` : ""}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black/40">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </div>
                  </label>

                  <label className="block">
                    <span className="text-sm font-bold text-black/68">Link</span>
                    <input
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      required
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      className="mt-2 h-12 w-full rounded-md border border-black/12 bg-[#faf8f2] px-3 text-sm outline-none focus:border-[#ff6b35]"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-bold text-black/68">Quantity</span>
                    <input
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                      inputMode="numeric"
                      placeholder={`Min ${min} — Max ${max.toLocaleString()}`}
                      className="mt-2 h-12 w-full rounded-md border border-black/12 bg-[#faf8f2] px-3 text-sm outline-none focus:border-[#ff6b35]"
                    />
                    <span className="mt-1 block text-xs text-black/50">
                      Min: {min.toLocaleString()} — Max: {max.toLocaleString()}
                    </span>
                  </label>

                  <div className="rounded-md border border-black/10 bg-[#faf8f2] px-4 py-3">
                    <p className="text-sm font-bold text-black/68">Charge (estimate)</p>
                    <p className="mt-1 text-2xl font-black text-[#ff6b35]">
                      ${charge.toFixed(4)}
                      <span className="ml-2 text-sm font-semibold text-black/50">USD</span>
                    </p>
                  </div>

                  {submitted ? (
                    <div className="rounded-md border border-[#00a676]/30 bg-[#00a676]/10 px-4 py-3 text-sm font-medium text-[#00a676]">
                      Request received. Our team will confirm your link and payment, then place the order manually.
                      <button
                        type="button"
                        className="mt-3 block text-sm font-bold text-[#00a676] underline hover:text-[#008a62]"
                        onClick={() => {
                          setSubmitted(false);
                          setLink("");
                          setQuantity("");
                        }}
                      >
                        Place another order
                      </button>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={!selected || qtyNum < min || qtyNum > max || !link.trim()}
                      className="mt-5 h-12 w-full rounded-md bg-[#ff6b35] text-base font-black text-white transition hover:bg-[#e85d2e] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Submit order
                    </button>
                  )}
                </form>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-md border border-black/10 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 border-b border-black/5 pb-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#ff6b35] text-white">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-gray-900">Service details</p>
                  </div>
                  <div className="relative">
                    <input
                      type="search"
                      placeholder="Search orders…"
                      className="h-9 w-full rounded-md border border-black/12 bg-[#faf8f2] pl-8 pr-3 text-xs outline-none focus:border-[#ff6b35]"
                      disabled
                      title="Coming soon"
                    />
                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-black/40">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </span>
                  </div>
                </div>
                {selected ? (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <DetailCard title="Service ID" value={selected.providerServiceId ?? selected.id.slice(0, 8)} accent="rose" />
                    <DetailCard title="Start time" value={hints?.startTime ?? "—"} accent="sky" />
                    <DetailCard title="Speed" value={hints?.speed ?? "—"} accent="violet" />
                    <DetailCard title="Guarantee" value={hints?.guarantee ?? "—"} accent="emerald" />
                    <DetailCard title="Avg. time" value={hints?.avgTime ?? "—"} accent="blue" />
                    <DetailCard title="Rate / 1K" value={selected.sellingRate != null ? `$${selected.sellingRate}` : "—"} accent="amber" />
                  </div>
                ) : (
                  <p className="mt-6 text-center text-sm text-black/50">Select a service</p>
                )}
                {selected?.description && (
                  <p className="mt-4 rounded-md bg-[#faf8f2] p-3 text-xs leading-relaxed text-black/70 border border-black/5">
                    {selected.description}
                  </p>
                )}
              </div>

              <div className="rounded-md border border-dashed border-black/20 bg-white/60 p-4 text-center text-xs text-black/60">
                Need help?{" "}
                <Link href="/#faq" className="font-bold text-[#ff6b35] hover:text-[#e85d2e] underline">
                  Read FAQ
                </Link>{" "}
                or contact support from your invoice channel.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailCard({
  title,
  value,
  accent,
}: {
  title: string;
  value: string;
  accent?: "rose" | "sky" | "violet" | "emerald" | "blue" | "amber";
}) {
  const ring: Record<string, string> = {
    rose: "bg-red-50 text-red-600",
    sky: "bg-sky-50 text-sky-600",
    violet: "bg-purple-50 text-purple-600",
    emerald: "bg-[#00a676]/10 text-[#00a676]",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-orange-50 text-orange-600",
    default: "bg-gray-100 text-gray-600"
  };
  const activeAccent = accent ?? "default";
  return (
    <div className="rounded-md border border-black/10 bg-[#faf8f2] p-3">
      <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-xs font-black ${ring[activeAccent]}`}>
        •
      </div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-black/50">{title}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}
