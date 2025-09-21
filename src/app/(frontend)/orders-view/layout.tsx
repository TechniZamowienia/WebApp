import React from 'react'
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
import SheetController from './sheet-controller'

export default async function OrdersView({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config: config })
  const findResult = await payload.find({ collection: 'orders' })

  const tableContent = (
    <div className="bg-card/70 backdrop-blur-xl rounded-2xl shadow-lg border border-border overflow-hidden animate-scale-in">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="bg-muted/60 sticky z-10 backdrop-blur-sm">
            <TableHead className="font-semibold text-foreground text-left">Order Number</TableHead>
            <TableHead className="font-semibold text-foreground text-center">
              Realisation Date
            </TableHead>
            <TableHead className="font-semibold text-foreground text-center">Store</TableHead>
            <TableHead className="font-semibold text-foreground text-center">Description</TableHead>
            <TableHead className="font-semibold text-foreground text-center">
              Participants
            </TableHead>
            <TableHead className="font-semibold text-foreground py-2 text-right">
              <Button variant="outline" asChild>
                <Link href="/history">History</Link>
              </Button>
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
                      {count} participants
                    </span>
                  )
                })()}
              </TableCell>
              <TableCell className="w-full text-right">
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-105 bg-transparent"
                  asChild
                >
                  <Link href={`/orders-view/${order.orderNumber}`}>View Details</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        <SheetController tableContent={tableContent}>{children}</SheetController>
      </div>
    </div>
  )
}
