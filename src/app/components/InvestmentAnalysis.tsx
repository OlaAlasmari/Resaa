import React from 'react';
import { Target, CheckCircle } from 'lucide-react';

export const InvestmentAnalysis = () => {
   return (
      <div className="p-4 bg-gradient-to-br from-[#30364F] to-[#3d4560] rounded-lg text-white">
         <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" />
            أفضل عائد استثماري ضمن الاستخدام المسموح (سكني)
         </h4>
         <p className="text-xs text-slate-300 mb-3">تحليل ذكي لأفضل استراتيجية استثمارية بناءً على الموقع والمساحة والسوق</p>
         <div className="space-y-2">
            <div className="flex items-start gap-2 bg-white/10 rounded p-2">
               <CheckCircle className="w-4 h-4 text-[#B7E5CD] mt-0.5 shrink-0" />
               <div className="flex-1">
                  <div className="text-sm font-bold text-[#B7E5CD]">بناء عمارة سكنية (8 شقق)</div>
                  <div className="text-xs text-slate-300 mt-0.5">عائد متوقع: 18-22% سنوياً • فترة استرداد: 4-5 سنوات</div>
               </div>
            </div>
            <div className="flex items-start gap-2 bg-white/5 rounded p-2">
               <div className="text-xs text-slate-300">بدائل أخرى: فيلتين منفصلتين (عائد 12-15%) أو تأجير الأرض (عائد 6-8%)</div>
            </div>
         </div>
      </div>
   );
};
