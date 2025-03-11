"use client";

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

// Separate component that uses useSearchParams
function ConfirmContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [verifying, setVerifying] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type')
    
    async function verifyEmail() {
      if (token_hash && type) {
        try {
          const { error } = await supabase.auth.verifyOtp({ token_hash, type })
          if (error) {
            toast.error('Error verifying your email. Please try again.')
            router.push('/auth/login')
          } else {
            setVerifying(false)
            toast.success('Email verified successfully!')
            // Short delay before redirect to ensure toast is seen
            setTimeout(() => {
              router.push('/dashboard')
            }, 2000)
          }
        } catch (error) {
          toast.error('An unexpected error occurred')
          router.push('/auth/login')
        }
      } else {
        toast.error('Invalid verification link')
        router.push('/auth/login')
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-center space-y-2">
          {verifying ? (
            <>
              <Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" />
              <h1 className="text-2xl font-semibold">Verifying your email</h1>
              <p className="text-muted-foreground">Please wait while we verify your email address...</p>
            </>
          ) : (
            <>
              <div className="h-8 w-8 mx-auto text-green-500">✓</div>
              <h1 className="text-2xl font-semibold">Email Verified!</h1>
              <p className="text-muted-foreground">Redirecting you to the dashboard...</p>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}

// Main page component with Suspense
export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <div className="text-center space-y-2">
            <Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </Card>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  )
}