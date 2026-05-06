"use client";

import { motion } from "framer-motion";
import { CheckCircle2, TrendingUp } from "lucide-react";
import { servicePackages } from "../data";
import type { ServicePackage } from "../types";
import { SectionHeader } from "./SectionHeader";

function ServicePackageCard({ item, index }: { item: ServicePackage; index: number }) {
  return (
    <motion.article 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-orange-500/10 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:border-orange-500/30 hover:shadow-[0_20px_40px_rgba(249,115,22,0.1)]"
    >
      {/* Decorative gradient background that appears on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
            <TrendingUp className="h-4 w-4" />
          </span>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
            {item.platform}
          </p>
        </div>
        <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-orange-600">
          {item.tag}
        </span>
      </div>
      
      <div className="relative mt-8 flex-grow">
        <h3 className="text-2xl font-black tracking-tight text-gray-900">{item.name}</h3>
        <div className="mt-4 flex items-baseline gap-2">
          <p className="text-4xl font-black text-orange-500">{item.price}</p>
        </div>
        
        <ul className="mt-8 flex flex-col gap-3">
          <li className="flex items-center gap-3 text-sm font-medium text-gray-600">
            <CheckCircle2 className="h-5 w-5 text-orange-400" />
            <span>Estimated delivery: <strong className="text-gray-900">{item.delivery}</strong></span>
          </li>
          <li className="flex items-center gap-3 text-sm font-medium text-gray-600">
            <CheckCircle2 className="h-5 w-5 text-orange-400" />
            <span>High quality accounts</span>
          </li>
          <li className="flex items-center gap-3 text-sm font-medium text-gray-600">
            <CheckCircle2 className="h-5 w-5 text-orange-400" />
            <span>24/7 Support included</span>
          </li>
        </ul>
      </div>
      
      <a
        href="#order"
        className="relative mt-8 inline-flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gray-900 px-8 text-sm font-bold text-white transition-all hover:bg-orange-500 hover:shadow-[0_0_40px_-10px_rgba(249,115,22,0.5)]"
      >
        <span>Select Package</span>
      </a>
    </motion.article>
  );
}

export function PackagesSection() {
  return (
    <section id="packages" className="relative overflow-hidden bg-[#faf9f6] py-24 lg:py-32">
      {/* Background decoration */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[1000px] rounded-full bg-orange-300/10 mix-blend-multiply blur-[100px] filter" />
      
      <div className="relative mx-auto max-w-7xl px-6 sm:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-between gap-8 md:flex-row md:items-end"
        >
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-600">
              <span>Our Packages</span>
            </div>
            <h2 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
              Cheapest and best SMM packages for all platforms.
            </h2>
          </div>
          <p className="max-w-md text-lg leading-relaxed text-gray-600">
            Get YouTube views, Instagram reel views, Facebook video views, TikTok
            engagement, and more from one trusted place with simple pricing.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-3 lg:gap-8">
          {servicePackages.map((item, index) => (
            <ServicePackageCard
              key={`${item.platform}-${item.name}`}
              item={item}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
