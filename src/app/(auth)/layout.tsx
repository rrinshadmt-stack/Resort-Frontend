import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-hidden bg-slate-950">
      {/* Luxury Resort Background Image with Dark Vignette Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-1000"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2560&q=85')",
        }}
      >
        {/* Multilayer gradient for optimal readability & atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a2560]/85 via-slate-950/80 to-slate-950/95 backdrop-blur-[2px]" />
      </div>

      {/* Minimal Header */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Logo/stayup_logo.png"
            alt="StayUp Resorts & Stays"
            className="h-12 sm:h-14 w-auto object-contain brightness-110 drop-shadow-md group-hover:scale-102 transition-transform"
          />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs sm:text-sm font-bold text-white backdrop-blur-md border border-white/15 transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-[#f97316]" />
          <span>Back to Stays</span>
        </Link>
      </header>

      {/* Main Auth Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-500">
        © 2026 StayUp. Verified Resort Booking Platform.
      </footer>
    </div>
  );
}
