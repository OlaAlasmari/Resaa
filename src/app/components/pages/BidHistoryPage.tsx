import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar, Clock, CheckCircle, X, ChevronDown, Loader2, AlertCircle,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { supabase } from "../../../lib/supabase";

// Gavel icon inline
const Gavel: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 6l-1-2H5v17h2v-7h5.5l1 2H20V6h-6z"/>
  </svg>
);

// ── Types ──────────────────────────────────────────────────────────────────────
type BidRow = {
  bid_id: number;
  auction_id: number;
  amount: number;
  bid_number: number;
  created_at: string;
};

type AuctionEntry = {
  auction_id: number;
  auction_name: string;
  end_time: string;
  highest_bid: number;
  property_type: string | null;
  image_url: string | null;
  city: string | null;
  userBids: BidRow[];          // all bids this user placed in this auction
  userHighestBid: number;      // the highest amount this user bid
  status: "won" | "lost" | "active";
};

// ── Calendar Widget (unchanged from original) ──────────────────────────────────
type CalendarWidgetProps = {
  onClose: () => void;
  onSelect: (date: string) => void;
  position?: "top" | "bottom";
};

const CalendarWidget = ({ onClose, onSelect, position = "bottom" }: CalendarWidgetProps) => {
  const [selectedDay, setSelectedDay] = useState(15);
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(0);

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const years = Array.from({ length: 80 }, (_, i) => 1950 + i);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDay = new Date(currentYear, currentMonth, 1).getDay();
  const positionClasses = position === "top" ? "bottom-full mb-2 origin-bottom-left" : "top-full mt-2 origin-top-left";

  return (
    <div className={`absolute ${positionClasses} left-0 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 w-[280px] animate-in zoom-in-95 duration-200`}>
      <div className="flex justify-between items-center mb-4 gap-2">
        <div className="flex gap-2 w-full">
          <select value={currentMonth} onChange={(e) => setCurrentMonth(Number(e.target.value))}
            className="flex-1 bg-slate-50 border border-slate-200 text-[#30364F] font-bold text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#30364F] cursor-pointer">
            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select value={currentYear} onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="w-20 bg-slate-50 border border-slate-200 text-[#30364F] font-bold text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#30364F] cursor-pointer">
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-2 text-center">
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <div key={i} className="text-[10px] font-bold text-slate-400 uppercase py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {Array.from({ length: startDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
          <button key={day} onClick={() => setSelectedDay(day)}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all mx-auto ${
              selectedDay === day ? "bg-[#30364F] text-white shadow-md shadow-slate-200" : "text-slate-600 hover:bg-slate-50 hover:text-[#30364F]"
            }`}>
            {day}
          </button>
        ))}
      </div>

      <button
        onClick={() => {
          onSelect(`${currentYear}-${(currentMonth + 1).toString().padStart(2,"0")}-${selectedDay.toString().padStart(2,"0")}`);
          onClose();
        }}
        className="w-full py-2.5 bg-[#30364F] text-white rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-[#1E2437] transition-all text-xs"
      >
        تأكيد التاريخ
      </button>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function BidHistoryPage() {
  const [showCalendar, setShowCalendar]   = useState(false);
  const [selectedDate, setSelectedDate]   = useState("");
  const [expandedBid, setExpandedBid]     = useState<number | null>(null);
  const [auctions, setAuctions]           = useState<AuctionEntry[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);

  // ── Fetch real bid history ───────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("يجب تسجيل الدخول لعرض سجل المزايدات"); setLoading(false); return; }

      // 2. Fetch all bids by this user, joined with auction + property image
      const { data: bidsData, error: bidsError } = await supabase
        .from("bids")
        .select(`
          bid_id,
          auction_id,
          amount,
          bid_number,
          created_at,
          auction:auction_id (
            auction_id,
            auction_name,
            end_time,
            highest_bid,
            property_type,
            city,
            property:property_id (
              image_url
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (bidsError) { setError("فشل تحميل سجل المزايدات"); setLoading(false); return; }
      if (!bidsData || bidsData.length === 0) { setAuctions([]); setLoading(false); return; }

      // 3. Group bids by auction_id
      const auctionMap = new Map<number, AuctionEntry>();

      for (const bid of bidsData as any[]) {
        const auc = bid.auction;
        if (!auc) continue;

        if (!auctionMap.has(bid.auction_id)) {
          const isEnded = new Date(auc.end_time) < new Date();
          const userHighest = bid.amount;

          auctionMap.set(bid.auction_id, {
            auction_id:      auc.auction_id,
            auction_name:    auc.auction_name,
            end_time:        auc.end_time,
            highest_bid:     auc.highest_bid,
            property_type:   auc.property_type,
            city:            auc.city,
            image_url:       auc.property?.image_url ?? null,
            userBids:        [],
            userHighestBid:  userHighest,
            status:          !isEnded ? "active" : userHighest === auc.highest_bid ? "won" : "lost",
          });
        }

        const entry = auctionMap.get(bid.auction_id)!;

        // Track the user's highest bid in this auction
        if (bid.amount > entry.userHighestBid) {
          entry.userHighestBid = bid.amount;
          // Re-evaluate win status
          const isEnded = new Date(auc.end_time) < new Date();
          entry.status = !isEnded ? "active" : bid.amount === auc.highest_bid ? "won" : "lost";
        }

        entry.userBids.push({
          bid_id:     bid.bid_id,
          auction_id: bid.auction_id,
          amount:     bid.amount,
          bid_number: bid.bid_number,
          created_at: bid.created_at,
        });
      }

      setAuctions(Array.from(auctionMap.values()));
      setLoading(false);
    };

    load();
  }, []);

  // ── Filter by selected date ───────────────────────────────────────────────────
  const filtered = selectedDate
    ? auctions.filter((a) => a.end_time?.startsWith(selectedDate))
    : auctions;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-in fade-in space-y-8 bg-[#f8fafc] min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-200 pb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#30364F] mb-2">سجل المزايدات</h1>
          <p className="text-slate-500">سجل كامل بجميع المزادات التي قمت بالمشاركة فيها ونتائجها.</p>
        </div>

        <div className="flex flex-col gap-1 w-full md:w-auto relative">
          <label className="text-xs font-bold text-slate-500 uppercase">تصفية حسب التاريخ</label>
          <div className="relative" onClick={() => setShowCalendar(!showCalendar)}>
            <Calendar className="absolute top-2.5 left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <div className="w-full md:w-64 pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm font-bold text-[#30364F] bg-white cursor-pointer hover:border-[#30364F] transition-colors flex items-center min-h-[40px]">
              {selectedDate || ""}
            </div>
          </div>
          {showCalendar && (
            <CalendarWidget onClose={() => setShowCalendar(false)} onSelect={(d) => { setSelectedDate(d); setShowCalendar(false); }} />
          )}
          {selectedDate && (
            <button onClick={() => setSelectedDate("")} className="text-xs text-slate-400 hover:text-red-500 mt-1 text-right transition-colors">
              مسح الفلتر ✕
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#91C6BC]" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <Gavel className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-bold text-lg">لا توجد مزايدات بعد</p>
          <p className="text-sm mt-1">شاركت في مزاد؟ ستظهر هنا تلقائياً.</p>
        </div>
      )}

      {/* Bid cards */}
      {!loading && !error && (
        <div className="grid gap-4">
          {filtered.map((item) => (
            <div key={item.auction_id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:border-[#30364F]/30 transition-all">
              <div className="p-6 flex flex-col md:flex-row items-center gap-6">

                {/* Image + title */}
                <div className="flex items-center gap-4 flex-1 w-full">
                  <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                    <ImageWithFallback
                      src={item.image_url ?? ""}
                      className="w-full h-full object-cover"
                      alt="Auction"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#30364F] mb-1">{item.auction_name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span className="font-mono">
                        {item.end_time
                          ? new Date(item.end_time).toLocaleDateString("en-US")
                          : "—"}
                      </span>
                      {item.city && (
                        <span className="text-slate-400">· {item.city}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:flex items-center gap-8 w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                  <div className="text-right md:text-center">
                    <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">أعلى مزايدة لي</div>
                    <div className="text-xl font-black text-[#30364F] font-mono">
                      {item.userHighestBid.toLocaleString()} ر.س
                    </div>
                  </div>

                  <div className="text-left md:text-center">
                    <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">نتيجة المزاد</div>
                    {item.status === "won" ? (
                      <Badge variant="success" className="inline-flex items-center gap-1.5 !px-3 !py-1 !text-xs">
                        <CheckCircle className="w-3.5 h-3.5" /> فوز بالمزاد
                      </Badge>
                    ) : item.status === "active" ? (
                      <Badge className="inline-flex items-center gap-1.5 !px-3 !py-1 !text-xs !bg-blue-50 !text-blue-600 !border-blue-200">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" /> جارٍ
                      </Badge>
                    ) : (
                      <Badge variant="neutral" className="inline-flex items-center gap-1.5 !px-3 !py-1 !text-xs !bg-slate-100 !text-slate-500">
                        <X className="w-3.5 h-3.5" /> لم يتم الفوز
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Expand toggle */}
                <div className="hidden md:block">
                  <button
                    onClick={() => setExpandedBid(expandedBid === item.auction_id ? null : item.auction_id)}
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-[#30364F] transition-all"
                  >
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expandedBid === item.auction_id ? "rotate-180" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Expanded bid history */}
              <AnimatePresence>
                {expandedBid === item.auction_id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-0 border-t border-slate-100">
                      <div className="bg-[#B7E5CD]/10 rounded-lg p-4 mt-4">
                        <h4 className="text-sm font-bold text-[#30364F] mb-3 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          مزايداتي في هذا المزاد ({item.userBids.length} مزايدة)
                        </h4>
                        <div className="space-y-2">
                          {item.userBids.map((bid) => (
                            <div key={bid.bid_id} className="flex justify-between items-center bg-white rounded-lg p-3 text-sm">
                              <div>
                                <span className="text-slate-600 font-mono text-xs block">
                                  {new Date(bid.created_at).toLocaleString("en-US")}
                                </span>
                                <span className="text-[10px] text-slate-400">مزايدة رقم {bid.bid_number}</span>
                              </div>
                              <span className="font-black text-[#30364F]">
                                {bid.amount.toLocaleString()} ر.س
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Summary row */}
                        <div className="mt-3 pt-3 border-t border-[#B7E5CD]/30 flex justify-between text-xs font-bold text-slate-600">
                          <span>السعر النهائي للمزاد</span>
                          <span className="text-[#30364F]">{item.highest_bid.toLocaleString()} ر.س</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}