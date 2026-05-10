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
    <div className="min-h-screen bg-[#f0f4fa] text-slate-900">
      <header className="border-b border-blue-700/30 bg-gradient-to-r from-[#1e6fd9] to-[#2b7eea] text-white shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="text-lg font-black tracking-tight">
            Ryzera SMM
          </Link>
          <nav className="flex items-center gap-2 text-sm font-semibold">
            <Link href="/#packages" className="rounded-lg px-3 py-2 hover:bg-white/10">
              Packages
            </Link>
            <Link href="/order" className="rounded-lg bg-white/15 px-3 py-2">
              New order
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <p className="text-center text-sm text-slate-600">
          You are currently on: <span className="font-bold text-slate-900">New order</span>
        </p>
        <p className="mt-1 text-center text-xs text-slate-500">
          Paste your public link, pick quantity, and submit. Our team confirms payment and places the order manually.
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setPlatform(p.id);
                setCategoryId("");
                setProductId("");
              }}
              className={`rounded-xl px-3 py-3 text-center text-xs font-bold transition sm:text-sm ${
                platform === p.id
                  ? "bg-[#2b7eea] text-white shadow-md ring-2 ring-blue-300"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center text-slate-500">
            Loading services…
          </div>
        ) : loadError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-800">
            <p className="font-semibold">{loadError}</p>
            <p className="mt-2 text-sm">Import products in the admin panel first.</p>
            <Link href="/admin/import" className="mt-4 inline-block text-sm font-bold text-blue-700 underline">
              Open admin import
            </Link>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center text-amber-950">
            <p className="font-semibold">No active services yet.</p>
            <p className="mt-2 text-sm">Add or import products from the admin panel.</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
                <button
                  type="button"
                  onClick={() => setTab("new")}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${
                    tab === "new" ? "bg-[#2b7eea] text-white" : "border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  New order
                </button>
                <button
                  type="button"
                  onClick={() => setTab("favorites")}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${
                    tab === "favorites" ? "bg-[#2b7eea] text-white" : "border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  Favorites
                </button>
              </div>

              {tab === "favorites" ? (
                <p className="mt-6 text-center text-sm text-slate-500">
                  Favorites coming soon — use New order for now.
                </p>
              ) : (
                <form onSubmit={onSubmit} className="mt-5 space-y-4">
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Search by ID</span>
                    <div className="relative mt-1.5">
                      <input
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        placeholder="Service ID…"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none ring-blue-500/30 focus:border-blue-400 focus:ring-2"
                      />
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
                    </div>
                  </label>

                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Category</span>
                    <select
                      value={categoryId}
                      onChange={(e) => {
                        setCategoryId(e.target.value);
                        setProductId("");
                      }}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-3 text-sm font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                    >
                      {categoryOptions.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Service <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2b7eea] text-[10px] text-white">#</span>
                    </span>
                    <select
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                    >
                      {servicesInCategory.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.providerServiceId ? `${p.providerServiceId} — ` : ""}
                          {p.name}
                          {p.sellingRate != null ? ` — $${p.sellingRate} / 1000` : ""}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Link</span>
                    <input
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      required
                      type="url"
                      placeholder="https://…"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Quantity</span>
                    <input
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                      inputMode="numeric"
                      placeholder={`Min ${min} — Max ${max.toLocaleString()}`}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                    />
                    <span className="mt-1 block text-xs text-slate-500">
                      Min: {min.toLocaleString()} — Max: {max.toLocaleString()}
                    </span>
                  </label>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-bold uppercase text-slate-500">Charge (estimate)</p>
                    <p className="mt-1 text-2xl font-black text-[#2b7eea]">
                      ${charge.toFixed(4)}
                      <span className="ml-2 text-sm font-semibold text-slate-500">USD</span>
                    </p>
                  </div>

                  {submitted ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
                      Request received. Our team will confirm your link and payment, then place the order manually.
                      <button
                        type="button"
                        className="mt-3 block text-sm font-bold text-blue-700 underline"
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
                      className="w-full rounded-xl bg-[#2b7eea] py-3.5 text-sm font-black text-white shadow-md transition hover:bg-[#256fd4] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Submit order
                    </button>
                  )}
                </form>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-black text-slate-800">Service details</p>
                  <input
                    type="search"
                    placeholder="Search orders…"
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none"
                    disabled
                    title="Coming soon"
                  />
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
                  <p className="mt-6 text-center text-sm text-slate-500">Select a service</p>
                )}
                {selected?.description && (
                  <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                    {selected.description}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4 text-center text-xs text-slate-500">
                Need help?{" "}
                <Link href="/#faq" className="font-bold text-[#2b7eea] underline">
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
  accent: "rose" | "sky" | "violet" | "emerald" | "blue" | "amber";
}) {
  const ring: Record<string, string> = {
    rose: "bg-rose-50 text-rose-600",
    sky: "bg-sky-50 text-sky-600",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
      <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black ${ring[accent]}`}>
        •
      </div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
