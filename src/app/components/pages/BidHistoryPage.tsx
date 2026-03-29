import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar,
  Clock,
  CheckCircle,
  X,
  ChevronDown,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../figma/ImageWithFallback";

type CalendarWidgetProps = {
  onClose: () => void;
  onSelect: (date: string) => void;
  position?: "top" | "bottom";
};

const CalendarWidget = ({
  onClose,
  onSelect,
  position = "bottom",
}: CalendarWidgetProps) => {
  const [selectedDay, setSelectedDay] = useState(15);
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(0);

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const years = Array.from({ length: 80 }, (_, i) => 1950 + i);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDay = new Date(currentYear, currentMonth, 1).getDay();

  const positionClasses =
    position === "top"
      ? "bottom-full mb-2 origin-bottom-left"
      : "top-full mt-2 origin-top-left";

  return (
    <div className={`absolute ${positionClasses} left-0 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 w-[280px] animate-in zoom-in-95 duration-200`}>
      <div className="flex justify-between items-center mb-4 gap-2">
        <div className="flex gap-2 w-full">
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(Number(e.target.value))}
            className="flex-1 bg-slate-50 border border-slate-200 text-[#30364F] font-bold text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#30364F] cursor-pointer"
          >
            {months.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="w-20 bg-slate-50 border border-slate-200 text-[#30364F] font-bold text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#30364F] cursor-pointer"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-2 text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-[10px] font-bold text-slate-400 uppercase py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`e-${i}`}></div>
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all mx-auto ${
              selectedDay === day
                ? "bg-[#30364F] text-white shadow-md shadow-slate-200"
                : "text-slate-600 hover:bg-slate-50 hover:text-[#30364F]"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      <button
        onClick={() => {
          onSelect(
            `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${selectedDay
              .toString()
              .padStart(2, "0")}`
          );
          onClose();
        }}
        className="w-full py-2.5 bg-[#30364F] text-white rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-[#1E2437] transition-all text-xs"
      >
        Apply Date
      </button>
    </div>
  );
};

export default function BidHistoryPage() {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [expandedBid, setExpandedBid] = useState<number | null>(null);

  const bidData = [
    {
      id: 1,
      title: "فيلا سكنية - حي القيروان",
      date: "2026/02/02",
      amount: 2450000,
      status: "won",
      image: "https://images.unsplash.com/photo-1656158113009-c8f5b3268aca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzYXVkaSUyMHJlc2lkZW50aWFsJTIwcHJvcGVydHl8ZW58MXx8fHwxNzcxOTcxNzg1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      bidHistory: [
        { date: "2026/02/02 - 14:30", amount: 2450000 },
        { date: "2026/02/02 - 14:15", amount: 2400000 },
        { date: "2026/02/02 - 14:00", amount: 2350000 },
      ],
    },
    {
      id: 2,
      title: "أرض تجارية - شمال الرياض",
      date: "2026/01/15",
      amount: 1800000,
      status: "lost",
      image: "https://images.unsplash.com/photo-1674635847424-d82d56e38ad5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB2aWxsYSUyMHJpeWFkaHxlbnwxfHx8fDE3NzE5NzE3OTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      bidHistory: [
        { date: "2026/01/15 - 16:45", amount: 1800000 },
        { date: "2026/01/15 - 16:20", amount: 1750000 },
      ],
    },
    {
      id: 3,
      title: "مجمع تجاري - جدة",
      date: "2025/12/20",
      amount: 5600000,
      status: "lost",
      image: "https://images.unsplash.com/photo-1656646425022-3b4cff0bc8e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tZXJjaWFsJTIwcmVhbCUyMGVzdGF0ZSUyMHByb3BlcnR5fGVufDF8fHx8MTc3MTk3MTc5NXww&ixlib=rb-4.1.0&q=80&w=1080",
      bidHistory: [
        { date: "2025/12/20 - 11:30", amount: 5600000 },
        { date: "2025/12/20 - 11:00", amount: 5500000 },
        { date: "2025/12/20 - 10:45", amount: 5400000 },
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-in fade-in space-y-8 bg-[#f8fafc] min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-200 pb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#30364F] mb-2">سجل المزايدات</h1>
          <p className="text-slate-500">سجل كامل بجميع المزادات التي قمت بالمشاركة فيها ونتائجها.</p>
        </div>

        <div className="flex flex-col gap-1 w-full md:w-auto relative">
          <label className="text-xs font-bold text-slate-500 uppercase">تصفية حسب التاريخ</label>
          <div className="relative" onClick={() => setShowCalendar(!showCalendar)}>
            <Calendar className="absolute top-2.5 left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <div className="w-full md:w-64 pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm font-bold text-[#30364F] bg-white cursor-pointer hover:border-[#30364F] transition-colors flex items-center min-h-[40px]">
              {selectedDate || ""}
            </div>
          </div>
          {showCalendar && (
            <CalendarWidget
              onClose={() => setShowCalendar(false)}
              onSelect={setSelectedDate}
            />
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {bidData.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:border-[#30364F]/30 transition-all">
            <div className="p-6 flex flex-col md:flex-row items-center gap-6">
              <div className="flex items-center gap-4 flex-1 w-full">
                <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                  <ImageWithFallback src={item.image} className="w-full h-full object-cover" alt="Auction" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#30364F] mb-1">{item.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span className="font-mono">{item.date}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:flex items-center gap-8 w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                <div className="text-right md:text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">قيمة المزايدة</div>
                  <div className="text-xl font-black text-[#30364F] font-mono">
                    {item.amount.toLocaleString()} ر.س
                  </div>
                </div>

                <div className="text-left md:text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">نتيجة المزاد</div>
                  {item.status === "won" ? (
                    <Badge variant="success" className="inline-flex items-center gap-1.5 !px-3 !py-1 !text-xs">
                      <CheckCircle className="w-3.5 h-3.5" /> فوز بالمزاد
                    </Badge>
                  ) : (
                    <Badge variant="neutral" className="inline-flex items-center gap-1.5 !px-3 !py-1 !text-xs !bg-slate-100 !text-slate-500">
                      <X className="w-3.5 h-3.5" /> لم يتم الفوز
                    </Badge>
                  )}
                </div>
              </div>

              <div className="hidden md:block">
                <button
                  onClick={() => setExpandedBid(expandedBid === item.id ? null : item.id)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-[#30364F] transition-all"
                >
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expandedBid === item.id ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {expandedBid === item.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 pt-0 border-t border-slate-100">
                    <div className="bg-[#B7E5CD]/10 rounded-lg p-4 mt-4">
                      <h4 className="text-sm font-bold text-[#30364F] mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        تاريخ المزايدات
                      </h4>
                      <div className="space-y-2">
                        {item.bidHistory.map((bid, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-white rounded-lg p-3 text-sm">
                            <span className="text-slate-600 font-mono text-xs">{bid.date}</span>
                            <span className="font-black text-[#30364F]">
                              {bid.amount.toLocaleString()} ر.س
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}