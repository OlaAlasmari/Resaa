import React from "react";
import { motion } from "motion/react";
import { HelpCircle, Phone, Mail } from "lucide-react";

export default function SupportPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
          <HelpCircle className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-black text-[#30364F] mb-4">
          مركز الدعم والمساعدة
        </h1>

        <p className="text-slate-500 mb-8 max-w-lg mx-auto">
          فريق خدمة العملاء جاهز لمساعدتك على مدار الساعة. يمكنك التواصل معنا عبر القنوات التالية.
        </p>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="p-6 border border-slate-200 rounded-xl hover:border-[#30364F] transition-all cursor-pointer group">
            <Phone className="w-8 h-8 text-[#30364F] mb-4" />
            <h3 className="font-bold text-lg mb-1">الاتصال المباشر</h3>
            <p className="text-slate-500 text-sm">920000000</p>
          </div>

          <div className="p-6 border border-slate-200 rounded-xl hover:border-[#30364F] transition-all cursor-pointer group">
            <Mail className="w-8 h-8 text-[#30364F] mb-4" />
            <h3 className="font-bold text-lg mb-1">البريد الإلكتروني</h3>
            <p className="text-slate-500 text-sm">support@rasaa.sa</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}