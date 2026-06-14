'use client'
import Link from 'next/link'

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[rgba(0,200,232,0.1)] bg-[#03070F]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#00C8E8] to-[#8B5CF6] flex items-center justify-center">
            <span className="text-[#03070F] font-bold text-sm">F</span>
          </div>
          <span className="font-display font-semibold text-[#E2EEF8] text-lg tracking-tight">
            FormForge
          </span>
        </Link>
        <div className="flex items-center gap-8">
          <Link href="/#how-it-works" className="text-[#6B8FAF] hover:text-[#E2EEF8] text-sm transition-colors">
            How it works
          </Link>
          <Link href="/#pricing" className="text-[#6B8FAF] hover:text-[#E2EEF8] text-sm transition-colors">
            Pricing
          </Link>
          <Link
            href="/dashboard/new"
            className="btn-primary !px-4 !py-2 !text-sm inline-flex items-center"
          >
            Try free
          </Link>
        </div>
      </div>
    </nav>
  )
}
