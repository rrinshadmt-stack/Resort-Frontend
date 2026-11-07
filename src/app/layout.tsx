import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StayUp | Top Rated Value Stays, Resorts & Villas",
  description:
    "Discover and book top rated value stays, luxury resorts, private pool villas, and nature sanctuaries across 35+ countries.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
