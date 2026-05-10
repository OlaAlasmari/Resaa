import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  Heart,
  MapPin,
  Gavel,
  ChevronUp,
  BarChart3,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "../ui/button";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { supabase } from "../../../lib/supabase";
import { PropertyDetails, PropertyJoinRow } from "../../models/Property";
import { PriceService, PricePredictionResult } from "../../services/PriceService";
import LandRecommendation from "../landRecommendition";

const THEME = {
  border: "border-[#cbd5e1]",
  textPrimary: "text-[#30364F]",
};

type AuctionDetailPageProps = {
  onBack: () => void;
  onParticipate: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  selectedAuctionId: string | null;
};

const Card = ({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`bg-white border ${THEME.border} rounded-2xl shadow-sm p-6 ${className}`}>
    {title && <h3 className="text-xl font-black text-[#30364F] mb-6">{title}</h3>}
    {children}
  </div>
);

export default function AuctionDetailPage({
  onBack,
  onParticipate,
  isFavorite,
  onToggleFavorite,
  selectedAuctionId,
}: AuctionDetailPageProps) {
  const [showAI, setShowAI] = useState(false);
  const [details, setDetails] = useState<PropertyDetails | null>(null);
  const [rawStartTime, setRawStartTime] = useState<string | null>(null);
  const [rawEndTime, setRawEndTime]     = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLandRec, setShowLandRec] = useState(false);

  // AI analysis states
  const [analysis, setAnalysis] = useState<PricePredictionResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Fetch auction + property from Supabase
  useEffect(() => {
    const fetchAuctionDetails = async () => {
      if (!selectedAuctionId) {
        setDetails(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from("auction")
        .select(`
          auction_id,
          auction_name,
          property_id,
          start_time,
          end_time,
          start_price,
          highest_bid,
          duration,
          products_count,
          time,
          property:property_id (
            property_id,
            property_type,
            city,
            district,
            region,
            area,
            usage,
            deed_number,
            plan_number,
            plot_number,
            north_boundary,
            south_boundary,
            east_boundary,
            west_boundary,
            image_url
          )
        `)
        .eq("auction_id", Number(selectedAuctionId))
        .single();

      if (error) {
        console.error("Error fetching auction details:", error.message);
        setDetails(null);
        setLoading(false);
        return;
      }

      setDetails(PropertyDetails.fromJoinRow(data as PropertyJoinRow));
      setRawStartTime(data.start_time ?? null);
      setRawEndTime(data.end_time ?? null);
      setLoading(false);
    };
    fetchAuctionDetails();
  }, [selectedAuctionId]);

      const isLand = details?.propertyType?.includes("أرض") ||
      details?.usage?.includes("أرض") ||
      details?.propertyType?.includes("قطعة");

  // ── Auction status — use raw ISO timestamps, treat as Saudi time UTC+3 ────
  const now = new Date();

const parseLocalTime = (t: string | null): Date | null => {
  if (!t) return null

  // ISO format
  if (t.includes("T") || t.includes("-")) {
    const normalized = t.includes("+") || t.endsWith("Z") ? t : t + "+03:00"
    return new Date(normalized)
  }

  // DD/MM/YYYY HH:MM or DD/MM/YYYY
  const match = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/)
  if (match) {
    const [, day, month, year, hour = "23", min = "59"] = match
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(min))
  }

  return null
}

  const startTime  = parseLocalTime(rawStartTime);
  const endTime    = parseLocalTime(rawEndTime);
  const isEnded    = endTime   ? now > endTime   : false;
  const isUpcoming = startTime ? now < startTime : false;
  const isLive     = !isEnded && !isUpcoming;


  // Fetch AI analysis once when panel first opens
  useEffect(() => {
    if (!showAI || analysis || aiLoading || !details) return;

    setAiLoading(true);
    setAiError(null);


    PriceService.predict({
      area_sqm: details.area ? parseFloat(details.area) : 500,
      neighborhood: details.district?.replace(/^حي\s*/, "").trim() ?? "الروضة",
      property_type: details.propertyType ?? "أرض",
      classification: details.usage ?? "سكني",
      plan_no: details.planNumber ?? "0",
      parcel_no: details.plotNumber ?? "0",
    })
      .then(setAnalysis)
      .catch((e) => setAiError(e.message))
      .finally(() => setAiLoading(false));
  }, [showAI, details]);

  if (loading) {
    return (
      <div className="bg-[#f8fafc] min-h-screen flex items-center justify-center text-slate-500 font-bold">
        جاري تحميل تفاصيل المزاد...
      </div>
    );
  }

  if (!details) {
    return (
      <div className="bg-[#f8fafc] min-h-screen flex flex-col items-center justify-center gap-4 text-slate-500 font-bold">
        <div>لا توجد بيانات لهذا المزاد</div>
        <Button onClick={onBack}>العودة للمزادات</Button>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20">

      {/* Top bar */}
      <div className={`bg-white border-b ${THEME.border} py-4 px-4 sticky top-20 z-30 shadow-sm`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#30364F] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> العودة للمزادات
          </button>

          <h1 className={`font-bold text-lg ${THEME.textPrimary}`}>
            تفاصيل المزاد #{details.auctionId}
          </h1>

          <button
            onClick={onToggleFavorite}
            className={`flex items-center gap-2 text-sm font-bold transition-colors ${isFavorite ? "text-red-600" : "text-slate-500 hover:text-red-600"
              }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
            <span>{isFavorite ? "تمت الإضافة للمفضلة" : "إضافة للمفضلة"}</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <Card title="الأصول المدرجة" className="space-y-6">
          <div className="grid md:grid-cols-12 gap-6 border-b border-slate-100 pb-8 last:border-0">

            {/* Left: Images + Map */}
            <div className="md:col-span-5 space-y-4">
              <div className="h-96 relative rounded-lg overflow-hidden group border border-slate-200">
                <ImageWithFallback
                  src={details.imageUrl}
                  className="w-full h-full object-cover"
                  alt={details.auctionTitle}
                />
              </div>

              <div className="h-48 rounded-lg overflow-hidden border border-slate-200 relative bg-slate-100">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://maps.google.com/maps?width=100%25&height=600&hl=ar&q=${encodeURIComponent(
                    `${details.city} ${details.district} Saudi Arabia`
                  )}&t=&z=14&ie=UTF8&iwloc=B&output=embed`}
                  className="w-full h-full opacity-90 hover:opacity-100 transition-opacity"
                ></iframe>
                <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-[10px] font-bold shadow-sm pointer-events-none">
                  موقع العقار
                </div>
              </div>
            </div>

            {/* Right: Details */}
            <div className="md:col-span-7 space-y-6">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-2xl font-black text-[#30364F] mb-1">
                    {details.auctionTitle}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <MapPin className="w-4 h-4" /> {details.locationText}
                  </div>
                </div>
                <div className="text-left bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">السعر الحالي</div>
                  <div className="text-2xl font-black text-[#30364F]">{details.currentPrice}</div>
                </div>
              </div>

              {/* Property specs */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                {[
                  ["النوع", details.propertyType],
                  ["المساحة م2", details.area],
                  ["رقم الصك", details.deedNumber],
                  ["الاستخدام", details.usage],
                  ["السعر الافتتاحي", details.openingPrice],
                  ["رقم المخطط", details.planNumber],
                  ["الحي", details.district],
                  ["رقم القطعة", details.plotNumber],
                  ["العربون", details.deposit],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between border-b border-dotted border-slate-200 pb-1">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-bold text-slate-800">{value}</span>
                  </div>
                ))}
              </div>

              

              {/* Action buttons */}
              <div className="flex flex-col gap-4 mt-8 pt-6 border-t border-slate-100">

                {/* ROW 1: Analysis ONLY */}
                <div
                  className="w-full bg-[#213448] rounded-xl p-2 flex items-center justify-between text-white
                  shadow-md min-h-[65px] py-3 cursor-pointer hover:opacity-95 transition"
                  onClick={() => setShowAI(!showAI)}
                >
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-[#91c6bc]" />
                    </div>
                    <h3 className="font-semibold text-sm">تحليل العقار</h3>
                  </div>

                  <ChevronUp
                    className={`w-5 h-5 mr-2 transition-transform text-white/80 ${showAI ? "rotate-180" : ""
                      }`}
                  />
                </div>

                {/* ROW 2: Two buttons side by side */}
                <div className="flex gap-4">

                  {isLand && (
                    <div
                      className="flex-1 bg-white border border-[#e6f5f2]
                      rounded-xl p-2 flex items-center justify-between
                      text-[#213448] min-h-[65px] py-3 cursor-pointer
                      shadow-[0_0_0_1px_rgba(145,198,188,0.25)]
                      hover:shadow-[0_0_12px_rgba(145,198,188,0.35)]
                      hover:border-[#91c6bc]
                      transition-all duration-200"
                      onClick={() => setShowLandRec(!showLandRec)}
                    >
                      <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 bg-[#91c6bc]/10 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-[#91c6bc]" />
                        </div>
                        <h3 className="font-semibold text-sm">توصية الأرض</h3>
                      </div>
                      <ChevronUp
                        className={`w-5 h-5 mr-2 transition-transform text-[#213448]/60 ${showLandRec ? "rotate-180" : ""}`}
                      />
                    </div>
                  )}

                  {/* Participation button — only show for live auctions */}
                  {isLive && (
                    <Button
                      onClick={onParticipate}
                      variant="primary"
                      icon={Gavel}
                      className="flex-[2] text-lg py-3 h-[54px]
                      bg-[#91c6bc] text-[#213448] min-h-[65px] py-3
                      shadow-md rounded-xl
                      hover:shadow-lg hover:brightness-105
                      transition-all duration-200"
                    >
                      المشاركة في المزايدة
                    </Button>
                  )}

                  {isEnded && (
                    <div className="flex-[2] min-h-[65px] flex items-center justify-center bg-slate-100 text-slate-400 font-bold rounded-xl border border-slate-200 text-sm">
                      انتهى المزاد
                    </div>
                  )}

                  {isUpcoming && (
                    <div className="flex-[2] min-h-[65px] flex items-center justify-center bg-blue-50 text-blue-500 font-bold rounded-xl border border-blue-100 text-sm">
                      لم يبدأ المزاد بعد
                    </div>
                  )}

                </div>
                {/* ── توصية استخدام الأرض panel ── */}
                <AnimatePresence>
                  {showLandRec && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <LandRecommendation
                        area_sqm={details.area ? parseFloat(details.area) : 500}
                        neighborhood={details.district?.replace(/^حي\s*/, "").trim() ?? "الروضة"}
                        classification={details.usage ?? "سكني"}
                        property_type={details.propertyType ?? "أرض"}
                        plan_no={details.planNumber ?? "0"}
                        parcel_no={details.plotNumber ?? "0"}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* AI Analysis Panel */}
                <AnimatePresence>
                  {showAI && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 bg-white border border-emerald-100 rounded-xl p-6 shadow-sm space-y-6">

                        {/* Loading state */}
                        {aiLoading && (
                          <div className="flex flex-col items-center justify-center py-8 gap-3 text-slate-500">
                            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                            <span className="text-sm">جارٍ تحليل العقار...</span>
                          </div>
                        )}

                        {/* Error state */}
                        {aiError && !aiLoading && (
                          <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>{aiError}</span>
                          </div>
                        )}

                        {/* Results */}
                        {analysis && !aiLoading && (
                          <>
                            <div className="grid grid-cols-2 gap-6">
                              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-center">
                                <div className="text-xs text-slate-500 font-bold mb-2">
                                  القيمة السوقية التقديرية
                                </div>
                                <div className="text-2xl font-black text-[#30364F]">
                                  {PriceService.formatPrice(analysis.price_range.low)} -{" "}
                                  {PriceService.formatPrice(analysis.price_range.high)}
                                </div>
                                <div className="text-[10px] text-emerald-600 mt-1 flex items-center justify-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  +{analysis.annual_growth}% نمو سنوي
                                </div>
                              </div>

                              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-center">
                                <div className="text-xs text-slate-500 font-bold mb-2">
                                  مؤشر الطلب
                                </div>
                                <div className="text-2xl font-black text-emerald-600">
                                  {analysis.demand_indicator}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1">
                                  {analysis.demand_basis}
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-bold text-sm mb-3">توصيات المزايدة</h4>
                              <ul className="space-y-2 text-sm">
                                <li className="flex gap-2 items-start">
                                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
                                  <span className="text-slate-600">
                                    السعر الحالي يعتبر فرصة ممتازة للدخول (أقل من السوق بـ{" "}
                                    {analysis.below_market_pct.toFixed(0)}%)
                                  </span>
                                </li>
                                <li className="flex gap-2 items-start">
                                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                                  <span className="text-slate-600">
                                    ينصح بعدم تجاوز حاجز{" "}
                                    {analysis.max_bid.toLocaleString("en-US")} ر.س لضمان هامش ربح جيد
                                  </span>
                                </li>
                              </ul>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}