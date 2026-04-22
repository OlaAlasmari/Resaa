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
} from "lucide-react";
import { Button } from "../ui/button";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { supabase } from "../../../lib/supabase";
import { PropertyDetails, PropertyJoinRow } from "../../models/Property";

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
  const [loading, setLoading] = useState(true);

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
    property (
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
      console.log("DETAILS RAW DATA:", data);
      console.log("PROPERTY ID FROM AUCTION:", data?.property_id);
      console.log("PROPERTY OBJECT:", data?.property);
      setDetails(PropertyDetails.fromJoinRow(data as PropertyJoinRow));
      setLoading(false);
    };

    fetchAuctionDetails();
  }, [selectedAuctionId]);

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
            <div className="md:col-span-5 space-y-4">
              <div className="h-96 relative rounded-lg overflow-hidden group border border-slate-200">
                <ImageWithFallback
                  src={details.imageUrl}
                  className="w-full h-full object-cover"
                  alt={details.auctionTitle}
                />

                <div
                  onClick={onToggleFavorite}
                  className={`absolute top-2 right-2 p-2 rounded-full cursor-pointer transition-colors shadow-sm ${isFavorite
                    ? "bg-red-500 text-white"
                    : "bg-white/90 text-slate-400 hover:text-red-500"
                    }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                </div>

                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                  1 من 1 صور
                </div>
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
                  <div className="text-[10px] text-slate-400 font-bold uppercase">
                    السعر الحالي
                  </div>
                  <div className="text-2xl font-black text-[#30364F]">
                    {details.currentPrice}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div className="flex justify-between border-b border-dotted border-slate-200 pb-1">
                  <span className="text-slate-500">النوع</span>
                  <span className="font-bold text-slate-800">{details.propertyType}</span>
                </div>

                <div className="flex justify-between border-b border-dotted border-slate-200 pb-1">
                  <span className="text-slate-500">المساحة م2</span>
                  <span className="font-bold text-slate-800 dir-ltr">{details.area}</span>
                </div>

                <div className="flex justify-between border-b border-dotted border-slate-200 pb-1">
                  <span className="text-slate-500">رقم الصك</span>
                  <span className="font-bold text-slate-800 font-mono">{details.deedNumber}</span>
                </div>

                <div className="flex justify-between border-b border-dotted border-slate-200 pb-1">
                  <span className="text-slate-500">الاستخدام</span>
                  <span className="font-bold text-slate-800">{details.usage}</span>
                </div>

                <div className="flex justify-between border-b border-dotted border-slate-200 pb-1">
                  <span className="text-slate-500">السعر الافتتاحي</span>
                  <span className="font-bold text-slate-800">{details.openingPrice}</span>
                </div>

                <div className="flex justify-between border-b border-dotted border-slate-200 pb-1">
                  <span className="text-slate-500">رقم المخطط</span>
                  <span className="font-bold text-slate-800">{details.planNumber}</span>
                </div>

                <div className="flex justify-between border-b border-dotted border-slate-200 pb-1">
                  <span className="text-slate-500">الحي</span>
                  <span className="font-bold text-slate-800">{details.district}</span>
                </div>

                <div className="flex justify-between border-b border-dotted border-slate-200 pb-1">
                  <span className="text-slate-500">رقم القطعة</span>
                  <span className="font-bold text-slate-800">{details.plotNumber}</span>
                </div>

                <div className="flex justify-between border-b border-dotted border-slate-200 pb-1">
                  <span className="text-slate-500">العربون</span>
                  <span className="font-bold text-[#30364F]">{details.deposit}</span>
                </div>
              </div>

              <div className="bg-[#f8fafc] rounded-lg p-4 border border-slate-200">
                <h4 className="font-bold text-sm mb-3 text-[#30364F]">الحدود والأطوال</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex gap-2">
                    <span className="font-bold w-12 text-slate-500">شمالاً</span>
                    <span className="text-slate-700 flex-1">{details.northBoundary}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold w-12 text-slate-500">جنوباً</span>
                    <span className="text-slate-700 flex-1">{details.southBoundary}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold w-12 text-slate-500">شرقاً</span>
                    <span className="text-slate-700 flex-1">{details.eastBoundary}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold w-12 text-slate-500">غرباً</span>
                    <span className="text-slate-700 flex-1">{details.westBoundary}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-100">
                <div
                  className="flex-1 bg-[#30364F] rounded-lg p-2 flex items-center justify-between text-white shadow-lg relative overflow-hidden h-[54px] cursor-pointer"
                  onClick={() => setShowAI(!showAI)}
                >
                  <div className="flex items-center gap-3 relative z-10 px-2">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">تحليل العقار</h3>
                    </div>
                  </div>
                  <ChevronUp
                    className={`w-5 h-5 transition-transform ${showAI ? "rotate-180" : ""} mr-2`}
                  />
                </div>

                <Button
                  onClick={onParticipate}
                  variant="primary"
                  icon={Gavel}
                  className="flex-[2] text-lg py-3 h-[54px]"
                >
                  المشاركة في المزايدة
                </Button>
              </div>

              <AnimatePresence>
                {showAI && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 bg-white border border-emerald-100 rounded-xl p-6 shadow-sm space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-center">
                          <div className="text-xs text-slate-500 font-bold mb-2">
                            القيمة السوقية التقديرية
                          </div>
                          <div className="text-2xl font-black text-[#30364F]">
                            2.4M - 2.6M
                          </div>
                          <div className="text-[10px] text-emerald-600 mt-1 flex items-center justify-center gap-1">
                            <TrendingUp className="w-3 h-3" /> +12% نمو سنوي
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-center">
                          <div className="text-xs text-slate-500 font-bold mb-2">
                            مؤشر الطلب
                          </div>
                          <div className="text-2xl font-black text-emerald-600">
                            عالي جداً
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            بناءً على 50 صفقة مشابهة
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm mb-3">توصيات المزايدة</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex gap-2 items-start">
                            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
                            <span className="text-slate-600">
                              السعر الحالي يعتبر فرصة ممتازة للدخول
                            </span>
                          </li>
                          <li className="flex gap-2 items-start">
                            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                            <span className="text-slate-600">
                              ينصح بعدم تجاوز السعر الأعلى المناسب حسب تحليلك
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}