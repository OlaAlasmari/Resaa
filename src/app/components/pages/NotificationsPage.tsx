import React, { useState, useEffect } from "react";
import {
  ShieldAlert, ShieldCheck, Heart, Clock, Bell,
  ChevronRight, Loader2, AlertCircle, Check, X,
  Gavel, Timer
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

// ── Types ──────────────────────────────────────────────────────────────────────
type NotificationType = "fraud" | "favorite_start" | "favorite_end";

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  risk_level?: "HIGH" | "MEDIUM";
  confidence?: number;
  reasons?: string[];
  auction_id?: number;
  auction_name?: string;
  national_id?: string;
  created_at: string;
  is_read: boolean;
};

type NotificationsPageProps = {
  onNavigate: (view: string) => void;
};

// ── Notification Icon ─────────────────────────────────────────────────────────
const NotifIcon = ({ type, risk }: { type: NotificationType; risk?: "HIGH" | "MEDIUM" }) => {
  if (type === "fraud") {
    const cls = risk === "HIGH" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600";
    return <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${cls}`}><ShieldAlert className="w-5 h-5" /></div>;
  }
  if (type === "favorite_start") return <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-emerald-100 text-emerald-600"><Gavel className="w-5 h-5" /></div>;
  return <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-orange-100 text-orange-600"><Timer className="w-5 h-5" /></div>;
};

// ── Risk dots ─────────────────────────────────────────────────────────────────
const RiskDots = ({ confidence }: { confidence: number }) => {
  const filled = Math.round((confidence / 100) * 5);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`w-2 h-2 rounded-full ${i < filled ? "bg-red-500" : "bg-red-200"}`} />
      ))}
      <span className="text-xs text-slate-400 mr-1">{confidence}%</span>
    </div>
  );
};
// ── Freeze Button ─────────────────────────────────────────────────────────────
const FreezeButton = ({ nationalId }: { nationalId: string }) => {
  const [isFrozen, setIsFrozen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("is_frozen")
        .eq("national_id", nationalId)
        .single();
      if (data) setIsFrozen(data.is_frozen ?? false);
    };
    check();
  }, [nationalId]);

  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !isFrozen;
    await supabase
      .from("profiles")
      .update({ is_frozen: newState })
      .eq("national_id", nationalId);
    setIsFrozen(newState);
    setModalMessage(newState ? "تم تجميد المزايد بنجاح" : "تم رفع التجميد بنجاح");
    setShowModal(true);
  };

  return (
    <>
      <button
        onClick={toggle}
        className={`w-full mt-3 py-2 text-xs font-black text-white rounded-lg transition-colors ${
          isFrozen
            ? "bg-emerald-600 hover:bg-emerald-500"
            : "bg-[#213448] hover:bg-[#2d4660]"
        }`}>
        {isFrozen ? "رفع التجميد" : "تجميد المزايد"}
      </button>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-[#91C6BC]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-10 h-10 text-[#91C6BC]" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-black text-[#30364F] mb-2">{modalMessage}</h2>
            <button
              onClick={(e) => { e.stopPropagation(); setShowModal(false); }}
              className="w-full py-3.5 bg-[#30364F] hover:bg-[#1e2538] text-white rounded-2xl font-bold text-sm transition-colors">
              متابعة
            </button>
          </div>
        </div>
      )}
    </>
  );
};
// ── Main Component ─────────────────────────────────────────────────────────────
export default function NotificationsPage({ onNavigate }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]             = useState(true);
  const [expanded, setExpanded]           = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "fraud" | "favorites">("all");
  const [isAdmin, setIsAdmin] = useState(false);

  // ── Load all notifications ────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

//----------------admin fraud alerts --------------------
const ADMIN_EMAIL = "elafbasmair209@gmail.com";
const isAdmin = user.email === ADMIN_EMAIL;
setIsAdmin(isAdmin);
//--------------------------------------------------------

      const allNotifs: Notification[] = [];

      // ── 1. Fraud alerts (admin only) ───────────────────────────────────────
      if (isAdmin) {
        const { data: fraudAlerts } = await supabase
          .from("fraud_alerts")
          .select(`
            alert_id, auction_id, national_id, risk_level,
            confidence, reasons, is_read, created_at,
            auction:auction_id ( auction_name )
          `)
          .order("created_at", { ascending: false })
          .limit(50);

        for (const alert of fraudAlerts ?? []) {
          const riskLabel = alert.risk_level === "HIGH" ? "خطر مرتفع" : "خطر متوسط";
          allNotifs.push({
            id:           `fraud-${alert.alert_id}`,
            type:         "fraud",
            title:        `${riskLabel} — ${(alert as any).auction?.auction_name ?? "مزاد"}`,
            body:         `المزايد برقم الهوية ${alert.national_id} — درجة الثقة ${alert.confidence}%`,
            risk_level:   alert.risk_level as "HIGH" | "MEDIUM",
            confidence:   alert.confidence,
            reasons:      alert.reasons ? alert.reasons.split(" | ") : [],
            auction_id:   alert.auction_id,
            auction_name: (alert as any).auction?.auction_name,
            national_id:  alert.national_id,
            created_at:   alert.created_at,
            is_read:      alert.is_read,
          });
        }
      }

      // ── 2. Load user's favorites from Supabase ────────────────────────────
      const { data: favRows } = await supabase
        .from("favorites")
        .select("auction_id")
        .eq("user_id", user.id);

      const favoriteIds = (favRows ?? []).map(f => f.auction_id);

      if (favoriteIds.length > 0) {
        const { data: favAuctions } = await supabase
          .from("auction")
          .select("auction_id, auction_name, start_time, end_time, highest_bid")
          .in("auction_id", favoriteIds);

        const now = new Date();
        const parseT = (t: string) => {
          const norm = t.includes("+") || t.endsWith("Z") ? t : t + "+03:00";
          return new Date(norm);
        };

        for (const auc of favAuctions ?? []) {
          const startTime   = parseT(auc.start_time);
          const endTime     = parseT(auc.end_time);
          const minsToStart = (startTime.getTime() - now.getTime()) / 60000;
          const minsToEnd   = (endTime.getTime() - now.getTime()) / 60000;
          const hasStarted  = now >= startTime;
          const hasEnded    = now >= endTime;

          // Auction started within the last 24 hours (still active)
          if (hasStarted && !hasEnded && minsToStart > -1440) {
            allNotifs.push({
              id:           `fav-start-${auc.auction_id}`,
              type:         "favorite_start",
              title:        `بدأ المزاد — ${auc.auction_name}`,
              body:         `المزاد المفضل لديك بدأ. السعر الحالي: ${auc.highest_bid?.toLocaleString()} ر.س`,
              auction_id:   auc.auction_id,
              auction_name: auc.auction_name,
              created_at:   auc.start_time,
              is_read:      false,
            });
          }

          // Auction ending within 24 hours
          if (!hasEnded && minsToEnd > 0 && minsToEnd <= 1440) {
            const hoursLeft = Math.floor(minsToEnd / 60);
            const minsLeft  = Math.round(minsToEnd % 60);
            const timeLabel = hoursLeft > 0
              ? `${hoursLeft} ساعة و${minsLeft} دقيقة`
              : `${Math.round(minsToEnd)} دقيقة`;
            allNotifs.push({
              id:           `fav-end-${auc.auction_id}`,
              type:         "favorite_end",
              title:        `ينتهي قريباً — ${auc.auction_name}`,
              body:         `تبقى ${timeLabel} على انتهاء المزاد. السعر الحالي: ${auc.highest_bid?.toLocaleString()} ر.س`,
              auction_id:   auc.auction_id,
              auction_name: auc.auction_name,
              created_at:   new Date().toISOString(),
              is_read:      false,
            });
          }
        }
      }

      // Sort newest first
      allNotifs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setNotifications(allNotifs);
      setLoading(false);
    };

    load();
  }, []);

  // ── Mark single notification as read ─────────────────────────────────────────
  const markRead = async (notif: Notification) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
    if (notif.type === "fraud") {
      const alertId = Number(notif.id.replace("fraud-", ""));
      await supabase.from("fraud_alerts").update({ is_read: true }).eq("alert_id", alertId);
    }
  };

  // ── Mark all as read ──────────────────────────────────────────────────────────
  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    const fraudIds = notifications
      .filter(n => n.type === "fraud" && !n.is_read)
      .map(n => Number(n.id.replace("fraud-", "")));
    if (fraudIds.length > 0) {
      await supabase.from("fraud_alerts").update({ is_read: true }).in("alert_id", fraudIds);
    }
  };

  // ── Filter ────────────────────────────────────────────────────────────────────
  const filtered = notifications.filter(n => {
    if (filter === "fraud")     return n.type === "fraud";
    if (filter === "favorites") return n.type === "favorite_start" || n.type === "favorite_end";
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const timeAgo = (date: string) => {
    const diff  = Date.now() - new Date(date).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 1)   return "الآن";
    if (mins < 60)  return `منذ ${mins} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${days} يوم`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-in fade-in min-h-screen bg-[#f8fafc]">

      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-[#30364F] mb-1">الإشعارات</h1>
          <p className="text-slate-500 text-sm">
            {unreadCount > 0 ? `${unreadCount} إشعار غير مقروء` : "جميع الإشعارات مقروءة"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            className="text-xs font-bold text-[#91C6BC] hover:text-[#7BB5AA] transition-colors flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> تحديد الكل كمقروء
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "all",       label: "الكل" },
          ...(isAdmin ? [{ key: "fraud", label: "تنبيهات الاحتيال" }] : []),
          { key: "favorites", label: "المفضلة" },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key as typeof filter)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              filter === key
                ? "bg-[#30364F] text-white"
                : "bg-white border border-slate-200 text-slate-500 hover:border-[#30364F]"
            }`}>
            {label}
            {key === "all" && unreadCount > 0 && (
              <span className="mr-1.5 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#91C6BC]" />
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-bold text-lg">لا توجد إشعارات</p>
          <p className="text-sm mt-1">ستظهر هنا تنبيهات المزادات المفضلة وتنبيهات الاحتيال.</p>
        </div>
      )}

      {/* Notification list */}
      {!loading && (
        <div className="space-y-3">
          {filtered.map((notif) => (
            <div key={notif.id}
              onClick={() => { setExpanded(expanded === notif.id ? null : notif.id); if (!notif.is_read) markRead(notif); }}
              className={`bg-white rounded-2xl border transition-all cursor-pointer ${
                !notif.is_read ? "border-[#30364F]/20 shadow-md" : "border-slate-100 shadow-sm"
              } hover:border-[#30364F]/30`}>

              {/* Main row */}
              <div className="p-4 flex items-start gap-3">
                <NotifIcon type={notif.type} risk={notif.risk_level} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className={`text-sm font-bold leading-snug ${!notif.is_read ? "text-[#30364F]" : "text-slate-600"}`}>
                      {notif.title}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      {!notif.is_read && <span className="w-2 h-2 bg-red-500 rounded-full" />}
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{timeAgo(notif.created_at)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{notif.body}</p>
                  {notif.type === "fraud" && notif.confidence !== undefined && (
                    <div className="mt-2"><RiskDots confidence={notif.confidence} /></div>
                  )}
                </div>

                <ChevronRight className={`w-4 h-4 text-slate-300 flex-shrink-0 mt-1 transition-transform duration-200 ${expanded === notif.id ? "rotate-90" : ""}`} />
              </div>

              {/* Expanded */}
              {expanded === notif.id && (
                <div className="px-4 pb-4 pt-0 border-t border-slate-50">

                  {/* Fraud reasons */}
                  {notif.type === "fraud" && notif.reasons && notif.reasons.length > 0 && (
                    <div className={`rounded-xl p-4 mt-3 ${notif.risk_level === "HIGH" ? "bg-red-50 border border-red-100" : "bg-amber-50 border border-amber-100"}`}>
                      <p className="text-xs font-bold text-slate-600 mb-2">أسباب التنبيه:</p>
                      <ul className="space-y-1.5">
                        {notif.reasons.map((r, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                            <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${notif.risk_level === "HIGH" ? "bg-red-500" : "bg-amber-500"}`} />
                            {r}
                          </li>
                        ))}
                      </ul>
                      {notif.national_id && (
                        <div className="mt-3 pt-3 border-t border-red-100 flex justify-between text-xs">
                          <span className="text-slate-400">رقم الهوية</span>
                          <span className="font-bold text-[#30364F]">{notif.national_id}</span>
                        </div>
           )}
                      <FreezeButton nationalId={notif.national_id!} />
                    </div>
                  )}

                  {/* Favorite auction actions */}
                  {/* Favorite auction actions */}
                  {(notif.type === "favorite_start" || notif.type === "favorite_end") && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); onNavigate("live-bidding"); }}
                        className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors">
                        دخول المزاد
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onNavigate("auction-detail"); }}
                        className="flex-1 py-2 text-xs font-bold text-[#30364F] border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                        عرض التفاصيل
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}