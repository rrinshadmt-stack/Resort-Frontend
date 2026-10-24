"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Star,
  MapPin,
  Check,
  ShieldCheck,
  Calendar,
  Users,
  Clock,
  Sparkles,
  ArrowRight,
  Wifi,
  Coffee,
  Heart,
  Share2,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Server,
} from "lucide-react";
import { MOCK_RESORTS } from "@/data/resorts";
import { MOCK_ROOMS } from "@/data/rooms";
import { MOCK_REVIEWS } from "@/data/reviews";
import { formatCurrency, calculateNights } from "@/lib/utils";
import { fetchResortById } from "@/lib/resort-service";
import {
  ThemeHeading,
  ThemeAddress,
  ThemePrice,
  ThemeDescription,
  ThemeBadge,
} from "@/components/theme";

function ResortDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const resortId = (params?.id as string) || "res-01";
  const checkIn = searchParams.get("checkIn") || "2026-11-15";
  const checkOut = searchParams.get("checkOut") || "2026-11-20";
  const guests = searchParams.get("guests") ? Number(searchParams.get("guests")) : 2;

  const [resort, setResort] = useState(() => {
    return MOCK_RESORTS.find((r) => r.id === resortId) || MOCK_RESORTS[0];
  });
  const [isLiveApi, setIsLiveApi] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      const res = await fetchResortById(resortId);
      if (res.resort) {
        setResort(res.resort);
        setIsLiveApi(res.isLive);
      }
    }
    loadDetail();
  }, [resortId]);

  const rooms = useMemo(() => {
    const list = MOCK_ROOMS.filter((rm) => rm.resortId === resort.id);
    return list.length > 0 ? list : MOCK_ROOMS.slice(0, 2);
  }, [resort.id]);

  const reviews = useMemo(() => {
    const list = MOCK_REVIEWS.filter((rev) => rev.resortId === resort.id);
    return list;
  }, [resort.id]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || "");
  const [isSaved, setIsSaved] = useState(false);

  const selectedRoom = rooms.find((rm) => rm.id === selectedRoomId) || rooms[0];
  const nights = calculateNights(checkIn, checkOut);
  const roomPrice = selectedRoom ? selectedRoom.pricePerNight : resort.pricePerNight;
  const subtotal = roomPrice * nights;
  const taxes = Math.round(subtotal * 0.15);
  const total = subtotal + taxes - 50;

  const handleProceedBooking = (roomId?: string) => {
    const targetRoomId = roomId || selectedRoomId || rooms[0]?.id;
    const query = new URLSearchParams({
      roomId: targetRoomId,
      checkIn,
      checkOut,
      guests: guests.toString(),
    });
    router.push(`/booking/${resort.id}?${query.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-800">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/resorts" className="hover:text-slate-800">Resorts</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-800 font-semibold truncate max-w-xs">{resort.name}</span>
      </nav>

      {/* Property Title & Header Bar */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="bg-[#0a2560] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider theme-badge">
              {resort.category} Stay
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-slate-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 theme-badge">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{resort.rating.toFixed(2)}</span>
              <span className="text-slate-500 font-normal">({resort.reviewCount} reviews)</span>
            </div>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold theme-badge">
              Verified Partner
            </span>
            {isLiveApi && (
              <span className="inline-flex items-center gap-1 text-xs text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md font-bold border border-sky-200">
                <Server className="w-3 h-3 text-sky-600" />
                Live API
              </span>
            )}
          </div>

          <ThemeHeading as="h1" size="xl" className="tracking-tight">
            {resort.name}
          </ThemeHeading>

          <div className="mt-2">
            <ThemeAddress
              size="md"
              destination={resort.destination || resort.city}
              country={resort.country}
            >
              {resort.address}, {resort.city}, {resort.country}
            </ThemeAddress>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2 self-start">
          <button
            onClick={() => setIsSaved(!isSaved)}
            className={`p-2.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold ${
              isSaved
                ? "bg-red-50 text-red-600 border-red-200"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
            <span>{isSaved ? "Saved" : "Save"}</span>
          </button>
          <button
            onClick={() => alert("Link copied to clipboard!")}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          {/* Main Large Image */}
          <div className="lg:col-span-3 aspect-16/10 rounded-2xl overflow-hidden bg-slate-100 shadow-md relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resort.images[activeImageIndex] || resort.featuredImage}
              alt={resort.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              Photo {activeImageIndex + 1} of {resort.images.length}
            </div>
          </div>

          {/* Thumbnails list */}
          <div className="grid grid-cols-4 lg:grid-cols-1 gap-2.5">
            {resort.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`relative aspect-16/10 rounded-xl overflow-hidden border-2 transition-all ${
                  activeImageIndex === idx
                    ? "border-[#ff4b38] ring-2 ring-red-400/30 scale-102"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Layout: 2 Columns (Details vs Sticky Booking Widget) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Property Overview, Amenities, Rooms, Rules, Reviews */}
        <div className="lg:col-span-8 space-y-10">
          {/* Overview & Description */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
            <ThemeDescription size="md">
              {resort.description}
            </ThemeDescription>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0a2560] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Check-in / Check-out</span>
                  <span className="text-xs font-bold text-slate-800">{resort.checkInTime} / {resort.checkOutTime}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0a2560] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Property Host</span>
                  <span className="text-xs font-bold text-slate-800">{resort.ownerName}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0a2560] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Total Accommodations</span>
                  <span className="text-xs font-bold text-slate-800">{resort.totalRooms} Luxury Suites</span>
                </div>
              </div>
            </div>
          </section>

          {/* Amenities Grid */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Resort Amenities & Inclusions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {resort.amenities.map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#ff4b38] shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Room Options & Selection (Critical user requirement) */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Select Your Suite or Villa</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose the perfect layout for your stay. All rooms include daily gourmet breakfast.
              </p>
            </div>

            <div className="space-y-4">
              {rooms.map((room) => {
                const isSelected = selectedRoomId === room.id;
                return (
                  <div
                    key={room.id}
                    className={`bg-white rounded-2xl p-5 border-2 transition-all flex flex-col md:flex-row gap-5 ${
                      isSelected
                        ? "border-[#0a2560] shadow-md ring-2 ring-blue-900/10"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {/* Room photo */}
                    <div className="w-full md:w-56 h-40 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={room.images[0] || resort.featuredImage}
                        alt={room.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Room info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-[#0a2560] bg-blue-50 px-2 py-0.5 rounded-md uppercase">
                            {room.type}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {room.sizeSqFt} sq ft • {room.bedType}
                          </span>
                        </div>

                        <h3 className="font-bold text-slate-900 text-base mt-1.5">{room.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{room.description}</p>

                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {room.amenities.map((am, i) => (
                            <span
                              key={i}
                              className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                            >
                              {am}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Room Price & Selection action */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-[#0a2560]">
                              {formatCurrency(room.pricePerNight)}
                            </span>
                            <span className="text-xs text-slate-500">/ night</span>
                          </div>
                          <span className="text-[10px] text-emerald-600 font-medium">
                            {room.availableCount} suites left for selected dates
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedRoomId(room.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                              isSelected
                                ? "bg-[#0a2560] text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            }`}
                          >
                            {isSelected ? "Selected" : "Select Room"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleProceedBooking(room.id)}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#ff4b38] hover:bg-[#e63827] text-white shadow-xs transition-colors flex items-center gap-1"
                          >
                            <span>Book Now</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* House Rules & Policies */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900">House Rules & Stay Policies</h2>
            <div className="space-y-2.5 text-xs text-slate-700">
              {resort.rules.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm mb-1">Cancellation Guarantee</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {resort.cancellationPolicy}
              </p>
            </div>
          </section>

          {/* Guest Reviews Section */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Verified Guest Reviews</h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="flex items-center text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                  <span className="text-sm font-bold text-slate-900">{resort.rating.toFixed(2)}</span>
                  <span className="text-xs text-slate-500">• {resort.reviewCount} total verified reviews</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 divide-y divide-slate-100">
              {reviews.map((rev) => (
                <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={rev.userAvatar}
                        alt={rev.userName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <span className="block text-xs font-bold text-slate-900">{rev.userName}</span>
                        <span className="block text-[10px] text-slate-400">{rev.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{rev.rating}.0</span>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-slate-800">{rev.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>

                  {rev.ownerReply && (
                    <div className="mt-3 ml-4 p-3 bg-blue-50/70 border-l-2 border-[#0a2560] rounded-r-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0a2560]">
                        <MessageSquare className="w-3 h-3" />
                        <span>Response from Host ({rev.ownerReply.date})</span>
                      </div>
                      <p className="text-xs text-slate-700 italic">{rev.ownerReply.text}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column (4 cols): Sticky Booking Summary Panel */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl space-y-5">
            <div className="flex items-baseline justify-between pb-4 border-b border-slate-100">
              <ThemePrice
                amount={roomPrice}
                currency="$"
                size="lg"
                period="/ night"
              />
              <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{resort.rating.toFixed(2)}</span>
              </div>
            </div>

            {/* Selected Suite Preview */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Selected Accommodation
              </span>
              <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">
                {selectedRoom?.name || "Standard Luxury Suite"}
              </p>
              <span className="text-[11px] text-slate-500">
                {selectedRoom?.bedType} • Max {selectedRoom?.maxGuests} guests
              </span>
            </div>

            {/* Dates & Guests Box */}
            <div className="rounded-xl border border-slate-200 divide-y divide-slate-200 text-xs">
              <div className="grid grid-cols-2 divide-x divide-slate-200 p-2.5">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">Check-in</label>
                  <span className="font-semibold text-slate-800">{checkIn}</span>
                </div>
                <div className="pl-2.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">Check-out</label>
                  <span className="font-semibold text-slate-800">{checkOut}</span>
                </div>
              </div>
              <div className="p-2.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Guests</label>
                <span className="font-semibold text-slate-800">{guests} Guests, 1 Suite</span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 text-xs text-slate-600 pt-2">
              <div className="flex justify-between">
                <span>{formatCurrency(roomPrice)} × {nights} nights</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Resort fee & local taxes (15%)</span>
                <span>{formatCurrency(taxes)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Early booking promotional discount</span>
                <span>-${50}</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline font-black text-slate-900 text-base">
                <span>Estimated Total</span>
                <span className="text-[#0a2560] text-xl">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Primary Action Button (Coral Red) */}
            <button
              type="button"
              onClick={() => handleProceedBooking()}
              className="w-full py-3.5 rounded-full bg-[#ff4b38] hover:bg-[#e63827] text-white font-bold text-sm tracking-wide shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Booking</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="space-y-1 text-center text-[11px] text-slate-400">
              <p>You won&apos;t be charged yet</p>
              <p className="text-emerald-700 font-medium">Free cancellation until 48 hours before check-in</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResortDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="w-10 h-10 border-4 border-[#0a2560] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-600">Loading sanctuary details...</p>
        </div>
      }
    >
      <ResortDetailContent />
    </Suspense>
  );
}
