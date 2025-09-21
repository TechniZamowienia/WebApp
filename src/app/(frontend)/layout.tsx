import React from 'react'
import '../global.css'
import './styles.css'
import { ThemeProvider } from '@/components/theme-provider'
import EnsurePayloadUser from './EnsurePayloadUser'
import AuthGate from './AuthGate'
import { ClerkProvider } from '@clerk/nextjs'
import { plPL } from '@clerk/localizations'
import { currentUser } from '@clerk/nextjs/server'

export const metadata = {
  description: 'Szablon aplikacji z Payload i Next.js.',
  title: 'Techniczne Zamówienia',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const cu = await currentUser()
  const email = (
    cu?.primaryEmailAddress?.emailAddress ||
    cu?.emailAddresses?.[0]?.emailAddress ||
    ''
  ).trim()

  return (
    <html lang="pl" suppressHydrationWarning>
      <body>
        <ClerkProvider localization={plPL}>
          <AuthGate />
          <EnsurePayloadUser />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <header className="w-full border-b border-border/60 bg-card/60 backdrop-blur sticky top-0 z-40">
              <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="text-sm font-semibold text-foreground">Techniczne Zamówienia</div>
                {email && <div className="text-sm text-muted-foreground">{email}</div>}
              </div>
            </header>
            {children}
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
