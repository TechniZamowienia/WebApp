import type React from "react"
import { getPayload } from "payload"
import config from "@/payload.config"
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import type { Store } from "@/payload-types"
import Link from "next/link"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export default async function OrdersView({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config: config })
  const findResult = await payload.find({ collection: "orders" })
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* <div className="mb-8 animate-slide-up">
          <h1 className="text-4xl font-bold text-foreground mb-2">Techni Zamowienia</h1>
          <p className="text-muted-foreground text-lg">Zamów sobie cos nwm </p>
        </div> */}

        <Sheet>
          <SheetTitle className="hidden">Orders View</SheetTitle>
          <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden animate-scale-in">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/70 transition-colors duration-200">
                  <TableHead className="font-semibold text-foreground">Order Number</TableHead>
                  <TableHead className="font-semibold text-foreground">Realisation Date</TableHead>
                  <TableHead className="font-semibold text-foreground">Store</TableHead>
                  <TableHead className="font-semibold text-foreground">Description</TableHead>
                  <TableHead className="font-semibold text-foreground">Participants</TableHead>
                  <TableHead className="font-semibold text-foreground">
                    <SheetTrigger asChild>
                      <Button
                        variant="default"
                        className="shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                        asChild
                      >
                        <Link href="/orders-view/create">+ Create Order</Link>
                      </Button>
                    </SheetTrigger>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {findResult.docs.map((order, index) => (
                  <TableRow
                    key={order.id}
                    className="hover:bg-muted/30 transition-all duration-200 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <TableCell className="font-medium text-primary">{order.orderNumber}</TableCell>
                    <TableCell className="text-muted-foreground">{order.realisationDate}</TableCell>
                    <TableCell className="font-medium">{(order.store as Store)?.name || ""}</TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">{order.description}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                        {order.participants?.length || 0} participants
                      </span>
                    </TableCell>
                    <TableCell>
                      <SheetTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-105 bg-transparent"
                          asChild
                        >
                          <Link href={`/orders-view/${order.id}`}>View Details</Link>
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
