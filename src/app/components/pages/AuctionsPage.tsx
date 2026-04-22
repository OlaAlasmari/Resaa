import React, { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ViewState } from "../../types";
import { Button } from "../ui/button";
import ListingAuctionCard from "../ListingAuctionCard";
import { Filter } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { Auction, AuctionRow } from "../../models/Auction";

const ASSETS = {
  detailRef: "figma:asset/847f6780f0acaecd11d2c4c7b0718985c1af7a04.png",
  heroBg:
    "https://images.unsplash.com/photo-1722009591790-f47342aa9d3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYXVkaSUyMGFyYWJpYSUyMGx1eHVyeSUyMHJlYWwlMjBlc3RhdGV8ZW58MXx8fHwxNzcxOTcyNjA5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  landPlaceholder: "figma:asset/dab0778c43e35d66c56bca4cbfdd164d2e85c03f.png",
  commercial: "figma:asset/a.png",
  listingRef: "figma:asset/e29d10f638fdcdc5bc4c3bcba9d7ba89ddba3171.png",
  aiBanner: "figma:asset/e8f3f172d276c82678d8b23bf9e86fcdaeec84de.png",
  villa:
    "https://images.unsplash.com/photo-1575356864509-f1727fd74ee4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB2aWxsYSUyMGV4dGVyaW9yJTIwc2F1ZGl8ZW58MXx8fHwxNzcxOTcyNjEwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  residential:
    "https://images.unsplash.com/photo-1755567818043-a86c648900de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNpZGVudGlhbCUyMGFwYXJ0bWVudCUyMGJ1aWxkaW5nfGVufDF8fHx8MTc3MTkxMDA0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  commercialBuilding:
    "https://images.unsplash.com/photo-1764983265127-8ec30a9c7b64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tZXJjaWFsJTIwcHJvcGVydHklMjBidWlsZGluZ3xlbnwxfHx8fDE3NzE5MTAzMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  landPlot:
    "https://images.unsplash.com/photo-1764222233275-87dc016c11dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5kJTIwcGxvdCUyMGRldmVsb3BtZW50fGVufDF8fHx8MTc3MTk3MjYxMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
};

type AuctionsPageProps = {
  navigate: (view: ViewState) => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  setSelectedAuctionId: React.Dispatch<React.SetStateAction<string | null>>;
};

const parseAuctionDate = (value?: string | null) => {
  if (!value) return null;

  const trimmed = value.trim();

  // إذا التاريخ فيه وقت أو بصيغة ISO
  if (trimmed.includes("T") || trimmed.includes("-")) {
    const date = new Date(trimmed);
    return isNaN(date.getTime()) ? null : date;
  }

  // إذا كان بصيغة yyyy/mm/dd
  const ymdMatch = trimmed.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (ymdMatch) {
    const [, year, month, day] = ymdMatch;
    return new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59);
  }

  // إذا كان بصيغة dd/mm/yyyy
  const dmyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    return new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59);
  }

  return null;
};

const extractDurationDays = (duration?: string | null) => {
  if (!duration) return 0;
  const match = duration.match(/\d+/);
  return match ? Number(match[0]) : 0;
};

const normalizeDateOnly = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const getAuctionStatus = (
  startTime?: string | null,
  endTime?: string | null,
  duration?: string | null
): "current" | "upcoming" | "ended" => {
  const now = normalizeDateOnly(new Date());
  const start = parseAuctionDate(startTime);

  if (!start) return "upcoming";

  const startDateOnly = normalizeDateOnly(start);

  let end = parseAuctionDate(endTime);

  if (!end) {
    const days = extractDurationDays(duration);
    end = new Date(start);
    end.setDate(end.getDate() + days);
  }

  const endDateOnly = normalizeDateOnly(end);

  if (now < startDateOnly) return "upcoming";
  if (now > endDateOnly) return "ended";
  return "current";
};

