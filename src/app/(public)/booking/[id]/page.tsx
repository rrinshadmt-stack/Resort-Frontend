"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Users,
  CreditCard,
  Lock,
  ArrowRight,
  Clock,
  Sparkles,
  ChevronLeft,
  AlertCircle,
} from "lucide-react";
import { MOCK_RESORTS } from "@/data/resorts";
import { MOCK_ROOMS } from "@/data/rooms";
import { mockApi } from "@/lib/mock-api";
import { formatCurrency, calculateNights } from "@/lib/utils";
import { CURRENT_MOCK_USER } from "@/data/users";
import { useAuth } from "@/context/AuthContext";

function BookingFlowContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const resortId = (params?.id as string) || "res-01";
  const roomId = searchParams.get("roomId") || "rm-101";
  const checkIn = searchParams.get("checkIn") || "2026-11-15";
  const checkOut = searchParams.get("checkOut") || "2026-11-20";
  const guests = searchParams.get("guests") ? Number(searchParams.get("guests")) : 2;

  const resort = useMemo(() => {
    return MOCK_RESORTS.find((r) => r.id === resortId) || MOCK_RESORTS[0];
  }, [resortId]);

  const room = useMemo(() => {
    return MOCK_ROOMS.find((rm) => rm.id === roomId) || MOCK_ROOMS[0];
  }, [roomId]);

  const nights = calculateNights(checkIn, checkOut);
  const roomPrice = room ? room.pricePerNight : resort.pricePerNight;
  const subtotal = roomPrice * nights;
  const taxesAndFees = Math.round(subtotal * 0.15);
  const discount = 50;
  const totalAmount = subtotal + taxesAndFees - discount;

  // Form State with prefilled active user or fallback mock
  const [guestName, setGuestName] = useState(user?.name || CURRENT_MOCK_USER.name);
  const [guestEmail, setGuestEmail] = useState(user?.email || CURRENT_MOCK_USER.email);
  const [guestPhone, setGuestPhone] = useState(user?.phone || CURRENT_MOCK_USER.phone);

  useEffect(() => {
    if (user) {
      if (user.name) setGuestName(user.name);
      if (user.email) setGuestEmail(user.email);
      if (user.phone) setGuestPhone(user.phone);
    }
  }, [user]);
  const [specialRequests, setSpecialRequests] = useState("");
  const [paymentOption, setPaymentOption] = useState<"card" | "arrival">("card");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    reference: string;
    total: number;
  } | null>(null);

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newBooking = await mockApi.createBooking({
        resortId: resort.id,
        roomId: room.id,
        checkIn,
        checkOut,
        guests,
        rooms: 1,
        guestName,
        guestEmail,
        guestPhone,
        specialRequests,
        paymentMethod: paymentOption,
      });

      setConfirmationData({
        reference: newBooking.bookingReference,
        total: newBooking.totalAmount,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmationData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Booking Reserved (Frontend Simulation)
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Congratulations, {guestName}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Your stay at <span className="font-semibold text-slate-800">{resort.name}</span> has
              been created in the frontend mock state.
            </p>
          </div>

          {/* Reference badge */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 max-w-md mx-auto text-left space-y-3">
            <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-200">
              <span className="text-slate-400 uppercase font-semibold">Booking Reference</span>
              <span className="font-black text-lg text-[#0a2560] tracking-wider">
                {confirmationData.reference}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Dates</span>
                <span className="font-semibold text-slate-800">{checkIn} → {checkOut}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Suite</span>
                <span className="font-semibold text-slate-800 truncate block">{room.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Guests</span>
                <span className="font-semibold text-slate-800">{guests} Adults</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Total Paid (Mock)</span>
                <span className="font-bold text-[#0a2560]">{formatCurrency(confirmationData.total)}</span>
              </div>
            </div>
          </div>

          {/* Project disclaimer alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 text-left flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#0a2560] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Frontend Demonstration Notice</p>
              <p className="text-blue-800 mt-0.5">
                No actual payment gateway was contacted and no credit card was charged. This mock
                reservation has been pushed to the local mock booking registry for review.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/bookings"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#ff4b38] hover:bg-[#e63827] text-white font-bold text-xs shadow-md transition-colors text-center"
            >
              View in My Bookings
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors text-center"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Resort Details</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Guest Form & Payment Step */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
            <div>
              <span className="text-xs font-bold text-[#ff4b38] uppercase tracking-wider block">
                Step 1 of 2
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-1">Guest Details</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                We will send booking confirmations and check-in access to this contact.
              </p>
            </div>

            <form id="booking-form" onSubmit={handleSubmitBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
                    placeholder="alex@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Special Requests (Optional)
                </label>
                <textarea
                  rows={3}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
                  placeholder="e.g. High floor preference, airport transfer flight arrival time, anniversary note..."
                />
              </div>
            </form>
          </div>

          {/* Payment Method Placeholder */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#ff4b38] uppercase tracking-wider block">
                  Step 2 of 2
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">Payment Method</h2>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                <Lock className="w-3 h-3" />
                <span>Encrypted Demo</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentOption("card")}
                className={`p-4 rounded-2xl border-2 text-left transition-colors flex flex-col justify-between ${
                  paymentOption === "card"
                    ? "border-[#0a2560] bg-blue-50/40"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className="w-5 h-5 text-[#0a2560]" />
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-[#0a2560] flex items-center justify-center">
                    {paymentOption === "card" && <span className="w-2 h-2 rounded-full bg-[#0a2560]" />}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-800 block">Credit / Debit Card</span>
                  <span className="text-[10px] text-slate-500">Instant confirmation mock</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentOption("arrival")}
                className={`p-4 rounded-2xl border-2 text-left transition-colors flex flex-col justify-between ${
                  paymentOption === "arrival"
                    ? "border-[#0a2560] bg-blue-50/40"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-5 h-5 text-[#0a2560]" />
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-[#0a2560] flex items-center justify-center">
                    {paymentOption === "arrival" && <span className="w-2 h-2 rounded-full bg-[#0a2560]" />}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-800 block">Pay at Check-In</span>
                  <span className="text-[10px] text-slate-500">Hold with card details</span>
                </div>
              </button>
            </div>

            {paymentOption === "card" && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      disabled
                      value="•••• •••• •••• 4242 (Mock Frontend Card)"
                      className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-200 rounded-lg text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Expiry
                    </label>
                    <input
                      type="text"
                      disabled
                      value="12 / 28"
                      className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-200 rounded-lg text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      CVC / CVV
                    </label>
                    <input
                      type="text"
                      disabled
                      value="888"
                      className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-200 rounded-lg text-slate-600"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Order Summary & Confirm Button */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xl space-y-5">
            {/* Property Card Summary */}
            <div className="flex gap-4 pb-4 border-b border-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resort.featuredImage}
                alt={resort.name}
                className="w-20 h-20 rounded-xl object-cover shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-[#0a2560] uppercase block">
                  {resort.category} Stay
                </span>
                <h3 className="font-bold text-slate-900 text-sm truncate">{resort.name}</h3>
                <p className="text-[11px] text-slate-500 truncate">{resort.city}, {resort.country}</p>
                <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-sm">
                  ★ {resort.rating.toFixed(2)} rating
                </span>
              </div>
            </div>

            {/* Room details */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Reserved Room</span>
              <p className="font-bold text-slate-800">{room.name}</p>
              <p className="text-slate-500 text-[11px]">{room.bedType} • Max {room.maxGuests} Guests</p>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Check-in</span>
                <span className="font-bold text-slate-800">{checkIn}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Check-out</span>
                <span className="font-bold text-slate-800">{checkOut}</span>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="space-y-2 text-xs text-slate-600 pt-2">
              <div className="flex justify-between">
                <span>{formatCurrency(roomPrice)} × {nights} nights</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & service fee (15%)</span>
                <span>{formatCurrency(taxesAndFees)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Promotional Welcome Discount</span>
                <span>-${discount}</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline font-black text-slate-900 text-base">
                <span>Total Due</span>
                <span className="text-[#0a2560] text-2xl">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {/* Confirmation CTA button */}
            <button
              type="submit"
              form="booking-form"
              disabled={isSubmitting}
              className="w-full py-4 rounded-full bg-[#ff4b38] hover:bg-[#e63827] text-white font-bold text-sm tracking-wide shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? "Reserving..." : "Confirm & Reserve Stay"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="space-y-1 text-center text-[11px] text-slate-400">
              <p className="text-emerald-700 font-medium">Free cancellation up to 48h before check-in</p>
              <p>Frontend Mock Demonstration • No real charge</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingFlowPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="w-10 h-10 border-4 border-[#0a2560] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-600">Loading reservation summary...</p>
        </div>
      }
    >
      <BookingFlowContent />
    </Suspense>
  );
}
