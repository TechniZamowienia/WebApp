import type React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import type { Store } from '@/payload-types'
import Link from 'next/link'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { currentUser } from '@clerk/nextjs/server'

export default async function OrdersView({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config: config })
  const findResultRaw = await payload.find({ collection: 'orders', limit: 500 })
  const nowISO = new Date().toISOString()
  const findResult = {
    ...findResultRaw,
    docs: (findResultRaw.docs || []).filter((o: any) => {
      const until = (o as any).distributionUntil as string | undefined
      return !until || until > nowISO
    }),
  }

  // Viewer context
  const cu = await currentUser()
  const viewerClerkId = cu?.id || null
  const viewerUserRes = viewerClerkId
    ? await payload.find({ collection: 'users', where: { clerkId: { equals: viewerClerkId } }, limit: 1 })
    : null
  const viewerPayloadId: number | undefined = (viewerUserRes?.docs?.[0] as any)?.id
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        {/* <div className="mb-8 animate-slide-up">
          <h1 className="text-4xl font-bold text-foreground mb-2">Techni Zamowienia</h1>
          <p className="text-muted-foreground text-lg">Zamów sobie cos nwm </p>
        </div> */}

        <Sheet>
          <SheetTitle className="hidden">Przegląd ogłoszeń</SheetTitle>
          <div className="bg-card/70 backdrop-blur-xl rounded-2xl shadow-lg border border-border overflow-hidden animate-scale-in">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-muted/60 sticky z-10 backdrop-blur-sm">
                  <TableHead className="font-semibold text-foreground text-left">
                    Numer ogłoszenia
                  </TableHead>
                  <TableHead className="font-semibold text-foreground text-center">
                    Data realizacji
                  </TableHead>
                  <TableHead className="font-semibold text-foreground text-center">Sklep</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">
                    Opis
                  </TableHead>
                  <TableHead className="font-semibold text-foreground text-center">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-foreground text-center">
                    Uczestnicy
                  </TableHead>
                  <TableHead className="font-semibold text-foreground py-2 text-right">
                    <SheetTrigger asChild>
                      <Button variant="outline" asChild>
                        <Link href="/history">Historia</Link>
                      </Button>
                    </SheetTrigger>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="max-h-[60vh] overflow-y-auto w-full">
                {findResult.docs.map((order, index) => (
                  <TableRow
                    key={order.id}
                    className="hover:bg-muted/30 transition-all duration-200 animate-fade-in w-full"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <TableCell className="font-medium text-primary text-left">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-center">
                      {order.realisationDate
                        ? new Date(order.realisationDate).toLocaleDateString('pl-PL', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </TableCell>
                    <TableCell className="font-medium text-center">
                      {(order.store as Store)?.name || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground w-full text-center ">
                      {order.description || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {(() => {
                        const founderId: number | undefined =
                          typeof (order as any).founder === 'number'
                            ? ((order as any).founder as number)
                            : ((order as any).founder as any)?.id
                        const isMine = !!viewerPayloadId && !!founderId && founderId === viewerPayloadId
                        const carts = Array.isArray((order as any).carts) ? ((order as any).carts as any[]) : []
                        const hasCart = !!viewerClerkId && carts.some((c) => c?.userId === viewerClerkId)
                        const badge = isMine
                          ? { text: 'Moje Ogłoszenie', cls: 'bg-red-500/10 text-red-600 border border-red-500/20' }
                          : hasCart
                          ? { text: 'Wzięto udział', cls: 'bg-amber-500/10 text-amber-600 border border-amber-500/20' }
                          : { text: 'Dostępne', cls: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' }
                        return (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}>
                            {badge.text}
                          </span>
                        )
                      })()}
                    </TableCell>
                    <TableCell className="w-full text-center">
                      {(() => {
                        const items = (order as any).items as any[] | undefined
                        const uniqueIds = new Set<string>()
                        if (Array.isArray(items)) {
                          for (const it of items) {
                            const key = String(it?.userId || it?.userName || '')
                            if (key) uniqueIds.add(key)
                          }
                        }
                        const count = uniqueIds.size || order.participants?.length || 0
                        return (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                            {count} uczestników
                          </span>
                        )
                      })()}
                    </TableCell>
                    <TableCell className="w-full text-right">
                      <SheetTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-105 bg-transparent"
                          asChild
                        >
                          <Link href={`/orders-view/${order.orderNumber}`}>Szczegóły</Link>
                        </Button>
                      </SheetTrigger>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex gap-2 justify-end">
            <SheetTrigger asChild>
              <Button
                variant="default"
                className="shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                asChild
              >
                <Link href="/orders-view/create">+ Utwórz ogłoszenie</Link>
              </Button>
            </SheetTrigger>
          </div>

          <SheetContent className="w-full h-full p-8 bg-background border-l border-border">
            <div className="animate-slide-up">{children}</div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
