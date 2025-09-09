'use client'
import { SignUp } from '@clerk/nextjs'
import React from 'react'

export default function SignupPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
      <SignUp routing="hash" signInUrl="/auth/login" afterSignUpUrl="/" />
    </div>
  )
}
