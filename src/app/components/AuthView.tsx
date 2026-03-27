import React from "react";
import { Gavel } from "lucide-react";
import { Button } from "./ui/button";
import InputField from "./InputField";

const THEME = {
  textPrimary: "text-[#30364F]",
};

type AuthViewProps = {
  isRegister: boolean;
  onToggle: () => void;
  onLogin: () => void;
};

export default function AuthView({
  isRegister,
  onToggle,
  onLogin,
}: AuthViewProps) {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden grid md:grid-cols-2">
        <div className="hidden md:flex bg-[#30364F] relative items-center justify-center p-12 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10 text-center text-white space-y-6">
            <div className="w-20 h-20 bg-white text-[#30364F] mx-auto flex items-center justify-center rounded-xl shadow-xl mb-6">
              <Gavel className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black">رســاء</h2>
            <p className="text-slate-300 leading-relaxed max-w-sm mx-auto text-sm">
              بوابتك الموثوقة للاستثمار العقاري.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className={`text-2xl font-black ${THEME.textPrimary} mb-2`}>
              {isRegister ? "إنشاء حساب جديد" : "تسجيل الدخول"}
            </h1>
          </div>

          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
            {isRegister ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="الاسم الأول" placeholder="محمد" />
                  <InputField label="اسم العائلة" placeholder="القحطاني" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#30364F]">الهوية الوطنية</label>
                  <input
                    type="text"
                    maxLength={10}
                    onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "").slice(0, 10); }}
                    placeholder="1xxxxxxxxx"
                    className="w-full border border-slate-300 px-4 py-2.5 text-sm rounded-md focus:border-[#30364F] focus:outline-none focus:ring-1 focus:ring-[#30364F] bg-white transition-all placeholder:text-slate-400"
                  />
                </div>
                <InputField label="رقم الجوال" placeholder="05xxxxxxxx" />
                <InputField label="البريد الإلكتروني" placeholder="name@example.com" type="email" />
                <InputField label="العنوان" placeholder="المدينة، الحي، الشارع" />
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#30364F]">الهوية الوطنية</label>
                  <input
                    type="text"
                    maxLength={10}
                    onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "").slice(0, 10); }}
                    placeholder="1xxxxxxxxx"
                    className="w-full border border-slate-300 px-4 py-2.5 text-sm rounded-md focus:border-[#30364F] focus:outline-none focus:ring-1 focus:ring-[#30364F] bg-white transition-all placeholder:text-slate-400"
                  />
                </div>
                <InputField label="كلمة المرور" placeholder="••••••••" type="password" />
              </>
            )}

            <Button fullWidth variant="primary" className="mt-6 !py-3">
              {isRegister ? "تسجيل حساب" : "دخول"}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-slate-500">
              {isRegister ? "لديك حساب بالفعل؟" : "مستخدم جديد؟"}
            </span>{" "}
            <button onClick={onToggle} className="font-bold text-[#30364F] hover:underline">
              {isRegister ? "تسجيل الدخول" : "إنشاء حساب"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}