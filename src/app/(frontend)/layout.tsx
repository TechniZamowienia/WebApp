import React from 'react'
import './styles.css'
import { ClerkProvider } from '@clerk/nextjs'
import EnsurePayloadUser from './EnsurePayloadUser'
import AuthGate from './AuthGate'

export const metadata = {
  description: 'A blank template using Payload in a Next.js app.',
  title: 'Payload Blank Template',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <AuthGate />
          <EnsurePayloadUser />
          <main>{children}</main>
        </ClerkProvider>
      </body>
    </html>
  )
}
