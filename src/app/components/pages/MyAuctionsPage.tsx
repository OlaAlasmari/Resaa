import React, { useEffect, useMemo, useState } from "react";
import {
  Gavel,
  Plus,
  Calendar,
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
import { supabase } from "../../../lib/supabase";

const THEME = {
  textPrimary: "text-[#30364F]",
  border: "border-[#cbd5e1]",
};

type MyAuctionsPageProps = {
  onAddAuction: () => void;
};

type AuctionRow = {
  auction_id: number;
  auction_name: string | null;
  city: string | null;
  district: string | null;
  region: string | null;
  start_time: string | null;
  end_time: string | null;
  start_price: number | null;
  highest_bid: number | null;
  total_sales: number | null;
  duration: string | null;
  products_count: string | null;
  time: string | null;
  property_id: number | null;
  user_id: string | null;
};

type CalendarWidgetProps = {
  onClose: () => void;
  onSelect: (date: string) => void;
  position?: "top" | "bottom";
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

const toDateInputValue = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatDate = (value?: string | null) => {
  const date = parseAuctionDate(value);
  if (!date) return "-";

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
};

const formatMoney = (value?: number | null) => {
  if (value === null || value === undefined) return "--";
  return `${Number(value).toLocaleString("en-US")} ر.س`;
};

const getAuctionStatus = (
  startTime?: string | null,
  endTime?: string | null
): "current" | "upcoming" | "ended" => {
  const today = normalizeDateOnly(new Date());
  const start = parseAuctionDate(startTime);
  const end = parseAuctionDate(endTime);

  if (!start) return "upcoming";

  const startDate = normalizeDateOnly(start);
  const endDate = end ? normalizeDateOnly(end) : startDate;

  if (today < startDate) return "upcoming";
  if (today > endDate) return "ended";
  return "current";
};

const isSameSelectedDay = (value: string | null, selectedDate: string) => {
  if (!selectedDate) return true;

  const date = parseAuctionDate(value);
  if (!date) return false;

  return toDateInputValue(date) === selectedDate;
};

const monthNameAr = (monthIndex: number) => {
  const months = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];

  return months[monthIndex] ?? "-";
};

const CalendarWidget = ({
  onClose,
  onSelect,
  position = "bottom",
}: CalendarWidgetProps) => {
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

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
          <div
            key={i}
            className="text-[10px] font-bold text-slate-400 uppercase py-1"
          >
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
            `${currentYear}-${(currentMonth + 1)
              .toString()
              .padStart(2, "0")}-${selectedDay.toString().padStart(2, "0")}`
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
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [auctions, setAuctions] = useState<AuctionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMyAuctions = async () => {
      try {
        setLoading(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setAuctions([]);
          return;
        }

        const { data, error } = await supabase
          .from("auction")
          .select("*")
          .eq("user_id", user.id)
          .order("auction_id", { ascending: false });

        if (error) {
          console.error("Error loading my auctions:", error.message);
          setAuctions([]);
          return;
        }

        setAuctions((data as AuctionRow[]) || []);
      } catch (error) {
        console.error("Unexpected dashboard error:", error);
        setAuctions([]);
      } finally {
        setLoading(false);
      }
    };

    loadMyAuctions();
  }, []);

  const filteredAuctions = useMemo(() => {
    return auctions.filter((auction) =>
      isSameSelectedDay(auction.start_time, selectedDate)
    );
  }, [auctions, selectedDate]);

  const performanceData = useMemo(() => {
    const map = new Map<string, number>();

    auctions.forEach((auction) => {
      const date = parseAuctionDate(auction.start_time);
      if (!date) return;

      const month = monthNameAr(date.getMonth());
      const value = Number(
        auction.total_sales ?? auction.highest_bid ?? auction.start_price ?? 0
      );

      map.set(month, (map.get(month) ?? 0) + value);
    });

    return Array.from(map.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [auctions]);

  const totalAuctions = filteredAuctions.length;

  const totalSales = filteredAuctions.reduce(
    (sum, auction) =>
      sum +
      Number(auction.total_sales ?? auction.highest_bid ?? auction.start_price ?? 0),
    0
  );

  const averagePrice =
    totalAuctions > 0 ? Math.round(totalSales / totalAuctions) : 0;

  const highestAuction = filteredAuctions.reduce<AuctionRow | null>(
    (highest, auction) => {
      if (!highest) return auction;

      const auctionValue = Number(
        auction.total_sales ?? auction.highest_bid ?? auction.start_price ?? 0
      );
      const highestValue = Number(
        highest.total_sales ?? highest.highest_bid ?? highest.start_price ?? 0
      );

      return auctionValue > highestValue ? auction : highest;
    },
    null
  );

  const lowestAuction = filteredAuctions.reduce<AuctionRow | null>(
    (lowest, auction) => {
      if (!lowest) return auction;

      const auctionValue = Number(
        auction.total_sales ?? auction.highest_bid ?? auction.start_price ?? 0
      );
      const lowestValue = Number(
        lowest.total_sales ?? lowest.highest_bid ?? lowest.start_price ?? 0
      );

      return auctionValue < lowestValue ? auction : lowest;
    },
    null
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 animate-in fade-in space-y-8">
      <div className="flex justify-between items-center">
        <h1
          className={`text-2xl font-black ${THEME.textPrimary} flex items-center gap-2`}
        >
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
                إجمالي المزادات
              </span>
              <span className="text-3xl font-black text-[#30364F]">
                {totalAuctions}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg flex flex-col justify-center items-center text-center border border-slate-100">
              <span className="text-slate-500 text-xs font-bold mb-2">
                متوسط قيمة المزاد
              </span>
              <span className="text-lg font-black text-[#30364F]">
                {formatMoney(averagePrice)}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg flex flex-col justify-center items-center text-center border border-slate-100">
              <span className="text-slate-500 text-xs font-bold mb-2">
                أعلى مزاد
              </span>
              <span className="text-sm font-black text-[#30364F]">
                {highestAuction?.auction_name ?? "--"}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg flex flex-col justify-center items-center text-center border border-slate-100">
              <span className="text-slate-500 text-xs font-bold mb-2">
                أقل مزاد
              </span>
              <span className="text-sm font-black text-rose-600">
                {lowestAuction?.auction_name ?? "--"}
              </span>
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
          <thead
            className={`bg-slate-50 ${THEME.textPrimary} font-bold border-b ${THEME.border}`}
          >
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
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-slate-500 font-bold"
                >
                  جاري تحميل البيانات...
                </td>
              </tr>
            ) : filteredAuctions.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-slate-500 font-bold"
                >
                  لا توجد مزادات لهذا المستخدم
                </td>
              </tr>
            ) : (
              filteredAuctions.map((auction) => {
                const status = getAuctionStatus(
                  auction.start_time,
                  auction.end_time
                );

                return (
                  <tr key={auction.auction_id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold">
                      {auction.auction_name ?? "مزاد بدون اسم"}
                    </td>

                    <td className="p-4 text-slate-500">
                      {formatDate(auction.start_time)}
                    </td>

                    <td className="p-4 text-slate-500">
                      {formatDate(auction.end_time)}
                    </td>

                    <td className="p-4">
                      {auction.products_count ?? "1 منتج"}
                    </td>

                    <td className="p-4 font-mono font-bold text-[#30364F]">
                      {formatMoney(
                        auction.total_sales ??
                          auction.highest_bid ??
                          auction.start_price
                      )}
                    </td>

                    <td className="p-4">
                      {status === "ended" && (
                        <Badge variant="success">مكتمل</Badge>
                      )}

                      {status === "current" && (
                        <Badge variant="warning">جاري</Badge>
                      )}

                      {status === "upcoming" && (
                        <Badge variant="neutral">قادم</Badge>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}