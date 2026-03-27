import React, { useState } from "react";
import {
   Menu, Search, MapPin, Gavel, Bell, User, ShieldCheck,
   TrendingUp, Home, AlertTriangle, Filter, ChevronDown,
   Calendar, DollarSign, BarChart3, Clock, ArrowRight,
   FileText, CheckCircle, LayoutDashboard, Heart, Wallet,
   LogOut, Plus, Minus, X, Briefcase, ChevronLeft, HelpCircle,
   Building, Check, Info, Users, ArrowUpRight, Map, Camera, FileBarChart,
   Phone, Mail, Globe, Target, Eye, ChevronUp, CreditCard, Lock, ChevronRight
} from "lucide-react";
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { FaqView } from './components/FaqView';
import { WalletModalNew } from './components/WalletModalNew';
import { InvestmentAnalysis } from './components/InvestmentAnalysis';
import { motion, AnimatePresence } from "motion/react";
import {
   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
   LineChart, Line, AreaChart, Area
} from 'recharts';
import { ViewState, ParticipationRole, SellerRole } from "./types";
import { Button } from "./components/ui/button";
import {
   Card,
   CardHeader,
   CardTitle,
   CardDescription,
   CardContent,
   CardFooter,
   CardAction,
} from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import LoginRequiredModal from "./components/ui/LoginRequiredModal";
import Homepage from "./components/pages/Homepage";
import AuctionsPage from "./components/pages/AuctionsPage";
import LoginPage from "./components/pages/LoginPage";
import RegisterPage from "./components/pages/RegisterPage";
import ListingAuctionCard from "./components/ListingAuctionCard";


// --- Types ---


// --- Assets ---
const ASSETS = {
   detailRef: "figma:asset/847f6780f0acaecd11d2c4c7b0718985c1af7a04.png",
   heroBg: "https://images.unsplash.com/photo-1722009591790-f47342aa9d3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYXVkaSUyMGFyYWJpYSUyMGx1eHVyeSUyMHJlYWwlMjBlc3RhdGV8ZW58MXx8fHwxNzcxOTcyNjA5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
   landPlaceholder: "figma:asset/dab0778c43e35d66c56bca4cbfdd164d2e85c03f.png",
   commercial: "figma:asset/a.png",
   listingRef: "figma:asset/e29d10f638fdcdc5bc4c3bcba9d7ba89ddba3171.png",
   aiBanner: "figma:asset/e8f3f172d276c82678d8b23bf9e86fcdaeec84de.png",
   villa: "https://images.unsplash.com/photo-1575356864509-f1727fd74ee4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB2aWxsYSUyMGV4dGVyaW9yJTIwc2F1ZGl8ZW58MXx8fHwxNzcxOTcyNjEwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
   residential: "https://images.unsplash.com/photo-1755567818043-a86c648900de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNpZGVudGlhbCUyMGFwYXJ0bWVudCUyMGJ1aWxkaW5nfGVufDF8fHx8MTc3MTkxMDA0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
   commercialBuilding: "https://images.unsplash.com/photo-1764983265127-8ec30a9c7b64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tZXJjaWFsJTIwcHJvcGVydHklMjBidWlsZGluZ3xlbnwxfHx8fDE3NzE5MTAzMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
   landPlot: "https://images.unsplash.com/photo-1764222233275-87dc016c11dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5kJTIwcGxvdCUyMGRldmVsb3BtZW50fGVufDF8fHx8MTc3MTk3MjYxMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
};

// --- Theme Constants (Dark Blue Palette) ---
const THEME = {
   primary: "bg-[#91C6BC]", // Teal/Mint Green for buttons
   primaryHover: "hover:bg-[#7BB5AA]", // Darker Teal for hover
   textPrimary: "text-[#30364F]",
   textSecondary: "text-[#475569]", // Slate 600
   bgLight: "bg-[#f1f5f9]", // Slate 100
   border: "border-[#cbd5e1]", // Slate 300
   accent: "bg-[#334155]", // Slate 700
   accentText: "text-[#f8fafc]",
   secondary: "bg-[#B7E5CD]", // Light Blue-Green
   secondaryText: "text-[#B7E5CD]",
   navbarBg: "bg-[#30364F]", // Deep Blue for navbar
   footerBg: "bg-[#30364F]" // Deep Blue for footer
};

// --- UI Components ---



const InputField = ({ label, placeholder, type = "text", value, onChange }: { label: string; placeholder: string; type?: string, value?: string, onChange?: (e: any) => void }) => (
   <div className="space-y-1.5">
      <label className={`text-sm font-bold ${THEME.textPrimary}`}>{label}</label>
      <input
         type={type}
         placeholder={placeholder}
         value={value}
         onChange={onChange}
         className={`w-full border ${THEME.border} px-4 py-2.5 text-sm rounded-md focus:border-[#30364F] focus:outline-none focus:ring-1 focus:ring-[#30364F] bg-white transition-all placeholder:text-slate-400`}
      />
   </div>
);

