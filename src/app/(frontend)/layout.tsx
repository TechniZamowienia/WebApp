import React from 'react'
import '../global.css'
import './styles.css'
import { ThemeProvider } from '@/components/theme-provider'
import EnsurePayloadUser from './EnsurePayloadUser'
import AuthGate from './AuthGate'
import { ClerkProvider } from '@clerk/nextjs'

export const metadata = {
  description: 'A blank template using Payload in a Next.js app.',
  title: 'Payload Blank Template',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClerkProvider>
          <AuthGate />
          <EnsurePayloadUser />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
