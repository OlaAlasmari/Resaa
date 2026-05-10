import React, { useState, useEffect, useRef, useCallback } from "react";
import { BarChart3, Info, Clock, Users, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { supabase } from "../../../lib/supabase";

// ── Fallback image by property type ───────────────────────────────────────────
const getFallbackImage = (propertyType: string | null | undefined): string => {
  switch (propertyType) {
    case "فيلا":   return "https://images.unsplash.com/photo-1575356864509-f1727fd74ee4?fit=max&fm=jpg&q=80&w=1080";
    case "عمارة":  return "https://images.unsplash.com/photo-1755567818043-a86c648900de?fit=max&fm=jpg&q=80&w=1080";
    case "سوق":    return "https://images.unsplash.com/photo-1764983265127-8ec30a9c7b64?fit=max&fm=jpg&q=80&w=1080";
    case "شقة":    return "https://images.unsplash.com/photo-1755567818043-a86c648900de?fit=max&fm=jpg&q=80&w=1080";
    default:       return "https://images.unsplash.com/photo-1764222233275-87dc016c11dc?fit=max&fm=jpg&q=80&w=1080";
  }
};


// ── Types ──────────────────────────────────────────────────────────────────────
type Auction = {
  auction_id: number;
  auction_name: string;
  start_price: number;
  highest_bid: number;
  start_time: string;
  end_time: string;
  property_id: number;
  minimum_bid_increment?: number;
  property?: {
    image_url: string | null;
    property_type: string | null;
    city: string | null;
    district: string | null;
  };
};

type Bid = {
  bid_id: number;
  auction_id: number;
  user_id: string;
  national_id: string;
  amount: number;
  bid_number: number;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    national_id: string;
  };
};

type LiveBiddingPageProps = {
  auctionId: number;
  onExit: () => void;
};

