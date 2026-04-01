import React, { useState } from "react";
import { BarChart3, Info } from "lucide-react";
import { Button } from "../ui/button";
import { ImageWithFallback } from "../figma/ImageWithFallback";

const ASSETS = {
  heroBg:
    "https://images.unsplash.com/photo-1722009591790-f47342aa9d3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYXVkaSUyMGFyYWJpYSUyMGx1eHVyeSUyMHJlYWwlMjBlc3RhdGV8ZW58MXx8fHwxNzcxOTcyNjA5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
};

type LiveBiddingPageProps = {
  onExit: () => void;
};

export default function LiveBiddingPage({ onExit }: LiveBiddingPageProps) {
  const [currentBid, setCurrentBid] = useState(2350000);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#30364F] pb-20">
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="font-bold">مزاد مباشر: فيلا القيروان</span>
        </div>

        <Button
          variant="outline"
          className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
          onClick={onExit}
        >
          خروج
        </Button>
      </div>

      <div className="max-w-6xl mx-auto p-6 grid md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-6">
          <div className="aspect-[16/7] bg-black rounded-xl overflow-hidden relative shadow-lg">
            <ImageWithFallback
              src={ASSETS.heroBg}
              className="w-full h-full object-cover opacity-90"
              alt="Live"
            />

            <div className="absolute bottom-6 right-6">
              <div className="text-sm text-slate-100 mb-1 font-bold shadow-black drop-shadow-md">
                السعر الحالي
              </div>
              <div className="text-5xl font-black text-white drop-shadow-lg">
                {currentBid.toLocaleString()} ر.س
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-emerald-100 relative overflow-hidden shadow-md">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
              <BarChart3 className="w-24 h-24 text-[#30364F]" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 text-[#30364F] font-bold">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span>تحليل العقار للمزايدة</span>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1 font-bold">
                    الحد الأقصى المقترح للمزايدة
                  </div>
                  <div className="text-3xl font-black text-[#30364F]">
                    2,450,000 ر.س
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500 mb-1 font-bold">
                    حالة السعر
                  </div>
                  <div className="text-lg font-bold text-emerald-600">
                    مناسب للشراء
                  </div>
                </div>
              </div>

              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-gradient-to-l from-emerald-500 to-emerald-700 w-[85%] transition-all duration-500"></div>
              </div>

              <p className="text-sm text-slate-500 flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
                <span>
                  السعر الحالي يقترب من القيمة العادلة. ننصح بزيادات حذرة لا
                  تتجاوز 10,000 ر.س في المرة الواحدة.
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 bg-white rounded-xl border border-slate-200 p-4 flex flex-col h-[600px] shadow-sm">
          <div className="flex-1 space-y-2 overflow-y-auto mb-4 pr-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex justify-between text-sm p-3 bg-slate-50 rounded border border-slate-100"
              >
                <span className="font-bold text-slate-600">مزايد {i}02</span>
                <span className="font-mono font-bold text-[#30364F]">
                  {(currentBid - i * 10000).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setCurrentBid((c) => c + 5000)}
                className="py-2 bg-white border border-slate-200 text-[#30364F] rounded text-xs font-bold hover:bg-slate-50"
              >
                + 5k
              </button>

              <button
                onClick={() => setCurrentBid((c) => c + 10000)}
                className="py-2 bg-white border border-slate-200 text-[#30364F] rounded text-xs font-bold hover:bg-slate-50"
              >
                + 10k
              </button>

              <button
                onClick={() => setCurrentBid((c) => c + 50000)}
                className="py-2 bg-white border border-slate-200 text-[#30364F] rounded text-xs font-bold hover:bg-slate-50"
              >
                + 50k
              </button>
            </div>

            <Button fullWidth className="!bg-emerald-600 hover:!bg-emerald-500 text-lg shadow-lg shadow-emerald-200">
              مزايدة
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}