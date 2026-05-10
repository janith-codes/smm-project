"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Play, Sparkles, TrendingUp, Zap } from "lucide-react";
import { heroStats } from "../data";

function HeroStats() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  return (
    <motion.dl 
      variants={container}
      initial="hidden"
      animate="show"
      className="mt-12 grid max-w-xl grid-cols-3 gap-4 sm:gap-6 text-sm"
    >
      {heroStats.map((stat) => (
        <motion.div
          key={stat.label}
          variants={item}
          whileHover={{ y: -5, scale: 1.02 }}
          className="group relative flex flex-col gap-1 overflow-hidden rounded-2xl border border-white/40 bg-white/40 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-colors duration-300 hover:bg-white/60 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
        >
          <div className={`absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
          <dt className={`relative text-3xl font-black tracking-tight text-gray-900`}>{stat.value}</dt>
          <dd className="relative font-medium text-gray-600">{stat.label}</dd>
          {/* Subtle accent border at the bottom */}
          <div className={`absolute bottom-0 left-0 h-1 w-full opacity-50 bg-orange-400`} />
        </motion.div>
      ))}
    </motion.dl>
  );
}

function HeroPackagePreview() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.6, type: "spring" as const, stiffness: 200, damping: 20 }}
      whileHover={{ scale: 1.03 }}
      className="absolute -bottom-6 -left-6 right-6 sm:-bottom-8 sm:-left-8 sm:right-auto sm:w-[360px] rounded-[2rem] border border-white/50 bg-white/60 p-6 shadow-[0_20px_40px_rgba(0,0,0,0.1)] backdrop-blur-2xl z-10"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500/15 text-orange-600 shadow-inner">
              <Play className="h-3.5 w-3.5 fill-current" />
            </span>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Selected package
            </p>
          </div>
          <p className="mt-3 text-xl font-black text-gray-900">YouTube 1,000 views</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-orange-500/15 px-3 py-1.5 text-xs font-bold text-orange-700 shadow-inner">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Ready
        </span>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/50 bg-white/50 p-3 shadow-sm backdrop-blur-md transition-colors hover:bg-white/80">
          <p className="font-black text-gray-900">LKR 1.2k</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">Price</p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/50 bg-white/50 p-3 shadow-sm backdrop-blur-md transition-colors hover:bg-white/80">
          <p className="font-black text-gray-900">12-48h</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">Delivery</p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/50 bg-white/50 p-3 shadow-sm backdrop-blur-md transition-colors hover:bg-white/80">
          <p className="font-black text-gray-900">24/7</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">Support</p>
        </div>
      </div>
    </motion.div>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#faf9f6]">
      {/* Decorative blurred background shapes for glassmorphism effect */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-orange-400/30 mix-blend-multiply blur-[120px] filter" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="pointer-events-none absolute top-[20%] -right-[10%] h-[700px] w-[700px] rounded-full bg-orange-500/20 mix-blend-multiply blur-[120px] filter" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="pointer-events-none absolute -bottom-[20%] left-[20%] h-[600px] w-[600px] rounded-full bg-orange-300/30 mix-blend-multiply blur-[120px] filter" 
      />

      <div className="relative mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-16 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
        <div className="max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-600 backdrop-blur-md"
          >
            <Sparkles className="h-4 w-4" />
            <span>Cheapest SMM services for every platform</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl font-black leading-[1.1] tracking-tight text-gray-900 sm:text-6xl lg:text-[4.5rem]"
          >
            Grow your audience <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-400">
              faster than ever.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600"
          >
            Ryzera SMM helps creators, businesses, and page owners grow their
            online presence with affordable views, followers, likes, and
            subscribers. Choose a package and watch your numbers soar.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <Link
              href="/order"
              className="group relative inline-flex h-14 items-center justify-center gap-2 overflow-hidden rounded-full bg-gray-900 px-8 text-base font-bold text-white transition-all hover:scale-105 hover:bg-gray-800 hover:shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)]"
            >
              <Zap className="h-5 w-5 text-orange-400" />
              <span>Start Growing Now</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <a
              href="#packages"
              className="group inline-flex h-14 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white/50 px-8 text-base font-bold text-gray-700 backdrop-blur-md transition-all hover:bg-white/80 hover:text-gray-900"
            >
              <TrendingUp className="h-5 w-5 text-gray-400 transition-colors group-hover:text-gray-600" />
              <span>View Packages</span>
            </a>
          </motion.div>
          
          <HeroStats />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative mx-auto w-full max-w-[500px] lg:max-w-none"
        >
          {/* Glassmorphism container for the image */}
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2.5rem] border border-white/40 bg-white/20 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.05)] backdrop-blur-2xl">
            <div className="relative h-full w-full overflow-hidden rounded-[2rem] border border-black/5 shadow-inner">
              <Image
                src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1400&q=80"
                alt="Social media apps displayed on a smartphone"
                fill
                sizes="(min-width: 1024px) 48vw, 100vw"
                priority
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
          
          <HeroPackagePreview />
        </motion.div>
      </div>
    </section>
  );
}
