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

export default async function OrdersView({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config: config })
  const findResult = await payload.find({ collection: 'orders' })
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* <div className="mb-8 animate-slide-up">
          <h1 className="text-4xl font-bold text-foreground mb-2">Techni Zamowienia</h1>
          <p className="text-muted-foreground text-lg">Zamów sobie cos nwm </p>
        </div> */}

        <Sheet>
          <SheetTitle className="hidden">Orders View</SheetTitle>
          <div className="bg-card/70 backdrop-blur-xl rounded-2xl shadow-lg border border-border overflow-hidden animate-scale-in">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-muted/60 sticky z-10 backdrop-blur-sm">
                  <TableHead className="font-semibold text-foreground">Order Number</TableHead>
                  <TableHead className="font-semibold text-foreground">Realisation Date</TableHead>
                  <TableHead className="font-semibold text-foreground">Store</TableHead>
                  <TableHead className="font-semibold text-foreground">Description</TableHead>
                  <TableHead className="font-semibold text-foreground">Participants</TableHead>
                  <TableHead className="font-semibold text-foreground py-2">
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
                      <Button variant="outline" asChild>
                        <Link href="/history">History</Link>
                      </Button>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="max-h-[60vh] overflow-y-auto block w-full">
                {findResult.docs.map((order, index) => (
                  <TableRow
                    key={order.id}
                    className="hover:bg-muted/30 transition-all duration-200 animate-fade-in block w-full"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <TableCell className="font-medium text-primary w-full">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell className="text-muted-foreground w-full">
                      {order.realisationDate}
                    </TableCell>
                    <TableCell className="font-medium w-full">
                      {(order.store as Store)?.name || ''}
                    </TableCell>
                    <TableCell className="text-muted-foreground w-full">
                      {order.description}
                    </TableCell>
                    <TableCell className="w-full">
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
                            {count} participants
                          </span>
                        )
                      })()}
                    </TableCell>
                    <TableCell className="w-full">
                      <SheetTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-105 bg-transparent"
                          asChild
                        >
                          <Link href={`/orders-view/${order.orderNumber}`}>View Details</Link>
                        </Button>
                      </SheetTrigger>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <SheetContent className="w-full h-full p-8 bg-background border-l border-border">
            <div className="animate-slide-up">{children}</div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
