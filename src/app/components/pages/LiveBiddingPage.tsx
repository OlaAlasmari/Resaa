import React, { useState, useEffect, useRef, useCallback } from "react";
import { Clock, Users, TrendingUp, Loader2, AlertCircle } from "lucide-react";
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
  const [currentUser, setCurrentUser] = useState<{ id: string; national_id: string; first_name: string; is_frozen: boolean } | null>(null);  const lastBidTimeRef = useRef<Date | null>(null);

  // ── Load current user ────────────────────────────────────────────────────────
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("id, national_id, first_name, is_frozen")
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

if (currentUser.is_frozen) {
  setError("تم تجميد حسابك ولا يمكنك المزايدة");
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
    // ── Re-fetch frozen status in real time ───────────────────────
    const { data: freshProfile } = await supabase
      .from("profiles")
      .select("is_frozen")
      .eq("id", currentUser.id)
      .single();

    if (freshProfile?.is_frozen) {
      setError("تم تجميد حسابك ولا يمكنك المزايدة");
      setBidding(false);
      return;
    }

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
  auction_id:  auctionId,
  user_id:     currentUser.id,
  national_id: currentUser.national_id,
  amount:      bidAmount,
  bid_number:  bidNumber,
});
      if (bidError) throw new Error(bidError.message);

      // Update auction's highest_bid
      const { error: auctionError } = await supabase
        .from("auction")
        .update({ highest_bid: bidAmount })
        .eq("auction_id", auctionId);

      if (auctionError) throw new Error(auctionError.message);
      
// ── Fraud Detection ────────────────────────────────────────────
      const auctionDuration =
        (new Date(auction.end_time).getTime() - new Date(auction.start_time).getTime()) / 60000;
      const firstBidTime = bids.length > 0
        ? (new Date(bids[bids.length - 1].created_at).getTime() - new Date(auction.start_time).getTime()) / 60000
        : 0;
      const lastBidTime = (new Date(auction.end_time).getTime() - now.getTime()) / 60000;

      const fraudPayload = {
        total_auctions_participated:    10,
        total_auctions_won:             2,
        total_bids_history:             userBidCount ?? 1,
        historical_win_rate:            0.2,
        bids_to_wins_ratio:             (userBidCount ?? 1) / 1,
        starting_price:                 auction.start_price,
        final_price:                    bidAmount,
        minimum_bid_increment:          minIncrement,
        auction_duration_minutes:       auctionDuration,
        number_of_unique_bidders:       uniqueBidders,
        total_bids_in_auction:          totalBids ?? 1,
        bids_count_in_auction:          (userBidCount ?? 0) + 1,
        bid_share_in_auction:           ((userBidCount ?? 0) + 1) / ((totalBids ?? 1) + 1),
        avg_seconds_between_bids:       secondsSinceLast ?? 30,
        first_bid_time_from_start_minutes: firstBidTime,
        last_bid_time_to_end_minutes:   lastBidTime,
        used_minimum_increment_ratio:   isMinIncrement ? 1 : 0,
        bid_increment_avg:              incrementAmount,
      };

      try {
        const fraudRes  = await fetch("http://localhost:5000/detect-fraud", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(fraudPayload),
        });
        const fraudData = await fraudRes.json();

        if (fraudData.fraud) {
          const { data: existingAlert } = await supabase
            .from("fraud_alerts")
            .select("alert_id")
            .eq("auction_id", auctionId)
            .eq("user_id", currentUser.id)
            .single();

          if (!existingAlert) {
            await supabase.from("fraud_alerts").insert({
              auction_id:  auctionId,
              user_id:     currentUser.id,
              national_id: currentUser.national_id,
              risk_level:  fraudData.risk_level,
              confidence:  fraudData.confidence,
              reasons:     fraudData.reasons,
              is_read:     false,
            });
          }
        }
      } catch (_) {
        // fraud check failing should never block the bid
      }

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
<div className="max-w-6xl mx-auto p-6">
        <div className="grid md:grid-cols-12 gap-6 items-start">

          {/* ── Left: image + property info ── */}
          <div className="md:col-span-8 flex flex-col gap-4">

            {/* Property image */}
            <div className="aspect-[16/9] bg-black rounded-2xl overflow-hidden relative shadow-lg">
              <ImageWithFallback
                src={auction.property?.image_url?.trim() || getFallbackImage(auction.property?.property_type)}
                className="w-full h-full object-cover opacity-90"
                alt="Live"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 right-6">
                <div className="text-sm text-slate-300 mb-1 font-bold drop-shadow-md">السعر الحالي</div>
                <div className="text-5xl font-black text-white drop-shadow-lg">
                  {auction.highest_bid.toLocaleString()} ر.س
                </div>
              </div>
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
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="grid grid-cols-5 divide-x divide-x-reverse divide-slate-100 text-center">
                <div className="px-3">
                  <span className="text-[11px] text-slate-400 font-bold block mb-1">نوع العقار</span>
                  <span className="font-black text-[#30364F] text-sm">{auction.property?.property_type ?? "—"}</span>
                </div>
                <div className="px-3">
                  <span className="text-[11px] text-slate-400 font-bold block mb-1">المدينة</span>
                  <span className="font-black text-[#30364F] text-sm">{auction.property?.city ?? "—"}</span>
                </div>
                <div className="px-3">
                  <span className="text-[11px] text-slate-400 font-bold block mb-1">الحي</span>
                  <span className="font-black text-[#30364F] text-sm">{auction.property?.district ?? "—"}</span>
                </div>
                <div className="px-3">
                  <span className="text-[11px] text-slate-400 font-bold block mb-1">السعر الابتدائي</span>
                  <span className="font-black text-[#30364F] text-sm">{auction.start_price.toLocaleString()} ر.س</span>
                </div>
                <div className="px-3">
                  <span className="text-[11px] text-slate-400 font-bold block mb-1">أدنى زيادة</span>
                  <span className="font-black text-[#30364F] text-sm">{minIncrement.toLocaleString()} ر.س</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: live bids + bid input ── */}
          <div className="md:col-span-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col" style={{ height: "calc(9/16 * (100vw - 3rem) * 8/12 + 88px)" }}>

              {/* Live bid list */}
              <div className="p-4 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  المزايدات الحية
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {bids.length === 0 ? (
                  <div className="text-center text-slate-400 text-sm py-8">لا توجد مزايدات بعد</div>
                ) : bids.map((bid, idx) => (
                  <div
                    key={bid.bid_id}
                    className={`flex justify-between items-center text-sm p-3 rounded-xl border transition-all ${
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

              {/* Bid controls */}
              <div className="p-4 border-t border-slate-100 space-y-3">

                {/* Quick increment buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {increments.map((inc) => (
                    <button
                      key={inc}
                      onClick={() => { setSelectedIncrement(inc); setCustomAmount(""); }}
                      disabled={bidding}
                      className={`py-2.5 border rounded-xl text-xs font-bold transition-all ${
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
                  placeholder={`أعلى من ${auction.highest_bid.toLocaleString()}`}
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setSelectedIncrement(null); }}
                  className="w-full border border-slate-300 px-3 py-2.5 text-sm rounded-xl focus:border-[#30364F] focus:outline-none focus:ring-1 focus:ring-[#30364F] placeholder:text-slate-400"
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

                {/* Error message */}
                {error && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                    {error}
                  </div>
                )}

                <Button
                  fullWidth
                  className="!bg-emerald-600 hover:!bg-emerald-500 text-base shadow-lg shadow-emerald-200"
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
    </div>
  );
}