import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Gavel,
  Plus,
  Calendar,
  ChevronDown,
  Clock,
  CheckCircle,
  X,
  Info,
  CreditCard,
  User,
  Camera,
  ShieldCheck,
  ChevronLeft,
  Check,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Bar,
} from "recharts";
import { Badge } from "../ui/badge";

const THEME = {
  textPrimary: "text-[#30364F]",
  border: "border-[#cbd5e1]",
};

type MyAuctionsPageProps = {
  onAddAuction: () => void;
};

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
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from({ length: 80 }, (_, i) => 1950 + i);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDay = new Date(currentYear, currentMonth, 1).getDay();

  const positionClasses =
    position === "top"
      ? "bottom-full mb-2 origin-bottom-left"
      : "top-full mt-2 origin-top-left";

  return (
    <div
      className={`absolute ${positionClasses} left-0 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 w-[280px] animate-in zoom-in-95 duration-200`}
    >
      <div className="flex justify-between items-center mb-4 gap-2">
        <div className="flex gap-2 w-full">
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(Number(e.target.value))}
            className="flex-1 bg-slate-50 border border-slate-200 text-[#30364F] font-bold text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#30364F] cursor-pointer"
          >
            {months.map((m, i) => (
              <option key={i} value={i}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="w-20 bg-slate-50 border border-slate-200 text-[#30364F] font-bold text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#30364F] cursor-pointer"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-2 text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-[10px] font-bold text-slate-400 uppercase py-1">
            {d}
          </div>
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

type CardProps = {
  title?: string;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  overflowVisible?: boolean;
};

const Card = ({
  title,
  children,
  className = "",
  noPadding = false,
  overflowVisible = false,
}: CardProps) => (
  <div
    className={`bg-white border ${THEME.border} rounded-2xl shadow-sm ${
      overflowVisible ? "overflow-visible" : "overflow-hidden"
    } ${className}`}
  >
    {title && (
      <div className="px-6 pt-6">
        <h3 className={`text-lg font-black ${THEME.textPrimary}`}>{title}</h3>
      </div>
    )}
    <div className={noPadding ? "" : "p-6"}>{children}</div>
  </div>
);

export default function MyAuctionsPage({
  onAddAuction,
}: MyAuctionsPageProps) {
  const performanceData = [
    { name: "يناير", value: 4000 },
    { name: "فبراير", value: 3000 },
    { name: "مارس", value: 2000 },
    { name: "أبريل", value: 2780 },
    { name: "مايو", value: 1890 },
  ];

  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 animate-in fade-in space-y-8">
      <div className="flex justify-between items-center">
        <h1 className={`text-2xl font-black ${THEME.textPrimary} flex items-center gap-2`}>
          <Gavel className="w-6 h-6" /> مزاداتي
        </h1>

        <button
          onClick={onAddAuction}
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#30364F] to-[#334155] text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          <span>أضف مزادك الآن</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card title="أداء المزادات">
          <div className="h-64 w-full dir-ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <RechartsTooltip cursor={{ fill: "#f1f5f9" }} />
                <Bar
                  dataKey="value"
                  fill="#30364F"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="ملخص المشاركات">
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="bg-slate-50 p-4 rounded-lg flex flex-col justify-center items-center text-center border border-slate-100">
              <span className="text-slate-500 text-xs font-bold mb-2">
                إجمالي المزايدات
              </span>
              <span className="text-3xl font-black text-[#30364F]">48</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg flex flex-col justify-center items-center text-center border border-slate-100">
              <span className="text-slate-500 text-xs font-bold mb-2">
                متوسط المزايدة/مزاد
              </span>
              <span className="text-3xl font-black text-[#30364F]">12.5</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg flex flex-col justify-center items-center text-center border border-slate-100">
              <span className="text-slate-500 text-xs font-bold mb-2">
                أعلى تنافس
              </span>
              <span className="text-sm font-black text-[#30364F]">
                فيلا القيروان (22)
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg flex flex-col justify-center items-center text-center border border-slate-100">
              <span className="text-slate-500 text-xs font-bold mb-2">
                أقل من التوقع
              </span>
              <span className="text-sm font-black text-rose-600">أرض الملقا</span>
            </div>
          </div>
        </Card>
      </div>

      <Card noPadding overflowVisible>
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="relative max-w-xs">
            <input
              type="text"
              value={selectedDate || ""}
              placeholder="تصفية حسب التاريخ"
              readOnly
              onClick={() => setShowCalendar(!showCalendar)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg bg-white text-sm cursor-pointer hover:border-[#30364F] focus:outline-none focus:border-[#30364F] transition-all"
            />
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            {showCalendar && (
              <CalendarWidget
                onClose={() => setShowCalendar(false)}
                onSelect={setSelectedDate}
                position="top"
              />
            )}
          </div>
        </div>

        <table className="w-full text-right text-sm">
          <thead className={`bg-slate-50 ${THEME.textPrimary} font-bold border-b ${THEME.border}`}>
            <tr>
              <th className="p-4">عنوان المزاد</th>
              <th className="p-4">تاريخ البدء</th>
              <th className="p-4">تاريخ الإنتهاء</th>
              <th className="p-4">عدد المشاركين</th>
              <th className="p-4">المبلغ النهائي</th>
              <th className="p-4">الحالة</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            <tr className="hover:bg-slate-50">
              <td className="p-4 font-bold">أرض خام - مخطط الخير</td>
              <td className="p-4 text-slate-500">2025-11-20</td>
              <td className="p-4 text-slate-500">2025-12-01</td>
              <td className="p-4">42</td>
              <td className="p-4 font-mono font-bold text-[#30364F]">
                3,450,000 ر.س
              </td>
              <td className="p-4">
                <Badge variant="success">مكتمل</Badge>
              </td>
            </tr>

            <tr className="hover:bg-slate-50">
              <td className="p-4 font-bold">فيلا العارض</td>
              <td className="p-4 text-slate-500">2026-02-01</td>
              <td className="p-4 text-slate-500">2026-02-15</td>
              <td className="p-4">15</td>
              <td className="p-4 font-mono font-bold text-[#30364F]">--</td>
              <td className="p-4">
                <Badge variant="warning">جاري</Badge>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}