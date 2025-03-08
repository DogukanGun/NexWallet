'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useConfigStore } from '../store/configStore'
import LoadingSpinner from './LoadingSpinner'

export default function RequireConfig({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const isConfigured = useConfigStore((state) => state.isConfigured)

  useEffect(() => {
    if (!isConfigured) {
      router.replace('/app')
    }
  }, [isConfigured, router])

  if (!isConfigured) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="large" text="Loading Configuration..." />
      </div>
    )
  }

  return <>{children}</>
} 