export default function AuctionsPage({
  navigate,
  isFavorite,
  toggleFavorite,
  setSelectedAuctionId,
}: AuctionsPageProps) {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [propertyType, setPropertyType] = useState("الكل");
  const [city, setCity] = useState("الكل");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [filterType, setFilterType] = useState("current");

  useEffect(() => {
    const fetchAuctions = async () => {
      const { data, error } = await supabase
        .from("auction")
        .select(`
  *,
  property (*)
`)
        .order("auction_id", { ascending: true });

      console.log("SUPABASE DATA:", data);
      console.log("SUPABASE ERROR:", error);

      if (error) {
        console.error("Error fetching auctions:", error.message);
        return;
      }

      const mappedAuctions = (data as AuctionRow[]).map((row) =>
        Auction.fromRow(row)
      );

      console.log("MAPPED AUCTIONS:", mappedAuctions);
      setAuctions(mappedAuctions);
    };

    fetchAuctions();
  }, []);

  const filteredAuctions = useMemo(() => {
    return auctions.filter((auction) => {
      const status = getAuctionStatus(
        auction.startTime,
        auction.endTime,
        auction.durationText
      );

      const matchesFilterType = status === filterType;

      const matchesPropertyType =
        propertyType === "الكل" || auction.propertyType === propertyType;

      const matchesCity =
        city === "الكل" || auction.location.includes(city);

      const matchesMin =
        minPrice === "" || auction.startPrice >= Number(minPrice);

      const matchesMax =
        maxPrice === "" || auction.startPrice <= Number(maxPrice);

      return (
        matchesFilterType &&
        matchesPropertyType &&
        matchesCity &&
        matchesMin &&
        matchesMax
      );
    });
  }, [auctions, propertyType, city, minPrice, maxPrice, filterType]);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#f8fafc] min-h-screen"
    >
      <HorizontalFilterBar
        filterType={filterType}
        setFilterType={setFilterType}
        propertyType={propertyType}
        setPropertyType={setPropertyType}
        city={city}
        setCity={setCity}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAuctions.length > 0 ? (
          filteredAuctions.map((auction) => (
            <ListingAuctionCard
              key={auction.id}
              id={auction.id}
              title={auction.title}
              location={auction.location}
              days={auction.days}
              hours={auction.hours}
              minutes={auction.minutes}
              seconds={auction.seconds}
              duration={auction.durationText}
              productsCount={auction.productsCountText}
              date={auction.displayDate}
              time={auction.displayTime}
              onClick={() => {
                setSelectedAuctionId(auction.id);
                navigate("auction-detail");
              }}
              isFavorite={isFavorite(auction.id)}
              onToggleFavorite={(e: React.MouseEvent) => {
                e.stopPropagation();
                toggleFavorite(auction.id);
              }}
              image={auction.imageUrl}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-16 text-slate-500 font-bold">
            لا توجد مزادات مطابقة
          </div>
        )}
      </div>
    </motion.div>
  );
}

type HorizontalFilterBarProps = {
  filterType: string;
  setFilterType: React.Dispatch<React.SetStateAction<string>>;
  propertyType: string;
  setPropertyType: React.Dispatch<React.SetStateAction<string>>;
  city: string;
  setCity: React.Dispatch<React.SetStateAction<string>>;
  minPrice: string;
  setMinPrice: React.Dispatch<React.SetStateAction<string>>;
  maxPrice: string;
  setMaxPrice: React.Dispatch<React.SetStateAction<string>>;
};

const HorizontalFilterBar = ({
  filterType,
  setFilterType,
  propertyType,
  setPropertyType,
  city,
  setCity,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
}: HorizontalFilterBarProps) => {
  return (
    <div className={`bg-white border-b ${THEME.border} sticky top-20 z-40 shadow-sm py-4`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className={`flex items-center gap-2 ${THEME.textPrimary} font-bold shrink-0`}>
            <Filter className="w-5 h-5" />
            <span>تصفية النتائج</span>
          </div>

          <div className="hidden md:block w-px h-8 bg-slate-200" />

          <div
            className="flex flex-1 gap-4 overflow-x-auto w-full pb-2 md:pb-0 no-scrollbar"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <style>{`
              .no-scrollbar::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            <div className="min-w-[160px]">
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                نوع العقار
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full text-sm border-slate-300 rounded-md focus:ring-[#30364F] focus:border-[#30364F]"
              >
                <option>الكل</option>
                <option>أرض</option>
                <option>فيلا</option>
                <option>عمارة</option>
                <option>شقة</option>
                <option>سوق</option>
              </select>
            </div>

            <div className="min-w-[160px]">
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                المدينة
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-sm border-slate-300 rounded-md focus:ring-[#30364F] focus:border-[#30364F]"
              >
                <option>الكل</option>
                <option>جدة</option>
                <option>الرياض</option>
                <option>الدمام</option>
                <option>مكة</option>
              </select>
            </div>

            <div className="flex gap-2 items-end max-w-[250px]">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  السعر من
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full text-sm border-slate-300 rounded-md focus:ring-[#30364F] focus:border-[#30364F]"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  السعر إلى
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="غير محدود"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full text-sm border-slate-300 rounded-md focus:ring-[#30364F] focus:border-[#30364F]"
                />
              </div>
            </div>
          </div>

          <Button variant="primary" className="shrink-0">
            تطبيق
          </Button>
        </div>

        <div className="flex justify-center pt-2">
          <div className="inline-flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            {[
              { id: "current", label: "المزادات الحالية" },
              { id: "upcoming", label: "المزادات القادمة" },
              { id: "ended", label: "المزادات المنتهية" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${filterType === tab.id
                  ? "bg-white text-[#30364F] shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const THEME = {
  primary: "bg-[#91C6BC]",
  primaryHover: "hover:bg-[#7BB5AA]",
  textPrimary: "text-[#30364F]",
  textSecondary: "text-[#475569]",
  bgLight: "bg-[#f1f5f9]",
  border: "border-[#cbd5e1]",
  accent: "bg-[#334155]",
  accentText: "text-[#f8fafc]",
  secondary: "bg-[#B7E5CD]",
  secondaryText: "text-[#B7E5CD]",
  navbarBg: "bg-[#30364F]",
  footerBg: "bg-[#30364F]",
};