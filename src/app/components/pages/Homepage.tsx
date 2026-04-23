import React, { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ViewState } from "../../types";
import { Button } from "../ui/button";
import { Globe, Target } from "lucide-react";
import ListingAuctionCard from "../ListingAuctionCard";
import { supabase } from "../../../lib/supabase";
import { Auction, AuctionRow } from "../../models/Auction";

type HomePageProps = {
  navigate: (view: ViewState) => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  setSelectedAuctionId: React.Dispatch<React.SetStateAction<string | null>>;
};

const parseAuctionDate = (value?: string | null) => {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.includes("T") || trimmed.includes("-")) {
    const date = new Date(trimmed);
    return isNaN(date.getTime()) ? null : date;
  }

  const dmyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const ymdMatch = trimmed.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (ymdMatch) {
    const [, year, month, day] = ymdMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  return null;
};

const normalizeDateOnly = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isUpcomingAuction = (startTime?: string | null) => {
  const start = parseAuctionDate(startTime);
  if (!start) return false;

  const today = normalizeDateOnly(new Date());
  const startDateOnly = normalizeDateOnly(start);

  return startDateOnly > today;
};

export default function HomePage({
  navigate,
  isFavorite,
  toggleFavorite,
  setSelectedAuctionId,
}: HomePageProps) {
  const [auctions, setAuctions] = useState<Auction[]>([]);

  useEffect(() => {
    const fetchAuctions = async () => {
      const { data, error } = await supabase
        .from("auction")
        .select(`
          *,
          property (*)
        `)
        .order("auction_id", { ascending: true });

      if (error) {
        console.error("Error fetching home auctions:", error.message);
        return;
      }

      const mappedAuctions = (data as AuctionRow[]).map((row) =>
        Auction.fromRow(row)
      );

      setAuctions(mappedAuctions);
    };

    fetchAuctions();
  }, []);

  const upcomingAuctions = useMemo(() => {
    return auctions
      .filter((auction) => isUpcomingAuction(auction.startTime))
      .slice(0, 3);
  }, [auctions]);

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-[#30364F] text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source
              src="https://www.shutterstock.com/shutterstock/videos/3807496161/preview/stock-footage-jeddah-saudi-arabia-jun-aerial-view-of-jeddah-islamic-port-largest-sea-port-on-red-sea.webm"
              type="video/webm"
            />
          </video>
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-6">
          <h1 className="text-5xl font-black">منصة رساء للمزادات</h1>
          <p className="text-xl text-slate-300">
            المنصة الرسمية الموحدة للمزادات العقارية
          </p>

          <div className="flex justify-center gap-4">
            <Button onClick={() => navigate("auction-browse")}>
              تصفح المزادات
            </Button>
          </div>
        </div>
      </section>

      <VisionMissionSection />

      {/* Latest Opportunities */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black">أحدث الفرص الاستثمارية</h2>
            <Button
              variant="ghost"
              onClick={() => navigate("auction-browse")}
            >
              عرض الكل
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {upcomingAuctions.length > 0 ? (
              upcomingAuctions.map((auction) => (
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
                لا توجد مزادات قادمة حالياً
              </div>
            )}
          </div>
        </section>
      </motion.div>
    </div>
  );
}

const VisionMissionSection = () => {
  return (
    <section className="bg-white border-b border-slate-200 py-16 px-4">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-start">
        <div className="space-y-6 flex flex-col">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-[#30364F] rounded-full text-xs font-bold">
            <Globe className="w-4 h-4" /> رؤية 2030
          </div>

          <h2 className="text-4xl font-black leading-tight text-[#30364F]">
            نصنع مستقبل المزادات العقارية بذكاء وشفافية
          </h2>

          <p className="text-lg text-slate-500 leading-relaxed">
            نسعى لتمكين المستثمرين والأفراد من الوصول إلى الفرص العقارية
            الموثوقة من خلال منصة رقمية متكاملة مدعومة بأحدث تقنيات الذكاء
            الاصطناعي، لضمان عدالة التقييم وسهولة المشاركة.
          </p>

          <div className="space-y-4 pt-4">
            {[
              {
                title: "الريادة والابتكار",
                desc: "توظيف التكنولوجيا لخدمة القطاع العقاري",
              },
              {
                title: "الشفافية المطلقة",
                desc: "جميع العمليات موثقة وواضحة للجميع",
              },
              {
                title: "الكفاءة العالية",
                desc: "تجربة مستخدم سلسة من التسجيل حتى الإفراغ",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 p-4 rounded-xl border border-slate-100 hover:border-[#30364F]/20 hover:bg-slate-50 transition-colors cursor-default group"
              >
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-[#30364F] group-hover:bg-[#30364F] group-hover:text-white transition-colors shrink-0">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-[#30364F]">{item.title}</h4>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative bg-slate-100 rounded-2xl overflow-hidden h-[650px]">
          <img
            src="https://images.unsplash.com/photo-1722966885396-1f3dcebdf27f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaXlhZGglMjBza3lsaW5lJTIwc2t5c2NyYXBlcnMlMjBzYXVkaSUyMGFyYWJpYXxlbnwxfHx8fDE3NzE5NzMyNjB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            className="w-full h-full object-cover"
            alt="ناطحات السحاب في السعودية"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#30364F] via-transparent to-transparent opacity-80"></div>
          <div className="absolute bottom-8 right-8 text-white max-w-sm">
            <div className="text-5xl font-black mb-2 opacity-20">01</div>
            <h3 className="text-2xl font-bold mb-2">مهمتنا</h3>
            <p className="text-slate-300 text-sm">
              توفير بيئة مزادات آمنة ومحفزة تضمن حقوق جميع الأطراف وتساهم في
              تنمية القطاع العقاري.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};