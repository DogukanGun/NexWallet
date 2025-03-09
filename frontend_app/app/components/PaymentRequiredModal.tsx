'use client'

import { useState } from 'react'

interface PaymentRequiredModalProps {
  provider: string
  onClose: () => void
}

export default function PaymentRequiredModal({ provider, onClose }: PaymentRequiredModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-xl max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-white mb-4">
          {provider} Access Required
        </h3>
        <p className="text-gray-300 mb-4">
          To use {provider}, you need to either:
        </p>
        <ul className="list-disc list-inside text-gray-300 mb-4">
          <li>Pay $10 in cryptocurrency</li>
          <li>Enter a special access code</li>
        </ul>
        <p className="text-gray-400 text-sm mb-6">
          You&apos;ll be prompted for payment or code verification when you start using the AI.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white font-semibold rounded-full py-2 hover:bg-blue-700 transition duration-300"
        >
          Got it
        </button>
      </div>
    </div>
  )
}