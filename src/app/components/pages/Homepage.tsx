import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ViewState } from "../../types";
import { Button } from "../ui/button";
import { Globe, Target, Star, CheckCircle } from "lucide-react";
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
  if (!value) return null
  const trimmed = value.trim()
  if (trimmed.includes("T") || trimmed.includes("-")) {
    const date = new Date(trimmed)
    return isNaN(date.getTime()) ? null : date
  }
  const dmyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch
    return new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59)
  }
  return null
}

const getAuctionStatus = (startTime?: string | null, endTime?: string | null) => {
  const now = new Date()
  const start = parseAuctionDate(startTime)
  const end = parseAuctionDate(endTime)
  if (!start) return "upcoming"
  if (now < start) return "upcoming"
  if (end && now > end) return "ended"
  return "current"
}

export default function HomePage({
  navigate,
  isFavorite,
  toggleFavorite,
  setSelectedAuctionId,
}: HomePageProps) {

  const [auctions, setAuctions] = useState<Auction[]>([])

  useEffect(() => {
    const fetchAuctions = async () => {
      const { data: rawData, error } = await supabase
        .from("auction")
        .select(`*, property (*)`)
        .order("auction_id", { ascending: true })

      if (error) { console.error("Error fetching auctions:", error.message); return; }

      const mapped = (rawData as AuctionRow[]).map((row) => Auction.fromRow(row))

      console.log("First auction startTime:", mapped[0]?.startTime)
      console.log("First auction endTime:", mapped[0]?.endTime)

      const currentAuctions = mapped.filter((auction) =>
        getAuctionStatus(auction.startTime, auction.endTime) === "current"
      )

      setAuctions(currentAuctions.slice(0, 3))
    }
    fetchAuctions()
  }, [])

  return (
    <div className="bg-[#f8fafc] min-h-screen">

      {/* Hero Section */}
      <section className="relative bg-[#30364F] text-white py-40 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source
              src="https://www.shutterstock.com/shutterstock/videos/3807496161/preview/stock-footage-jeddah-saudi-arabia-jun-aerial-view-of-jeddah-islamic-port-largest-sea-port-on-red-sea.webm"
              type="video/webm"
            />
          </video>
        </div>
        <div className="max-w-4xl mx-auto relative z-0 text-center space-y-6">
          <h1 className="text-5xl font-black">منصة رساء للمزادات</h1>
          <p className="text-xl text-slate-300">المنصة الرسمية الموحدة للمزادات العقارية</p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => navigate("auction-browse")} className="text-[#213448] font-bold">
              تصفح المزادات
            </Button>
          </div>
        </div>
      </section>

      <VisionMissionSection />

      {/* Latest Opportunities */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black">أحدث الفرص الاستثمارية</h2>
            <Button variant="ghost" onClick={() => navigate('auction-browse')}>عرض الكل</Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {auctions.length > 0 ? (
              auctions.map((auction) => (
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
                لا توجد مزادات متاحة حالياً
              </div>
            )}
          </div>
        </section>
      </motion.div>

    </div>
  );
}

const VisionMissionSection = () => {
  const features = [
    { icon: <Star className="w-6 h-6" />, title: "الريادة والابتكار", desc: "توظيف التكنولوجيا لخدمة القطاع العقاري" },
    { icon: <CheckCircle className="w-6 h-6" />, title: "الشفافية المطلقة", desc: "جميع العمليات موثقة وواضحة للجميع" },
    { icon: <Target className="w-6 h-6" />, title: "الكفاءة العالية", desc: "تجربة مستخدم سلسة من التسجيل حتى الإفراغ" },
  ];

  return (
    <section className="bg-white py-20 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#91C6BC]/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#213448]/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
        <div className="space-y-8 flex flex-col">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#213448]/10 border border-[#213448]/20 text-[#213448] rounded-full text-sm font-bold w-fit">
            <Globe className="w-4 h-4" /> رؤية 2030
          </div>
          <h2 className="text-5xl font-black leading-tight text-[#213448]">
            نصنع مستقبل{" "}
            <span className="text-[#91C6BC]">المزادات العقارية</span>{" "}
            بذكاء وشفافية
          </h2>
          <p className="text-lg text-[#213448]/60 leading-relaxed">
            نسعى لتمكين المستثمرين والأفراد من الوصول إلى الفرص العقارية
            الموثوقة من خلال منصة رقمية متكاملة مدعومة بأحدث تقنيات الذكاء
            الاصطناعي، لضمان عدالة التقييم وسهولة المشاركة.
          </p>
          <div className="space-y-4 pt-2">
            {features.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="flex gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-[#91C6BC]/40 hover:shadow-md transition-all cursor-default group"
              >
                <div className="w-12 h-12 bg-[#91C6BC]/20 rounded-xl flex items-center justify-center text-[#213448] group-hover:bg-[#213448] group-hover:text-white transition-all shrink-0">
                  {item.icon}
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="font-black text-[#213448] text-base">{item.title}</h4>
                  <p className="text-sm text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden h-[500px] shadow-2xl shadow-black/20">
          <img
            src="https://images.unsplash.com/photo-1722966885396-1f3dcebdf27f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaXlhZGglMjBza3lsaW5lJTIwc2t5c2NyYXBlcnMlMjBzYXVkaSUyMGFyYWJpYXxlbnwxfHx8fDE3NzE5NzMyNjB8MA&ixlib=rb-4.1.0&q=80&w=1080"
            className="w-full h-full object-cover scale-105"
            alt="ناطحات السحاب في السعودية"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#213448] via-[#213448]/20 to-transparent" />
        </div>
      </div>
    </section>
  );
};