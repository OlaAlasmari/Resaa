import React, { useRef, useState, useEffect } from "react";
import { Camera, FileText, Sparkles, Loader2, Target, Clock, TrendingUp, CalendarDays, Calendar, CheckCircle } from "lucide-react";
import { Button } from "../ui/button";
import InputField from "../InputField";
import { SellerRole } from "../../types";
import { supabase } from "../../../lib/supabase";

const THEME = {
  primary: "bg-[#91C6BC]",
  textPrimary: "text-[#30364F]",
};

type AddAuctionPageProps = {
  onCancel: () => void;
  currentUser?: { name: string; nationalId: string } | null;
};

type AuctionStrategy = {
  recommended_start_price: number;
  expected_final_price: number;
  expected_return: number;
  recommended_time_range: string;
  recommended_duration_hours: number;
  best_quarter: string;
  day_group: string;
  month_part: string;
};

type AuctionStrategyResponse = {
  status: "success" | "below_target";
  message?: string;
  target_price: number;
  area: number;
  best_strategy: AuctionStrategy;
  top_strategies: AuctionStrategy[];
};

// ── Calendar Widget ────────────────────────────────────────────────────────────
type CalendarWidgetProps = {
  onClose: () => void;
  onSelect: (date: string) => void;
  position?: "top" | "bottom";
};