// --- Side Panel (Strict Navigation Menu) ---
const SidePanel = ({
   isOpen,
   onClose,
   user,
   onLogout,
   onNavigate
}: {
   isOpen: boolean,
   onClose: () => void,
   user: any,
   onLogout: () => void,
   onNavigate: (view: ViewState) => void
}) => {
   if (!isOpen) return null;

   const menuItems = [
      { id: 'profile', label: 'الملف الشخصي', icon: User },
      { id: 'bid-history', label: 'سجل المزايدات', icon: Gavel },
      { id: 'support', label: 'الدعم والمساعدة', icon: HelpCircle },
   ];

   return (
      <div className="fixed inset-0 z-[100] flex justify-end">
         <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose}></div>

         <div className="relative w-80 bg-[#f8fafc] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-8 flex flex-col items-center border-b border-slate-200 bg-white">
               <div className="w-20 h-20 bg-[#30364F] text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-lg relative group">
                  {user.name ? user.name[0] : 'U'}
                  <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm">
                     <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                  </div>
               </div>
               <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-[#30364F] text-lg">{user.name}</h3>
                  <Badge variant="success" className="flex items-center gap-1 !px-1.5 !py-0.5 !text-[10px]">
                     <Check className="w-3 h-3" /> Verified
                  </Badge>
               </div>
               <p className="text-sm text-slate-500">{user.email}</p>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
               {menuItems.map((item) => (
                  <button
                     key={item.id}
                     onClick={() => {
                        onNavigate(item.id as ViewState);
                        onClose();
                     }}
                     className="w-full flex items-center gap-4 p-4 rounded-xl text-slate-600 hover:bg-white hover:text-[#30364F] hover:shadow-sm transition-all duration-200 group"
                  >
                     <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-[#30364F] group-hover:text-white transition-colors">
                        <item.icon className="w-5 h-5" />
                     </div>
                     <span className="font-bold text-sm">{item.label}</span>
                     <ChevronLeft className="w-4 h-4 mr-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
               ))}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-slate-200">
               <button
                  onClick={onLogout}
                  className="flex items-center gap-3 w-full p-4 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold text-sm"
               >
                  <LogOut className="w-5 h-5" />
                  تسجيل الخروج
               </button>
            </div>
         </div>
      </div>
   );
};

// --- View: User Profile ---
const ProfileView = ({ user }: { user: any }) => {
   const [activeTab, setActiveTab] = useState<'personal' | 'banking'>('personal');
   const [editMode, setEditMode] = useState(false);
   const [showCalendar, setShowCalendar] = useState(false);
   const [dob, setDob] = useState('1410/01/01');

   return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in bg-[#f8fafc]">
         <div className="flex flex-col lg:flex-row gap-8 items-stretch">

            {/* Left Sidebar */}
            <div className="w-full lg:w-80 shrink-0 flex flex-col">
               <div className="bg-white rounded-[30px] p-6 shadow-sm border border-slate-100 flex flex-col items-center sticky top-24 h-full">
                  <div className="relative mb-4 mt-4">
                     <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner bg-[#30364F] flex items-center justify-center text-white text-4xl font-bold">
                        {user.name ? user.name[0] : 'U'}
                     </div>
                     <button className="absolute bottom-1 right-1 w-8 h-8 bg-[#30364F] text-white rounded-full flex items-center justify-center border-2 border-white shadow-md hover:scale-105 transition-transform">
                        <Camera className="w-4 h-4" />
                     </button>
                  </div>
                  <h2 className="text-xl font-black text-[#30364F] mb-1">{user.name}</h2>
                  <p className="text-slate-400 text-sm font-bold mb-10">المستثمر</p>

                  <div className="w-full space-y-2 mb-8">
                     <button
                        onClick={() => setActiveTab('personal')}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200 ${activeTab === 'personal' ? 'bg-[#30364F]/5 text-[#30364F]' : 'text-slate-400 hover:bg-slate-50'}`}
                     >
                        <User className={`w-5 h-5 ${activeTab === 'personal' ? 'fill-current' : ''}`} />
                        <span className="font-bold text-sm">المعلومات الشخصية</span>
                        {activeTab === 'personal' && <div className="w-1.5 h-1.5 rounded-full bg-[#30364F] mr-auto shadow-[0_0_8px_rgba(48,54,79,0.5)]"></div>}
                     </button>

                     <button
                        onClick={() => setActiveTab('banking')}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200 ${activeTab === 'banking' ? 'bg-[#30364F]/5 text-[#30364F]' : 'text-slate-400 hover:bg-slate-50'}`}
                     >
                        <CreditCard className={`w-5 h-5 ${activeTab === 'banking' ? 'fill-current' : ''}`} />
                        <span className="font-bold text-sm">الحسابات البنكية</span>
                        {activeTab === 'banking' && <div className="w-1.5 h-1.5 rounded-full bg-[#30364F] mr-auto shadow-[0_0_8px_rgba(48,54,79,0.5)]"></div>}
                     </button>
                  </div>
               </div>
            </div>

            {/* Right Content */}
            <div className="flex-1 flex flex-col">
               <div className="bg-white rounded-[30px] p-8 lg:p-10 shadow-sm border border-slate-100 h-full">
                  {activeTab === 'personal' && (
                     <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 h-full flex flex-col">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-6">
                           <h2 className="text-2xl font-black text-[#30364F]">المعلومات الشخصية</h2>
                           <Button variant={editMode ? "danger" : "primary"} onClick={() => setEditMode(!editMode)} icon={editMode ? X : User}>
                              {editMode ? "إلغاء التعديل" : "تعديل البيانات"}
                           </Button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 flex-1">
                           <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-400 ml-1">الاسم الأول</label>
                              <input disabled={!editMode} type="text" defaultValue="محمد" className="w-full bg-[#F6F7F9] rounded-xl px-5 py-3.5 text-sm font-bold text-[#30364F] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#30364F]/20 transition-all" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-400 ml-1">اسم العائلة</label>
                              <input disabled={!editMode} type="text" defaultValue="القحطاني" className="w-full bg-[#F6F7F9] rounded-xl px-5 py-3.5 text-sm font-bold text-[#30364F] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#30364F]/20 transition-all" />
                           </div>

                           <div className="md:col-span-2 space-y-2">
                              <label className="text-xs font-bold text-slate-400 ml-1">البريد الإلكتروني</label>
                              <div className="relative">
                                 <input disabled type="email" defaultValue={user.email} className="w-full bg-[#F6F7F9] rounded-xl px-5 py-3.5 text-sm font-bold text-[#30364F] focus:outline-none focus:ring-2 focus:ring-[#30364F]/20 transition-all" />
                                 <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md text-[10px] font-bold">
                                    <CheckCircle className="w-3 h-3 fill-current" /> Verified
                                 </div>
                              </div>
                           </div>

                           <div className="md:col-span-2 space-y-2">
                              <label className="text-xs font-bold text-slate-400 ml-1">العنوان الوطني</label>
                              <input disabled={!editMode} type="text" defaultValue="الرياض، حي الملز، شارع الجامعة" className="w-full bg-[#F6F7F9] rounded-xl px-5 py-3.5 text-sm font-bold text-[#30364F] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#30364F]/20 transition-all" />
                           </div>

                           <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-400 ml-1">رقم الجوال</label>
                              <div className="flex gap-2 dir-ltr">
                                 <select
                                    disabled={!editMode}
                                    className="w-24 bg-[#F6F7F9] rounded-xl px-2 py-3.5 text-sm font-bold text-[#30364F] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#30364F]/20 cursor-pointer"
                                 >
                                    <option value="+966">+966</option>
                                    <option value="+971">+971</option>
                                    <option value="+965">+965</option>
                                 </select>
                                 <input
                                    disabled={!editMode}
                                    type="tel"
                                    defaultValue={user.phone.replace('+966 ', '')}
                                    maxLength={10}
                                    placeholder="5xxxxxxxx"
                                    className="flex-1 bg-[#F6F7F9] rounded-xl px-5 py-3.5 text-sm font-bold text-[#30364F] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#30364F]/20 transition-all text-left"
                                 />
                              </div>
                           </div>

                           <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-400 ml-1">الهوية الوطنية</label>
                              <input
                                 disabled={!editMode}
                                 type="text"
                                 defaultValue={user.id}
                                 maxLength={10}
                                 pattern="\d*"
                                 onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 10); }}
                                 className="w-full bg-[#F6F7F9] rounded-xl px-5 py-3.5 text-sm font-bold text-[#30364F] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#30364F]/20 transition-all"
                              />
                           </div>

                           <div className="md:col-span-2 space-y-2 relative">
                              <label className="text-xs font-bold text-slate-400 ml-1">تاريخ الميلاد</label>
                              <div className="relative" onClick={() => editMode && setShowCalendar(!showCalendar)}>
                                 <input
                                    disabled={!editMode}
                                    type="text"
                                    value={dob}
                                    readOnly
                                    className="w-full bg-[#F6F7F9] rounded-xl px-5 py-3.5 text-sm font-bold text-[#30364F] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#30364F]/20 transition-all cursor-pointer"
                                 />
                                 <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                              </div>
                              {showCalendar && (
                                 <CalendarWidget onClose={() => setShowCalendar(false)} onSelect={(d) => setDob(d)} position="top" />
                              )}
                           </div>
                        </div>

                        {editMode && (
                           <div className="flex gap-4 mt-12 pt-6 border-t border-slate-100 animate-in slide-in-from-bottom-2">
                              <button onClick={() => setEditMode(false)} className="flex-1 py-3.5 rounded-xl border border-[#30364F] text-[#30364F] font-bold hover:bg-slate-50 transition-all">
                                 إلغاء التغييرات
                              </button>
                              <button onClick={() => setEditMode(false)} className="flex-1 py-3.5 rounded-xl bg-[#30364F] text-white font-bold shadow-lg shadow-slate-200 hover:bg-[#1E2437] transition-all">
                                 حفظ التغييرات
                              </button>
                           </div>
                        )}
                     </div>
                  )}

                  {activeTab === 'banking' && (
                     <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 h-full flex flex-col">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-6">
                           <h2 className="text-2xl font-black text-[#30364F]">الحسابات البنكية</h2>
                           <Badge variant="success" className="flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> آمن ومشفر
                           </Badge>
                        </div>

                        <div className="bg-[#f0fdf4] border border-emerald-100 rounded-xl p-4 flex gap-3">
                           <Info className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                           <p className="text-sm text-emerald-800 font-medium">يرجى التأكد من أن اسم صاحب الحساب البنكي يطابق الاسم المسجل في ملفك الشخصي لتجنب تأخير المعاملات.</p>
                        </div>

                        <div className="space-y-6 flex-1">
                           <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-400 ml-1">اختر البنك</label>
                              <div className="relative">
                                 <select className="w-full bg-[#F6F7F9] rounded-xl px-5 py-3.5 text-sm font-bold text-[#30364F] focus:outline-none focus:ring-2 focus:ring-[#30364F]/20 appearance-none cursor-pointer">
                                    <option>مصرف الراجحي</option>
                                    <option>البنك الأهلي السعودي</option>
                                    <option>بنك الرياض</option>
                                 </select>
                                 <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                              </div>
                           </div>

                           <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-400 ml-1">رقم الآيبان (IBAN)</label>
                              <div className="relative">
                                 <input type="text" placeholder="SA00 0000 0000 0000 0000 0000" className="w-full bg-[#F6F7F9] rounded-xl px-5 py-3.5 text-sm font-bold text-[#30364F] focus:outline-none focus:ring-2 focus:ring-[#30364F]/20 transition-all font-mono dir-ltr text-right" />
                                 <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" />
                              </div>
                           </div>

                           <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-400 ml-1">اسم صاحب الحساب</label>
                              <input type="text" defaultValue={user.name} className="w-full bg-[#F6F7F9] rounded-xl px-5 py-3.5 text-sm font-bold text-[#30364F] focus:outline-none focus:ring-2 focus:ring-[#30364F]/20 transition-all" />
                           </div>
                        </div>

                        <div className="flex gap-4 mt-12 pt-6 border-t border-slate-100">
                           <button className="flex-1 py-3.5 rounded-xl border border-slate-300 text-slate-500 font-bold hover:bg-slate-50 transition-all">
                              إلغاء
                           </button>
                           <button className="flex-1 py-3.5 rounded-xl bg-[#30364F] text-white font-bold shadow-lg shadow-slate-200 hover:bg-[#1E2437] transition-all">
                              إضافة حساب بنكي
                           </button>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};

// --- Calendar Widget (Custom UI) ---
const CalendarWidget = ({ onClose, onSelect, position = 'bottom' }: { onClose: () => void, onSelect: (date: string) => void, position?: 'top' | 'bottom' }) => {
   const [selectedDay, setSelectedDay] = useState(15);
   const [currentYear, setCurrentYear] = useState(2026);
   const [currentMonth, setCurrentMonth] = useState(0); // 0 = Jan

   const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
   const years = Array.from({ length: 80 }, (_, i) => 1950 + i);

   // Simple day generation
   const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
   const startDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

   const positionClasses = position === 'top' ? 'bottom-full mb-2 origin-bottom-left' : 'top-full mt-2 origin-top-left';

   return (
      <div className={`absolute ${positionClasses} left-0 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 w-[280px] animate-in zoom-in-95 duration-200`}>
         {/* Header with Selectors */}
         <div className="flex justify-between items-center mb-4 gap-2">
            <div className="flex gap-2 w-full">
               <select
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(Number(e.target.value))}
                  className="flex-1 bg-slate-50 border border-slate-200 text-[#30364F] font-bold text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#30364F] cursor-pointer"
               >
                  {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
               </select>
               <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(Number(e.target.value))}
                  className="w-20 bg-slate-50 border border-slate-200 text-[#30364F] font-bold text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#30364F] cursor-pointer"
               >
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
               </select>
            </div>
         </div>

         {/* Days of Week */}
         <div className="grid grid-cols-7 mb-2 text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
               <div key={i} className="text-[10px] font-bold text-slate-400 uppercase py-1">{d}</div>
            ))}
         </div>

         {/* Days Grid */}
         <div className="grid grid-cols-7 gap-1 mb-4">
            {/* Empty cells for offset */}
            {Array.from({ length: startDay }).map((_, i) => <div key={`e-${i}`}></div>)}

            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
               <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all mx-auto
                   ${selectedDay === day
                        ? 'bg-[#30364F] text-white shadow-md shadow-slate-200'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-[#30364F]'
                     }`}
               >
                  {day}
               </button>
            ))}
         </div>

         {/* Footer */}
         <button
            onClick={() => { onSelect(`${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`); onClose(); }}
            className="w-full py-2.5 bg-[#30364F] text-white rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-[#1E2437] transition-all text-xs"
         >
            Apply Date
         </button>
      </div>
   );
};

// --- View: Bid History ---
const BidHistoryView = () => {
   const [showCalendar, setShowCalendar] = useState(false);
   const [selectedDate, setSelectedDate] = useState('');
   const [expandedBid, setExpandedBid] = useState<number | null>(null);

   const bidData = [
      {
         id: 1,
         title: 'فيلا سكنية - حي القيروان',
         date: '2026/02/02',
         amount: 2450000,
         status: 'won',
         image: 'https://images.unsplash.com/photo-1656158113009-c8f5b3268aca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzYXVkaSUyMHJlc2lkZW50aWFsJTIwcHJvcGVydHl8ZW58MXx8fHwxNzcxOTcxNzg1fDA&ixlib=rb-4.1.0&q=80&w=1080',
         bidHistory: [
            { date: '2026/02/02 - 14:30', amount: 2450000 },
            { date: '2026/02/02 - 14:15', amount: 2400000 },
            { date: '2026/02/02 - 14:00', amount: 2350000 }
         ]
      },
      {
         id: 2,
         title: 'أرض تجارية - شمال الرياض',
         date: '2026/01/15',
         amount: 1800000,
         status: 'lost',
         image: 'https://images.unsplash.com/photo-1674635847424-d82d56e38ad5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB2aWxsYSUyMHJpeWFkaHxlbnwxfHx8fDE3NzE5NzE3OTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
         bidHistory: [
            { date: '2026/01/15 - 16:45', amount: 1800000 },
            { date: '2026/01/15 - 16:20', amount: 1750000 }
         ]
      },
      {
         id: 3,
         title: 'مجمع تجاري - جدة',
         date: '2025/12/20',
         amount: 5600000,
         status: 'lost',
         image: 'https://images.unsplash.com/photo-1656646425022-3b4cff0bc8e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tZXJjaWFsJTIwcmVhbCUyMGVzdGF0ZSUyMHByb3BlcnR5fGVufDF8fHx8MTc3MTk3MTc5NXww&ixlib=rb-4.1.0&q=80&w=1080',
         bidHistory: [
            { date: '2025/12/20 - 11:30', amount: 5600000 },
            { date: '2025/12/20 - 11:00', amount: 5500000 },
            { date: '2025/12/20 - 10:45', amount: 5400000 }
         ]
      }
   ];

   return (
      <div className="max-w-6xl mx-auto px-4 py-12 animate-in fade-in space-y-8 bg-[#f8fafc] min-h-screen">
         <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-200 pb-8 gap-4">
            <div>
               <h1 className="text-3xl font-black text-[#30364F] mb-2">سجل المزايدات</h1>
               <p className="text-slate-500">سجل كامل بجميع المزادات التي قمت بالمشاركة فيها ونتائجها.</p>
            </div>

            {/* Date Filter */}
            <div className="flex flex-col gap-1 w-full md:w-auto relative">
               <label className="text-xs font-bold text-slate-500 uppercase">تصفية حسب التاريخ</label>
               <div className="relative" onClick={() => setShowCalendar(!showCalendar)}>
                  <Calendar className="absolute top-2.5 left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  <div className="w-full md:w-64 pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm font-bold text-[#30364F] bg-white cursor-pointer hover:border-[#30364F] transition-colors flex items-center min-h-[40px]">
                     {selectedDate || ""}
                  </div>
               </div>
               {showCalendar && <CalendarWidget onClose={() => setShowCalendar(false)} onSelect={setSelectedDate} />}
            </div>
         </div>

         <div className="grid gap-4">
            {bidData.map((item) => (
               <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:border-[#30364F]/30 transition-all">
                  <div className="p-6 flex flex-col md:flex-row items-center gap-6">
                     <div className="flex items-center gap-4 flex-1 w-full">
                        <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                           <ImageWithFallback src={item.image} className="w-full h-full object-cover" alt="Auction" />
                        </div>
                        <div>
                           <h3 className="font-bold text-lg text-[#30364F] mb-1">{item.title}</h3>
                           <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Clock className="w-3 h-3" />
                              <span className="font-mono">{item.date}</span>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 md:flex items-center gap-8 w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                        <div className="text-right md:text-center">
                           <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">قيمة المزايدة</div>
                           <div className="text-xl font-black text-[#30364F] font-mono">{item.amount.toLocaleString()} ر.س</div>
                        </div>

                        <div className="text-left md:text-center">
                           <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">نتيجة المزاد</div>
                           {item.status === 'won' ? (
                              <Badge variant="success" className="inline-flex items-center gap-1.5 !px-3 !py-1 !text-xs">
                                 <CheckCircle className="w-3.5 h-3.5" /> فوز بالمزاد
                              </Badge>
                           ) : (
                              <Badge variant="neutral" className="inline-flex items-center gap-1.5 !px-3 !py-1 !text-xs !bg-slate-100 !text-slate-500">
                                 <X className="w-3.5 h-3.5" /> لم يتم الفوز
                              </Badge>
                           )}
                        </div>
                     </div>

                     <div className="hidden md:block">
                        <button
                           onClick={() => setExpandedBid(expandedBid === item.id ? null : item.id)}
                           className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-[#30364F] transition-all"
                        >
                           <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expandedBid === item.id ? 'rotate-180' : ''}`} />
                        </button>
                     </div>
                  </div>

                  {/* Expanded Bid History */}
                  <AnimatePresence>
                     {expandedBid === item.id && (
                        <motion.div
                           initial={{ height: 0, opacity: 0 }}
                           animate={{ height: 'auto', opacity: 1 }}
                           exit={{ height: 0, opacity: 0 }}
                           transition={{ duration: 0.3 }}
                           className="overflow-hidden"
                        >
                           <div className="px-6 pb-6 pt-0 border-t border-slate-100">
                              <div className="bg-[#B7E5CD]/10 rounded-lg p-4 mt-4">
                                 <h4 className="text-sm font-bold text-[#30364F] mb-3 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    تاريخ المزايدات
                                 </h4>
                                 <div className="space-y-2">
                                    {item.bidHistory.map((bid, idx) => (
                                       <div key={idx} className="flex justify-between items-center bg-white rounded-lg p-3 text-sm">
                                          <span className="text-slate-600 font-mono text-xs">{bid.date}</span>
                                          <span className="font-black text-[#30364F]">{bid.amount.toLocaleString()} ر.س</span>
                                       </div>
                                    ))}
                                 </div>
                              </div>
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

// --- View: Wallet ---
const WalletView = ({ balance, onAddFunds }: { balance: number, onAddFunds: () => void }) => (
   <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in space-y-8">
      <h1 className="text-3xl font-black text-[#30364F]">المحفظة الإلكترونية</h1>

      <div className="grid md:grid-cols-3 gap-6">
         <div className="bg-[#30364F] text-white p-8 rounded-2xl shadow-xl md:col-span-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="relative z-10">
               <div className="text-sm text-slate-300 font-bold uppercase mb-2">الرصيد الكلي</div>
               <div className="text-5xl font-black mb-8 tracking-tight">{balance.toLocaleString()} <span className="text-2xl font-bold text-slate-400">ر.س</span></div>

               <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-6">
                  <div>
                     <div className="text-xs text-slate-400 font-bold uppercase mb-1">الرصيد المتاح</div>
                     <div className="text-xl font-bold text-emerald-400">{(balance - 5000).toLocaleString()} ر.س</div>
                  </div>
                  <div>
                     <div className="text-xs text-slate-400 font-bold uppercase mb-1">الرصيد المحجوز</div>
                     <div className="text-xl font-bold text-amber-400">5,000 ر.س</div>
                  </div>
               </div>
            </div>
         </div>

         <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm flex flex-col justify-end items-center text-center space-y-6">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-[#30364F] mb-auto">
               <Wallet className="w-8 h-8" />
            </div>

            <button
               onClick={onAddFunds}
               className="w-14 h-14 bg-[#30364F] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
               title="شحن الرصيد"
            >
               <Plus className="w-6 h-6" />
            </button>
            <span className="text-xs font-bold text-slate-500">شحن الرصيد</span>
         </div>
      </div>
   </div>
);

// --- Login Required Modal ---


// --- Navbar ---
const Navbar = ({
   onNavigate,
   currentView,
   isLoggedIn,
   walletBalance,
   onOpenWallet,
   onOpenSidePanel
}: {
   onNavigate: (view: ViewState) => void,
   currentView: ViewState,
   isLoggedIn: boolean,
   walletBalance: number,
   onOpenWallet: () => void,
   onOpenSidePanel: () => void
}) => (
   <nav className={`border-b border-[#1E2437] ${THEME.navbarBg} sticky top-0 z-50`}>

      {/* 👇 أهم تعديل هنا (full width) */}
      <div className="w-full px-6 md:px-10 h-20 flex items-center justify-between">

         {/* Brand - LEFT */}
         <div
            className="flex items-center gap-3 cursor-pointer group min-w-fit"
            onClick={() => onNavigate('home')}
         >
            <div className={`w-10 h-10 bg-white flex items-center justify-center text-[#30364F] rounded-md shadow-md`}>
               <Gavel className="w-5 h-5" />
            </div>
            <div className="flex flex-col items-start">
               <span className="font-black text-2xl tracking-tighter leading-none text-white">رســاء</span>
               <span className="text-[10px] font-bold uppercase tracking-widest text-[#91C6BC]">منصة المزادات</span>
            </div>
         </div>


         {/* Navigation - CENTER */}
         <div className="hidden md:flex flex-1 justify-start items-center gap-15 -translate-x-30">
            {[
               { id: 'home', label: 'الرئيسية' },
               { id: 'auction-browse', label: 'المزادات' },
               { id: 'my-auctions', label: 'مزاداتي' },
               { id: 'faq', label: 'الأسئلة الشائعة' },
            ].map((item) => (
               <button
                  key={item.id}
                  onClick={() => onNavigate(item.id as ViewState)}
                  className={`text-sm font-bold transition-colors ${currentView === item.id
                     ? 'text-[#91C6BC]'
                     : 'text-white/80 hover:text-white'
                     }`}
               >
                  {item.label}
               </button>
            ))}

            <button
               onClick={() => onNavigate('favorites')}
               className={`text-white/80 hover:text-red-500 transition-colors ${currentView === 'favorites' ? 'text-red-500' : ''
                  }`}
               title="المفضلة"
            >
               <Heart className="w-5 h-5" />
            </button>
         </div>

         {/* Actions - RIGHT */}
         <div className="flex items-center gap-3 min-w-fit">
            <button
               className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
               onClick={onOpenWallet}
            >
               <Wallet className="w-4 h-4 text-white" />
               <span className="font-bold text-sm text-white">
                  {isLoggedIn ? `${walletBalance.toLocaleString()} ر.س` : 'المحفظة'}
               </span>
            </button>

            {isLoggedIn ? (
               <>
                  <button className="relative p-2 text-white/80 hover:bg-white/10 rounded-full">
                     <Bell className="w-5 h-5" />
                  </button>
                  <div className="w-px h-6 bg-white/20 mx-1"></div>

                  <button
                     onClick={onOpenSidePanel}
                     className="flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-white/90 text-[#30364F] transition-colors"
                  >
                     <User className="w-5 h-5" />
                  </button>
               </>
            ) : (
               <Button onClick={() => onNavigate('login')} variant="primary" icon={User}>
                  تسجيل الدخول
               </Button>
            )}
         </div>

      </div>

   </nav>

);

// --- Horizontal Filter Bar ---

// --- Component: Asset Reference Card (Listing) ---

// --- Component: Vision Mission (New) ---

// --- Detail View ---

const DetailView = ({ onBack, onParticipate, isFavorite, onToggleFavorite }: { onBack: () => void, onParticipate: () => void, isFavorite: boolean, onToggleFavorite: () => void }) => {
   const [showAI, setShowAI] = useState(false);

   return (
      <div className="bg-[#f8fafc] min-h-screen pb-20">
         <div className={`bg-white border-b ${THEME.border} py-4 px-4 sticky top-20 z-30 shadow-sm`}>
            <div className="max-w-7xl mx-auto flex justify-between items-center">
               <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#30364F] transition-colors">
                  <ChevronLeft className="w-4 h-4" /> العودة للمزادات
               </button>
               <h1 className={`font-bold text-lg ${THEME.textPrimary}`}>تفاصيل المزاد #4482</h1>
               <button onClick={onToggleFavorite} className={`flex items-center gap-2 text-sm font-bold transition-colors ${isFavorite ? 'text-red-600' : 'text-slate-500 hover:text-red-600'}`}>
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} /> <span>{isFavorite ? 'تمت الإضافة للمفضلة' : 'إضافة للمفضلة'}</span>
               </button>
            </div>
         </div>

         <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
            <Card title="الأصول المدرجة" className="space-y-6">
               <div className="grid md:grid-cols-12 gap-6 border-b border-slate-100 pb-8 last:border-0">
                  {/* Image & Map Section */}
                  <div className="md:col-span-5 space-y-4">
                     <div className="h-96 relative rounded-lg overflow-hidden group border border-slate-200">
                        <ImageWithFallback src={ASSETS.heroBg} className="w-full h-full object-cover" alt="Asset" />
                        <div onClick={onToggleFavorite} className={`absolute top-2 right-2 p-2 rounded-full cursor-pointer transition-colors shadow-sm ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-400 hover:text-red-500'}`}>
                           <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                           1 من 5 صور
                        </div>
                     </div>
                     {/* Google Map Integration */}
                     <div className="h-48 rounded-lg overflow-hidden border border-slate-200 relative bg-slate-100">
                        <iframe
                           width="100%"
                           height="100%"
                           frameBorder="0"
                           scrolling="no"
                           marginHeight={0}
                           marginWidth={0}
                           src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=en&amp;q=Riyadh%20Saudi%20Arabia+(Rasaa%20Auction)&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
                           className="w-full h-full opacity-90 hover:opacity-100 transition-opacity"
                        ></iframe>
                        <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-[10px] font-bold shadow-sm pointer-events-none">
                           موقع العقار
                        </div>
                     </div>
                  </div>

                  {/* Details Section */}
                  <div className="md:col-span-7 space-y-6">
                     <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                        <div>
                           <h3 className="text-2xl font-black text-[#30364F] mb-1">فيلا سكنية - حي القيروان</h3>
                           <div className="flex items-center gap-1 text-sm text-slate-500">
                              <MapPin className="w-4 h-4" /> الرياض، حي القيروان
                           </div>
                        </div>
                        <div className="text-left bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                           <div className="text-[10px] text-slate-400 font-bold uppercase">السعر الحالي</div>
                           <div className="text-2xl font-black text-[#30364F]">2,350,000 ر.س</div>
                        </div>
                     </div>

                     {/* Structured Data Table (From Reference) */}
                     <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                        <div className="flex justify-between border-b border-dotted border-slate-200 pb-1">
                           <span className="text-slate-500">النوع</span>
                           <span className="font-bold text-slate-800">فيلا</span>
                        </div>
                        <div className="flex justify-between border-b border-dotted border-slate-200 pb-1">
                           <span className="text-slate-500">المساحة م2</span>
                           <span className="font-bold text-slate-800 dir-ltr">1,182.13</span>
                        </div>
                        <div className="flex justify-between border-b border-dotted border-slate-200 pb-1">
                           <span className="text-slate-500">رقم الصك</span>
                           <span className="font-bold text-slate-800 font-mono">8802695657600000</span>
                        </div>
                        <div className="flex justify-between border-b border-dotted border-slate-200 pb-1">
                           <span className="text-slate-500">الاستخدام</span>
                           <span className="font-bold text-slate-800">سكني</span>
                        </div>
                        <div className="flex justify-between border-b border-dotted border-slate-200 pb-1">
                           <span className="text-slate-500">السعر الافتتاحي</span>
                           <span className="font-bold text-slate-800">1,500,000 ر.س</span>
                        </div>
                        <div className="flex justify-between border-b border-dotted border-slate-200 pb-1">
                           <span className="text-slate-500">رقم المخطط</span>
                           <span className="font-bold text-slate-800">3256</span>
                        </div>
                        <div className="flex justify-between border-b border-dotted border-slate-200 pb-1">
                           <span className="text-slate-500">الحي</span>
                           <span className="font-bold text-slate-800">القيروان</span>
                        </div>
                        <div className="flex justify-between border-b border-dotted border-slate-200 pb-1">
                           <span className="text-slate-500">رقم القطعة</span>
                           <span className="font-bold text-slate-800">1/1/1450</span>
                        </div>
                        <div className="flex justify-between border-b border-dotted border-slate-200 pb-1">
                           <span className="text-slate-500">العربون</span>
                           <span className="font-bold text-[#30364F]">300,000 ر.س</span>
                        </div>
                     </div>

                     {/* Boundaries */}
                     <div className="bg-[#f8fafc] rounded-lg p-4 border border-slate-200">
                        <h4 className="font-bold text-sm mb-3 text-[#30364F]">الحدود والأطوال</h4>
                        <div className="space-y-2 text-xs">
                           <div className="flex gap-2">
                              <span className="font-bold w-12 text-slate-500">شمالاً</span>
                              <span className="text-slate-700 flex-1">قطعة رقم 1451 / 2 ورقم 1453 / 1 بطول 34.45م</span>
                           </div>
                           <div className="flex gap-2">
                              <span className="font-bold w-12 text-slate-500">جنوباً</span>
                              <span className="text-slate-700 flex-1">شارع عرض 15م وقطعة رقم 1456 / 2 بطول 42.87م</span>
                           </div>
                           <div className="flex gap-2">
                              <span className="font-bold w-12 text-slate-500">شرقاً</span>
                              <span className="text-slate-700 flex-1">قطعة رقم 1450 / 1 / 2 بطول 30.02م</span>
                           </div>
                           <div className="flex gap-2">
                              <span className="font-bold w-12 text-slate-500">غرباً</span>
                              <span className="text-slate-700 flex-1">قطعة رقم 1454 / 2 بطول 31.68م</span>
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-100">
                        {/* AI Analysis Toggle Banner */}
                        <div className="flex-1 bg-[#30364F] rounded-lg p-2 flex items-center justify-between text-white shadow-lg relative overflow-hidden h-[54px] cursor-pointer" onClick={() => setShowAI(!showAI)}>
                           <div className="flex items-center gap-3 relative z-10 px-2">
                              <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                                 <BarChart3 className="w-4 h-4" />
                              </div>
                              <div>
                                 <h3 className="font-bold text-sm">تحليل العقار</h3>
                              </div>
                           </div>
                           <ChevronUp className={`w-5 h-5 transition-transform ${showAI ? 'rotate-180' : ''} mr-2`} />
                        </div>

                        <Button onClick={onParticipate} variant="primary" icon={Gavel} className="flex-[2] text-lg py-3 h-[54px]">المشاركة في المزايدة</Button>
                     </div>

                     {/* Expanded AI Analysis Content */}
                     <AnimatePresence>
                        {showAI && (
                           <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                           >
                              <div className="mt-4 bg-white border border-emerald-100 rounded-xl p-6 shadow-sm space-y-6">
                                 <div className="grid grid-cols-2 gap-6">
                                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-center">
                                       <div className="text-xs text-slate-500 font-bold mb-2">القيمة السوقية التقديرية</div>
                                       <div className="text-2xl font-black text-[#30364F]">2.4M - 2.6M</div>
                                       <div className="text-[10px] text-emerald-600 mt-1 flex items-center justify-center gap-1">
                                          <TrendingUp className="w-3 h-3" /> +12% نمو سنوي
                                       </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-center">
                                       <div className="text-xs text-slate-500 font-bold mb-2">مؤشر الطلب</div>
                                       <div className="text-2xl font-black text-emerald-600">عالي جداً</div>
                                       <div className="text-[10px] text-slate-400 mt-1">بناءً على 50 صفقة مشابهة</div>
                                    </div>
                                 </div>

                                 <div>
                                    <h4 className="font-bold text-sm mb-3">توصيات المزايدة</h4>
                                    <ul className="space-y-2 text-sm">
                                       <li className="flex gap-2 items-start">
                                          <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
                                          <span className="text-slate-600">السعر الحالي يعتبر فرصة ممتازة للدخول (أقل من السوق بـ 8%)</span>
                                       </li>
                                       <li className="flex gap-2 items-start">
                                          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                                          <span className="text-slate-600">ينصح بعدم تجاوز حاجز 2,650,000 ر.س لضمان هامش ربح جيد</span>
                                       </li>
                                    </ul>
                                 </div>
                              </div>
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </div>
               </div>
            </Card>
         </div>
      </div>
   );
};

// --- Wizard: Add Auction ---

const AddAuctionWizard = ({ onCancel }: { onCancel: () => void }) => {
   const [step, setStep] = useState(1);
   const [sellerRole, setSellerRole] = useState<SellerRole>('principal');
   const [showCalendar, setShowCalendar] = useState(false);
   const [expiryDate, setExpiryDate] = useState('');

   return (
      <div className="max-w-3xl mx-auto px-4 py-12 animate-in zoom-in-95 duration-300">
         <div className="mb-8 text-center">
            <h1 className={`text-2xl font-black ${THEME.textPrimary} mb-2`}>إضافة مزاد جديد</h1>
            <p className="text-slate-500">أكمل الخطوات التالية لإدراج عقارك في منصة رساء</p>
         </div>

         <div className="flex items-center justify-center mb-10">
            {[1, 2, 3, 4].map((s) => (
               <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold transition-colors ${step >= s ? `${THEME.primary} border-transparent text-white` : 'bg-white border-slate-300 text-slate-300'}`}>
                     {s}
                  </div>
                  {s < 4 && <div className={`w-16 h-0.5 mx-2 ${step > s ? 'bg-[#30364F]' : 'bg-slate-200'}`} />}
               </div>
            ))}
         </div>

         <Card className="p-8">
            {step === 1 && (
               <div className="space-y-6">
                  <h3 className="font-bold text-lg border-b pb-2 mb-4">بيانات البائع</h3>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                     {['principal', 'agent', 'marketer'].map((role) => (
                        <button
                           key={role}
                           onClick={() => setSellerRole(role as SellerRole)}
                           className={`p-3 border rounded-lg text-center transition-all font-bold text-sm ${sellerRole === role ? 'bg-[#30364F] text-white border-[#30364F]' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                        >
                           {role === 'principal' ? 'أصيل' : role === 'agent' ? 'وكيل' : 'مسوق'}
                        </button>
                     ))}
                  </div>

                  <div className="space-y-4">
                     <InputField label="الاسم الكامل" placeholder="" />

                     <div className="space-y-1.5">
                        <label className="text-sm font-bold text-[#30364F]">رقم الهوية / السجل</label>
                        <input
                           type="text"
                           maxLength={10}
                           onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 10); }}
                           placeholder="1xxxxxxxxx"
                           className="w-full border border-slate-300 px-4 py-2.5 text-sm rounded-md focus:border-[#30364F] focus:outline-none focus:ring-1 focus:ring-[#30364F] bg-white transition-all placeholder:text-slate-400"
                        />
                     </div>

                     {sellerRole === 'agent' && (
                        <>
                           <InputField label="رقم الوكالة الشرعية" placeholder="xxxxxxxx" />

                           <div className="space-y-1.5 relative">
                              <label className="text-sm font-bold text-[#30364F]">تاريخ انتهاء الوكالة</label>
                              <div className="relative" onClick={() => setShowCalendar(!showCalendar)}>
                                 <input
                                    type="text"
                                    value={expiryDate}
                                    readOnly
                                    placeholder=""
                                    className="w-full border border-slate-300 px-4 py-2.5 text-sm rounded-md focus:border-[#30364F] focus:outline-none focus:ring-1 focus:ring-[#30364F] bg-white transition-all placeholder:text-slate-400 cursor-pointer"
                                 />
                                 <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                              </div>
                              {showCalendar && (
                                 <CalendarWidget onClose={() => setShowCalendar(false)} onSelect={(d) => { setExpiryDate(d); setShowCalendar(false); }} position="top" />
                              )}
                           </div>

                           <InputField label="مكان إنشاء الوكالة" placeholder="الرياض" />
                        </>
                     )}

                     {sellerRole === 'marketer' && (
                        <>
                           <InputField label="رقم رخصة فال" placeholder="1100xxxxxx" />
                           <InputField label="اسم المنشأة" placeholder="" />
                        </>
                     )}
                  </div>

                  <Button fullWidth onClick={() => setStep(2)} className="mt-4">التالي</Button>
               </div>
            )}
            {step === 2 && (
               <div className="space-y-6">
                  <h3 className="font-bold text-lg border-b pb-2 mb-4">بيانات العقار</h3>
                  <div className="grid grid-cols-2 gap-4">
                     <InputField label="نوع العقار" placeholder="أرض، فيلا، عمارة..." />
                     <InputField label="الاستخدام" placeholder="سكني، تجاري..." />
                     <InputField label="المساحة (م²)" placeholder="0.00" type="number" />
                     <InputField label="واجهة العقار" placeholder="شمالية، جنوبية..." />

                     <InputField label="المدينة" placeholder="" />
                     <InputField label="الحي" placeholder="" />
                     <InputField label="اسم الشارع" placeholder="" />
                     <InputField label="رابط الموقع (Google Maps)" placeholder="https://maps.google.com/..." />

                     <div className="col-span-2 space-y-2">
                        <label className="text-sm font-bold text-[#30364F]">صورة العقار</label>
                        <div className="border border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 cursor-pointer">
                           <Camera className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                           <span className="text-sm text-slate-500">اضغط لرفع صورة العقار</span>
                        </div>
                     </div>

                     <div className="col-span-2">
                        <h4 className="text-sm font-bold text-[#30364F] mb-2 mt-2">الحدود والأطوال</h4>
                        <div className="grid grid-cols-2 gap-4">
                           <InputField label="شمالاً" placeholder="وصف الحد الشمالي" />
                           <InputField label="جنوباً" placeholder="وصف الحد الجنوبي" />
                           <InputField label="شرقاً" placeholder="وصف الحد الشرقي" />
                           <InputField label="غرباً" placeholder="وصف الحد الغربي" />
                        </div>
                     </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                     <Button variant="outline" onClick={() => setStep(1)} className="flex-1">السابق</Button>
                     <Button onClick={() => setStep(3)} className="flex-1">التالي</Button>
                  </div>
               </div>
            )}
            {step === 3 && (
               <div className="space-y-6">
                  <h3 className="font-bold text-lg border-b pb-2 mb-4">بيانات صك الملكية</h3>
                  <div className="grid grid-cols-1 gap-4">
                     <InputField label="رقم الصك" placeholder="" />
                     <InputField label="رقم المخطط" placeholder="" />
                     <InputField label="رقم القطعة" placeholder="" />
                  </div>
                  <div className="flex gap-4 pt-4">
                     <Button variant="outline" onClick={() => setStep(2)} className="flex-1">السابق</Button>
                     <Button onClick={() => setStep(4)} className="flex-1">التالي</Button>
                  </div>
               </div>
            )}
            {step === 4 && (
               <div className="space-y-6">
                  <h3 className="font-bold text-lg border-b pb-2 mb-4">وثيقة الملكية</h3>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center text-slate-400">
                     <FileText className="w-12 h-12 mx-auto mb-2" />
                     <p>اسحب وأفلت صورة الصك هنا</p>
                  </div>
                  <div className="flex gap-4 pt-4">
                     <Button variant="outline" onClick={() => setStep(3)} className="flex-1">السابق</Button>
                     <Button onClick={onCancel} className="flex-1">إرسال الطلب</Button>
                  </div>
               </div>
            )}
         </Card>
      </div>
   );
};

