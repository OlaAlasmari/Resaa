import React, { useEffect, useState } from "react";
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
  duration: string;
  productsCount: string;
  date: string;
  time: string;
  onClick: () => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  image?: string;
  startTime?: string;
  endTime?: string;
  status?: "current" | "upcoming" | "ended"
};

// ── Parse DD/MM/YYYY or DD/MM/YYYY HH:MM or ISO ──────────────────────────────
const parseDate = (val?: string, isStart = false): Date | null => {
  if (!val) return null

  if (val.includes("T") || /^\d{4}-\d{2}-\d{2}/.test(val)) {
    const d = new Date(val.includes("+") || val.endsWith("Z") ? val : val + "+03:00")
    return isNaN(d.getTime()) ? null : d
  }

  const match = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/)
  if (match) {
    const [, day, month, year, hour, min, sec] = match
    const h = hour ?? (isStart ? "0" : "23")
    const m = min ?? (isStart ? "0" : "59")
    const s = sec ?? (isStart ? "0" : "59")
    return new Date(Number(year), Number(month) - 1, Number(day), Number(h), Number(m), Number(s))
  }

  return null
}

export default function ListingAuctionCard({
  title,
  location,
  duration,
  productsCount,
  date,
  time,
  onClick,
  isFavorite,
  onToggleFavorite,
  image,
  startTime,
  endTime,
  status: passedStatus,
}: Props) {

  const [countdown, setCountdown] = useState({ days: "00", hours: "00", minutes: "00", seconds: "00" })
  const [calculatedStatus, setCalculatedStatus] = useState<"upcoming" | "current" | "ended">("upcoming")

  const status = passedStatus ?? calculatedStatus
  useEffect(() => {
    const tick = () => {
      const now = new Date().getTime()
      const start = parseDate(startTime, true)
      const end = parseDate(endTime, false)

      let targetMs = 0

      if (start && now < start.getTime()) {
        setCalculatedStatus("upcoming")
        targetMs = start.getTime() - now
      } else if (end && now < end.getTime()) {
        setCalculatedStatus("current")
        targetMs = end.getTime() - now
      } else {
        setCalculatedStatus("ended")
        setCountdown({ days: "00", hours: "00", minutes: "00", seconds: "00" })
        return
      }

      const d = Math.floor(targetMs / 86400000)
      const h = Math.floor((targetMs % 86400000) / 3600000)
      const m = Math.floor((targetMs % 3600000) / 60000)
      const s = Math.floor((targetMs % 60000) / 1000)

      setCountdown({
        days: String(d).padStart(2, "0"),
        hours: String(h).padStart(2, "0"),
        minutes: String(m).padStart(2, "0"),
        seconds: String(s).padStart(2, "0"),
      })
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [startTime, endTime])


  // ── Status config ─────────────────────────────────────────────────────────
  const statusConfig = {
    upcoming: {
      label: "يبدأ هذا المزاد بعد",
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-100",
      numColor: "text-amber-700",
    },
    current: {
      label: "جاري — ينتهي بعد",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-100",
      numColor: "text-emerald-800",
    },
    ended: {
      label: "تم الانتهاء من هذا المزاد",
      bg: "bg-red-50",
      text: "text-red-500",
      border: "border-red-100",
      numColor: "text-red-400",
    },
  }[status]

  return (
    <div
      className={`bg-[#f8fafc] rounded-xl overflow-hidden shadow-sm border ${THEME.border} group cursor-pointer`}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-48 bg-slate-200">
        <ImageWithFallback
          src={image || ASSETS.heroBg}
          className="w-full h-full object-cover"
          alt={title}
        />
        <button
          onClick={onToggleFavorite}
          className={`absolute top-4 left-4 p-2 rounded-full transition-colors ${isFavorite
            ? "bg-red-500 text-white"
            : "bg-white/90 text-slate-400 hover:text-red-500"
            }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
        </button>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white drop-shadow-md w-full px-4">
          <h3 className="text-2xl font-black mb-1">{title}</h3>
          <p className="text-sm font-bold opacity-90">{location}</p>
        </div>
      </div>

      {/* Countdown */}
      <div className={`${statusConfig.bg} border-b ${statusConfig.border} py-3 px-4`}>
        <div className={`text-center text-sm ${statusConfig.text} font-bold mb-2`}>
          {statusConfig.label}
        </div>

        {status === "ended" ? (
          <div className="flex justify-between text-center">
            {[
              { val: "00", label: "يوم" },
              { val: "00", label: "ساعة" },
              { val: "00", label: "دقيقة" },
              { val: "00", label: "ثانية" },
            ].map((t, i) => (
              <div key={i} className="flex-1 border-r last:border-0 border-red-100">
                <div className="font-black text-lg text-red-400 leading-none">{t.val}</div>
                <div className="text-[10px] text-slate-500">{t.label}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-between text-center">
            {[
              { val: countdown.days, label: "يوم" },
              { val: countdown.hours, label: "ساعة" },
              { val: countdown.minutes, label: "دقيقة" },
              { val: countdown.seconds, label: "ثانية" },
            ].map((t, i) => (
              <div key={i} className={`flex-1 border-r last:border-0 ${statusConfig.border}`}>
                <div className={`font-black text-lg ${statusConfig.numColor} leading-none`}>{t.val}</div>
                <div className="text-[10px] text-slate-500">{t.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details — hidden for ended auctions */}
      {status !== "ended" ? (
        <div className="bg-white p-4 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 justify-center">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="font-bold text-slate-700">المدة {duration}</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <LayoutDashboard className="w-4 h-4 text-slate-500" />
            <span className="font-bold text-slate-700">{productsCount}</span>
          </div>
          <div className="flex items-center gap-2 justify-center border-t border-dotted border-slate-200 pt-3 mt-1">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="font-bold text-slate-800">{date}</span>
          </div>
          <div className="flex items-center gap-2 justify-center border-t border-dotted border-slate-200 pt-3 mt-1">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="font-bold text-slate-800">{time}</span>
          </div>
        </div>
      ) : (
        <div className="bg-white p-4 text-center text-sm text-slate-400 font-bold">
          لا توجد تفاصيل متاحة — المزاد منتهي
        </div>
      )}

      {/* Footer */}
      <div className="p-4 flex justify-between items-center bg-slate-50 border-t border-slate-100">

        {/* Hide details button for ended auctions */}
        {status !== "ended" ? (
          <Button className="!w-32 !py-2 !rounded-md">
            التفاصيل
          </Button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2 opacity-80">
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400">منصة</div>
            <div className="font-black text-[#30364F] leading-none text-lg">رســاء</div>
          </div>
          <Gavel className="w-6 h-6 text-[#30364F]" />
        </div>
      </div>
    </div>
  );
}