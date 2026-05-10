import React, { useEffect, useState } from "react";
import {
   Gavel, Bell, User,
   CheckCircle, Heart, Wallet,
   LogOut, ChevronLeft, HelpCircle,
   Check, Phone, Mail,
} from "lucide-react";
import { FaqView } from './components/FaqView';
import { WalletModalNew } from './components/WalletModalNew';
import { motion, AnimatePresence } from "motion/react";
import { ViewState } from "./types";
import { Button } from "./components/ui/button";
import {
   Card,
} from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import LoginRequiredModal from "./components/ui/LoginRequiredModal";
import Homepage from "./components/pages/Homepage";
import AuctionsPage from "./components/pages/AuctionsPage";
import LoginPage from "./components/pages/LoginPage";
import RegisterPage from "./components/pages/RegisterPage";
import MyAuctionsPage from "./components/pages/MyAuctionsPage";
import AddAuctionPage from "./components/pages/AddAuctionPage";
import AuctionDetailPage from "./components/pages/AuctionDetailPage";
import ProfilePage from "./components/pages/ProfilePage";
import BidHistoryPage from "./components/pages/BidHistoryPage";
import SupportPage from "./components/pages/SupportPage";
import WalletPage from "./components/pages/WalletPage";
import LiveBiddingPage from "./components/pages/LiveBiddingPage";
import ParticipationModal from "./components/ParticipationModal";
import ListingAuctionCard from "./components/ListingAuctionCard";
import { authService } from "./services/AuthService";
import { User as AppUser } from "./models/User";
import NotificationsPage from "./components/pages/NotificationsPage";
import { supabase } from "../lib/supabase";
import ResetPasswordPage from "./components/ResetPasswordPage";
import { Auction, AuctionRow } from "./models/Auction";

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
   navbarBg: "bg-[#213448]", // Deep Blue for navbar
   footerBg: "bg-[#213448]" // Deep Blue for footer
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

// 1. Add state at the top of Navbar — convert it to a function component
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
}) => {

   return (
      <nav className={`border-b border-[#1E2437] ${THEME.navbarBg} sticky top-0 z-50`}>
         <div className="w-full px-6 md:px-10 h-20 flex items-center justify-between">

            {/* Brand - LEFT */}
            <div
               className="flex items-center gap-3 cursor-pointer group min-w-fit"
               onClick={() => onNavigate('home')}
            >
               <img src="logo.png" alt="رساء" className="h-16 w-auto" />
            </div>

            {/* Navigation - CENTER */}
            <div className="hidden md:flex flex-1 justify-start items-center gap-15 -translate-x-30">
               {[
                  { id: 'home', label: 'الرئـيسيـة' },
                  { id: 'auction-browse', label: 'المـزادات' },
                  { id: 'my-auctions', label: 'مـزاداتي' },
                  { id: 'faq', label: 'الأسئـلة الشـائعة' },
               ].map((item) => (
                  <button
                     key={item.id}
                     onClick={() => onNavigate(item.id as ViewState)}
                     className={`text-lg font-bold transition-colors ${currentView === item.id
                        ? 'text-[#91C6BC]'
                        : 'text-white/80 hover:text-white'
                        }`}
                  >
                     {item.label}
                  </button>
               ))}

               <button
                  onClick={() => onNavigate('favorites')}
                  className={`text-white/80 hover:text-red-500 transition-colors ${currentView === 'favorites' ? 'text-red-500' : ''}`}
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
                     <div className="relative">
                        <button
                           onClick={() => onNavigate('notifications' as ViewState)}
                           className="relative p-2 text-white/80 hover:bg-white/10 rounded-full"
                        >
                           <Bell className="w-5 h-5" />
                           <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#213448] animate-pulse" />
                        </button>
                     </div>

                     <div className="w-px h-6 bg-white/20 mx-1" />

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
};



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

// --- Favorites View ---
function FavoritesView({
   favorites,
   onNavigate,
   onToggleFavorite,
   isFavorite,
}: {
   favorites: string[];
   onNavigate: (id: string) => void;
   onToggleFavorite: (id: string) => void;
   isFavorite: (id: string) => boolean;
}) {
   const [auctions, setAuctions] = React.useState<Auction[]>([]);
   const [loading, setLoading] = React.useState(true);


   React.useEffect(() => {
      const load = async () => {
         if (favorites.length === 0) { setAuctions([]); setLoading(false); return; }
         const { data } = await supabase
            .from("auction")
            .select(`
        auction_id, auction_name, start_time, end_time,
        start_price, highest_bid, duration, products_count, time,
        property:property_id ( image_url, property_type, city, district )
      `)
            .in("auction_id", favorites.map(Number));

         const mapped = (data as AuctionRow[]).map((row) => Auction.fromRow(row))
         setAuctions(mapped)
         setLoading(false);
      };
      load();
   }, [favorites]);

   if (loading) return (
      <div className="flex items-center justify-center py-20">
         <div className="w-8 h-8 border-4 border-[#91C6BC] border-t-transparent rounded-full animate-spin" />
      </div>
   );

   return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
         <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            <h1 className="text-2xl font-black text-[#30364F] mb-6">المفضلة</h1>
            {auctions.length === 0 ? (
               <div className="text-center py-20 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                  <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold">لا توجد مزادات في المفضلة</p>
               </div>
            ) : (
               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {auctions.map((auction) => (
                     <ListingAuctionCard
                        key={auction.id}
                        id={auction.id}
                        title={auction.title}
                        location={auction.location}
                        days={auction.days}
                        hours={auction.hours}
                        minutes={auction.minutes}
                        seconds={auction.seconds}
                        duration={auction.durationText}
                        productsCount={auction.productsCountText}
                        date={auction.displayDate}
                        time={auction.displayTime}
                        startTime={auction.startTime ?? ""}
                        endTime={auction.endTime ?? ""}
                        onClick={() => onNavigate(auction.id)}
                        isFavorite={isFavorite(auction.id)}
                        onToggleFavorite={(e) => { e.stopPropagation(); onToggleFavorite(auction.id); }}
                        image={auction.imageUrl}
                     />
                  ))}
               </div>
            )  }       
         </div>
      </motion.div>
   );
}


