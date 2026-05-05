"use client";

import Link from "next/link";
import { Search, ShoppingBag } from "lucide-react";
import { useStore } from "@/store/useStore";

export default function Header() {
  const { searchQuery, setSearchQuery } = useStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-light bg-brand-dark text-white shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            {/* Replace with actual logo image later */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-2xl font-bold tracking-widest text-brand-light">COLDVAULT</span>
              <span className="text-xs font-light tracking-[0.3em] text-brand-accent">STUDIO</span>
            </div>
          </Link>
        </div>

        <div className="hidden flex-1 items-center justify-center px-8 md:flex">
          <div className="relative w-full max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-full border-0 bg-[#3a362f] py-2.5 pl-10 pr-3 text-white placeholder-gray-400 focus:bg-white focus:text-gray-900 focus:ring-2 focus:ring-brand-accent sm:text-sm"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* <Link href="/admin" className="text-sm font-medium hover:text-brand-accent transition-colors">
            Admindddddddddddd
          </Link> */}
          <button className="relative p-2 hover:bg-[#3a362f] rounded-full transition-colors">
            <ShoppingBag className="h-6 w-6 text-brand-light" />
            <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-brand-accent text-[10px] font-bold text-white">
              0
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
