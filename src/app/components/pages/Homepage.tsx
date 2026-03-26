import React from "react";
import { motion } from "motion/react";
import { ViewState } from "../../types";
import { Button } from "../ui/button";
import { Globe, Target } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import ListingAuctionCard from "../ListingAuctionCard";

type HomePageProps = {
  navigate: (view: ViewState) => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
};

const ASSETS = {
  detailRef: "figma:asset/847f6780f0acaecd11d2c4c7b0718985c1af7a04.png",
  heroBg: "https://images.unsplash.com/photo-1722009591790-f47342aa9d3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYXVkaSUyMGFyYWJpYSUyMGx1eHVyeSUyMHJlYWwlMjBlc3RhdGV8ZW58MXx8fHwxNzcxOTcyNjA5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  landPlaceholder: "figma:asset/dab0778c43e35d66c56bca4cbfdd164d2e85c03f.png",
  commercial: "figma:asset/a.png",
  listingRef: "figma:asset/e29d10f638fdcdc5bc4c3bcba9d7ba89ddba3171.png",
  aiBanner: "figma:asset/e8f3f172d276c82678d8b23bf9e86fcdaeec84de.png",
  villa: "https://images.unsplash.com/photo-1575356864509-f1727fd74ee4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB2aWxsYSUyMGV4dGVyaW9yJTIwc2F1ZGl8ZW58MXx8fHwxNzcxOTcyNjEwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  residential: "https://images.unsplash.com/photo-1755567818043-a86c648900de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNpZGVudGlhbCUyMGFwYXJ0bWVudCUyMGJ1aWxkaW5nfGVufDF8fHx8MTc3MTkxMDA0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  commercialBuilding: "https://images.unsplash.com/photo-1764983265127-8ec30a9c7b64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tZXJjaWFsJTIwcHJvcGVydHklMjBidWlsZGluZ3xlbnwxfHx8fDE3NzE5MTAzMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  landPlot: "https://images.unsplash.com/photo-1764222233275-87dc016c11dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5kJTIwcGxvdCUyMGRldmVsb3BtZW50fGVufDF8fHx8MTc3MTk3MjYxMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
};

export default function HomePage({
  navigate,
  isFavorite,
  toggleFavorite,
}: HomePageProps) {
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
       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                         
      
                         {/* Vision & Mission */}
      
                         <section className="max-w-7xl mx-auto px-4 py-16">
                            <div className="flex justify-between items-center mb-8">
                               <h2 className="text-2xl font-black">أحدث الفرص الاستثمارية</h2>
                               <Button variant="ghost" onClick={() => navigate('auction-browse')}>عرض الكل</Button>
                            </div>
                            <div className="grid md:grid-cols-3 gap-6">
                               {[1, 2, 3].map((i) => (
                                   <ListingAuctionCard 
                                      key={i}
                                      id={`featured-${i}`}
                                      title={i === 1 ? "مزاد البركة" : i === 2 ? "مزاد أريج الباحة" : "مزاد الباحة"}
                                      location="مكة المكرمة - العاصمة المقدسة" 
                                      days="01" hours="20" minutes="28" seconds="09" 
                                      onClick={() => navigate('auction-detail')}
                                      isFavorite={isFavorite(`featured-${i}`)}
                                      onToggleFavorite={(e) => { e.stopPropagation(); toggleFavorite(`featured-${i}`); }}
                                      image={i === 1 ? ASSETS.villa : i === 2 ? ASSETS.residential : ASSETS.commercialBuilding}
                                   />
                               ))}
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