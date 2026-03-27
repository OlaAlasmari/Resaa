import { X, User } from "lucide-react";
import { Button } from "./button"; 

const LoginRequiredModal = ({ isOpen, onClose, onLogin }: { isOpen: boolean, onClose: () => void, onLogin: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-300 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 bg-[#30364F] rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg">
          <User className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-[#30364F] mb-2">تسجيل الدخول مطلوب</h2>

        <p className="text-slate-500 mb-8 text-sm leading-relaxed px-4">
          يجب عليك تسجيل الدخول أو إنشاء حساب جديد للوصول إلى هذه الميزة.
        </p>

        <Button fullWidth onClick={onLogin} className="!bg-[#91C6BC] hover:!bg-[#7BB5AA] !py-3 !rounded-xl text-base shadow-xl shadow-[#91C6BC]/20">
          تسجيل الدخول / إنشاء حساب
        </Button>

        <p className="text-[10px] text-slate-400 mt-6 text-center">
          بمتابعة التسجيل، أنت توافق على سياسة الخصوصية والشروط والأحكام.
        </p>
      </div>
    </div>
  );
};

export default LoginRequiredModal;