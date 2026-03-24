import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

// --- FAQ View ---
export const FaqView = () => {
   const [openIndex, setOpenIndex] = useState<number | null>(null);

   const faqs = [
      { q: "كيف يمكنني التسجيل في المزاد؟", a: "يمكنك التسجيل في المزاد عن طريق إنشاء حساب جديد وتفعيله عبر الهوية الوطنية، ثم شحن محفظتك ودفع العربون الخاص بالمزاد." },
      { q: "ما هي شروط المشاركة في المزادات؟", a: "يجب أن تكون سعودي الجنسية أو مقيماً بإقامة سارية، وأن يكون لديك حساب بنكي نشط، وتوافق على الشروط والأحكام الخاصة بكل مزاد." },
      { q: "كيف يتم استرداد مبلغ العربون؟", a: "في حال عدم الفوز بالمزاد، يتم إعادة مبلغ العربون تلقائياً إلى محفظتك الإلكترونية ويمكنك استرداده إلى حسابك البنكي في أي وقت." },
      { q: "هل المزادات موثوقة؟", a: "نعم، جميع المزادات تتم تحت إشراف مركز الإسناد والتصفية (إنفاذ) وتخضع للأنظمة واللوائح المعمول بها في المملكة العربية السعودية." },
      { q: "ماذا يحدث بعد الفوز بالمزاد؟", a: "بعد الفوز، يجب عليك سداد كامل قيمة العقار خلال الفترة المحددة في كراسة الشروط، وسيتم التواصل معك لإكمال إجراءات الإفراغ." }
   ];

   return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in">
         <div className="text-center mb-12">
            <h1 className="text-3xl font-black text-[#30364F] mb-4">الأسئلة الشائعة</h1>
            <p className="text-slate-500">إجابات على أكثر الأسئلة تكراراً حول المزادات وإجراءاتها.</p>
         </div>

         <div className="space-y-4">
            {faqs.map((faq, index) => (
               <div key={index} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm transition-all hover:border-[#30364F]/20 group">
                  <button 
                     onClick={() => setOpenIndex(openIndex === index ? null : index)}
                     className="w-full flex items-center justify-between p-6 text-right font-bold text-[#30364F] hover:bg-slate-50 transition-colors"
                  >
                     <div className="flex items-center gap-4">
                        <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-black shrink-0 transition-colors ${openIndex === index ? 'bg-[#30364F] text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                           {index + 1}
                        </span>
                        <span className="text-lg">{faq.q}</span>
                     </div>
                     <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-[#30364F]' : 'text-slate-400'}`} />
                  </button>
                  <AnimatePresence>
                     {openIndex === index && (
                        <motion.div 
                           initial={{ height: 0, opacity: 0 }}
                           animate={{ height: "auto", opacity: 1 }}
                           exit={{ height: 0, opacity: 0 }}
                           className="overflow-hidden"
                        >
                           <div className="p-6 pt-2 pb-8 pr-20 text-slate-500 leading-relaxed border-t border-slate-100 bg-slate-50/30 text-base">
                              {faq.a}
                           </div>
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>
            ))}
         </div>
      </div>
   );
};