// ── Fraud Alert Component (kept from original) ─────────────────────────────────
// ── Countdown Timer ────────────────────────────────────────────────────────────
const Countdown = ({ endTime }: { endTime: string }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("انتهى المزاد"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setIsUrgent(diff < 300000); // red if < 5 min
      setTimeLeft(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  return (
    <div className={`flex items-center gap-2 font-mono font-black text-sm ${isUrgent ? "text-red-500 animate-pulse" : "text-slate-600"}`}>
      <Clock className="w-4 h-4" />
      {timeLeft}
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function LiveBiddingPage({ auctionId, onExit }: LiveBiddingPageProps) {
  const [auction, setAuction]         = useState<Auction | null>(null);
  const [bids, setBids]               = useState<Bid[]>([]);
  const [loading, setLoading]         = useState(true);
  const [bidding, setBidding]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedIncrement, setSelectedIncrement] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; national_id: string; first_name: string } | null>(null);
  const lastBidTimeRef = useRef<Date | null>(null);

  // ── Load current user ────────────────────────────────────────────────────────
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("id, national_id, first_name")
        .eq("id", user.id)
        .single();
      if (data) setCurrentUser(data);
    };
    loadUser();
  }, []);

  // ── Load auction data ────────────────────────────────────────────────────────
  useEffect(() => {
    const loadAuction = async () => {
      const { data, error } = await supabase
        .from("auction")
        .select(`
          *,
          property:property_id (
            image_url,
            property_type,
            city,
            district
          )
        `)
        .eq("auction_id", auctionId)
        .single();

      if (error) { setError("فشل تحميل بيانات المزاد"); setLoading(false); return; }
      setAuction(data);
      setLoading(false);
    };
    loadAuction();
  }, [auctionId]);

  // ── Load bids ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const loadBids = async () => {
      const { data } = await supabase
        .from("bids")
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            national_id
          )
        `)
        .eq("auction_id", auctionId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) setBids(data);
    };
    loadBids();
  }, [auctionId]);

  // ── Supabase Realtime — live bid updates ─────────────────────────────────────
  useEffect(() => {
    // Listen for new bids in real time
    const bidChannel = supabase
      .channel(`bids:auction_${auctionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bids", filter: `auction_id=eq.${auctionId}` },
        async (payload) => {
          // Fetch the full bid with profile data
          const { data } = await supabase
            .from("bids")
            .select(`*, profiles:user_id (first_name, last_name, national_id)`)
            .eq("bid_id", payload.new.bid_id)
            .single();
          if (data) setBids((prev) => [data, ...prev.slice(0, 19)]);
        }
      )
      .subscribe();

    // Listen for auction highest_bid updates
    const auctionChannel = supabase
      .channel(`auction:${auctionId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "auction", filter: `auction_id=eq.${auctionId}` },
        (payload) => {
          setAuction((prev) => prev ? { ...prev, highest_bid: payload.new.highest_bid } : prev);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bidChannel);
      supabase.removeChannel(auctionChannel);
    };
  }, [auctionId]);

  // ── Place bid ────────────────────────────────────────────────────────────────
  const placeBid = useCallback(async (incrementOrAmount?: number) => {
    if (!auction || !currentUser) {
      setError("يجب تسجيل الدخول أولاً");
      return;
    }

    const minIncrement = auction.minimum_bid_increment ?? 1000;
    const bidAmount = incrementOrAmount
      ? auction.highest_bid + incrementOrAmount
      : Number(customAmount);

    if (!bidAmount || bidAmount <= auction.highest_bid) {
      setError(`يجب أن تكون المزايدة أعلى من ${auction.highest_bid.toLocaleString()} ر.س`);
      return;
    }

    if (bidAmount < auction.highest_bid + minIncrement) {
      setError(`الحد الأدنى للزيادة هو ${minIncrement.toLocaleString()} ر.س`);
      return;
    }

    setBidding(true);
    setError(null);

    try {
      // Calculate time since last bid
      const now = new Date();
      const secondsSinceLast = lastBidTimeRef.current
        ? (now.getTime() - lastBidTimeRef.current.getTime()) / 1000
        : null;

      // Count existing bids for this user in this auction
      const { count: userBidCount } = await supabase
        .from("bids")
        .select("*", { count: "exact", head: true })
        .eq("auction_id", auctionId)
        .eq("user_id", currentUser.id);

      // Count total bids in auction
      const { count: totalBids } = await supabase
        .from("bids")
        .select("*", { count: "exact", head: true })
        .eq("auction_id", auctionId);

      const bidNumber = (userBidCount ?? 0) + 1;
      const incrementAmount = bidAmount - auction.highest_bid;
      const isMinIncrement = incrementAmount === minIncrement;

      // Insert bid into bids table
      const { error: bidError } = await supabase.from("bids").insert({
        auction_id:             auctionId,
        user_id:                currentUser.id,
        national_id:            currentUser.national_id,
        amount:                 bidAmount,
        bid_number:             bidNumber,
        seconds_since_last_bid: secondsSinceLast,
        increment_amount:       incrementAmount,
        is_minimum_increment:   isMinIncrement,
      });

      if (bidError) throw new Error(bidError.message);

      // Update auction's highest_bid
      const { error: auctionError } = await supabase
        .from("auction")
        .update({ highest_bid: bidAmount })
        .eq("auction_id", auctionId);

      if (auctionError) throw new Error(auctionError.message);

      lastBidTimeRef.current = now;
      setCustomAmount("");
      setSelectedIncrement(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "فشلت عملية المزايدة");
    } finally {
      setBidding(false);
    }
  }, [auction, currentUser, auctionId, customAmount]);

  // ── Loading / Error states ───────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#91C6BC]" />
    </div>
  );

  if (!auction) return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="font-bold text-[#30364F]">لم يتم العثور على المزاد</p>
        <button onClick={onExit} className="mt-4 text-sm text-slate-500 underline">العودة</button>
      </div>
    </div>
  );

  const minIncrement = auction.minimum_bid_increment ?? 1000;
  const increments   = [minIncrement, minIncrement * 5, minIncrement * 10];
  const uniqueBidders = new Set(bids.map(b => b.user_id)).size;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#30364F] pb-20">

      {/* ── Top bar ── */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="font-bold">مزاد مباشر: {auction.auction_name}</span>
        </div>
        <div className="flex items-center gap-4">
          {auction.end_time && <Countdown endTime={auction.end_time} />}
          <Button
            variant="outline"
            className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
            onClick={onExit}
          >
            خروج
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 grid md:grid-cols-12 gap-6">

        {/* ── Left: image + stats + analysis ── */}
        <div className="md:col-span-8 space-y-6">

          {/* Property image with current bid overlay */}
          <div className="aspect-[16/7] bg-black rounded-xl overflow-hidden relative shadow-lg">
            <ImageWithFallback
              src={auction.property?.image_url?.trim() || getFallbackImage(auction.property?.property_type)}
              className="w-full h-full object-cover opacity-90"
              alt="Live"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 right-6">
              <div className="text-sm text-slate-200 mb-1 font-bold drop-shadow-md">السعر الحالي</div>
              <div className="text-5xl font-black text-white drop-shadow-lg">
                {auction.highest_bid.toLocaleString()} ر.س
              </div>
            </div>
            {/* Stats chips */}
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold">
                <Users className="w-3 h-3" /> {uniqueBidders} مزايد
              </div>
              <div className="bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold">
                <TrendingUp className="w-3 h-3" /> {bids.length} مزايدة
              </div>
            </div>
          </div>

          {/* Property info bar */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-xs text-slate-400 font-bold block mb-0.5">نوع العقار</span>
              <span className="font-bold text-[#30364F]">{auction.property?.property_type ?? "—"}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold block mb-0.5">المدينة</span>
              <span className="font-bold text-[#30364F]">{auction.property?.city ?? "—"}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold block mb-0.5">الحي</span>
              <span className="font-bold text-[#30364F]">{auction.property?.district ?? "—"}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold block mb-0.5">السعر الابتدائي</span>
              <span className="font-bold text-[#30364F]">{auction.start_price.toLocaleString()} ر.س</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold block mb-0.5">أدنى زيادة</span>
              <span className="font-bold text-[#30364F]">{minIncrement.toLocaleString()} ر.س</span>
            </div>
          </div>

          {/* Analysis panel — kept from original design */}
          <div className="bg-white rounded-xl p-6 border border-emerald-100 relative overflow-hidden shadow-md">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
              <BarChart3 className="w-24 h-24 text-[#30364F]" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 text-[#30364F] font-bold">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span>تحليل العقار للمزايدة</span>
              </div>
              <div className="grid grid-cols-2 gap-8 mb-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1 font-bold">الحد الأقصى المقترح للمزايدة</div>
                  <div className="text-3xl font-black text-[#30364F]">
                    {Math.round(auction.start_price * 1.3).toLocaleString()} ر.س
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1 font-bold">حالة السعر</div>
                  <div className={`text-lg font-bold ${
                    auction.highest_bid < auction.start_price * 1.1 ? "text-emerald-600" :
                    auction.highest_bid < auction.start_price * 1.25 ? "text-amber-500" : "text-red-500"
                  }`}>
                    {auction.highest_bid < auction.start_price * 1.1 ? "مناسب للشراء" :
                     auction.highest_bid < auction.start_price * 1.25 ? "يقترب من الحد" : "يتجاوز القيمة"}
                  </div>
                </div>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-l from-emerald-500 to-emerald-700 transition-all duration-500"
                  style={{ width: `${Math.min(100, ((auction.highest_bid - auction.start_price) / (auction.start_price * 0.3)) * 100)}%` }}
                />
              </div>
              <p className="text-sm text-slate-500 flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
                <span>السعر الحالي بالنسبة للسعر الابتدائي. ننصح بزيادات حذرة لا تتجاوز {(minIncrement * 10).toLocaleString()} ر.س في المرة الواحدة.</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── Right: live bids + bid input ── */}
        <div className="md:col-span-4 flex flex-col gap-4">

          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col h-[600px] shadow-sm">

            {/* Live bid list */}
            <div className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              المزايدات الحية
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto mb-4 pr-1">
              {bids.length === 0 ? (
                <div className="text-center text-slate-400 text-sm py-8">لا توجد مزايدات بعد</div>
              ) : bids.map((bid, idx) => (
                <div
                  key={bid.bid_id}
                  className={`flex justify-between items-center text-sm p-3 rounded border transition-all ${
                    idx === 0
                      ? "bg-emerald-50 border-emerald-200 shadow-sm"
                      : "bg-slate-50 border-slate-100"
                  }`}
                >
                  <div>
                    <span className="font-bold text-slate-700 block text-xs">
                      {bid.profiles
                        ? `${bid.profiles.first_name} ${bid.profiles.last_name ?? ""}`.trim()
                        : `مزايد ${bid.national_id?.slice(-4) ?? "—"}`}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(bid.created_at).toLocaleTimeString("ar-SA")}
                    </span>
                  </div>
                  <span className={`font-mono font-black ${idx === 0 ? "text-emerald-600" : "text-[#30364F]"}`}>
                    {bid.amount.toLocaleString()} ر.س
                  </span>
                </div>
              ))}
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            {/* Bid input + buttons */}
            <div className="space-y-3 pt-4 border-t border-slate-100">

              {/* Quick increment buttons */}
              <div className="grid grid-cols-3 gap-2">
                {increments.map((inc) => (
                  <button
                    key={inc}
                    onClick={() => { setSelectedIncrement(inc); setCustomAmount(""); }}
                    disabled={bidding}
                    className={`py-2 border rounded text-xs font-bold transition-all ${
                      selectedIncrement === inc
                        ? "bg-[#30364F] text-white border-[#30364F]"
                        : "bg-white border-slate-200 text-[#30364F] hover:bg-slate-50"
                    }`}
                  >
                    +{(inc / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>

              {/* Custom amount input */}
              <input
                type="number"
                placeholder={`أدخل مبلغ المزايدة (أعلى من ${auction.highest_bid.toLocaleString()})`}
                value={customAmount}
                onChange={(e) => { setCustomAmount(e.target.value); setSelectedIncrement(null); }}
                className="w-full border border-slate-300 px-3 py-2 text-sm rounded-lg focus:border-[#30364F] focus:outline-none focus:ring-1 focus:ring-[#30364F] placeholder:text-slate-400"
              />

              {/* Selected amount preview */}
              {(selectedIncrement || customAmount) && (
                <div className="text-center text-xs text-slate-500">
                  مزايدة بـ:{" "}
                  <span className="font-black text-[#30364F]">
                    {selectedIncrement
                      ? (auction.highest_bid + selectedIncrement).toLocaleString()
                      : Number(customAmount).toLocaleString()
                    } ر.س
                  </span>
                </div>
              )}

              <Button
                fullWidth
                className="!bg-emerald-600 hover:!bg-emerald-500 text-lg shadow-lg shadow-emerald-200"
                onClick={() => selectedIncrement ? placeBid(selectedIncrement) : placeBid()}
                disabled={bidding || (!selectedIncrement && !customAmount)}
              >
                {bidding ? <><Loader2 className="w-4 h-4 animate-spin ml-2" /> جاري المزايدة...</> : "مزايدة"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}