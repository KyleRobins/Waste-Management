"use client";

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/utils/supabase/client'

// Separate component that uses useSearchParams
function ConfirmContent() {
  const searchParams = useSearchParams()
  const [message, setMessage] = useState('Verifying your email...')
  const supabase = createClient()

  useEffect(() => {
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type')
    
    if (token_hash && type) {
      supabase.auth.verifyOtp({ token_hash, type })
        .then(({ error }) => {
          if (error) {
            setMessage('Error verifying your email. Please try again.')
          } else {
            setMessage('Email verified successfully! Redirecting...')
            setTimeout(() => {
              window.location.href = '/'
            }, 2000)
          }
        })
    } else {
      setMessage('No verification token found. Please try signing up again.')
    }
  }, [searchParams])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <p className="text-center">{message}</p>
    </div>
  )
}

// Main page component with Suspense
export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p className="text-center">Loading...</p>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  )
}