// --- View: My Auctions ---

const MyAuctionsView = ({ onAddAuction }: { onAddAuction: () => void }) => {
   // Mock Data for Charts
   const performanceData = [
      { name: 'يناير', value: 4000 },
      { name: 'فبراير', value: 3000 },
      { name: 'مارس', value: 2000 },
      { name: 'أبريل', value: 2780 },
      { name: 'مايو', value: 1890 },
   ];

   const [showCalendar, setShowCalendar] = useState(false);
   const [selectedDate, setSelectedDate] = useState('');

   return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 animate-in fade-in space-y-8">
         <div className="flex justify-between items-center">
            <h1 className={`text-2xl font-black ${THEME.textPrimary} flex items-center gap-2`}>
               <Gavel className="w-6 h-6" /> مزاداتي
            </h1>
            <button
               onClick={onAddAuction}
               className={`flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#30364F] to-[#334155] text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5`}
            >
               <Plus className="w-5 h-5" />
               <span>أضف مزادك الآن</span>
            </button>
         </div>

         {/* Analytics Section */}
         <div className="grid md:grid-cols-2 gap-6">
            <Card title="أداء المزادات">
               <div className="h-64 w-full dir-ltr">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                        <RechartsTooltip cursor={{ fill: '#f1f5f9' }} />
                        <Bar dataKey="value" fill="#30364F" radius={[4, 4, 0, 0]} barSize={40} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </Card>
            <Card title="ملخص المشاركات">
               <div className="grid grid-cols-2 gap-4 h-full">
                  <div className="bg-slate-50 p-4 rounded-lg flex flex-col justify-center items-center text-center border border-slate-100">
                     <span className="text-slate-500 text-xs font-bold mb-2">إجمالي المزايدات</span>
                     <span className="text-3xl font-black text-[#30364F]">48</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg flex flex-col justify-center items-center text-center border border-slate-100">
                     <span className="text-slate-500 text-xs font-bold mb-2">متوسط المزايدة/مزاد</span>
                     <span className="text-3xl font-black text-[#30364F]">12.5</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg flex flex-col justify-center items-center text-center border border-slate-100">
                     <span className="text-slate-500 text-xs font-bold mb-2">أعلى تنافس</span>
                     <span className="text-sm font-black text-[#30364F]">فيلا القيروان (22)</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg flex flex-col justify-center items-center text-center border border-slate-100">
                     <span className="text-slate-500 text-xs font-bold mb-2">أقل من التوقع</span>
                     <span className="text-sm font-black text-rose-600">أرض الملقا</span>
                  </div>
               </div>
            </Card>
         </div>

         <Card noPadding overflowVisible>
            <div className="p-4 border-b border-slate-100 bg-slate-50">
               <div className="relative max-w-xs">
                  <input
                     type="text"
                     value={selectedDate || ''}
                     placeholder="تصفية حسب التاريخ"
                     readOnly
                     onClick={() => setShowCalendar(!showCalendar)}
                     className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg bg-white text-sm cursor-pointer hover:border-[#30364F] focus:outline-none focus:border-[#30364F] transition-all"
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  {showCalendar && (
                     <CalendarWidget onClose={() => setShowCalendar(false)} onSelect={setSelectedDate} position="top" />
                  )}
               </div>
            </div>
            <table className="w-full text-right text-sm">
               <thead className={`bg-slate-50 ${THEME.textPrimary} font-bold border-b ${THEME.border}`}>
                  <tr>
                     <th className="p-4">عنوان المزاد</th>
                     <th className="p-4">تاريخ البدء</th>
                     <th className="p-4">تاريخ الإنتهاء</th>
                     <th className="p-4">عدد المشاركين</th>
                     <th className="p-4">المبلغ النهائي</th>
                     <th className="p-4">الحالة</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                     <td className="p-4 font-bold">أرض خام - مخطط الخير</td>
                     <td className="p-4 text-slate-500">2025-11-20</td>
                     <td className="p-4 text-slate-500">2025-12-01</td>
                     <td className="p-4">42</td>
                     <td className="p-4 font-mono font-bold text-[#30364F]">3,450,000 ر.س</td>
                     <td className="p-4"><Badge variant="success">مكتمل</Badge></td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                     <td className="p-4 font-bold">فيلا العارض</td>
                     <td className="p-4 text-slate-500">2026-02-01</td>
                     <td className="p-4 text-slate-500">2026-02-15</td>
                     <td className="p-4">15</td>
                     <td className="p-4 font-mono font-bold text-[#30364F]">--</td>
                     <td className="p-4"><Badge variant="warning">جاري</Badge></td>
                  </tr>
               </tbody>
            </table>
         </Card>
      </div>
   );
};

