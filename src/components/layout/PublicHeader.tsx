"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  CalendarDays,
  User as UserIcon,
  Phone,
  Menu,
  X,
  MapPin,
  Sparkles,
  Home,
  LogIn,
} from "lucide-react";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/context/AuthContext";

const DESTINATION_LINKS = [
  { name: "Maldives", href: "/resorts?destination=Maldives" },
  { name: "Bali", href: "/resorts?destination=Bali" },
  { name: "Swiss Alps", href: "/resorts?destination=Swiss+Alps" },
  { name: "Dubai", href: "/resorts?destination=Dubai" },
  { name: "Goa", href: "/resorts?destination=Goa" },
  { name: "Santorini", href: "/resorts?destination=Santorini" },
  { name: "Phuket", href: "/resorts?destination=Phuket" },
  { name: "All Destinations", href: "/resorts" },
];

function PublicHeaderContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user: currentUser } = useAuth();
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <>
      {/* Header Container: Absolute transparent on homepage, sticky white on other pages */}
      <header
        className={
          isHome
            ? "absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/80 via-black/45 to-transparent text-white w-full transition-all"
            : "sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs text-slate-800 w-full transition-shadow"
        }
      >
        {/* Main Ribbon */}
        <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* StayUp Brand Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Logo/stayup_logo.png"
                alt="StayUp Resorts & Stays"
                className={`h-14 sm:h-16 w-auto object-contain group-hover:scale-102 transition-transform ${
                  isHome ? "brightness-110 drop-shadow-md" : ""
                }`}
              />
            </Link>

            {/* Desktop Utility Nav */}
            <div
              className={`hidden lg:flex items-center gap-7 text-sm font-semibold ${
                isHome ? "text-white" : "text-slate-700"
              }`}
            >
              {/* Home */}
              <Link
                href="/"
                className={`flex items-center gap-2 transition-colors ${
                  isHome
                    ? "text-[#38bdf8] font-black"
                    : pathname === "/"
                    ? "text-[#0ea5e9] font-black"
                    : "hover:text-[#0ea5e9]"
                }`}
              >
                <Home className={`w-5 h-5 ${isHome ? "text-[#38bdf8]" : "text-[#0ea5e9]"}`} />
                <span className="text-base font-bold">Home</span>
              </Link>

              <div className={`h-7 w-px ${isHome ? "bg-white/20" : "bg-slate-200"}`} />

              {/* Special Offers / Villas & Deals */}
              <Link
                href="/resorts?category=villas"
                className={`flex items-center gap-2 transition-colors ${
                  isHome ? "hover:text-[#38bdf8]" : "hover:text-[#0ea5e9]"
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#f97316]" />
                <span className="text-base font-bold">Villas & Deals</span>
              </Link>

              <div className={`h-7 w-px ${isHome ? "bg-white/20" : "bg-slate-200"}`} />

              {/* Phone support */}
              <div className={`flex items-center gap-2.5 ${isHome ? "text-white/90" : "text-slate-600"}`}>
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    isHome ? "bg-white/15 text-[#38bdf8]" : "bg-sky-50 text-[#0ea5e9]"
                  }`}
                >
                  <Phone className="w-4 h-4 text-[#38bdf8]" />
                </div>
                <div className="text-left">
                  <span
                    className={`block text-base font-black leading-tight ${
                      isHome ? "text-white" : "text-slate-900"
                    }`}
                  >
                    0124-6201611
                  </span>
                  <span className={`block text-xs font-medium ${isHome ? "text-white/70" : "text-slate-500"}`}>
                    24/7 Helpline
                  </span>
                </div>
              </div>

              <div className={`h-7 w-px ${isHome ? "bg-white/20" : "bg-slate-200"}`} />

              {/* My Bookings Pill */}
              <Link
                href="/bookings"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  isHome
                    ? "bg-white/15 hover:bg-white/25 text-white border border-white/25 backdrop-blur-sm"
                    : pathname === "/bookings"
                    ? "bg-sky-50 text-[#0ea5e9] border border-sky-200 font-black"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <CalendarDays className="w-4 h-4 text-[#f97316]" />
                <span>My Bookings</span>
              </Link>

              {/* Profile / Auth Button */}
              {currentUser ? (
                <Link
                  href="/profile"
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm shadow-sm transition-all ${
                    isHome
                      ? "bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-sky-500/30"
                      : "bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-sky-500/20"
                  }`}
                >
                  <UserIcon className="w-4 h-4 text-white" />
                  <span>{currentUser.name.split(" ")[0]}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm shadow-sm transition-all cursor-pointer ${
                    isHome
                      ? "bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-sky-500/30"
                      : "bg-[#0a2560] hover:bg-[#1444a8] text-white shadow-blue-900/20"
                  }`}
                >
                  <LogIn className="w-4 h-4 text-white" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-3 lg:hidden">
              <Link
                href="/profile"
                className={`p-2.5 rounded-xl transition-colors ${
                  isHome ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <UserIcon className="w-5 h-5" />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 rounded-lg transition-colors ${
                  isHome ? "text-white hover:bg-white/20" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Transparent Destinations Row (Matching Screenshot 2) */}
          <div
            className={`hidden md:flex items-center justify-between text-xs sm:text-sm py-2.5 overflow-x-auto gap-4 border-t ${
              isHome ? "border-white/15 text-white/90" : "border-slate-100 text-slate-600"
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold shrink-0">
              <MapPin className="w-4 h-4 text-[#f97316]" />
              <span className={isHome ? "text-white" : "text-slate-800"}>Top Destinations:</span>
            </div>
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
              {DESTINATION_LINKS.map((dest) => (
                <Link
                  key={dest.name}
                  href={dest.href}
                  className={`whitespace-nowrap font-semibold text-xs sm:text-sm transition-colors ${
                    isHome
                      ? "text-white/90 hover:text-[#38bdf8]"
                      : "text-slate-600 hover:text-[#0ea5e9]"
                  }`}
                >
                  {dest.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white text-slate-900 px-6 pt-4 pb-6 space-y-4 shadow-xl">
            <div className="grid grid-cols-2 gap-3 text-sm font-semibold">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 bg-sky-50 text-[#0ea5e9] rounded-xl flex items-center gap-2 font-bold"
              >
                <Home className="w-4 h-4 text-[#0ea5e9]" />
                <span>Home</span>
              </Link>
              <Link
                href="/resorts?category=villas"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 bg-slate-100 text-slate-800 rounded-xl flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#f97316]" />
                <span>Villas & Deals</span>
              </Link>
              <Link
                href="/bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 bg-orange-50 text-[#f97316] rounded-xl flex items-center gap-2 font-bold"
              >
                <CalendarDays className="w-4 h-4 text-[#f97316]" />
                <span>My Bookings</span>
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 bg-slate-100 text-slate-800 rounded-xl flex items-center gap-2"
              >
                <UserIcon className="w-4 h-4 text-[#0ea5e9]" />
                <span>My Profile</span>
              </Link>
              {currentUser ? (
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="col-span-2 p-3 bg-sky-50 text-[#0ea5e9] rounded-xl flex items-center justify-center gap-2 text-center font-bold transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-[#0ea5e9]" />
                  <span>Logged in as {currentUser.name}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="col-span-2 p-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-xl flex items-center justify-center gap-2 text-center font-bold transition-colors cursor-pointer"
                >
                  <UserIcon className="w-4 h-4 text-white" />
                  <span>Sign In / Register</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Interactive Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}

export function PublicHeader() {
  return (
    <Suspense
      fallback={
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs h-20 w-full" />
      }
    >
      <PublicHeaderContent />
    </Suspense>
  );
}
