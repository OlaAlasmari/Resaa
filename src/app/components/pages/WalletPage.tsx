import React from "react";
import { Wallet, Plus } from "lucide-react";

export default function WalletPage({
  balance,
  onAddFunds
}: {
  balance: number;
  onAddFunds: () => void;
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in space-y-8">
      <h1 className="text-3xl font-black text-[#30364F]">المحفظة الإلكترونية</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* CARD */}
        <div className="bg-[#30364F] text-white p-8 rounded-2xl shadow-xl md:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="text-sm text-slate-300 font-bold uppercase mb-2">
              الرصيد الكلي
            </div>

            <div className="text-5xl font-black mb-8 tracking-tight">
              {balance.toLocaleString()}{" "}
              <span className="text-2xl font-bold text-slate-400">ر.س</span>
            </div>

            <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-6">
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase mb-1">
                  الرصيد المتاح
                </div>
                <div className="text-xl font-bold text-emerald-400">
                  {(balance - 5000).toLocaleString()} ر.س
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-400 font-bold uppercase mb-1">
                  الرصيد المحجوز
                </div>
                <div className="text-xl font-bold text-amber-400">
                  5,000 ر.س
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION */}
        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm flex flex-col justify-end items-center text-center space-y-6">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-[#30364F] mb-auto">
            <Wallet className="w-8 h-8" />
          </div>

          <button
            onClick={onAddFunds}
            className="w-14 h-14 bg-[#30364F] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            <Plus className="w-6 h-6" />
          </button>

          <span className="text-xs font-bold text-slate-500">
            شحن الرصيد
          </span>
        </div>
      </div>
    </div>
  );
}