// --- Live Bidding Room ---

const LiveBiddingRoom = ({ onExit }: { onExit: () => void }) => {
   const [currentBid, setCurrentBid] = useState(2350000);
   return (
      <div className="min-h-screen bg-[#f8fafc] text-[#30364F] pb-20">
         <div className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
               <span className="font-bold">مزاد مباشر: فيلا القيروان</span>
            </div>
            <Button variant="outline" className="hover:bg-red-50 hover:border-red-200 hover:text-red-600" onClick={onExit}>خروج</Button>
         </div>
         <div className="max-w-6xl mx-auto p-6 grid md:grid-cols-12 gap-6">
            <div className="md:col-span-8 space-y-6">
               <div className="aspect-[16/7] bg-black rounded-xl overflow-hidden relative shadow-lg">
                  <ImageWithFallback src={ASSETS.heroBg} className="w-full h-full object-cover opacity-90" alt="Live" />
                  <div className="absolute bottom-6 right-6">
                     <div className="text-sm text-slate-100 mb-1 font-bold shadow-black drop-shadow-md">السعر الحالي</div>
                     <div className="text-5xl font-black text-white drop-shadow-lg">{currentBid.toLocaleString()} ر.س</div>
                  </div>
               </div>

               {/* Live AI Assistant (For Participating Bidders) - Updated to Light Theme inside */}
               <div className="bg-white rounded-xl p-6 border border-emerald-100 relative overflow-hidden shadow-md">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                     <BarChart3 className="w-24 h-24 text-[#30364F]" />
                  </div>
                  <div className="relative z-10">
                     <div className="flex items-center gap-2 mb-4 text-[#30364F] font-bold">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span>تحليل العقار للمزايدة</span>
                     </div>
                     <div className="grid grid-cols-2 gap-8 mb-4">
                        <div>
                           <div className="text-xs text-slate-500 mb-1 font-bold">الحد الأقصى المقترح للمزايدة</div>
                           <div className="text-3xl font-black text-[#30364F]">2,450,000 ر.س</div>
                        </div>
                        <div>
                           <div className="text-xs text-slate-500 mb-1 font-bold">حالة السعر</div>
                           <div className="text-lg font-bold text-emerald-600">مناسب للشراء</div>
                        </div>
                     </div>
                     <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                        <div className="h-full bg-gradient-to-l from-emerald-500 to-emerald-700 w-[85%] transition-all duration-500"></div>
                     </div>
                     <p className="text-sm text-slate-500 flex items-start gap-2">
                        <Info className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
                        <span>السعر الحالي يقترب من القيمة العادلة. ننصح بزيادات حذرة لا تتجاوز 10,000 ر.س في المرة الواحدة.</span>
                     </p>
                  </div>
               </div>
            </div>

            <div className="md:col-span-4 bg-white rounded-xl border border-slate-200 p-4 flex flex-col h-[600px] shadow-sm">
               <div className="flex-1 space-y-2 overflow-y-auto mb-4 pr-1">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                     <div key={i} className="flex justify-between text-sm p-3 bg-slate-50 rounded border border-slate-100">
                        <span className="font-bold text-slate-600">مزايد {i}02</span>
                        <span className="font-mono font-bold text-[#30364F]">{(currentBid - (i * 10000)).toLocaleString()}</span>
                     </div>
                  ))}
               </div>
               <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-3 gap-2">
                     <button onClick={() => setCurrentBid(c => c + 5000)} className="py-2 bg-white border border-slate-200 text-[#30364F] rounded text-xs font-bold hover:bg-slate-50">+ 5k</button>
                     <button onClick={() => setCurrentBid(c => c + 10000)} className="py-2 bg-white border border-slate-200 text-[#30364F] rounded text-xs font-bold hover:bg-slate-50">+ 10k</button>
                     <button onClick={() => setCurrentBid(c => c + 50000)} className="py-2 bg-white border border-slate-200 text-[#30364F] rounded text-xs font-bold hover:bg-slate-50">+ 50k</button>
                  </div>
                  <Button fullWidth className="!bg-emerald-600 hover:!bg-emerald-500 text-lg shadow-lg shadow-emerald-200">مزايدة</Button>
               </div>
            </div>
         </div>
      </div>
   );
};

