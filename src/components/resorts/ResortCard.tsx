import Link from "next/link";
import { Star, Sparkles, Check, ArrowRight } from "lucide-react";
import { Resort } from "@/types/resort";
import {
  ThemeHeading,
  ThemeAddress,
  ThemePrice,
  ThemeDescription,
  ThemeBadge,
} from "@/components/theme";

interface ResortCardProps {
  resort: Resort;
  checkIn?: string;
  checkOut?: string;
}

export function ResortCard({ resort, checkIn, checkOut }: ResortCardProps) {
  const queryParams = new URLSearchParams();
  if (checkIn) queryParams.set("checkIn", checkIn);
  if (checkOut) queryParams.set("checkOut", checkOut);
  const detailUrl = `/home/${resort.id}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const bookingUrl = `/booking/${resort.id}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Property Image Container */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resort.featuredImage}
          alt={resort.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient shadow for badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <ThemeBadge
            variant="neutral"
            size="sm"
            icon={<Sparkles className="w-3 h-3 text-[#f97316]" />}
            className="bg-white/95 text-[#0a2560] backdrop-blur-xs"
          >
            <span className="capitalize">{resort.category}</span>
          </ThemeBadge>

          <ThemeBadge
            variant="primary"
            size="sm"
            icon={<Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
            className="bg-[#0a2560]/95 backdrop-blur-xs"
          >
            <span>{resort.rating.toFixed(1)}</span>
            <span className="text-slate-300 text-[10px] font-normal">({resort.reviewCount})</span>
          </ThemeBadge>
        </div>

        {/* Bottom image overlay info */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <ThemeAddress
            size="xs"
            destination={resort.destination}
            country={resort.country}
            className="text-white drop-shadow-sm font-medium"
          />
          <span className="bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-sm text-[11px] font-medium text-slate-200">
            {resort.totalRooms} rooms
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <Link href={detailUrl} className="block group/title">
            <ThemeHeading
              as="h3"
              size="md"
              className="group-hover/title:text-[#0284c7] line-clamp-1"
            >
              {resort.name}
            </ThemeHeading>
          </Link>

          <ThemeDescription
            size="sm"
            lines={2}
            className="mt-1.5"
          >
            {resort.tagline}
          </ThemeDescription>

          {/* Key Amenities pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {resort.amenities.slice(0, 3).map((amenity, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate max-w-[140px]">{amenity}</span>
              </span>
            ))}
            {resort.amenities.length > 3 && (
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                +{resort.amenities.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Pricing and Action Footer */}
        <div className="mt-6 pt-4.5 border-t border-slate-100 flex items-end justify-between gap-4">
          <ThemePrice
            amount={resort.pricePerNight}
            currency={resort.currency}
            originalPrice={resort.originalPrice}
            discountText="Save 20%"
            size="md"
            subtext="Includes breakfast & taxes"
          />

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href={detailUrl}
              className="inline-flex items-center justify-center text-sm font-bold px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
            >
              Details
            </Link>
            <Link
              href={bookingUrl}
              className="inline-flex items-center justify-center gap-1.5 text-sm font-black px-5 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-md shadow-sky-600/20 transition-all cursor-pointer active:scale-98"
            >
              <span>Book</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