// --- Footer ---

const Footer = () => (
   <footer className="bg-[#30364F] text-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid md:grid-cols-4 gap-8">
         <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
               <img
                  src="public\logo1.png"
                  alt="رساء"
                  className="h-30 w-auto"
               />
            </div>

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


// --- Main App Container ---

export default function App() {
   const [currentView, setCurrentView] = useState<ViewState>('home');
   const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
   const [authLoading, setAuthLoading] = useState(true); const [walletOpen, setWalletOpen] = useState(false);
   const [walletBalance, setWalletBalance] = useState(45000);
   const [participationOpen, setParticipationOpen] = useState(false);
   const [paidDepositAuctions, setPaidDepositAuctions] = useState<Set<string>>(new Set());
   const [favorites, setFavorites] = useState<string[]>([]);

   // ── Load favorites from Supabase on login ──────────────────────────────────
   useEffect(() => {
      const loadFavorites = async () => {
         const { data: { user } } = await supabase.auth.getUser();
         if (!user) return;
         const { data } = await supabase
            .from("favorites")
            .select("auction_id")
            .eq("user_id", user.id);
         if (data) setFavorites(data.map(f => String(f.auction_id)));
      };
      if (currentUser) loadFavorites();
      else setFavorites([]);
   }, [currentUser]);
   const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
   const [showLoginModal, setShowLoginModal] = useState(false);
   const [hasBankInfo, setHasBankInfo] = useState(false);
   const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null);

   const isLoggedIn = !!currentUser;

   const userData = currentUser
      ? {
         name: currentUser.name,
         id: currentUser.nationalId,
         phone: currentUser.phone,
         email: currentUser.email,
      }
      : {
         name: "",
         id: "",
         phone: "",
         email: "",
      };

   useEffect(() => {
      const loadCurrentUser = async () => {
         try {
            const user = await authService.getCurrentUser();
            setCurrentUser(user);
         } catch (error) {
            console.error("Failed to load current user:", error);
         } finally {
            setAuthLoading(false);
         }
      };

      loadCurrentUser();
   }, []);

   // ── Handle password reset redirect ──────────────────────
   useEffect(() => {
      const hash = window.location.hash
      if (hash.includes("type=recovery")) {
         navigate("reset-password")
      }
   }, [])

   const handleRegisterSubmit = async (data: {
      firstName: string;
      lastName: string;
      nationalId: string;
      phone: string;
      email: string;
      password: string;
      address: string;
   }) => {
      const user = await authService.register({
         firstName: data.firstName,
         lastName: data.lastName,
         nationalId: data.nationalId,
         phone: data.phone,
         email: data.email,
         password: data.password,
         address: data.address,
         role: "bidder",
      });

      setCurrentUser(user);
      navigate("home");
   };

   const handleLoginSubmit = async (data: {
      nationalId: string;
      password: string;
   }) => {
      const user = await authService.login({
         nationalId: data.nationalId,
         password: data.password,
      });

      setCurrentUser(user);
      navigate("home");
   };

   const handleLogout = async () => {
      try {
         await authService.logout();
         setCurrentUser(null);
         setIsSidePanelOpen(false);
         navigate("home");
      } catch (error) {
         alert("فشل تسجيل الخروج");
      }
   };

   // Mock User Data

   const navigate = (view: ViewState) => {
      if (!currentUser && (view === 'my-auctions' || view === 'favorites' || view === 'wallet')) {
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
         if (selectedAuctionId) {
            setPaidDepositAuctions(prev => new Set(prev).add(selectedAuctionId));
         }
         setParticipationOpen(false);
         setCurrentView('live-bidding');
      }
   };

   const toggleFavorite = async (id: string) => {
      if (!isLoggedIn) {
         setShowLoginModal(true);
         return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const isFav = favorites.includes(id);

      if (isFav) {
         // Remove from favorites
         setFavorites(prev => prev.filter(f => f !== id));
         await supabase
            .from("favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("auction_id", Number(id));
      } else {
         // Add to favorites
         setFavorites(prev => [...prev, id]);
         await supabase
            .from("favorites")
            .insert({ user_id: user.id, auction_id: Number(id) });
      }
   };

   const isFavorite = (id: string) => favorites.includes(id);

   if (authLoading) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] text-[#30364F]">
            جارٍ التحميل...
         </div>
      );
   }

   return (
      <div dir="rtl" className="min-h-screen bg-[#f8fafc] font-sans text-[#30364F] selection:bg-[#30364F] selection:text-white flex flex-col relative">


         <SidePanel
            isOpen={isSidePanelOpen}
            onClose={() => setIsSidePanelOpen(false)}
            user={userData}
            onLogout={handleLogout}
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

               {/* Call pages */}
               {currentView === "home" && (
                  <Homepage
                     navigate={navigate}
                     isFavorite={isFavorite}
                     toggleFavorite={toggleFavorite}
                     setSelectedAuctionId={setSelectedAuctionId}

                  />
               )}

               {currentView === "auction-browse" && (
                  <AuctionsPage
                     navigate={navigate}
                     isFavorite={isFavorite}
                     toggleFavorite={toggleFavorite}
                     setSelectedAuctionId={setSelectedAuctionId}
                  />
               )}

               {currentView === "login" && (
                  <LoginPage
                     onLoginSubmit={handleLoginSubmit}
                     onGoToRegister={() => navigate("register")}
                  />
               )}

               {currentView === "register" && (
                  <RegisterPage
                     onRegisterSubmit={handleRegisterSubmit}
                     onGoToLogin={() => navigate("login")}
                  />
               )}

               {currentView === "my-auctions" && (
                  <MyAuctionsPage onAddAuction={() => navigate("add-auction")} />
               )}

               {currentView === "add-auction" && (
                  <AddAuctionPage onCancel={() => navigate("my-auctions")} />
               )}

               {currentView === "profile" && (
                  <ProfilePage user={userData} />
               )}

               {currentView === "bid-history" && (
                  <BidHistoryPage />
               )}


               {currentView === 'favorites' && (
                  <FavoritesView
                     favorites={favorites}
                     onNavigate={(id) => {
                        setSelectedAuctionId(id);
                        navigate("auction-detail");
                     }}
                     onToggleFavorite={toggleFavorite}
                     isFavorite={isFavorite}
                  />
               )}

               {currentView === 'auction-detail' && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                     <AuctionDetailPage
                        onBack={() => navigate("auction-browse")}
                        onParticipate={() => {
                           if (selectedAuctionId && paidDepositAuctions.has(selectedAuctionId)) {
                              setCurrentView('live-bidding');
                           } else {
                              setParticipationOpen(true);
                           }
                        }}
                        isFavorite={selectedAuctionId ? isFavorite(selectedAuctionId) : false}
                        onToggleFavorite={() => {
                           if (selectedAuctionId) toggleFavorite(selectedAuctionId);
                        }}
                        selectedAuctionId={selectedAuctionId}
                     />
                  </motion.div>
               )}

               {currentView === "live-bidding" && (
                  <LiveBiddingPage
                     auctionId={Number(selectedAuctionId)}
                     onExit={() => {
                        navigate("home");
                     }}
                  />
               )}

               {currentView === "notifications" && (
                  <NotificationsPage
                     onNavigate={navigate}
                  />
               )}

               {currentView === "wallet" && (
                  <WalletPage
                     balance={walletBalance}
                     onAddFunds={() => setWalletOpen(true)}
                  />
               )}

               {currentView === "support" && <SupportPage />}


               {currentView === 'faq' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                     <FaqView />
                  </motion.div>
               )}
               {currentView === "reset-password" && (
                  <ResetPasswordPage onDone={() => navigate("login")} />
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