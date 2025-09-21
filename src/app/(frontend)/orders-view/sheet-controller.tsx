'use client'

import { usePathname } from 'next/navigation'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ReactNode } from 'react'

interface SheetControllerProps {
  children: ReactNode
  tableContent: ReactNode
}

export default function SheetController({ children, tableContent }: SheetControllerProps) {
  const pathname = usePathname()
  const isMainPage = pathname === '/orders-view'
  const shouldOpenSheet = !isMainPage

  return (
    <Sheet defaultOpen={shouldOpenSheet}>
      <SheetTitle className="hidden">Orders View</SheetTitle>
      <div className="space-y-4">
        {tableContent}
        <div className="flex gap-2 justify-end">
          <SheetTrigger asChild>
            <Button
              variant="default"
              className="shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
              asChild
            >
              <Link href="/orders-view/create">+ Create Order</Link>
            </Button>
          </SheetTrigger>
        </div>
      </div>
      <SheetContent className="w-full h-full p-8 bg-background border-l border-border">
        <div className="animate-slide-up">{children}</div>
      </SheetContent>
    </Sheet>
  )
}
