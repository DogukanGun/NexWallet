'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useConfigStore } from '../store/configStore'
import LoadingSpinner from './LoadingSpinner'

export default function RequireConfig({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const isConfigured = useConfigStore((state) => state.isConfigured)
  const [showConfigModal, setShowConfigModal] = useState(false)

  useEffect(() => {
    if (!isConfigured) {
      setShowConfigModal(true)
    }
  }, [isConfigured])

  if (!isConfigured) {
    return (
      <>
        {showConfigModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-white mb-4">Configuration Required</h3>
              <p className="text-gray-300 mb-6">
                Please configure your AI agent before accessing this feature. You need to select:
                <ul className="list-disc ml-6 mt-2">
                  <li>One or more chains</li>
                  <li>LLM provider</li>
                  <li>Agent type</li>
                </ul>
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => router.push('/app')}
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  Configure Now
                </button>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <LoadingSpinner size="large" text="Loading Configuration..." />
        </div>
      </>
    )
  }

  return <>{children}</>
} 