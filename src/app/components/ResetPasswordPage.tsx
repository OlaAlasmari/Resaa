import React, { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import { Button } from "./ui/button";

export default function ResetPasswordPage({ onDone }: { onDone: () => void }) {
  const [password, setPassword]       = useState("")
  const [confirm, setConfirm]         = useState("")
  const [loading, setLoading]         = useState(false)
  const [message, setMessage]         = useState("")
  const [error, setError]             = useState("")

  const handleReset = async () => {
    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل")
      return
    }
    if (password !== confirm) {
      setError("كلمتا المرور غير متطابقتين")
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw new Error("فشل تحديث كلمة المرور")
      setMessage("تم تحديث كلمة المرور بنجاح")
      setTimeout(onDone, 2000)
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-slate-200">
        <h1 className="text-2xl font-black text-[#30364F] mb-2">تعيين كلمة مرور جديدة</h1>
        <p className="text-sm text-slate-500 mb-6">أدخل كلمة المرور الجديدة</p>

        {message ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-bold text-center">
            {message}
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#30364F]">كلمة المرور الجديدة</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-slate-300 px-4 py-2.5 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-[#30364F] bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#30364F]">تأكيد كلمة المرور</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-slate-300 px-4 py-2.5 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-[#30364F] bg-white"
              />
            </div>
            <Button fullWidth onClick={handleReset} disabled={loading}>
              {loading ? "جاري الحفظ..." : "حفظ كلمة المرور"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}