// --- Modals ---

const WalletModal = ({ balance, onClose, onRecharge }: { balance: number, onClose: () => void, onRecharge: (amount: number) => void }) => {
   const [amount, setAmount] = useState("");
   return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
         <Card className="w-full max-w-sm" title="المحفظة الإلكترونية">
            <div className="text-center py-6 bg-slate-50 rounded-lg mb-6 border border-slate-100">
               <div className="text-xs font-bold text-slate-400 uppercase mb-1">الرصيد الحالي</div>
               <div className="text-3xl font-black text-[#30364F]">{balance.toLocaleString()} ر.س</div>
            </div>
            <div className="space-y-4">
               <InputField
                  label="مبلغ الشحن"
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
                  <Button fullWidth onClick={() => { onRecharge(Number(amount)); onClose(); }}>شحن الرصيد</Button>
               </div>
            </div>
         </Card>
      </div>
   );
};

const ParticipationModal = ({ isOpen, onClose, onConfirm, walletBalance }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, walletBalance: number }) => {
   const [role, setRole] = useState<ParticipationRole>(null);
   const [agreed, setAgreed] = useState(false);

   // Agent Fields
   const [agencyNumber, setAgencyNumber] = useState("");
   const [agencyDate, setAgencyDate] = useState("");
   const [agentConfirmed, setAgentConfirmed] = useState(false);

   // Payment Step
   const [step, setStep] = useState<1 | 2>(1); // 1: Info, 2: Payment
   const depositAmount = 5000;

   if (!isOpen) return null;

   const handleNext = () => {
      // All roles now require deposit step
      setStep(2);
   };

   return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
         <Card className={`w-full ${role === 'agent' && step === 1 ? 'max-w-md' : 'max-w-lg'} shadow-2xl`} title={step === 1 ? "طلب المشاركة في المزاد" : "دفع العربون"}>
            {step === 1 ? (
               <div className="space-y-6">
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-3">اختر صفة المشاركة</label>
                     <div className="grid grid-cols-2 gap-4">
                        <button
                           onClick={() => setRole('principal')}
                           className={`p-4 border-2 rounded-xl text-center transition-all ${role === 'principal' ? 'border-[#30364F] bg-slate-50 text-[#30364F]' : 'border-slate-200 hover:border-slate-300'}`}
                        >
                           <User className="w-8 h-8 mx-auto mb-2 opacity-80" />
                           <div className="font-bold">أصيل</div>
                        </button>
                        <button
                           onClick={() => setRole('agent')}
                           className={`p-4 border-2 rounded-xl text-center transition-all ${role === 'agent' ? 'border-[#30364F] bg-slate-50 text-[#30364F]' : 'border-slate-200 hover:border-slate-300'}`}
                        >
                           <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-80" />
                           <div className="font-bold">وكيل</div>
                        </button>
                     </div>
                  </div>

                  {/* Agent Validation Fields */}
                  {role === 'agent' && (
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
                           <input type="checkbox" checked={agentConfirmed} onChange={(e) => setAgentConfirmed(e.target.checked)} />
                           <span className="text-xs font-bold text-slate-600">أقر بصحة البيانات المدخلة وسريان مفعول الوكالة</span>
                        </label>
                     </div>
                  )}

                  <div className="space-y-3 pt-4 border-t border-slate-100">
                     <label className="flex items-start gap-3 cursor-pointer group">
                        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 rounded border-slate-300 text-[#30364F] focus:ring-[#30364F]" />
                        <span className="text-sm text-slate-600 group-hover:text-slate-900">أقر بأنني اطلعت على كراسة الشروط والأحكام الخاصة بالمزاد وأوافق عليها بالكامل.</span>
                     </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                     <Button fullWidth variant="secondary" onClick={onClose}>إلغاء</Button>
                     <Button
                        fullWidth
                        disabled={!role || !agreed || (role === 'agent' && (!agencyNumber || !agencyDate || !agentConfirmed))}
                        onClick={handleNext}
                        variant="primary"
                     >
                        التالي: دفع العربون
                     </Button>
                  </div>
               </div>
            ) : (
               // Step 2: Deposit Payment
               <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
                     <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                     <p className="text-sm text-blue-800">
                        لضمان الجدية، يلزم دفع عربون دخول المزاد بقيمة <strong className="font-black text-lg mx-1">{depositAmount.toLocaleString()} ر.س</strong>
                        <br />
                        سيتم خصم المبلغ مباشرة من محفظتك الإلكترونية.
                     </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-slate-50">
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-slate-500">رصيد المحفظة الحالي</span>
                        <span className={`font-black ${walletBalance >= depositAmount ? 'text-[#30364F]' : 'text-red-600'}`}>
                           {walletBalance.toLocaleString()} ر.س
                        </span>
                     </div>
                     <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                        <span className="text-sm font-bold text-slate-500">مبلغ العربون</span>
                        <span className="font-black text-red-600">-{depositAmount.toLocaleString()} ر.س</span>
                     </div>
                  </div>

                  {walletBalance < depositAmount && (
                     <div className="flex items-center gap-2 text-red-600 text-sm font-bold bg-red-50 p-3 rounded border border-red-100">
                        <AlertTriangle className="w-4 h-4" />
                        <span>رصيد المحفظة غير كافٍ. يرجى إضافة عربون أولاً.</span>
                     </div>
                  )}

                  <div className="flex gap-3 pt-2">
                     <Button fullWidth variant="secondary" onClick={() => setStep(1)}>رجوع</Button>
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
};

// --- Footer ---

const Footer = () => (
   <footer className="bg-[#30364F] text-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid md:grid-cols-4 gap-8">
         <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
               <div className="w-8 h-8 bg-white text-[#30364F] rounded flex items-center justify-center font-bold">ر</div>
               <span className="font-black text-2xl">رســاء</span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
               المنصة الرائدة للمزادات العقارية الإلكترونية في المملكة.
            </p>
         </div>
         <div>
            <h4 className="font-bold mb-4 text-slate-300">روابط سريعة</h4>
            <ul className="space-y-2 text-sm text-slate-400">
               <li><a href="#" className="hover:text-white">الرئيسية</a></li>
               <li><a href="#" className="hover:text-white">المزادات</a></li>
               <li><a href="#" className="hover:text-white">الأسئلة الشائعة</a></li>
            </ul>
         </div>
         <div>
            <h4 className="font-bold mb-4 text-slate-300">تواصل معنا</h4>
            <ul className="space-y-2 text-sm text-slate-400">
               <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> 920000000</li>
               <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@rasaa.sa</li>
            </ul>
         </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
         جميع الحقوق محفوظة © منصة رساء 2026
      </div>
   </footer>
);

// --- Auth Views ---


// --- Main App Container ---

export default function App() {
   const [currentView, setCurrentView] = useState<ViewState>('home');
   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [walletOpen, setWalletOpen] = useState(false);
   const [walletBalance, setWalletBalance] = useState(45000);
   const [participationOpen, setParticipationOpen] = useState(false);
   const [favorites, setFavorites] = useState<string[]>([]);
   const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
   const [showLoginModal, setShowLoginModal] = useState(false);
   const [hasBankInfo, setHasBankInfo] = useState(false);

   // Mock User Data
   const user = {
      name: 'محمد القحطاني',
      id: '1023456789',
      phone: '0501234567',
      email: 'mohammed@example.com'
   };

   const navigate = (view: ViewState) => {
      // Intercept protected routes if not logged in
      if (!isLoggedIn && (view === 'my-auctions' || view === 'favorites' || view === 'wallet')) {
         setShowLoginModal(true);
         return;
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentView(view);
   };

   const handleRecharge = (amount: number) => {
      setWalletBalance(b => b + amount);
   };

   const handleDepositPayment = () => {
      // Deduct 5000 SAR deposit
      if (walletBalance >= 5000) {
         setWalletBalance(b => b - 5000);
         setParticipationOpen(false);
         setCurrentView('live-bidding');
      }
   };

   const toggleFavorite = (id: string) => {
      if (!isLoggedIn) {
         setShowLoginModal(true);
         return;
      }
      setFavorites(prev =>
         prev.includes(id)
            ? prev.filter(f => f !== id)
            : [...prev, id]
      );
   };

   const isFavorite = (id: string) => favorites.includes(id);

   return (
      <div dir="rtl" className="min-h-screen bg-[#f8fafc] font-sans text-[#30364F] selection:bg-[#30364F] selection:text-white flex flex-col relative overflow-x-hidden">

         <SidePanel
            isOpen={isSidePanelOpen}
            onClose={() => setIsSidePanelOpen(false)}
            user={user}
            onLogout={() => { setIsLoggedIn(false); setIsSidePanelOpen(false); navigate('home'); }}
            onNavigate={navigate}
         />



         {currentView !== 'login' && currentView !== 'register' && currentView !== 'live-bidding' && (
            <Navbar
               onNavigate={navigate}
               currentView={currentView}
               isLoggedIn={isLoggedIn}
               walletBalance={walletBalance}
               onOpenWallet={() => isLoggedIn ? navigate('wallet') : setShowLoginModal(true)}
               onOpenSidePanel={() => setIsSidePanelOpen(true)}
            />
         )}

         <main className="flex-1">
            <AnimatePresence mode="wait">

//Call pages
               {currentView === "home" && (
                  <Homepage
                     navigate={navigate}
                     isFavorite={isFavorite}
                     toggleFavorite={toggleFavorite}
                  />
               )}

               {currentView === "auction-browse" && (
                  <AuctionsPage
                     navigate={navigate}
                     isFavorite={isFavorite}
                     toggleFavorite={toggleFavorite}
                  />
               )}

               {currentView === "login" && (
                  <LoginPage
                     onLogin={() => {
                        setIsLoggedIn(true);
                        navigate("home");
                     }}
                     onGoToRegister={() => navigate("register")}
                  />
               )}

               {currentView === "register" && (
                  <RegisterPage
                     onLogin={() => {
                        setIsLoggedIn(true);
                        navigate("home");
                     }}
                     onGoToLogin={() => navigate("login")}
                  />
               )}





               {currentView === 'favorites' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                     <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                        <h1 className="text-2xl font-black mb-6">المفضلة</h1>
                        {favorites.length === 0 ? (
                           <div className="text-center py-20 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                              <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                              <p className="text-slate-500 font-bold">لا توجد مزادات في المفضلة</p>
                           </div>
                        ) : (
                           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {favorites.map((id, idx) => (
                                 <ListingAuctionCard
                                    key={id}
                                    id={id}
                                    title="مزاد محفوظ"
                                    location="موقع محفوظ"
                                    days="02" hours="05" minutes="30" seconds="00"
                                    onClick={() => navigate('auction-detail')}
                                    isFavorite={true}
                                    onToggleFavorite={(e) => { e.stopPropagation(); toggleFavorite(id); }}
                                    image={[ASSETS.villa, ASSETS.residential, ASSETS.commercialBuilding, ASSETS.landPlot][idx % 4]}
                                 />
                              ))}
                           </div>
                        )}
                     </div>
                  </motion.div>
               )}

               {currentView === 'auction-detail' && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                     <DetailView
                        onBack={() => navigate('auction-browse')}
                        onParticipate={() => setParticipationOpen(true)}
                        isFavorite={isFavorite('detail-1')}
                        onToggleFavorite={() => toggleFavorite('detail-1')}
                     />
                  </motion.div>
               )}

               {currentView === 'live-bidding' && (
                  <LiveBiddingRoom onExit={() => {
                     // استرجاع العربون إلى المحفظة الإلكترونية
                     setWalletBalance(b => b + 5000);
                     navigate('home');
                  }} />
               )}

               {currentView === 'add-auction' && (
                  <AddAuctionWizard onCancel={() => navigate('my-auctions')} />
               )}

               {currentView === 'my-auctions' && (
                  <MyAuctionsView onAddAuction={() => navigate('add-auction')} />
               )}


               {currentView === 'profile' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                     <ProfileView user={user} />
                  </motion.div>
               )}

               {currentView === 'bid-history' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                     <BidHistoryView />
                  </motion.div>
               )}

               {currentView === 'wallet' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                     <WalletView balance={walletBalance} onAddFunds={() => setWalletOpen(true)} />
                  </motion.div>
               )}

               {currentView === 'support' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                     <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                           <HelpCircle className="w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-black text-[#30364F] mb-4">مركز الدعم والمساعدة</h1>
                        <p className="text-slate-500 mb-8 max-w-lg mx-auto">فريق خدمة العملاء جاهز لمساعدتك على مدار الساعة. يمكنك التواصل معنا عبر القنوات التالية.</p>

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
               )}

               {currentView === 'faq' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                     <FaqView />
                  </motion.div>
               )}
            </AnimatePresence>
         </main>

         {currentView !== 'login' && currentView !== 'live-bidding' && <Footer />}

         {/* Modals */}
         {walletOpen && (
            <WalletModalNew
               balance={walletBalance}
               onClose={() => setWalletOpen(false)}
               onRecharge={handleRecharge}
               hasBankInfo={hasBankInfo}
               onSaveBankInfo={() => setHasBankInfo(true)}
            />
         )}

         {participationOpen && (
            <ParticipationModal
               isOpen={participationOpen}
               onClose={() => setParticipationOpen(false)}
               onConfirm={handleDepositPayment}
               walletBalance={walletBalance}
            />
         )}

         <LoginRequiredModal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
            onLogin={() => {
               setShowLoginModal(false);
               navigate("login");
            }}
         />

      </div>
   );
}