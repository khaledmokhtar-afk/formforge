'use client'

import { useSession } from 'next-auth/react'
import { DropZone } from '@/components/upload/DropZone'

export default function NewConversionPage() {
  const { data: session } = useSession()
  const credits = session?.user?.credits ?? 0

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[#E2EEF8]">
          New conversion
        </h1>
        <p className="text-[#6B8FAF] mt-1">Upload your 2D PDF drawing</p>
      </div>

      <DropZone userCredits={credits} />
    </div>
  )
}
