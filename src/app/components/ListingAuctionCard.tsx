import React from "react";
import {
  Heart,
  Clock,
  LayoutDashboard,
  Calendar,
  Gavel,
} from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const THEME = {
  border: "border-[#cbd5e1]",
};

const ASSETS = {
  heroBg:
    "https://images.unsplash.com/photo-1722009591790-f47342aa9d3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
};

type Props = {
  id: string;
  title: string;
  location: string;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  onClick: () => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  image?: string;
};

export default function ListingAuctionCard({
  title,
  location,
  days,
  hours,
  minutes,
  seconds,
  onClick,
  isFavorite,
  onToggleFavorite,
  image,
}: Props) {
  return (
    <div
      className={`bg-[#f8fafc] rounded-xl overflow-hidden shadow-sm border ${THEME.border} group cursor-pointer`}
      onClick={onClick}
    >
      {/* Image Area */}
      <div className="relative h-48 bg-slate-200">
        <ImageWithFallback
          src={image || ASSETS.heroBg}
          className="w-full h-full object-cover"
          alt={title}
        />

        <button
          onClick={onToggleFavorite}
          className={`absolute top-4 left-4 p-2 rounded-full transition-colors ${
            isFavorite
              ? "bg-red-500 text-white"
              : "bg-white/90 text-slate-400 hover:text-red-500"
          }`}
        >
          <Heart
            className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`}
          />
        </button>

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white drop-shadow-md w-full px-4">
          <h3 className="text-2xl font-black mb-1">{title}</h3>
          <p className="text-sm font-bold opacity-90">{location}</p>
        </div>
      </div>

      {/* Countdown Section */}
      <div className="bg-[#f0fdf4] border-b border-slate-100 py-3 px-4">
        <div className="text-center text-[10px] text-emerald-700 font-bold uppercase mb-2">
          جاري ينتهي بعد
        </div>

        <div className="flex justify-between text-center dir-ltr">
          {[
            { val: days, label: "يوم" },
            { val: hours, label: "ساعة" },
            { val: minutes, label: "دقيقة" },
            { val: seconds, label: "ثانية" },
          ].map((t, i) => (
            <div
              key={i}
              className="flex-1 border-r last:border-0 border-emerald-100"
            >
              <div className="font-black text-lg text-slate-800 leading-none">
                {t.val}
              </div>
              <div className="text-[10px] text-slate-500">
                {t.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Stats */}
      <div className="bg-white p-4 grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2 justify-center">
          <Clock className="w-4 h-4 text-slate-500" />
          <span className="font-bold text-slate-700">
            المدة 3 أيام
          </span>
        </div>

        <div className="flex items-center gap-2 justify-center">
          <LayoutDashboard className="w-4 h-4 text-slate-500" />
          <span className="font-bold text-slate-700">
            3 منتجات
          </span>
        </div>

        <div className="col-span-2 flex items-center justify-center gap-3 border-t border-dotted border-slate-200 pt-3 mt-1 text-sm">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="font-bold text-slate-800">
            2026/02/02
          </span>
          <span className="text-slate-300">|</span>
          <span className="font-bold text-slate-800">
            07:00 م
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 flex justify-between items-center bg-slate-50 border-t border-slate-100">
        <Button className="!w-32 !py-2 !rounded-md">
          التفاصيل
        </Button>

        <div className="flex items-center gap-2 opacity-80">
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400">
              منصة
            </div>
            <div className="font-black text-[#30364F] leading-none text-lg">
              رســاء
            </div>
          </div>
          <Gavel className="w-6 h-6 text-[#30364F]" />
        </div>
      </div>
    </div>
  );
}