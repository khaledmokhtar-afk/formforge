import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-[rgba(0,200,232,0.08)] py-12 mt-20">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="font-display font-semibold text-[#E2EEF8]">FormForge</p>
          <p className="text-[#6B8FAF] text-sm mt-1">PDF to 3D CAD — powered by Claude AI</p>
        </div>
        <div className="flex items-center gap-8 text-sm text-[#6B8FAF]">
          <Link href="/privacy" className="hover:text-[#E2EEF8] transition-colors">Privacy</Link>
          <Link href="/terms"   className="hover:text-[#E2EEF8] transition-colors">Terms</Link>
          <a href="mailto:hello@formforge.io" className="hover:text-[#E2EEF8] transition-colors">Contact</a>
        </div>
        <p className="text-[#344B63] text-sm">© 2025 FormForge. All rights reserved.</p>
      </div>
    </footer>
  )
}
