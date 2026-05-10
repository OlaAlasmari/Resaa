import React, { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "motion/react";
import { ViewState } from "../../types";
import { Button } from "../ui/button";
import ListingAuctionCard from "../ListingAuctionCard";
import { Filter, ChevronDown } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { Auction, AuctionRow } from "../../models/Auction";

const ASSETS = {
  detailRef: "figma:asset/847f6780f0acaecd11d2c4c7b0718985c1af7a04.png",
  heroBg: "https://images.unsplash.com/photo-1722009591790-f47342aa9d3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYXVkaSUyMGFyYWJpYSUyMGx1eHVyeSUyMHJlYWwlMjBlc3RhdGV8ZW58MXx8fHwxNzcxOTcyNjA5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  villa: "https://images.unsplash.com/photo-1575356864509-f1727fd74ee4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB2aWxsYSUyMGV4dGVyaW9yJTIwc2F1ZGl8ZW58MXx8fHwxNzcxOTcyNjEwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  residential: "https://images.unsplash.com/photo-1755567818043-a86c648900de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNpZGVudGlhbCUyMGFwYXJ0bWVudCUyMGJ1aWxkaW5nfGVufDF8fHx8MTc3MTkxMDA0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  commercialBuilding: "https://images.unsplash.com/photo-1764983265127-8ec30a9c7b64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tZXJjaWFsJTIwcHJvcGVydHklMjBidWlsZGluZ3xlbnwxfHx8fDE3NzE5MTAzMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  landPlot: "https://images.unsplash.com/photo-1764222233275-87dc016c11dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5kJTIwcGxvdCUyMGRldmVsb3BtZW50fGVufDF8fHx8MTc3MTk3MjYxMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
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
  if (trimmed.includes("T") || trimmed.includes("-")) {
    const date = new Date(trimmed);
    return isNaN(date.getTime()) ? null : date;
  }
  const ymdMatch = trimmed.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (ymdMatch) {
    const [, year, month, day] = ymdMatch;
    return new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59);
  }
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

const normalizeDateOnly = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

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

// ── Dropdown Checkbox ─────────────────────────────────────────────────────────
type DropdownCheckboxProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
};

const DropdownCheckbox = ({ label, options, value, onChange }: DropdownCheckboxProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative min-w-[160px]" ref={ref}>
      <label className="text-[12px] font-bold text-slate-500 uppercase block mb-1">{label}</label>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-sm border border-slate-300 rounded-md px-3 py-2 bg-white hover:border-[#91C6BC] transition-colors"
      >
        <span className="text-[#30364F] font-medium">{value}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-[999] w-full p-1.5">
          {options.map((opt) => (
            <label
              key={opt}
              className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              <span className="text-sm text-[#30364F]">{opt}</span>
              <input
                type="checkbox"
                checked={value === opt}
                onChange={() => { onChange(opt); setOpen(false); }}
                className="w-4 h-4 rounded accent-[#91C6BC] cursor-pointer"
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
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
        .select(`*, property (*)`)
        .order("auction_id", { ascending: true });

      if (error) { console.error("Error fetching auctions:", error.message); return; }

      const mappedAuctions = (data as AuctionRow[]).map((row) => Auction.fromRow(row));
      console.log("MAPPED AUCTIONS:", mappedAuctions);
      setAuctions(mappedAuctions);
    };
    fetchAuctions();
  }, []);

  const filteredAuctions = useMemo(() => {
    return auctions.filter((auction) => {
      const status = getAuctionStatus(auction.startTime, auction.endTime, auction.durationText);
      return (
        status === filterType &&
        (propertyType === "الكل" || auction.propertyType === propertyType) &&
        (city === "الكل" || auction.location.includes(city)) &&
        (minPrice === "" || auction.startPrice >= Number(minPrice)) &&
        (maxPrice === "" || auction.startPrice <= Number(maxPrice))
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
          filteredAuctions.map((auction) => {
            const auctionStatus = getAuctionStatus(auction.startTime, auction.endTime, auction.durationText)
            return (
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
                date={auction.displayDate ?? "-"}
                time={auction.displayTime}
                startTime={auction.startTime ?? ""}
                endTime={auction.endTime ?? ""}
                status={auctionStatus}
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
            )
          })) : (
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

          {/* Label */}
          <div className={`flex items-center gap-2 ${THEME.textPrimary} font-bold shrink-0`}>
            <Filter className="w-5 h-5" />
            <span>تصفية النتائج</span>
          </div>

          <div className="hidden md:block w-px h-8 bg-slate-200" />

          {/* Filters */}
          <div className="flex flex-1 gap-4 flex-wrap">


            <DropdownCheckbox
              label="نوع العقار"
              options={["الكل", "أرض", "فيلا", "عمارة", "شقة", "سوق"]}
              value={propertyType}
              onChange={setPropertyType}
            />

            <DropdownCheckbox
              label="المدينة"
              options={["الكل", "جدة", "الرياض", "الدمام", "مكة"]}
              value={city}
              onChange={setCity}
            />

            {/* السعر من */}
            <div className="min-w-[120px]">
              <label className="text-[12px] font-bold text-slate-500 uppercase block mb-1">
                السعر من
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#91C6BC]"
              />
            </div>

            {/* السعر إلى */}
            <div className="min-w-[120px]">
              <label className="text-[12px] font-bold text-slate-500 uppercase block mb-1">
                السعر إلى
              </label>
              <input
                type="number"
                min="0"
                placeholder="غير محدود"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#91C6BC]"
              />
            </div>

          </div>


        </div>

        {/* Tabs */}
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