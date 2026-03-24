import React, { useState } from 'react';

interface InputFieldProps {
  label: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField = ({ label, placeholder = "", type = "text", value, onChange }: InputFieldProps) => (
  <div className="space-y-1.5">
    <label className="text-sm font-bold text-[#30364F]">{label}</label>
    <input 
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full border border-slate-300 px-4 py-2.5 text-sm rounded-md focus:border-[#30364F] focus:outline-none focus:ring-1 focus:ring-[#30364F] bg-white transition-all placeholder:text-slate-400"
    />
  </div>
);

const Button = ({ 
  children, 
  variant = "primary", 
  className = "", 
  fullWidth = false,
  onClick,
  disabled = false
}: { 
  children: React.ReactNode; 
  variant?: "primary" | "secondary"; 
  className?: string;
  fullWidth?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 px-5 py-2.5 font-bold transition-all duration-200 rounded-md text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#91C6BC] text-white hover:bg-[#7BB5AA] shadow-sm",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm",
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

const Card = ({ title, children, className = "" }: { title?: React.ReactNode; children: React.ReactNode; className?: string }) => (
  <div className={`bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden ${className}`}>
    {title && (
      <div className="border-b border-slate-300 px-6 py-4 flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-[#30364F] text-lg">{title}</h3>
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

export const WalletModalNew = ({ balance, onClose, onRecharge, hasBankInfo, onSaveBankInfo }: { 
  balance: number;
  onClose: () => void;
  onRecharge: (amount: number) => void;
  hasBankInfo: boolean;
  onSaveBankInfo: () => void;
}) => {
   const [amount, setAmount] = useState("");
   const [step, setStep] = useState(hasBankInfo ? 2 : 1);
   const [bankName, setBankName] = useState("");
   const [iban, setIban] = useState("");
   const [accountName, setAccountName] = useState("");
   
   const handleSaveBankInfo = () => {
      if (bankName && iban && accountName) {
         onSaveBankInfo();
         setStep(2);
      }
   };
   
   return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
         <Card className="w-full max-w-sm" title={step === 1 ? "البيانات البنكية" : "عربون"}>
            {step === 1 ? (
               <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg mb-4">
                     <p className="text-sm text-blue-800 font-bold">
                        يجب إضافة البيانات البنكية أولاً لتتمكن من سحب الأموال لاحقاً
                     </p>
                  </div>
                  <InputField 
                     label="اسم البنك" 
                     placeholder="مثال: البنك الأهلي" 
                     value={bankName}
                     onChange={(e) => setBankName(e.target.value)}
                  />
                  <InputField 
                     label="رقم الآيبان" 
                     placeholder="SA00 0000 0000 0000 0000 0000" 
                     value={iban}
                     onChange={(e) => setIban(e.target.value)}
                  />
                  <InputField 
                     label="اسم صاحب الحساب" 
                     placeholder="محمد القحطاني" 
                     value={accountName}
                     onChange={(e) => setAccountName(e.target.value)}
                  />
                  <div className="flex gap-3 mt-6">
                     <Button variant="secondary" onClick={onClose} fullWidth>إلغاء</Button>
                     <Button 
                        fullWidth 
                        onClick={handleSaveBankInfo}
                        disabled={!bankName || !iban || !accountName}
                     >
                        حفظ والمتابعة
                     </Button>
                  </div>
               </div>
            ) : (
               <>
                  <div className="text-center py-6 bg-slate-50 rounded-lg mb-6 border border-slate-100">
                     <div className="text-xs font-bold text-slate-400 uppercase mb-1">الرصيد الحالي</div>
                     <div className="text-3xl font-black text-[#30364F]">{balance.toLocaleString()} ر.س</div>
                  </div>
                  <div className="space-y-4">
                     <InputField 
                        label="مبلغ العربون" 
                        placeholder="أدخل المبلغ..." 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                     />
                     <div className="grid grid-cols-3 gap-2">
                        {[1000, 5000, 10000].map(amt => (
                           <button key={amt} onClick={() => setAmount(amt.toString())} className="py-1 text-xs border rounded hover:bg-slate-50 font-bold">{amt}</button>
                        ))}
                     </div>
                     <div className="flex gap-3 mt-4">
                        <Button variant="secondary" onClick={onClose} fullWidth>إلغاء</Button>
                        <Button fullWidth onClick={() => { onRecharge(Number(amount)); onClose(); }}>إضافة عربون</Button>
                     </div>
                  </div>
               </>
            )}
         </Card>
      </div>
   );
};
