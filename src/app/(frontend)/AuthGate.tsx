'use client'
import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { usePathname, useRouter } from 'next/navigation'

export default function AuthGate() {
  const { isLoaded, isSignedIn } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return
    const isAuthRoute = pathname?.startsWith('/auth')
    if (!isSignedIn && !isAuthRoute) {
      router.replace('/auth/login')
    }
    if (isSignedIn && isAuthRoute) {
      router.replace('/')
    }
  }, [isLoaded, isSignedIn, pathname, router])

  return null
}


// cos