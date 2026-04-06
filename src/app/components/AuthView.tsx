import React, { useState } from "react";
import { Gavel } from "lucide-react";
import { Button } from "./ui/button";

const THEME = {
  textPrimary: "text-[#30364F]",
};

type LoginSubmitData = {
  nationalId: string;
  password: string;
};

type RegisterSubmitData = {
  firstName: string;
  lastName: string;
  nationalId: string;
  phone: string;
  email: string;
  password: string;
  address: string;
};

type AuthViewProps = {
  isRegister: boolean;
  onToggle: () => void;
  onLoginSubmit: (data: LoginSubmitData) => void | Promise<void>;
  onRegisterSubmit: (data: RegisterSubmitData) => void | Promise<void>;
};

type FormErrors = {
  firstName?: string;
  lastName?: string;
  nationalId?: string;
  phone?: string;
  email?: string;
  password?: string;
  address?: string;
  general?: string;
};

type FieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  maxLength?: number;
  numericOnly?: boolean;
  error?: string;
};

function FormField({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  maxLength,
  numericOnly = false,
  error,
}: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-bold text-[#30364F]">{label}</label>
      <input
        type={type}
        value={value}
        maxLength={maxLength}
        onChange={(e) => {
          let newValue = e.target.value;

          if (numericOnly) {
            newValue = newValue.replace(/[^0-9]/g, "");
          }

          if (maxLength) {
            newValue = newValue.slice(0, maxLength);
          }

          onChange(newValue);
        }}
        placeholder={placeholder}
        className={`w-full border px-4 py-2.5 text-sm rounded-md focus:outline-none focus:ring-1 bg-white transition-all placeholder:text-slate-400 ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
            : "border-slate-300 focus:border-[#30364F] focus:ring-[#30364F]"
        }`}
      />
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
    </div>
  );
}

export default function AuthView({
  isRegister,
  onToggle,
  onLoginSubmit,
  onRegisterSubmit,
}: AuthViewProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setNationalId("");
    setPhone("");
    setEmail("");
    setPassword("");
    setAddress("");
    setErrors({});
  };

  const clearFieldError = (field: keyof FormErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (isRegister) {
      if (!firstName.trim()) {
        newErrors.firstName = "الاسم الأول مطلوب";
      }

      if (!lastName.trim()) {
        newErrors.lastName = "اسم العائلة مطلوب";
      }

      if (!/^[0-9]{10}$/.test(nationalId)) {
        newErrors.nationalId = "الهوية الوطنية يجب أن تكون 10 أرقام";
      }

      if (!/^05[0-9]{8}$/.test(phone)) {
        newErrors.phone = "رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام";
      }

      if (!email.trim()) {
        newErrors.email = "البريد الإلكتروني مطلوب";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.com[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          newErrors.email = "صيغة البريد الإلكتروني غير صحيحة";
        }
      }

      if (password.length < 6) {
        newErrors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
      }

      if (!address.trim()) {
        newErrors.address = "العنوان مطلوب";
      }
    } else {
      if (!/^[0-9]{10}$/.test(nationalId)) {
        newErrors.nationalId = "أدخلي هوية وطنية صحيحة";
      }

      if (!password.trim()) {
        newErrors.password = "كلمة المرور مطلوبة";
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);

      if (isRegister) {
        await onRegisterSubmit({
          firstName,
          lastName,
          nationalId,
          phone,
          email: email.trim(),
          password,
          address,
        });

        resetForm();
      } else {
        await onLoginSubmit({
          nationalId,
          password,
        });
      }
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
      });
    } finally {
      setLoading(false);
    }
  };

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

          {errors.general && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {errors.general}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isRegister ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="الاسم الأول"
                    placeholder="محمد"
                    value={firstName}
                    onChange={(value) => {
                      setFirstName(value);
                      clearFieldError("firstName");
                    }}
                    error={errors.firstName}
                  />
                  <FormField
                    label="اسم العائلة"
                    placeholder="القحطاني"
                    value={lastName}
                    onChange={(value) => {
                      setLastName(value);
                      clearFieldError("lastName");
                    }}
                    error={errors.lastName}
                  />
                </div>

                <FormField
                  label="الهوية الوطنية"
                  placeholder="1xxxxxxxxx"
                  value={nationalId}
                  onChange={(value) => {
                    setNationalId(value);
                    clearFieldError("nationalId");
                  }}
                  maxLength={10}
                  numericOnly
                  error={errors.nationalId}
                />

                <FormField
                  label="رقم الجوال"
                  placeholder="05xxxxxxxx"
                  value={phone}
                  onChange={(value) => {
                    setPhone(value);
                    clearFieldError("phone");
                  }}
                  maxLength={10}
                  numericOnly
                  error={errors.phone}
                />

                <FormField
                  label="البريد الإلكتروني"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(value) => {
                    setEmail(value);
                    clearFieldError("email");
                  }}
                  type="email"
                  error={errors.email}
                />

                <FormField
                  label="كلمة المرور"
                  placeholder="*********"
                  value={password}
                  onChange={(value) => {
                    setPassword(value);
                    clearFieldError("password");
                  }}
                  type="password"
                  error={errors.password}
                />

                <FormField
                  label="العنوان"
                  placeholder="المدينة، الحي، الشارع"
                  value={address}
                  onChange={(value) => {
                    setAddress(value);
                    clearFieldError("address");
                  }}
                  error={errors.address}
                />
              </>
            ) : (
              <>
                <FormField
                  label="الهوية الوطنية"
                  placeholder="1xxxxxxxxx"
                  value={nationalId}
                  onChange={(value) => {
                    setNationalId(value);
                    clearFieldError("nationalId");
                  }}
                  maxLength={10}
                  numericOnly
                  error={errors.nationalId}
                />

                <FormField
                  label="كلمة المرور"
                  placeholder="••••••••"
                  value={password}
                  onChange={(value) => {
                    setPassword(value);
                    clearFieldError("password");
                  }}
                  type="password"
                  error={errors.password}
                />
              </>
            )}

            <Button fullWidth variant="primary" className="mt-6 !py-3" disabled={loading}>
              {loading
                ? isRegister
                  ? "جارٍ إنشاء الحساب..."
                  : "جارٍ تسجيل الدخول..."
                : isRegister
                ? "تسجيل حساب"
                : "دخول"}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-slate-500">
              {isRegister ? "لديك حساب بالفعل؟" : "مستخدم جديد؟"}
            </span>{" "}
            <button
              type="button"
              onClick={onToggle}
              className="font-bold text-[#30364F] hover:underline"
            >
              {isRegister ? "تسجيل الدخول" : "إنشاء حساب"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}