'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useConfigStore } from '../store/configStore'

export default function RequireConfig({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const isConfigured = useConfigStore((state) => state.isConfigured)

  useEffect(() => {
    if (!isConfigured) {
      router.replace('/app')
    }
  }, [isConfigured, router])

  if (!isConfigured) {
    return null
  }

  return <>{children}</>
} 