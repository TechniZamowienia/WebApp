"use client"
import { SignIn } from "@clerk/nextjs"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Witamy ponownie</h1>
          <p className="text-muted-foreground">Zaloguj się, aby kontynuować</p>
        </div>
        <div className="bg-card rounded-2xl shadow-lg border border-border p-2 animate-scale-in">
          <SignIn
            routing="hash"
            signUpUrl="/auth/signup"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none border-none",
                headerTitle: "text-foreground",
                headerSubtitle: "text-muted-foreground",
                socialButtonsBlockButton: "bg-background border-border hover:bg-muted transition-colors duration-200",
                formButtonPrimary: "bg-primary hover:bg-primary/90 transition-colors duration-200",
                footerActionLink: "text-primary hover:text-primary/80 transition-colors duration-200",
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}
