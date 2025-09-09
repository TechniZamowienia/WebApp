'use client'
import { SignIn } from '@clerk/nextjs'
import React from 'react'

export default function LoginPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
      <SignIn routing="hash" signUpUrl="/auth/signup" />
    </div>
  )
}
