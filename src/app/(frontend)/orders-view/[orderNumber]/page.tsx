import config from "@/payload.config"

import { getPayload } from "payload"
import type { Store } from "@/payload-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { deleteOrderById } from "@/actions/delete-order"

export default async function OrderViewPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params
  const payload = await getPayload({ config })
  const order = await payload.find({
    collection: "orders",
    where: { orderNumber: { equals: Number(orderNumber) } },
    limit: 1,
  })

  const doc = order?.docs?.[0] as any
  if (!doc) {
    return (
      <div className="max-w-3xl mx-auto p-6 md:p-8">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-center text-xl md:text-2xl">Nie znaleziono zamówienia</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Zamówienie o numerze {orderNumber} nie istnieje.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const store = doc.store as Store | undefined
  const participants = Array.isArray(doc.participants) ? doc.participants : []
  const formattedDate = doc.realisationDate ? new Date(doc.realisationDate).toLocaleDateString() : "—"

  return (
    <div className="animate-fade-in">
      <Card className="w-full border-0 shadow-xl bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-primary-foreground font-bold">#</span>
              </div>
              Order #{doc.orderNumber}
            </CardTitle>
            // dev
            <div className="flex items-center gap-3">
              <span className="text-xs px-2 py-1 rounded-md bg-muted/60 text-muted-foreground border">DEV</span>
              <form action={async () => { 'use server'; await deleteOrderById(doc.id) }}>
                <Button type="submit" variant="destructive" size="sm" className="hover:shadow-md">
                  Delete
                </Button>
              </form>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                <h3 className="font-semibold text-foreground mb-2">Description</h3>
                <p className="text-muted-foreground">{doc.description || "—"}</p>
              </div>

              <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                <h3 className="font-semibold text-foreground mb-2">Realisation Date</h3>
                <p className="text-muted-foreground">{formattedDate}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                <h3 className="font-semibold text-foreground mb-2">Store</h3>
                <p className="text-muted-foreground">{store?.name || "—"}</p>
              </div>

              <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                <h3 className="font-semibold text-foreground mb-2">Participants</h3>
                <div className="flex flex-wrap gap-2">
                  {participants.length > 0 ? (
                    participants.map((p: any, index: number) => (
                      <span
                        key={p?.id || p?.name || index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/10 text-accent border border-accent/20"
                      >
                        {p?.name || "—"}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground">No participants</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
