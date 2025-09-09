'use client'
import React from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { LucideArrowLeft } from 'lucide-react'

export default function SheetWrapper({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger onClick={() => setOpen(true)}>
        <LucideArrowLeft />
      </SheetTrigger>
      <SheetContent>{children}</SheetContent>
    </Sheet>
  )
}
