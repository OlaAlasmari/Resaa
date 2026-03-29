import React, { useState } from "react";
import { Calendar, Camera, FileText } from "lucide-react";
import { Button } from "../ui/button";
import InputField from "../InputField";
import { SellerRole, ViewState } from "../../types";

const THEME = {
  primary: "bg-[#91C6BC]",
  textPrimary: "text-[#30364F]",
};

type AddAuctionPageProps = {
  onCancel: () => void;
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
    <div className={`absolute ${positionClasses} left-0 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 w-[280px]`}>
      <div className="flex justify-between items-center mb-4 gap-2">
        <div className="flex gap-2 w-full">
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(Number(e.target.value))}
            className="flex-1 bg-slate-50 border border-slate-200 text-[#30364F] font-bold text-xs rounded-lg px-2 py-1.5"
          >
            {months.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>

          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="w-20 bg-slate-50 border border-slate-200 text-[#30364F] font-bold text-xs rounded-lg px-2 py-1.5"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
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
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mx-auto ${
              selectedDay === day
                ? "bg-[#30364F] text-white"
                : "text-slate-600 hover:bg-slate-50"
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
        className="w-full py-2.5 bg-[#30364F] text-white rounded-xl font-bold text-xs"
      >
        Apply Date
      </button>
    </div>
  );
};

const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`bg-white border border-slate-200 rounded-2xl shadow-sm ${className}`}>
    {children}
  </div>
);

export default function AddAuctionPage({ onCancel }: AddAuctionPageProps) {
  const [step, setStep] = useState(1);
  const [sellerRole, setSellerRole] = useState<SellerRole>("principal");
  const [showCalendar, setShowCalendar] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-in zoom-in-95 duration-300">
      <div className="mb-8 text-center">
        <h1 className={`text-2xl font-black ${THEME.textPrimary} mb-2`}>
          إضافة مزاد جديد
        </h1>
        <p className="text-slate-500">
          أكمل الخطوات التالية لإدراج عقارك في منصة رساء
        </p>
      </div>

      <div className="flex items-center justify-center mb-10">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold transition-colors ${
                step >= s
                  ? `${THEME.primary} border-transparent text-white`
                  : "bg-white border-slate-300 text-slate-300"
              }`}
            >
              {s}
            </div>
            {s < 4 && (
              <div
                className={`w-16 h-0.5 mx-2 ${
                  step > s ? "bg-[#30364F]" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <Card className="p-8">
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="font-bold text-lg border-b pb-2 mb-4">بيانات البائع</h3>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {["principal", "agent", "marketer"].map((role) => (
                <button
                  key={role}
                  onClick={() => setSellerRole(role as SellerRole)}
                  className={`p-3 border rounded-lg text-center transition-all font-bold text-sm ${
                    sellerRole === role
                      ? "bg-[#30364F] text-white border-[#30364F]"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {role === "principal" ? "أصيل" : role === "agent" ? "وكيل" : "مسوق"}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <InputField label="الاسم الكامل" placeholder="" />

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#30364F]">رقم الهوية / السجل</label>
                <input
                  type="text"
                  maxLength={10}
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value
                      .replace(/[^0-9]/g, "")
                      .slice(0, 10);
                  }}
                  placeholder="1xxxxxxxxx"
                  className="w-full border border-slate-300 px-4 py-2.5 text-sm rounded-md focus:border-[#30364F] focus:outline-none focus:ring-1 focus:ring-[#30364F] bg-white transition-all placeholder:text-slate-400"
                />
              </div>

              {sellerRole === "agent" && (
                <>
                  <InputField label="رقم الوكالة الشرعية" placeholder="xxxxxxxx" />

                  <div className="space-y-1.5 relative">
                    <label className="text-sm font-bold text-[#30364F]">تاريخ انتهاء الوكالة</label>
                    <div className="relative" onClick={() => setShowCalendar(!showCalendar)}>
                      <input
                        type="text"
                        value={expiryDate}
                        readOnly
                        placeholder=""
                        className="w-full border border-slate-300 px-4 py-2.5 text-sm rounded-md focus:border-[#30364F] focus:outline-none focus:ring-1 focus:ring-[#30364F] bg-white transition-all placeholder:text-slate-400 cursor-pointer"
                      />
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    {showCalendar && (
                      <CalendarWidget
                        onClose={() => setShowCalendar(false)}
                        onSelect={(d) => {
                          setExpiryDate(d);
                          setShowCalendar(false);
                        }}
                        position="top"
                      />
                    )}
                  </div>

                  <InputField label="مكان إنشاء الوكالة" placeholder="الرياض" />
                </>
              )}

              {sellerRole === "marketer" && (
                <>
                  <InputField label="رقم رخصة فال" placeholder="1100xxxxxx" />
                  <InputField label="اسم المنشأة" placeholder="" />
                </>
              )}
            </div>

            <Button fullWidth onClick={() => setStep(2)} className="mt-4">
              التالي
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="font-bold text-lg border-b pb-2 mb-4">بيانات العقار</h3>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="نوع العقار" placeholder="أرض، فيلا، عمارة..." />
              <InputField label="الاستخدام" placeholder="سكني، تجاري..." />
              <InputField label="المساحة (م²)" placeholder="0.00" type="number" />
              <InputField label="واجهة العقار" placeholder="شمالية، جنوبية..." />

              <InputField label="المدينة" placeholder="" />
              <InputField label="الحي" placeholder="" />
              <InputField label="اسم الشارع" placeholder="" />
              <InputField label="رابط الموقع (Google Maps)" placeholder="https://maps.google.com/..." />

              <div className="col-span-2 space-y-2">
                <label className="text-sm font-bold text-[#30364F]">صورة العقار</label>
                <div className="border border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 cursor-pointer">
                  <Camera className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <span className="text-sm text-slate-500">اضغط لرفع صورة العقار</span>
                </div>
              </div>

              <div className="col-span-2">
                <h4 className="text-sm font-bold text-[#30364F] mb-2 mt-2">الحدود والأطوال</h4>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="شمالاً" placeholder="وصف الحد الشمالي" />
                  <InputField label="جنوباً" placeholder="وصف الحد الجنوبي" />
                  <InputField label="شرقاً" placeholder="وصف الحد الشرقي" />
                  <InputField label="غرباً" placeholder="وصف الحد الغربي" />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                السابق
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                التالي
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="font-bold text-lg border-b pb-2 mb-4">بيانات صك الملكية</h3>
            <div className="grid grid-cols-1 gap-4">
              <InputField label="رقم الصك" placeholder="" />
              <InputField label="رقم المخطط" placeholder="" />
              <InputField label="رقم القطعة" placeholder="" />
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                السابق
              </Button>
              <Button onClick={() => setStep(4)} className="flex-1">
                التالي
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h3 className="font-bold text-lg border-b pb-2 mb-4">وثيقة الملكية</h3>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-2" />
              <p>اسحب وأفلت صورة الصك هنا</p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                السابق
              </Button>
              <Button onClick={onCancel} className="flex-1">
                إرسال الطلب
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}