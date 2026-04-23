import React, { useRef, useState } from "react";
import { Calendar, Camera, FileText } from "lucide-react";
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
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
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
      className={`absolute ${positionClasses} left-0 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 w-[280px]`}
    >
      <div className="flex justify-between items-center mb-4 gap-2">
        <div className="flex gap-2 w-full">
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(Number(e.target.value))}
            className="flex-1 bg-slate-50 border border-slate-200 text-[#30364F] font-bold text-xs rounded-lg px-2 py-1.5"
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
            className="w-20 bg-slate-50 border border-slate-200 text-[#30364F] font-bold text-xs rounded-lg px-2 py-1.5"
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
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mx-auto ${selectedDay === day
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
  const [loading, setLoading] = useState(false);

  const propertyImageInputRef = useRef<HTMLInputElement | null>(null);
  const deedFileInputRef = useRef<HTMLInputElement | null>(null);

  const [propertyImageFile, setPropertyImageFile] = useState<File | null>(null);
  const [deedFile, setDeedFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    nationalId: "",
    agencyNumber: "",
    agencyExpiry: "",
    agencyPlace: "",
    falLicense: "",
    companyName: "",

    propertyType: "",
    usage: "",
    area: "",
    facade: "",
    city: "",
    district: "",
    streetName: "",
    mapUrl: "",
    northBoundary: "",
    southBoundary: "",
    eastBoundary: "",
    westBoundary: "",

    deedNumber: "",
    planNumber: "",
    plotNumber: "",

    auctionName: "",
    startTime: "",
    endTime: "",
    startPrice: "",
    duration: "",
    productsCount: "1",
    time: "",
  });

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const extractTimeFromDatetime = (datetimeValue: string) => {
    if (!datetimeValue) return null;
    const date = new Date(datetimeValue);
    if (Number.isNaN(date.getTime())) return null;
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  };

  const calculateDurationText = (start: string, end: string) => {
    if (!start || !end) return "";
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return "";
    }

    const diffMs = endDate.getTime() - startDate.getTime();
    if (diffMs <= 0) return "0 أيام";

    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return `${diffDays} أيام`;
  };

  const validateStepOne = () => {
    if (!form.fullName.trim() || !form.nationalId.trim()) {
      alert("أكملي بيانات البائع الأساسية");
      return false;
    }

    if (sellerRole === "agent") {
      if (!form.agencyNumber.trim() || !form.agencyExpiry.trim() || !form.agencyPlace.trim()) {
        alert("أكملي بيانات الوكالة");
        return false;
      }
    }

    if (sellerRole === "marketer") {
      if (!form.falLicense.trim() || !form.companyName.trim()) {
        alert("أكملي بيانات المسوق");
        return false;
      }
    }

    return true;
  };

  const validateStepTwo = () => {
    if (
      !form.propertyType.trim() ||
      !form.usage.trim() ||
      !form.area.trim() ||
      !form.city.trim() ||
      !form.district.trim()
    ) {
      alert("أكملي بيانات العقار الأساسية");
      return false;
    }
    return true;
  };

  const validateStepThree = () => {
    if (!form.deedNumber.trim()) {
      alert("أدخلي رقم الصك");
      return false;
    }
    return true;
  };

  const validateFinalSubmission = () => {
    if (!form.auctionName.trim()) {
      alert("أدخلي اسم المزاد");
      return false;
    }

    if (!form.startTime || !form.endTime) {
      alert("أكملي تاريخ بداية ونهاية المزاد");
      return false;
    }

    if (new Date(form.endTime) <= new Date(form.startTime)) {
      alert("وقت نهاية المزاد يجب أن يكون بعد وقت البداية");
      return false;
    }

    if (!form.startPrice || Number(form.startPrice) <= 0) {
      alert("أدخلي السعر الافتتاحي بشكل صحيح");
      return false;
    }

    return true;
  };

  const uploadFileToBucket = async (
    bucket: string,
    file: File,
    folder: string
  ): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${fileExt}`;

    const { error } = await supabase.storage.from(bucket).upload(fileName, file);

    if (error) {
      console.error(`Storage upload error in bucket ${bucket}:`, error.message);
      return null;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!validateFinalSubmission()) return;

    try {
      setLoading(true);

      let propertyImageUrl: string | null = null;

      if (propertyImageFile) {
        propertyImageUrl = await uploadFileToBucket(
          "property-images",
          propertyImageFile,
          "auctions"
        );
      }

      if (propertyImageFile && !propertyImageUrl) {
        alert("فشل رفع صورة العقار. تأكدي من وجود bucket باسم property-images");
        return;
      }

      if (deedFile) {
        const uploadedDeed = await uploadFileToBucket(
          "deed-files",
          deedFile,
          "deeds"
        );

        if (!uploadedDeed) {
          alert("فشل رفع وثيقة الملكية. تأكدي من وجود bucket باسم deed-files");
          return;
        }
      }

      const { data: propertyData, error: propertyError } = await supabase
        .from("property")
        .insert({
          property_type: form.propertyType || null,
          city: form.city || null,
          district: form.district || null,
          region: null,
          area: form.area ? Number(form.area) : null,
          usage: form.usage || null,
          deed_number: form.deedNumber || null,
          plan_number: form.planNumber || null,
          plot_number: form.plotNumber || null,
          north_boundary: form.northBoundary || null,
          south_boundary: form.southBoundary || null,
          east_boundary: form.eastBoundary || null,
          west_boundary: form.westBoundary || null,
          image_url: propertyImageUrl,
        })
        .select("property_id")
        .single();

      if (propertyError) {
        console.error("Property insert error:", propertyError.message);
        alert("حدث خطأ أثناء حفظ بيانات العقار");
        return;
      }

      const durationText =
        form.duration.trim() || calculateDurationText(form.startTime, form.endTime);

      const displayTime = form.time.trim() || extractTimeFromDatetime(form.startTime);

      const { error: auctionError } = await supabase
        .from("auction")
        .insert({
          auction_name: form.auctionName,
          property_id: propertyData.property_id,
          start_time: form.startTime,
          end_time: form.endTime,
          start_price: Number(form.startPrice),
          highest_bid: Number(form.startPrice),
          duration: durationText || null,
          products_count: form.productsCount || "1",
          time: displayTime,
        });

      if (auctionError) {
        console.error("FULL AUCTION ERROR:", auctionError);
        alert(auctionError.message || "حدث خطأ أثناء إضافة المزاد");
        return;
      }

      alert("تمت إضافة المزاد بنجاح");
      onCancel();
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-in zoom-in-95 duration-300">
      <div className="mb-8 text-center">
        <h1 className={`text-2xl font-black ${THEME.textPrimary} mb-2`}>
          إضافة مزاد جديد
        </h1>
        <p className="text-slate-500">أكمل الخطوات التالية لإدراج عقارك في منصة رساء</p>
      </div>

      <div className="flex items-center justify-center mb-10">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold transition-colors ${step >= s
                  ? `${THEME.primary} border-transparent text-white`
                  : "bg-white border-slate-300 text-slate-300"
                }`}
            >
              {s}
            </div>
            {s < 4 && (
              <div
                className={`w-16 h-0.5 mx-2 ${step > s ? "bg-[#30364F]" : "bg-slate-200"}`}
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
                  className={`p-3 border rounded-lg text-center transition-all font-bold text-sm ${sellerRole === role
                      ? "bg-[#30364F] text-white border-[#30364F]"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                    }`}
                >
                  {role === "principal" ? "أصيل" : role === "agent" ? "وكيل" : "مسوق"}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <InputField
                label="الاسم الكامل"
                placeholder=""
                value={form.fullName}
                onChange={(e) => updateForm("fullName", e.target.value)}
              />

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#30364F]">رقم الهوية / السجل</label>
                <input
                  type="text"
                  maxLength={10}
                  value={form.nationalId}
                  onChange={(e) =>
                    updateForm(
                      "nationalId",
                      e.target.value.replace(/[^0-9]/g, "").slice(0, 10)
                    )
                  }
                  placeholder="1xxxxxxxxx"
                  className="w-full border border-slate-300 px-4 py-2.5 text-sm rounded-md focus:border-[#30364F] focus:outline-none focus:ring-1 focus:ring-[#30364F] bg-white transition-all placeholder:text-slate-400"
                />
              </div>

              {sellerRole === "agent" && (
                <>
                  <InputField
                    label="رقم الوكالة الشرعية"
                    placeholder="xxxxxxxx"
                    value={form.agencyNumber}
                    onChange={(e) => updateForm("agencyNumber", e.target.value)}
                  />

                  <div className="space-y-1.5 relative">
                    <label className="text-sm font-bold text-[#30364F]">تاريخ انتهاء الوكالة</label>
                    <div className="relative" onClick={() => setShowCalendar(!showCalendar)}>
                      <input
                        type="text"
                        value={form.agencyExpiry}
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
                          updateForm("agencyExpiry", d);
                          setShowCalendar(false);
                        }}
                        position="top"
                      />
                    )}
                  </div>

                  <InputField
                    label="مكان إنشاء الوكالة"
                    placeholder="الرياض"
                    value={form.agencyPlace}
                    onChange={(e) => updateForm("agencyPlace", e.target.value)}
                  />
                </>
              )}

              {sellerRole === "marketer" && (
                <>
                  <InputField
                    label="رقم رخصة فال"
                    placeholder="1100xxxxxx"
                    value={form.falLicense}
                    onChange={(e) => updateForm("falLicense", e.target.value)}
                  />
                  <InputField
                    label="اسم المنشأة"
                    placeholder=""
                    value={form.companyName}
                    onChange={(e) => updateForm("companyName", e.target.value)}
                  />
                </>
              )}
            </div>

            <Button
              fullWidth
              onClick={() => {
                if (validateStepOne()) setStep(2);
              }}
              className="mt-4"
            >
              التالي
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="font-bold text-lg border-b pb-2 mb-4">بيانات العقار</h3>

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="نوع العقار"
                placeholder="أرض، فيلا، عمارة..."
                value={form.propertyType}
                onChange={(e) => updateForm("propertyType", e.target.value)}
              />
              <InputField
                label="الاستخدام"
                placeholder="سكني، تجاري..."
                value={form.usage}
                onChange={(e) => updateForm("usage", e.target.value)}
              />
              <InputField
                label="المساحة (م²)"
                placeholder="0.00"
                type="number"
                value={form.area}
                onChange={(e) => updateForm("area", e.target.value)}
              />
              <InputField
                label="واجهة العقار"
                placeholder="شمالية، جنوبية..."
                value={form.facade}
                onChange={(e) => updateForm("facade", e.target.value)}
              />

              <InputField
                label="المدينة"
                placeholder=""
                value={form.city}
                onChange={(e) => updateForm("city", e.target.value)}
              />
              <InputField
                label="الحي"
                placeholder=""
                value={form.district}
                onChange={(e) => updateForm("district", e.target.value)}
              />
              <InputField
                label="اسم الشارع"
                placeholder=""
                value={form.streetName}
                onChange={(e) => updateForm("streetName", e.target.value)}
              />
              <InputField
                label="رابط الموقع (Google Maps)"
                placeholder="https://maps.google.com/..."
                value={form.mapUrl}
                onChange={(e) => updateForm("mapUrl", e.target.value)}
              />

              <div className="col-span-2 space-y-2">
                <label className="text-sm font-bold text-[#30364F]">صورة العقار</label>

                <input
                  ref={propertyImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setPropertyImageFile(file);
                  }}
                />

                <div
                  className="border border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 cursor-pointer"
                  onClick={() => propertyImageInputRef.current?.click()}
                >
                  <Camera className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <span className="text-sm text-slate-500 block">
                    {propertyImageFile
                      ? `تم اختيار: ${propertyImageFile.name}`
                      : "اضغط لرفع صورة العقار"}
                  </span>
                </div>
              </div>

              <div className="col-span-2">
                <h4 className="text-sm font-bold text-[#30364F] mb-2 mt-2">الحدود والأطوال</h4>
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="شمالاً"
                    placeholder="وصف الحد الشمالي"
                    value={form.northBoundary}
                    onChange={(e) => updateForm("northBoundary", e.target.value)}
                  />
                  <InputField
                    label="جنوباً"
                    placeholder="وصف الحد الجنوبي"
                    value={form.southBoundary}
                    onChange={(e) => updateForm("southBoundary", e.target.value)}
                  />
                  <InputField
                    label="شرقاً"
                    placeholder="وصف الحد الشرقي"
                    value={form.eastBoundary}
                    onChange={(e) => updateForm("eastBoundary", e.target.value)}
                  />
                  <InputField
                    label="غرباً"
                    placeholder="وصف الحد الغربي"
                    value={form.westBoundary}
                    onChange={(e) => updateForm("westBoundary", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                السابق
              </Button>
              <Button
                onClick={() => {
                  if (validateStepTwo()) setStep(3);
                }}
                className="flex-1"
              >
                التالي
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="font-bold text-lg border-b pb-2 mb-4">بيانات صك الملكية</h3>

            <div className="grid grid-cols-1 gap-4">
              <InputField
                label="رقم الصك"
                placeholder=""
                value={form.deedNumber}
                onChange={(e) => updateForm("deedNumber", e.target.value)}
              />
              <InputField
                label="رقم المخطط"
                placeholder=""
                value={form.planNumber}
                onChange={(e) => updateForm("planNumber", e.target.value)}
              />
              <InputField
                label="رقم القطعة"
                placeholder=""
                value={form.plotNumber}
                onChange={(e) => updateForm("plotNumber", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="اسم المزاد"
                placeholder=""
                value={form.auctionName}
                onChange={(e) => updateForm("auctionName", e.target.value)}
              />
              <InputField
                label="السعر الافتتاحي"
                placeholder="0"
                type="number"
                value={form.startPrice}
                onChange={(e) => updateForm("startPrice", e.target.value)}
              />
              <InputField
                label="بداية المزاد"
                type="datetime-local"
                placeholder=""
                value={form.startTime}
                onChange={(e) => updateForm("startTime", e.target.value)}
              />
              <InputField
                label="نهاية المزاد"
                type="datetime-local"
                placeholder=""
                value={form.endTime}
                onChange={(e) => updateForm("endTime", e.target.value)}
              />
              <InputField
                label="مدة المزاد"
                placeholder="3 أيام"
                value={form.duration}
                onChange={(e) => updateForm("duration", e.target.value)}
              />
              <InputField
                label="وقت العرض"
                placeholder="06:00:00"
                value={form.time}
                onChange={(e) => updateForm("time", e.target.value)}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                السابق
              </Button>
              <Button
                onClick={() => {
                  if (validateStepThree()) setStep(4);
                }}
                className="flex-1"
              >
                التالي
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h3 className="font-bold text-lg border-b pb-2 mb-4">وثيقة الملكية</h3>

            <input
              ref={deedFileInputRef}
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setDeedFile(file);
              }}
            />

            <div
              className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center text-slate-400 cursor-pointer hover:bg-slate-50"
              onClick={() => deedFileInputRef.current?.click()}
            >
              <FileText className="w-12 h-12 mx-auto mb-2" />
              <p>{deedFile ? `تم اختيار: ${deedFile.name}` : "اسحب وأفلت صورة الصك هنا"}</p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                السابق
              </Button>
              <Button onClick={handleSubmit} className="flex-1" disabled={loading}>
                {loading ? "جاري الحفظ..." : "إرسال الطلب"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}