'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CREDIT_PACKS } from '@/config/pricing'

interface Payment {
  id: string
  creditsPurchased: number
  amountCents: number
  currency: string
  status: string
  createdAt: string
}

export default function CreditsPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [payments, setPayments] = useState<Payment[]>([])
  const [buying, setBuying] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const credits = session?.user?.credits ?? 0

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setToast({ type: 'success', msg: 'Payment successful! Credits have been added to your account.' })
    } else if (searchParams.get('cancelled') === 'true') {
      setToast({ type: 'error', msg: 'Payment cancelled. No credits were added.' })
    }
  }, [searchParams])

  useEffect(() => {
    fetch('/api/payments')
      .then(r => r.json())
      .then(d => setPayments(d.payments ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 5000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const handleBuy = async (packId: string) => {
    setBuying(packId)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setToast({ type: 'error', msg: data.error ?? 'Failed to create checkout' })
      }
    } catch {
      setToast({ type: 'error', msg: 'Something went wrong' })
    } finally {
      setBuying(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Toast */}
      {toast && (
        <div className={`mb-6 rounded-xl p-4 text-sm border ${
          toast.type === 'success'
            ? 'bg-[rgba(16,217,140,0.1)] border-[rgba(16,217,140,0.3)] text-[#10D98C]'
            : 'bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.3)] text-[#EF4444]'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[#E2EEF8]">Credits</h1>
        <p className="text-[#6B8FAF] mt-1">Manage your conversion credits</p>
      </div>

      {/* Current balance */}
      <div className="card p-8 mb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-[#00C8E8] text-3xl">&#9889;</span>
          <span className="text-[#00C8E8] font-display font-bold text-5xl">{credits}</span>
        </div>
        <p className="text-[#E2EEF8] font-medium text-lg">credits remaining</p>
        <p className="text-[#6B8FAF] text-sm mt-2">Credits are consumed at 1 credit per PDF page processed</p>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {CREDIT_PACKS.map(pack => (
          <div
            key={pack.id}
            className={`card p-6 relative ${
              pack.popular
                ? 'border-[rgba(0,200,232,0.4)] shadow-[0_0_30px_rgba(0,200,232,0.1)]'
                : ''
            }`}
          >
            {pack.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00C8E8] text-[#03070F] text-xs font-semibold px-3 py-1 rounded-full">
                Most popular
              </div>
            )}
            <h3 className="font-display text-xl font-semibold text-[#E2EEF8] mt-2">{pack.name}</h3>
            <div className="mt-4 mb-2">
              <span className="text-[#E2EEF8] font-display font-bold text-4xl">${pack.price}</span>
            </div>
            <p className="text-[#00C8E8] font-medium">{pack.credits} credits</p>
            <p className="text-[#6B8FAF] text-sm mt-1">${pack.perCredit.toFixed(2)} / credit</p>
            <button
              onClick={() => handleBuy(pack.id)}
              disabled={buying !== null}
              className={`mt-6 w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                pack.popular
                  ? 'btn-primary'
                  : 'btn-ghost'
              } disabled:opacity-50`}
            >
              {buying === pack.id ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                'Buy'
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Payment history */}
      <div>
        <h2 className="font-display text-xl font-semibold text-[#E2EEF8] mb-4">Payment history</h2>
        {payments.length === 0 ? (
          <div className="card p-8 text-center text-[#6B8FAF]">No payments yet</div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(0,200,232,0.1)]">
                  <th className="text-left text-[#6B8FAF] font-medium px-4 py-3">Date</th>
                  <th className="text-left text-[#6B8FAF] font-medium px-4 py-3">Credits</th>
                  <th className="text-left text-[#6B8FAF] font-medium px-4 py-3">Amount</th>
                  <th className="text-left text-[#6B8FAF] font-medium px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} className="border-b border-[rgba(0,200,232,0.06)]">
                    <td className="px-4 py-3 text-[#6B8FAF]">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-[#E2EEF8]">{p.creditsPurchased}</td>
                    <td className="px-4 py-3 text-[#E2EEF8]">${(p.amountCents / 100).toFixed(2)} {p.currency.toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-mono px-2 py-1 rounded-full ${
                        p.status === 'complete'
                          ? 'bg-[#0A2420] text-[#10D98C]'
                          : 'bg-[#1A2A3A] text-[#6B8FAF]'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
