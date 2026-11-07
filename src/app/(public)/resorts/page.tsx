"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/resorts/SearchBar";
import { ResortCard } from "@/components/resorts/ResortCard";
import { FilterSidebar } from "@/components/resorts/FilterSidebar";
import { SearchFilterParams, Resort } from "@/types/resort";
import { fetchResorts } from "@/lib/resort-service";
import { Compass, Filter, RefreshCw, Server, Wifi, Sparkles } from "lucide-react";
import Link from "next/link";
import { ThemeHeading, ThemeDescription } from "@/components/theme";

function ResortsSearchContent() {
  const searchParams = useSearchParams();

  const destinationParam = searchParams.get("destination") || "";
  const categoryParam = searchParams.get("category") || "";
  const checkInParam = searchParams.get("checkIn") || "2026-11-15";
  const checkOutParam = searchParams.get("checkOut") || "2026-11-20";
  const guestsParam = searchParams.get("guests") ? Number(searchParams.get("guests")) : 2;
  const roomsParam = searchParams.get("rooms") ? Number(searchParams.get("rooms")) : 1;

  const [filters, setFilters] = useState<SearchFilterParams>({
    destination: destinationParam,
    category: categoryParam,
    checkIn: checkInParam,
    checkOut: checkOutParam,
    guests: guestsParam,
    rooms: roomsParam,
    sortBy: "recommended",
  });

  const [resorts, setResorts] = useState<Resort[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiSource, setApiSource] = useState<string>("connecting");
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync searchParams with local state if URL changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      destination: searchParams.get("destination") || "",
      category: searchParams.get("category") || "",
      checkIn: searchParams.get("checkIn") || "2026-11-15",
      checkOut: searchParams.get("checkOut") || "2026-11-20",
    }));
  }, [searchParams]);

  // Load resorts via API integration service
  const loadResorts = async () => {
    setIsLoading(true);
    try {
      const res = await fetchResorts(filters);
      setResorts(res.resorts);
      setApiSource(res.source);
      setIsLiveApi(res.isLive);
    } catch (err) {
      console.error("Resort API fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResorts();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      destination: "",
      category: "",
      checkIn: "2026-11-15",
      checkOut: "2026-11-20",
      guests: 2,
      rooms: 1,
      sortBy: "recommended",
    });
  };

  return (
    <div className="w-full max-w-[1600px] 2xl:max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 py-10 space-y-10">
      {/* Search Bar Banner */}
      <div className="bg-gradient-to-r from-[#0a2560] to-[#1444a8] p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold text-sky-200 mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Theme-Aware Typography & Live Resort API</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black">
            Find Your Next Resort Getaway
          </h1>
          <p className="text-sm sm:text-base text-blue-100 mt-1.5 font-medium">
            Browse verified luxury stays, overwater villas, and mountain chalets with instant confirmation
          </p>
        </div>
        <div className="max-w-[1500px] mx-auto">
          <SearchBar
            initialDestination={filters.destination}
            initialCheckIn={filters.checkIn}
            initialCheckOut={filters.checkOut}
            initialGuests={filters.guests}
            initialRooms={filters.rooms}
            isCompact
          />
        </div>
      </div>

      {/* Results Header and API Integration Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <ThemeHeading as="h2" size="lg">
            {filters.destination ? (
              <>
                Resorts in <span className="text-[#0a2560]">{filters.destination}</span>
              </>
            ) : (
              "All Available Resorts"
            )}
          </ThemeHeading>
          <ThemeDescription size="md" className="mt-1">
            Showing <strong className="text-slate-900 font-bold">{resorts.length}</strong> {resorts.length === 1 ? "stay" : "stays"} • Dates:{" "}
            <span className="font-bold text-slate-800">{filters.checkIn} → {filters.checkOut}</span> •{" "}
            <span className="font-bold text-slate-800">{filters.guests} Guests, {filters.rooms} Room</span>
          </ThemeDescription>
        </div>

        {/* API Integration Status & Theme Quick Link */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
            <Server className={`w-3.5 h-3.5 ${isLiveApi ? "text-emerald-600" : "text-sky-600"}`} />
            <span>
              API:{" "}
              <strong className={isLiveApi ? "text-emerald-700 font-bold" : "text-slate-800 font-bold"}>
                {isLiveApi ? "Express Live" : "Internal / Cached"}
              </strong>
            </span>
            <button
              type="button"
              onClick={loadResorts}
              title="Refresh from API"
              disabled={isLoading}
              className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>


          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-xs"
          >
            <Filter className="w-4 h-4 text-[#0a2560]" />
            <span>Filters ({filters.amenities?.length || (filters.category ? 1 : 0)})</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar + Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-3">
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* Mobile Filter Drawer / Toggle */}
        {showMobileFilters && (
          <div className="lg:hidden col-span-1">
            <FilterSidebar
              filters={filters}
              onChange={setFilters}
              onReset={handleResetFilters}
            />
          </div>
        )}

        {/* Resort Cards Results (Stretchy lg:col-span-9 with 3-column layout) */}
        <div className="lg:col-span-9">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-4"
                >
                  <div className="aspect-16/10 bg-slate-200 rounded-xl w-full" />
                  <div className="h-6 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <div className="h-8 bg-slate-200 rounded w-24" />
                    <div className="h-8 bg-slate-200 rounded w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : resorts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {resorts.map((resort) => (
                <ResortCard
                  key={resort.id}
                  resort={resort}
                  checkIn={filters.checkIn}
                  checkOut={filters.checkOut}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0a2560] flex items-center justify-center mx-auto">
                <Compass className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Resorts Found</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We couldn&apos;t find any properties matching your current filter criteria or destination. Try
                loosening your price filters or searching for Bali, Maldives, Dubai, or Swiss Alps.
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0a2560] text-white text-xs font-bold hover:bg-blue-900 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResortsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="w-10 h-10 border-4 border-[#0a2560] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-600">Loading resorts...</p>
        </div>
      }
    >
      <ResortsSearchContent />
    </Suspense>
  );
}