const CalendarWidget = ({ onClose, onSelect, position = "bottom" }: CalendarWidgetProps) => {
  const [selectedDay, setSelectedDay] = useState(15);
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(0);

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const years = Array.from({ length: 80 }, (_, i) => 1950 + i);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDay = new Date(currentYear, currentMonth, 1).getDay();
  const positionClasses = position === "top" ? "bottom-full mb-2 origin-bottom-left" : "top-full mt-2 origin-top-left";

  return (
    <div className={`absolute ${positionClasses} left-0 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 w-[280px] animate-in zoom-in-95 duration-200`}>
      <div className="flex gap-2 w-full mb-4">
        <select value={currentMonth} onChange={(e) => setCurrentMonth(Number(e.target.value))}
          className="flex-1 bg-slate-50 border border-slate-200 text-[#30364F] font-bold text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#30364F] cursor-pointer">
          {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select value={currentYear} onChange={(e) => setCurrentYear(Number(e.target.value))}
          className="w-20 bg-slate-50 border border-slate-200 text-[#30364F] font-bold text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#30364F] cursor-pointer">
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-7 mb-2 text-center">
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <div key={i} className="text-[10px] font-bold text-slate-400 uppercase py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {Array.from({ length: startDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
          <button key={day} onClick={() => setSelectedDay(day)}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all mx-auto ${
              selectedDay === day ? "bg-[#30364F] text-white shadow-md shadow-slate-200" : "text-slate-600 hover:bg-slate-50 hover:text-[#30364F]"
            }`}>
            {day}
          </button>
        ))}
      </div>

      <button
        onClick={() => {
          onSelect(`${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${selectedDay.toString().padStart(2, "0")}`);
          onClose();
        }}
        className="w-full py-2.5 bg-[#30364F] text-white rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-[#1E2437] transition-all text-xs"
      >
        تأكيد التاريخ
      </button>
    </div>
  );
};

// ── Time Picker ────────────────────────────────────────────────────────────────
type TimeVal = { hour: number; minute: number; period: "AM" | "PM" };

const ITEM_H = 44;
const VISIBLE = 5; // items visible at once
const PADDING = Math.floor(VISIBLE / 2); // 2 items padding top/bottom

const TimeColumn = ({
  items,
  selected,
  onSelect,
  format,
}: {
  items: (number | string)[];
  selected: number | string;
  onSelect: (v: number | string) => void;
  format?: (v: number | string) => string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settling = useRef(false);

  const getIdx = () => items.indexOf(selected);

  // On mount: scroll to selected without animation
  useEffect(() => {
    if (!ref.current) return;
    const idx = getIdx();
    ref.current.scrollTop = idx * ITEM_H;
  }, []); // only on mount

  // When selected changes from outside (e.g. applyStrategy), scroll to it
  useEffect(() => {
    if (!ref.current || settling.current) return;
    const idx = getIdx();
    ref.current.scrollTo({ top: idx * ITEM_H, behavior: "smooth" });
  }, [selected]);

  const handleScroll = () => {
    if (!ref.current) return;
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      if (!ref.current) return;
      const raw = ref.current.scrollTop / ITEM_H;
      const idx = Math.round(raw);
      const clamped = Math.max(0, Math.min(idx, items.length - 1));
      settling.current = true;
      ref.current.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" });
      onSelect(items[clamped]);
      setTimeout(() => { settling.current = false; }, 300);
    }, 100);
  };

  return (
    <div className="relative flex flex-col items-center" style={{ width: 56 }}>
      <div
        ref={ref}
        onScroll={handleScroll}
        className="overflow-y-scroll no-scrollbar"
        style={{
          height: ITEM_H * VISIBLE,
          scrollSnapType: "y mandatory",
        }}
      >
        {/* top padding so first item can reach center */}
        {Array.from({ length: PADDING }).map((_, i) => (
          <div key={`pt-${i}`} style={{ height: ITEM_H }} />
        ))}

        {items.map((item, i) => (
          <div
            key={i}
            style={{ height: ITEM_H, scrollSnapAlign: "center" }}
            className="flex items-center justify-center cursor-pointer select-none"
            onClick={() => {
              if (!ref.current) return;
              settling.current = true;
              ref.current.scrollTo({ top: i * ITEM_H, behavior: "smooth" });
              onSelect(item);
              setTimeout(() => { settling.current = false; }, 300);
            }}
          >
            <span className={`font-bold transition-all duration-150 ${
              item === selected ? "text-[#30364F] text-base" : "text-slate-300 text-sm"
            }`}>
              {format ? format(item as number) : String(item)}
            </span>
          </div>
        ))}

        {/* bottom padding */}
        {Array.from({ length: PADDING }).map((_, i) => (
          <div key={`pb-${i}`} style={{ height: ITEM_H }} />
        ))}
      </div>
    </div>
  );
};

const ScrollTimePicker = ({
  value,
  onChange,
  onClose,
}: {
  value: TimeVal;
  onChange: (v: TimeVal) => void;
  onClose: () => void;
}) => {
  const hours   = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const periods: ("AM" | "PM")[] = ["AM", "PM"];

  return (
    <div className="absolute top-full mt-2 left-0 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 w-[200px] overflow-hidden animate-in zoom-in-95 duration-200">
      {/* Selection highlight — fixed center strip */}
      <div className="relative">
        <div
          className="absolute left-3 right-3 bg-slate-50 rounded-xl border border-slate-100 pointer-events-none z-10"
          style={{ top: ITEM_H * PADDING, height: ITEM_H }}
        />
        <div className="flex items-center justify-center gap-0 relative z-20 px-3 pt-2">
          <TimeColumn
            items={hours}
            selected={value.hour}
            onSelect={(v) => onChange({ ...value, hour: v as number })}
            format={(v) => String(v).padStart(2, "0")}
          />
          <span className="text-[#30364F] font-black text-lg self-center pb-1 mx-0.5">:</span>
          <TimeColumn
            items={minutes}
            selected={value.minute}
            onSelect={(v) => onChange({ ...value, minute: v as number })}
            format={(v) => String(v).padStart(2, "0")}
          />
          <div style={{ width: 8 }} />
          <TimeColumn
            items={periods}
            selected={value.period}
            onSelect={(v) => onChange({ ...value, period: v as "AM" | "PM" })}
          />
        </div>
      </div>

      <div className="px-3 pb-3 pt-1">
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-[#30364F] text-white rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-[#1E2437] transition-all text-xs"
        >
          تأكيد الوقت
        </button>
      </div>
    </div>
  );
};

// ── Date + Time Field ─────────────────────────────────────────────────────────
type DateTimeFieldProps = {
  label: string;
  dateValue: string;
  timeValue: TimeVal;
  onDateChange: (d: string) => void;
  onTimeChange: (t: TimeVal) => void;
};

const DateTimeField = ({ label, dateValue, timeValue, onDateChange, onTimeChange }: DateTimeFieldProps) => {
  const [showCal, setShowCal]   = useState(false);
  const [showTime, setShowTime] = useState(false);
  const formatTime = (t: TimeVal) =>
    `${String(t.hour).padStart(2, "0")}:${String(t.minute).padStart(2, "0")} ${t.period}`;

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-bold text-[#30364F]">{label}</label>
      <div className="flex gap-2">
        {/* Date */}
        <div className="relative flex-1">
          <div onClick={() => { setShowCal(!showCal); setShowTime(false); }}
            className="w-full border border-slate-300 px-4 py-2.5 text-sm rounded-md bg-white cursor-pointer flex items-center justify-between hover:border-[#30364F] transition-colors">
            <span className={dateValue ? "text-[#30364F] font-medium" : "text-slate-400"}>
              {dateValue || "التاريخ"}
            </span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          {showCal && (
            <CalendarWidget onClose={() => setShowCal(false)}
              onSelect={(d) => { onDateChange(d); setShowCal(false); }} position="bottom" />
          )}
        </div>

        {/* Time */}
        <div className="relative w-36">
          <div onClick={() => { setShowTime(!showTime); setShowCal(false); }}
            className="w-full border border-slate-300 px-3 py-2.5 text-sm rounded-md bg-white cursor-pointer flex items-center justify-between hover:border-[#30364F] transition-colors">
            <span className="text-[#30364F] font-medium">{formatTime(timeValue)}</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          {showTime && (
            <ScrollTimePicker value={timeValue} onChange={onTimeChange} onClose={() => setShowTime(false)} />
          )}
        </div>
      </div>
    </div>
  );
};

// ── AI Strategy Card ───────────────────────────────────────────────────────────
const AuctionStrategyCard = ({
  strategy, status, onApply,
}: {
  strategy: AuctionStrategy;
  status: "success" | "below_target";
  onApply: (s: AuctionStrategy) => void;
}) => {
  const quarterLabel: Record<string, string> = {
    Q1: "الربع الأول (يناير - مارس)",
    Q2: "الربع الثاني (أبريل - يونيو)",
    Q3: "الربع الثالث (يوليو - سبتمبر)",
    Q4: "الربع الرابع (أكتوبر - ديسمبر)",
  };
  const dayGroupLabel: Record<string, string> = { weekday: "أيام الأسبوع", weekend: "عطلة نهاية الأسبوع" };

  return (
    <div className={`rounded-2xl border-2 p-5 mt-4 ${status === "success" ? "border-[#91C6BC] bg-[#f0faf8]" : "border-amber-300 bg-amber-50"}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-[#30364F] flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-[#91C6BC]" />
        </div>
        <div>
          <p className="font-black text-[#30364F] text-sm">اقتراح الذكاء الاصطناعي</p>
          <p className="text-xs text-slate-500">
            {status === "success" ? "هذه الاستراتيجية تتوقع الوصول إلى سعرك المستهدف" : "أفضل سيناريو متاح — قد لا يصل للسعر المستهدف"}
          </p>
        </div>
        {status === "below_target" && (
          <span className="mr-auto text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">دون الهدف</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-xl p-3 border border-slate-100">
          <div className="flex items-center gap-1.5 mb-1">
            <Target className="w-3.5 h-3.5 text-[#91C6BC]" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">السعر المبدئي المقترح</span>
          </div>
          <p className="text-lg font-black text-[#30364F]">{strategy.recommended_start_price.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400">ريال سعودي</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-slate-100">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#91C6BC]" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">السعر النهائي المتوقع</span>
          </div>
          <p className="text-lg font-black text-[#30364F]">{strategy.expected_final_price.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400">ريال سعودي</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-slate-100">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-[#91C6BC]" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">أفضل وقت للنشر</span>
          </div>
          <p className="text-sm font-black text-[#30364F]">{strategy.recommended_time_range}</p>
          <p className="text-[10px] text-slate-400">{dayGroupLabel[strategy.day_group] ?? strategy.day_group}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-slate-100">
          <div className="flex items-center gap-1.5 mb-1">
            <CalendarDays className="w-3.5 h-3.5 text-[#91C6BC]" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">أفضل فترة</span>
          </div>
          <p className="text-sm font-black text-[#30364F]">{quarterLabel[strategy.best_quarter] ?? strategy.best_quarter}</p>
          <p className="text-[10px] text-slate-400">مدة المزاد: {strategy.recommended_duration_hours} ساعة</p>
        </div>
      </div>

      <button onClick={() => onApply(strategy)}
        className="w-full py-2.5 bg-[#30364F] hover:bg-[#1e2538] text-white rounded-xl font-bold text-sm transition-colors">
        تطبيق الاقتراح في الحقول أدناه
      </button>
      <p className="text-center text-xs text-slate-400 mt-2">يمكنك تعديل القيم بعد التطبيق</p>
    </div>
  );
};

// ── Card ──────────────────────────────────────────────────────────────────────
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white border border-slate-200 rounded-2xl shadow-sm ${className}`}>{children}</div>
);

// ══════════════════════════════════════════════════════════════════════════════
export default function AddAuctionPage({ onCancel, currentUser }: AddAuctionPageProps) {
  const [step, setStep] = useState(1);
  const [sellerRole, setSellerRole] = useState<SellerRole>("principal");
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [targetPrice, setTargetPrice]     = useState("");
  const [strategyLoading, setStrategyLoading] = useState(false);
  const [strategyResult, setStrategyResult]   = useState<AuctionStrategyResponse | null>(null);
  const [strategyError, setStrategyError]     = useState<string | null>(null);

  const propertyImageInputRef = useRef<HTMLInputElement | null>(null);
  const deedFileInputRef      = useRef<HTMLInputElement | null>(null);
  const [propertyImageFile, setPropertyImageFile] = useState<File | null>(null);
  const [deedFile, setDeedFile]                   = useState<File | null>(null);

  const defaultTime: TimeVal = { hour: 9, minute: 0, period: "AM" };
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState<TimeVal>(defaultTime);
  const [endDate, setEndDate]     = useState("");
  const [endTime, setEndTime]     = useState<TimeVal>({ hour: 9, minute: 0, period: "AM" });

  const [form, setForm] = useState({
    fullName: currentUser?.name ?? "", nationalId: currentUser?.nationalId ?? "", agencyNumber: "", agencyExpiry: "", agencyPlace: "",
    falLicense: "", companyName: "", propertyType: "", usage: "", area: "", facade: "",
    city: "", district: "", region: "", streetName: "", mapUrl: "", northBoundary: "", southBoundary: "",
    eastBoundary: "", westBoundary: "", deedNumber: "", planNumber: "", plotNumber: "",
    auctionName: "", startPrice: "", productsCount: "1",
  });

  const updateForm = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ── FIX: append +03:00 so Supabase stores the correct Saudi time ──────────
  const toDatetimeString = (date: string, time: TimeVal) => {
    if (!date) return "";
    let h = time.hour;
    if (time.period === "PM" && h !== 12) h += 12;
    if (time.period === "AM" && h === 12) h = 0;
    return `${date}T${String(h).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}:00+03:00`;
  };

  const formatTimeDisplay = (t: TimeVal) => {
    let h = t.hour;
    if (t.period === "PM" && h !== 12) h += 12;
    if (t.period === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${String(t.minute).padStart(2, "0")}:00`;
  };

  const fetchAuctionStrategy = async () => {
    const price = Number(targetPrice);
    if (!price || price <= 0) { setStrategyError("أدخل سعراً مستهدفاً صحيحاً"); return; }
    setStrategyLoading(true); setStrategyError(null); setStrategyResult(null);
    try {
      const res = await fetch("http://localhost:5000/auction-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          area: form.area ? Number(form.area) : 500,
          target_price: price,
          city: form.city || undefined,
          district: form.district || undefined,
          region: form.region || undefined,
          property_type: form.propertyType || undefined,
        }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error ?? "فشل الاتصال بالخادم"); }
      setStrategyResult(await res.json());
    } catch (e: unknown) {
      setStrategyError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally { setStrategyLoading(false); }
  };

  const applyStrategy = (strategy: AuctionStrategy) => {
    updateForm("startPrice", String(strategy.recommended_start_price));
    const timeMap: Record<string, TimeVal> = {
      "9:00 AM - 11:00 AM": { hour: 9, minute: 0, period: "AM" },
      "1:00 PM - 4:00 PM":  { hour: 1, minute: 0, period: "PM" },
      "5:00 PM - 9:00 PM":  { hour: 5, minute: 0, period: "PM" },
    };
    const mapped = timeMap[strategy.recommended_time_range];
    if (mapped) setStartTime(mapped);
  };

  const validateStepOne = () => {
    if (!form.fullName.trim() || !form.nationalId.trim()) { alert("أكملي بيانات البائع الأساسية"); return false; }
    if (sellerRole === "agent" && (!form.agencyNumber.trim() || !form.agencyExpiry.trim() || !form.agencyPlace.trim())) { alert("أكملي بيانات الوكالة"); return false; }
    if (sellerRole === "marketer" && (!form.falLicense.trim() || !form.companyName.trim())) { alert("أكملي بيانات المسوق"); return false; }
    return true;
  };
  const validateStepTwo = () => {
    if (!form.propertyType.trim() || !form.usage.trim() || !form.area.trim() || !form.city.trim() || !form.district.trim()) { alert("أكملي بيانات العقار الأساسية"); return false; }
    return true;
  };
  const validateStepThree = () => { if (!form.deedNumber.trim()) { alert("أدخلي رقم الصك"); return false; } return true; };
  const validateFinalSubmission = () => {
    if (!form.auctionName.trim()) { alert("أدخلي اسم المزاد"); return false; }
    if (!startDate || !endDate) { alert("أكملي تاريخ بداية ونهاية المزاد"); return false; }
    if (new Date(toDatetimeString(endDate, endTime)) <= new Date(toDatetimeString(startDate, startTime))) { alert("وقت نهاية المزاد يجب أن يكون بعد وقت البداية"); return false; }
    if (!form.startPrice || Number(form.startPrice) <= 0) { alert("أدخلي السعر الافتتاحي بشكل صحيح"); return false; }
    return true;
  };

  const uploadFileToBucket = async (bucket: string, file: File, folder: string): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const { error } = await supabase.storage.from(bucket).upload(fileName, file);
    if (error) { console.error(`Storage upload error:`, error.message); return null; }
    return supabase.storage.from(bucket).getPublicUrl(fileName).data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!validateFinalSubmission()) return;
    try {
      setLoading(true);
      let propertyImageUrl: string | null = null;
      if (propertyImageFile) propertyImageUrl = await uploadFileToBucket("property-images", propertyImageFile, "auctions");
      if (propertyImageFile && !propertyImageUrl) { alert("فشل رفع صورة العقار"); return; }
      if (deedFile) { const u = await uploadFileToBucket("deed-files", deedFile, "deeds"); if (!u) { alert("فشل رفع وثيقة الملكية"); return; } }

      const { data: propertyData, error: propertyError } = await supabase.from("property").insert({
        property_type: form.propertyType || null, city: form.city || null, district: form.district || null,
        region: form.region || null, area: form.area ? Number(form.area) : null, usage: form.usage || null,
        deed_number: form.deedNumber || null, plan_number: form.planNumber || null, plot_number: form.plotNumber || null,
        north_boundary: form.northBoundary || null, south_boundary: form.southBoundary || null,
        east_boundary: form.eastBoundary || null, west_boundary: form.westBoundary || null,
        image_url: propertyImageUrl,
      }).select("property_id").single();

      if (propertyError) { console.error("Property insert error:", propertyError.message); alert("حدث خطأ أثناء حفظ بيانات العقار"); return; }

      const startDT  = toDatetimeString(startDate, startTime);
      const endDT    = toDatetimeString(endDate, endTime);
      const diffDays = Math.ceil((new Date(endDT).getTime() - new Date(startDT).getTime()) / (1000 * 60 * 60 * 24));

      const { error: auctionError } = await supabase.from("auction").insert({
        auction_name: form.auctionName, property_id: propertyData.property_id,
        start_time: startDT, end_time: endDT,
        start_price: Number(form.startPrice), highest_bid: Number(form.startPrice),
        duration: `${diffDays} أيام`, products_count: form.productsCount || "1",
        time: formatTimeDisplay(startTime),
        // Property details — saved on auction level for easy querying
        property_type: form.propertyType || null,
        city: form.city || null,
        district: form.district || null,
        region: form.region || null,
        area: form.area ? Number(form.area) : null,
        // AI model output — target price the seller wants to achieve
        target_price: targetPrice ? Number(targetPrice) : null,
      });

      if (auctionError) { console.error("Auction insert error:", auctionError); alert(auctionError.message || "حدث خطأ أثناء إضافة المزاد"); return; }
      setShowSuccess(true);
    } catch (err) { console.error("Unexpected error:", err); alert("حدث خطأ غير متوقع"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-in zoom-in-95 duration-300">
      <div className="mb-8 text-center">
        <h1 className={`text-2xl font-black ${THEME.textPrimary} mb-2`}>إضافة مزاد جديد</h1>
        <p className="text-slate-500">أكمل الخطوات التالية لإدراج عقارك في منصة رساء</p>
      </div>

      <div className="flex items-center justify-center mb-10">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold transition-colors ${
              step >= s ? `${THEME.primary} border-transparent text-white` : "bg-white border-slate-300 text-slate-300"
            }`}>{s}</div>
            {s < 4 && <div className={`w-16 h-0.5 mx-2 ${step > s ? "bg-[#30364F]" : "bg-slate-200"}`} />}
          </div>
        ))}
      </div>

      <Card className="p-8">

        {/* ── Step 1 ── */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="font-bold text-lg border-b pb-2 mb-4">بيانات البائع</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {["principal","agent","marketer"].map((role) => (
                <button key={role} onClick={() => setSellerRole(role as SellerRole)}
                  className={`p-3 border rounded-lg text-center transition-all font-bold text-sm ${
                    sellerRole === role ? "bg-[#30364F] text-white border-[#30364F]" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  }`}>
                  {role === "principal" ? "أصيل" : role === "agent" ? "وكيل" : "مسوق"}
                </button>
              ))}
            </div>
            <div className="space-y-4">
              <InputField label="الاسم الكامل" placeholder="" value={form.fullName} onChange={(e) => updateForm("fullName", e.target.value)} />
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#30364F]">رقم الهوية / السجل</label>
                <input type="text" maxLength={10} value={form.nationalId}
                  onChange={(e) => updateForm("nationalId", e.target.value.replace(/[^0-9]/g,"").slice(0,10))}
                  placeholder="1xxxxxxxxx"
                  className="w-full border border-slate-300 px-4 py-2.5 text-sm rounded-md focus:border-[#30364F] focus:outline-none focus:ring-1 focus:ring-[#30364F] bg-white transition-all placeholder:text-slate-400" />
              </div>
              {sellerRole === "agent" && (
                <>
                  <InputField label="رقم الوكالة الشرعية" placeholder="xxxxxxxx" value={form.agencyNumber} onChange={(e) => updateForm("agencyNumber", e.target.value)} />
                  <div className="space-y-1.5 relative">
                    <label className="text-sm font-bold text-[#30364F]">تاريخ انتهاء الوكالة</label>
                    <div className="relative" onClick={() => setShowCalendar(!showCalendar)}>
                      <input type="text" value={form.agencyExpiry} readOnly placeholder=""
                        className="w-full border border-slate-300 px-4 py-2.5 text-sm rounded-md focus:border-[#30364F] focus:outline-none focus:ring-1 focus:ring-[#30364F] bg-white transition-all cursor-pointer" />
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    {showCalendar && (
                      <CalendarWidget onClose={() => setShowCalendar(false)}
                        onSelect={(d) => { updateForm("agencyExpiry", d); setShowCalendar(false); }} position="top" />
                    )}
                  </div>
                  <InputField label="مكان إنشاء الوكالة" placeholder="الرياض" value={form.agencyPlace} onChange={(e) => updateForm("agencyPlace", e.target.value)} />
                </>
              )}
              {sellerRole === "marketer" && (
                <>
                  <InputField label="رقم رخصة فال" placeholder="1100xxxxxx" value={form.falLicense} onChange={(e) => updateForm("falLicense", e.target.value)} />
                  <InputField label="اسم المنشأة" placeholder="" value={form.companyName} onChange={(e) => updateForm("companyName", e.target.value)} />
                </>
              )}
            </div>
            <Button fullWidth onClick={() => { if (validateStepOne()) setStep(2); }} className="mt-4">التالي</Button>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="font-bold text-lg border-b pb-2 mb-4">بيانات العقار</h3>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="نوع العقار" placeholder="أرض، فيلا، عمارة..." value={form.propertyType} onChange={(e) => updateForm("propertyType", e.target.value)} />
              <InputField label="الاستخدام" placeholder="سكني، تجاري..." value={form.usage} onChange={(e) => updateForm("usage", e.target.value)} />
              <InputField label="المساحة (م²)" placeholder="0.00" type="number" value={form.area} onChange={(e) => updateForm("area", e.target.value)} />
              <InputField label="واجهة العقار" placeholder="شمالية، جنوبية..." value={form.facade} onChange={(e) => updateForm("facade", e.target.value)} />
              <InputField label="المدينة" placeholder="" value={form.city} onChange={(e) => updateForm("city", e.target.value)} />
              <InputField label="الحي" placeholder="" value={form.district} onChange={(e) => updateForm("district", e.target.value)} />
              <InputField label="المنطقة" placeholder="مثال: مكة المكرمة، الرياض..." value={form.region} onChange={(e) => updateForm("region", e.target.value)} />
              <InputField label="اسم الشارع" placeholder="" value={form.streetName} onChange={(e) => updateForm("streetName", e.target.value)} />
              <div className="col-span-2">
                <InputField label="رابط الموقع (Google Maps)" placeholder="https://maps.google.com/..." value={form.mapUrl} onChange={(e) => updateForm("mapUrl", e.target.value)} />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-bold text-[#30364F]">صورة العقار</label>
                <input ref={propertyImageInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => setPropertyImageFile(e.target.files?.[0] ?? null)} />
                <div className="border border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 cursor-pointer"
                  onClick={() => propertyImageInputRef.current?.click()}>
                  <Camera className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <span className="text-sm text-slate-500 block">
                    {propertyImageFile ? `تم اختيار: ${propertyImageFile.name}` : "اضغط لرفع صورة العقار"}
                  </span>
                </div>
              </div>
              <div className="col-span-2">
                <h4 className="text-sm font-bold text-[#30364F] mb-2 mt-2">الحدود والأطوال (بالمتر)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="شمالاً" placeholder="0.00" type="number" value={form.northBoundary} onChange={(e) => updateForm("northBoundary", e.target.value)} />
                  <InputField label="جنوباً" placeholder="0.00" type="number" value={form.southBoundary} onChange={(e) => updateForm("southBoundary", e.target.value)} />
                  <InputField label="شرقاً" placeholder="0.00" type="number" value={form.eastBoundary} onChange={(e) => updateForm("eastBoundary", e.target.value)} />
                  <InputField label="غرباً" placeholder="0.00" type="number" value={form.westBoundary} onChange={(e) => updateForm("westBoundary", e.target.value)} />
                </div>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">السابق</Button>
              <Button onClick={() => { if (validateStepTwo()) setStep(3); }} className="flex-1">التالي</Button>
            </div>
          </div>
        )}

        {/* ── Step 3 ── */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="font-bold text-lg border-b pb-2 mb-4">بيانات صك الملكية</h3>
            <div className="grid grid-cols-1 gap-4">
              <InputField label="رقم الصك" placeholder="" value={form.deedNumber} onChange={(e) => updateForm("deedNumber", e.target.value)} />
              <InputField label="رقم المخطط" placeholder="" value={form.planNumber} onChange={(e) => updateForm("planNumber", e.target.value)} />
              <InputField label="رقم القطعة" placeholder="" value={form.plotNumber} onChange={(e) => updateForm("plotNumber", e.target.value)} />
            </div>

            <div>
              <h4 className="font-bold text-sm text-[#30364F] mb-4 pt-2 border-t">تفاصيل المزاد</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="اسم المزاد" placeholder="" value={form.auctionName} onChange={(e) => updateForm("auctionName", e.target.value)} />
                  <InputField label="السعر الافتتاحي (ريال)" placeholder="0" type="number" value={form.startPrice} onChange={(e) => updateForm("startPrice", e.target.value)} />
                </div>
                <DateTimeField label="بداية المزاد" dateValue={startDate} timeValue={startTime} onDateChange={setStartDate} onTimeChange={setStartTime} />
                <DateTimeField label="نهاية المزاد" dateValue={endDate} timeValue={endTime} onDateChange={setEndDate} onTimeChange={setEndTime} />
              </div>
            </div>

            {/* AI target price */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#30364F]">
                السعر المستهدف (ريال)
                <span className="mr-2 text-[10px] font-bold text-[#91C6BC] bg-white border border-[#91C6BC] px-2 py-0.5 rounded-full">اختياري</span>
              </label>
              <p className="text-xs text-slate-400 mb-2">أدخل السعر الذي تريد تحقيقه، وسيقترح النموذج السعر المبدئي الأمثل ووقت النشر.</p>
              <div className="flex gap-3 items-end">
                <input type="number" placeholder="مثال: 1,000,000" value={targetPrice}
                  onChange={(e) => { setTargetPrice(e.target.value); setStrategyResult(null); setStrategyError(null); }}
                  className="flex-1 border border-slate-300 px-4 py-2.5 text-sm rounded-md focus:border-[#91C6BC] focus:outline-none focus:ring-1 focus:ring-[#91C6BC] bg-white transition-all placeholder:text-slate-400" />
                <button onClick={fetchAuctionStrategy} disabled={strategyLoading || !targetPrice}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#30364F] hover:bg-[#1e2538] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md font-bold text-sm transition-colors whitespace-nowrap">
                  {strategyLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري التحليل...</>
                    : <><Sparkles className="w-4 h-4" /> احصل على اقتراح</>}
                </button>
              </div>
              {strategyError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">{strategyError}</div>
              )}
            </div>

            <div className="flex gap-4 pt-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">السابق</Button>
              <Button onClick={() => { if (validateStepThree()) setStep(4); }} className="flex-1">التالي</Button>
            </div>

            {strategyResult && (
              <AuctionStrategyCard strategy={strategyResult.best_strategy} status={strategyResult.status} onApply={applyStrategy} />
            )}
          </div>
        )}

        {/* ── Step 4 ── */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="font-bold text-lg border-b pb-2 mb-4">وثيقة الملكية</h3>
            <input ref={deedFileInputRef} type="file" accept=".pdf,image/*" className="hidden"
              onChange={(e) => setDeedFile(e.target.files?.[0] ?? null)} />
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center text-slate-400 cursor-pointer hover:bg-slate-50"
              onClick={() => deedFileInputRef.current?.click()}>
              <FileText className="w-12 h-12 mx-auto mb-2" />
              <p>{deedFile ? `تم اختيار: ${deedFile.name}` : "اسحب وأفلت صورة الصك هنا"}</p>
            </div>
            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1">السابق</Button>
              <Button onClick={handleSubmit} className="flex-1" disabled={loading}>
                {loading ? "جاري الحفظ..." : "إرسال الطلب"}
              </Button>
            </div>
          </div>
        )}

      </Card>

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>

      {/* ── Success Modal ── */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-[#91C6BC]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[#91C6BC]" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-black text-[#30364F] mb-2">تمت الإضافة بنجاح</h2>
            <p className="text-slate-500 text-sm mb-8">
              تم إرسال طلبك بنجاح. سيتم مراجعة المزاد وإدراجه في المنصة قريباً.
            </p>
            <button
              onClick={() => { setShowSuccess(false); onCancel(); }}
              className="w-full py-3.5 bg-[#30364F] hover:bg-[#1e2538] text-white rounded-2xl font-bold text-sm transition-colors"
            >
              متابعة
            </button>
          </div>
        </div>
      )}
    </div>
  );}
