"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  providers: number;
  categories: number;
  products: number;
  activeProducts: number;
}

function StatCard({
  label,
  value,
  icon,
  color,
  href,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  href: string;
}) {
  return (
    <Link href={href} className="bg-gray-900 rounded-2xl p-6 hover:bg-gray-800 transition-colors block">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-gray-400 text-sm">{label}</p>
    </Link>
  );
}

const quickLinks = [
  {
    title: "Add SMM Provider",
    description: "Connect a new SMM panel API",
    href: "/admin/providers",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    color: "bg-blue-600",
  },
  {
    title: "Import Services",
    description: "Fetch & import services from a panel",
    href: "/admin/import",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
      </svg>
    ),
    color: "bg-emerald-600",
  },
  {
    title: "Manage Categories",
    description: "Create categories & subcategories",
    href: "/admin/categories",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    color: "bg-purple-600",
  },
  {
    title: "View Products",
    description: "Browse and manage all products",
    href: "/admin/products",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    color: "bg-orange-600",
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome to your SMM Admin Panel</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="SMM Providers"
          value={stats?.providers ?? 0}
          href="/admin/providers"
          color="bg-blue-600"
          icon={
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
          }
        />
        <StatCard
          label="Categories"
          value={stats?.categories ?? 0}
          href="/admin/categories"
          color="bg-purple-600"
          icon={
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />
        <StatCard
          label="Total Products"
          value={stats?.products ?? 0}
          href="/admin/products"
          color="bg-orange-600"
          icon={
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        <StatCard
          label="Active Products"
          value={stats?.activeProducts ?? 0}
          href="/admin/products"
          color="bg-emerald-600"
          icon={
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-gray-900 rounded-2xl p-5 flex items-start gap-4 hover:bg-gray-800 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl ${link.color} flex items-center justify-center flex-shrink-0 text-white`}>
                {link.icon}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{link.title}</p>
                <p className="text-gray-400 text-xs mt-0.5">{link.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
