import React, { useState } from "react";
import {
  Camera,
  CheckCircle,
  User,
  CreditCard,
  Calendar,
  ShieldCheck,
  Info,
  ChevronDown,
  Check,
  X,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

type ProfilePageProps = {
  user: any;
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

export default function ProfilePage({ user }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<"personal" | "banking">("personal");
  const [editMode, setEditMode] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [dob, setDob] = useState("1410/01/01");

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in bg-[#f8fafc]">
      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        <div className="w-full lg:w-80 shrink-0 flex flex-col">
          <div className="bg-white rounded-[30px] p-6 shadow-sm border border-slate-100 flex flex-col items-center sticky top-24 h-full">
            <div className="relative mb-4 mt-4">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner bg-[#30364F] flex items-center justify-center text-white text-4xl font-bold">
                {user.name ? user.name[0] : "U"}
              </div>
              <button className="absolute bottom-1 right-1 w-8 h-8 bg-[#30364F] text-white rounded-full flex items-center justify-center border-2 border-white shadow-md hover:scale-105 transition-transform">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-xl font-black text-[#30364F] mb-1">{user.name}</h2>
            <p className="text-slate-400 text-sm font-bold mb-10">المستثمر</p>

            <div className="w-full space-y-2 mb-8">
              <button
                onClick={() => setActiveTab("personal")}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200 ${
                  activeTab === "personal"
                    ? "bg-[#30364F]/5 text-[#30364F]"
                    : "text-slate-400 hover:bg-slate-50"
                }`}
              >
                <User className={`w-5 h-5 ${activeTab === "personal" ? "fill-current" : ""}`} />
                <span className="font-bold text-sm">المعلومات الشخصية</span>
                {activeTab === "personal" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#30364F] mr-auto shadow-[0_0_8px_rgba(48,54,79,0.5)]"></div>
                )}
              </button>

              <button
                onClick={() => setActiveTab("banking")}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200 ${
                  activeTab === "banking"
                    ? "bg-[#30364F]/5 text-[#30364F]"
                    : "text-slate-400 hover:bg-slate-50"
                }`}
              >
                <CreditCard className={`w-5 h-5 ${activeTab === "banking" ? "fill-current" : ""}`} />
                <span className="font-bold text-sm">الحسابات البنكية</span>
                {activeTab === "banking" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#30364F] mr-auto shadow-[0_0_8px_rgba(48,54,79,0.5)]"></div>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="bg-white rounded-[30px] p-8 lg:p-10 shadow-sm border border-slate-100 h-full">
            {activeTab === "personal" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 h-full flex flex-col">
                <div className="flex justify-between items-center border-b border-slate-100 pb-6">
                  <h2 className="text-2xl font-black text-[#30364F]">المعلومات الشخصية</h2>
                  <Button
                    variant={editMode ? "danger" : "primary"}
                    onClick={() => setEditMode(!editMode)}
                    icon={editMode ? X : User}
                  >
                    {editMode ? "إلغاء التعديل" : "تعديل البيانات"}
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 flex-1">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 ml-1">الاسم الأول</label>
                    <input disabled={!editMode} type="text" defaultValue={user.name.split(" ")[0] || ""} className="w-full bg-[#F6F7F9] rounded-xl px-5 py-3.5 text-sm font-bold text-[#30364F] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#30364F]/20 transition-all" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 ml-1">اسم العائلة</label>
                    <input disabled={!editMode} type="text" defaultValue={user.name.split(" ").slice(1).join(" ") || ""}  className="w-full bg-[#F6F7F9] rounded-xl px-5 py-3.5 text-sm font-bold text-[#30364F] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#30364F]/20 transition-all" />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-400 ml-1">البريد الإلكتروني</label>
                    <div className="relative">
                      <input disabled type="email" defaultValue={user.email} className="w-full bg-[#F6F7F9] rounded-xl px-5 py-3.5 text-sm font-bold text-[#30364F] focus:outline-none focus:ring-2 focus:ring-[#30364F]/20 transition-all" />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md text-[10px] font-bold">
                        <CheckCircle className="w-3 h-3 fill-current" /> Verified
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-400 ml-1">العنوان الوطني</label>
                    <input disabled={!editMode} type="text" defaultValue="جدة، حي الورود" className="w-full bg-[#F6F7F9] rounded-xl px-5 py-3.5 text-sm font-bold text-[#30364F] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#30364F]/20 transition-all" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 ml-1">رقم الجوال</label>
                    <div className="flex gap-2 dir-ltr">
                      <select disabled={!editMode} className="w-24 bg-[#F6F7F9] rounded-xl px-2 py-3.5 text-sm font-bold text-[#30364F] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#30364F]/20 cursor-pointer">
                        <option value="+966">+966</option>
                        <option value="+971">+971</option>
                        <option value="+965">+965</option>
                      </select>
                      <input disabled={!editMode} type="tel" defaultValue={user.phone.replace("+966 ", "")} maxLength={10} placeholder="5xxxxxxxx" className="flex-1 bg-[#F6F7F9] rounded-xl px-5 py-3.5 text-sm font-bold text-[#30364F] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#30364F]/20 transition-all text-left" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 ml-1">الهوية الوطنية</label>
                    <input
                      disabled={!editMode}
                      type="text"
                      defaultValue={user.id}
                      maxLength={10}
                      pattern="\d*"
                      onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "").slice(0, 10);
                      }}
                      className="w-full bg-[#F6F7F9] rounded-xl px-5 py-3.5 text-sm font-bold text-[#30364F] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#30364F]/20 transition-all"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2 relative">
                    <label className="text-xs font-bold text-slate-400 ml-1">تاريخ الميلاد</label>
                    <div className="relative" onClick={() => editMode && setShowCalendar(!showCalendar)}>
                      <input
                        disabled={!editMode}
                        type="text"
                        value={dob}
                        readOnly
                        className="w-full bg-[#F6F7F9] rounded-xl px-5 py-3.5 text-sm font-bold text-[#30364F] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#30364F]/20 transition-all cursor-pointer"
                      />
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    {showCalendar && (
                      <CalendarWidget onClose={() => setShowCalendar(false)} onSelect={(d) => setDob(d)} position="top" />
                    )}
                  </div>
                </div>

                {editMode && (
                  <div className="flex gap-4 mt-12 pt-6 border-t border-slate-100 animate-in slide-in-from-bottom-2">
                    <button onClick={() => setEditMode(false)} className="flex-1 py-3.5 rounded-xl border border-[#30364F] text-[#30364F] font-bold hover:bg-slate-50 transition-all">
                      إلغاء التغييرات
                    </button>
                    <button onClick={() => setEditMode(false)} className="flex-1 py-3.5 rounded-xl bg-[#30364F] text-white font-bold shadow-lg shadow-slate-200 hover:bg-[#1E2437] transition-all">
                      حفظ التغييرات
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "banking" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 h-full flex flex-col">
                <div className="flex justify-between items-center border-b border-slate-100 pb-6">
                  <h2 className="text-2xl font-black text-[#30364F]">الحسابات البنكية</h2>
                  <Badge variant="success" className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> آمن ومشفر
                  </Badge>
                </div>

                <div className="bg-[#f0fdf4] border border-emerald-100 rounded-xl p-4 flex gap-3">
                  <Info className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-emerald-800 font-medium">
                    يرجى التأكد من أن اسم صاحب الحساب البنكي يطابق الاسم المسجل في ملفك الشخصي لتجنب تأخير المعاملات.
                  </p>
                </div>

                <div className="space-y-6 flex-1">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 ml-1">اختر البنك</label>
                    <div className="relative">
                      <select className="w-full bg-[#F6F7F9] rounded-xl px-5 py-3.5 text-sm font-bold text-[#30364F] focus:outline-none focus:ring-2 focus:ring-[#30364F]/20 appearance-none cursor-pointer">
                        <option>مصرف الراجحي</option>
                        <option>البنك الأهلي السعودي</option>
                        <option>بنك الرياض</option>
                      </select>
                      <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 ml-1">رقم الآيبان (IBAN)</label>
                    <div className="relative">
                      <input type="text" placeholder="SA00 0000 0000 0000 0000 0000" className="w-full bg-[#F6F7F9] rounded-xl px-5 py-3.5 text-sm font-bold text-[#30364F] focus:outline-none focus:ring-2 focus:ring-[#30364F]/20 transition-all font-mono dir-ltr text-right" />
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 ml-1">اسم صاحب الحساب</label>
                    <input type="text" defaultValue={user.name} className="w-full bg-[#F6F7F9] rounded-xl px-5 py-3.5 text-sm font-bold text-[#30364F] focus:outline-none focus:ring-2 focus:ring-[#30364F]/20 transition-all" />
                  </div>
                </div>

                <div className="flex gap-4 mt-12 pt-6 border-t border-slate-100">
                  <button className="flex-1 py-3.5 rounded-xl border border-slate-300 text-slate-500 font-bold hover:bg-slate-50 transition-all">
                    إلغاء
                  </button>
                  <button className="flex-1 py-3.5 rounded-xl bg-[#30364F] text-white font-bold shadow-lg shadow-slate-200 hover:bg-[#1E2437] transition-all">
                    إضافة حساب بنكي
                  </button>
                </div>
              </div>
            )}
         </div>
      </div>
    </div>
    </div>
  );
}