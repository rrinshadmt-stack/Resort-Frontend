"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Save,
  CheckCircle2,
  Heart,
  Award,
  ArrowLeft,
  LogOut,
} from "lucide-react";
import { CURRENT_MOCK_USER } from "@/data/users";
import { useAuth } from "@/context/AuthContext";

export default function CustomerProfilePage() {
  const router = useRouter();
  const { user, logout, updateUserProfile } = useAuth();

  const [name, setName] = useState(user?.name || CURRENT_MOCK_USER.name);
  const [email, setEmail] = useState(user?.email || CURRENT_MOCK_USER.email);
  const [phone, setPhone] = useState(user?.phone || CURRENT_MOCK_USER.phone);
  const [currency, setCurrency] = useState("USD ($)");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  const handleSignOut = () => {
    logout();
    router.push("/login");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, email, phone });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0a2560] hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group"
          id="profile-back-button"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-[#ff4b38] group-hover:-translate-x-1 transition-all" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500">
          <Link href="/" className="hover:text-[#0a2560] transition-colors">
            Home
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-extrabold">Profile</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Guest Profile</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your personal details, reservation preferences, and loyalty member status.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile changes updated successfully (Frontend state).</span>
        </div>
      )}

      {/* Stats Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0a2560] flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Member Tier</span>
            <span className="text-sm font-black text-slate-900">StayUp Gold Elite</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0a2560] flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Stays</span>
            <span className="text-sm font-black text-slate-900">4 Completed Getaways</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-[#ff4b38] flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Wishlist Stays</span>
            <span className="text-sm font-black text-slate-900">6 Saved Resorts</span>
          </div>
        </div>
      </div>

      {/* Main Profile Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user?.avatar || CURRENT_MOCK_USER.avatar}
            alt={name}
            className="w-16 h-16 rounded-full object-cover ring-4 ring-blue-50"
          />
          <div>
            <h2 className="text-lg font-bold text-slate-900">{name}</h2>
            <p className="text-xs text-slate-500">Member since {user?.joinedDate || CURRENT_MOCK_USER.joinedDate}</p>
            <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Verified Account
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6 pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs font-semibold pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs font-semibold pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs font-semibold pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Preferred Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full text-xs font-semibold p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
              >
                <option value="USD ($)">USD ($) - US Dollar</option>
                <option value="EUR (€)">EUR (€) - Euro</option>
                <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                <option value="GBP (£)">GBP (£) - British Pound</option>
                <option value="AED (AED)">AED - UAE Dirham</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded text-[#0a2560] focus:ring-0 w-4 h-4 border-slate-300"
              />
              <span>Receive resort discounts and exclusive member rates via email</span>
            </label>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0a2560] hover:bg-blue-900 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
