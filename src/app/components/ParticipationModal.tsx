import React, { useState } from "react";
import {
  User,
  Briefcase,
  Info,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { Button } from "./ui/button";
import InputField from "./InputField";
import { ParticipationRole } from "../types";

type CardProps = {
  title?: string;
  children: React.ReactNode;
  className?: string;
};

const Card = ({ title, children, className = "" }: CardProps) => (
  <div className={`bg-white border border-slate-200 rounded-2xl shadow-sm p-6 ${className}`}>
    {title && <h3 className="text-xl font-black text-[#30364F] mb-6">{title}</h3>}
    {children}
  </div>
);

type ParticipationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  walletBalance: number;
};

export default function ParticipationModal({
  isOpen,
  onClose,
  onConfirm,
  walletBalance,
}: ParticipationModalProps) {
  const [role, setRole] = useState<ParticipationRole>(null);
  const [agreed, setAgreed] = useState(false);

  const [agencyNumber, setAgencyNumber] = useState("");
  const [agencyDate, setAgencyDate] = useState("");
  const [agentConfirmed, setAgentConfirmed] = useState(false);

  const [step, setStep] = useState<1 | 2>(1);
  const depositAmount = 5000;

  if (!isOpen) return null;

  const handleNext = () => {
    setStep(2);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <Card
        className={`w-full ${role === "agent" && step === 1 ? "max-w-md" : "max-w-lg"} shadow-2xl`}
        title={step === 1 ? "طلب المشاركة في المزاد" : "دفع العربون"}
      >
        {step === 1 ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                اختر صفة المشاركة
              </label>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setRole("principal")}
                  className={`p-4 border-2 rounded-xl text-center transition-all ${
                    role === "principal"
                      ? "border-[#30364F] bg-slate-50 text-[#30364F]"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <User className="w-8 h-8 mx-auto mb-2 opacity-80" />
                  <div className="font-bold">أصيل</div>
                </button>

                <button
                  onClick={() => setRole("agent")}
                  className={`p-4 border-2 rounded-xl text-center transition-all ${
                    role === "agent"
                      ? "border-[#30364F] bg-slate-50 text-[#30364F]"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-80" />
                  <div className="font-bold">وكيل</div>
                </button>
              </div>
            </div>

            {role === "agent" && (
              <div className="bg-slate-50 p-4 rounded-lg space-y-4 border border-slate-100 animate-in slide-in-from-top-2">
                <InputField
                  label="رقم الوكالة"
                  placeholder="xxxxxxxx"
                  value={agencyNumber}
                  onChange={(e) => setAgencyNumber(e.target.value)}
                />
                <InputField
                  label="تاريخ الوكالة"
                  placeholder=""
                  type="date"
                  value={agencyDate}
                  onChange={(e) => setAgencyDate(e.target.value)}
                />
                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={agentConfirmed}
                    onChange={(e) => setAgentConfirmed(e.target.checked)}
                  />
                  <span className="text-xs font-bold text-slate-600">
                    أقر بصحة البيانات المدخلة وسريان مفعول الوكالة
                  </span>
                </label>
              </div>
            )}

            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 rounded border-slate-300 text-[#30364F] focus:ring-[#30364F]"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-900">
                  أقر بأنني اطلعت على كراسة الشروط والأحكام الخاصة بالمزاد وأوافق عليها بالكامل.
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button fullWidth variant="secondary" onClick={onClose}>
                إلغاء
              </Button>

              <Button
                fullWidth
                disabled={
                  !role ||
                  !agreed ||
                  (role === "agent" && (!agencyNumber || !agencyDate || !agentConfirmed))
                }
                onClick={handleNext}
                variant="primary"
              >
                التالي: دفع العربون
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-800">
                لضمان الجدية، يلزم دفع عربون دخول المزاد بقيمة{" "}
                <strong className="font-black text-lg mx-1">
                  {depositAmount.toLocaleString()} ر.س
                </strong>
                <br />
                سيتم خصم المبلغ مباشرة من محفظتك الإلكترونية.
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-slate-50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-slate-500">رصيد المحفظة الحالي</span>
                <span
                  className={`font-black ${
                    walletBalance >= depositAmount ? "text-[#30364F]" : "text-red-600"
                  }`}
                >
                  {walletBalance.toLocaleString()} ر.س
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-sm font-bold text-slate-500">مبلغ العربون</span>
                <span className="font-black text-red-600">
                  -{depositAmount.toLocaleString()} ر.س
                </span>
              </div>
            </div>

            {walletBalance < depositAmount && (
              <div className="flex items-center gap-2 text-red-600 text-sm font-bold bg-red-50 p-3 rounded border border-red-100">
                <AlertTriangle className="w-4 h-4" />
                <span>رصيد المحفظة غير كافٍ. يرجى إضافة عربون أولاً.</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button fullWidth variant="secondary" onClick={() => setStep(1)}>
                رجوع
              </Button>

              <Button
                fullWidth
                onClick={onConfirm}
                variant="primary"
                icon={Lock}
                disabled={walletBalance < depositAmount}
              >
                دفع العربون وتأكيد المشاركة
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}