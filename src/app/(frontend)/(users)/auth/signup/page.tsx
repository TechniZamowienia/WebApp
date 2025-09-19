'use client'
import { SignUp } from '@clerk/nextjs'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
          <p className="text-muted-foreground">Join us and start managing your orders</p>
        </div>
        <div className="bg-card rounded-2xl shadow-lg border border-border p-2 animate-scale-in">
          <SignUp
            routing="hash"
            signInUrl="/auth/login"
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'bg-transparent shadow-none border-none',
                headerTitle: 'text-foreground',
                headerSubtitle: 'text-muted-foreground',
                socialButtonsBlockButton:
                  'bg-background border-border hover:bg-muted transition-colors duration-200',
                formButtonPrimary: 'bg-primary hover:bg-primary/90 transition-colors duration-200',
                footerActionLink:
                  'text-primary hover:text-primary/80 transition-colors duration-200',
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}
