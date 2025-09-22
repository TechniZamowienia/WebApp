import { getPayload } from 'payload'
import config from '@/payload.config'
import { auth, currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'

export default async function HistoriaPage() {
  const payload = await getPayload({ config })
  const { userId } = await auth()
  if (!userId) return <div>Brak dostępu</div>

  const cu = await currentUser()
  const clerkId = cu?.id

  let payloadUserId: string | undefined
  if (clerkId) {
    const users = await payload.find({
      collection: 'users',
      where: { clerkId: { equals: clerkId } },
      limit: 1,
    })
    const userDoc = users.docs?.[0] as any
    payloadUserId = userDoc?.id ? String(userDoc.id) : undefined
  }

  const createdByMeDocs: any[] = payloadUserId
    ? (
        await payload.find({
          collection: 'orders',
          where: { founder: { equals: payloadUserId } },
          limit: 100,
          sort: '-createdAt',
        })
      ).docs
    : []

  const tookPartRes = await payload.find({ collection: 'orders', limit: 200 })
  const nowISO = new Date().toISOString()

  const isClosed = (o: any) => {
    const until = (o as any).distributionUntil as string | undefined
    return !!until && until <= nowISO
  }

  const tookPart = (tookPartRes.docs || []).filter((o: any) => {
    const items = (o as any).items as any[] | undefined
    if (!Array.isArray(items)) return false
    return isClosed(o) && items.some((it) => String(it?.userId || '') === String(userId))
  })

  const createdByMeClosed = (createdByMeDocs || []).filter(isClosed)

  const founderIds = new Set<number>()
  for (const o of createdByMeClosed) {
    const f = (o as any).founder
    const id = typeof f === 'number' ? f : (f as any)?.id
    if (typeof id === 'number') founderIds.add(id)
  }
  for (const o of tookPart) {
    const f = (o as any).founder
    const id = typeof f === 'number' ? f : (f as any)?.id
    if (typeof id === 'number') founderIds.add(id)
  }

  const foundersRes = founderIds.size
    ? await payload.find({
        collection: 'users',
        where: { id: { in: Array.from(founderIds) } },
        limit: 200,
      })
    : { docs: [] as any[] }
  const foundersById = new Map<number, any>()
  for (const u of foundersRes.docs || []) {
    if (typeof (u as any)?.id === 'number') foundersById.set((u as any).id as number, u)
  }

  // Tiny helper to render stars
  function Stars({ avg, count }: { avg: number; count: number }) {
    const full = Math.floor(Math.max(0, Math.min(5, avg)))
    const empty = 5 - full
    return (
      <span className="ml-1 text-xs text-muted-foreground">
        <span className="text-amber-500">{'★'.repeat(full)}</span>
        <span className="text-muted-foreground/40">{'☆'.repeat(empty)}</span>
        <span className="ml-1">
          ({avg.toFixed(2)} / {count})
        </span>
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Historia</h1>
          <Button variant="outline" asChild>
            <Link href="/orders-view">Powrót do strony głównej</Link>
          </Button>
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-6 text-foreground">Moje ogłoszenia (zakończone)</h2>
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
                  <TableHead className="font-semibold text-foreground text-center">Opis</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-foreground text-center">
                    Uczestnicy
                  </TableHead>
                  <TableHead className="font-semibold text-foreground py-2 text-right">
                    Akcje
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="max-h-[60vh] overflow-y-auto w-full">
                {createdByMeClosed.map((o: any, index: number) => (
                  <TableRow
                    key={o.id}
                    className="hover:bg-muted/30 transition-all duration-200 animate-fade-in w-full"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <TableCell className="font-medium text-primary text-left">
                      {o.orderNumber}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-center">
                      {o.realisationDate
                        ? new Date(o.realisationDate).toLocaleDateString('pl-PL', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </TableCell>
                    <TableCell className="font-medium text-center">
                      {(o.store as any)?.name || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground w-full text-center">
                      {o.description || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600 border border-red-500/20">
                          Moje Ogłoszenie
                        </span>
                        {(() => {
                          const f = (o as any).founder
                          const id = typeof f === 'number' ? f : (f as any)?.id
                          const fu = typeof id === 'number' ? foundersById.get(id) : undefined
                          if (!fu) return null
                          const avg = Number((fu as any)?.ratingAverage || 0)
                          const count = Number((fu as any)?.ratingCount || 0)
                          return (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <span>Organizator:</span>
                              <span className="font-medium text-foreground">
                                {(fu as any)?.name || '—'}
                              </span>
                              <Stars avg={avg} count={count} />
                            </div>
                          )
                        })()}
                      </div>
                    </TableCell>
                    <TableCell className="w-full text-center">
                      {(() => {
                        const items = (o as any).items as any[] | undefined
                        const uniqueIds = new Set<string>()
                        if (Array.isArray(items)) {
                          for (const it of items) {
                            const key = String(it?.userId || it?.userName || '')
                            if (key) uniqueIds.add(key)
                          }
                        }
                        const count = uniqueIds.size || o.participants?.length || 0
                        return (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                            {count} uczestników
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
                        <Link href={`/orders-view/${o.orderNumber}`}>Szczegóły</Link>
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="ml-2 hover:scale-105 transition-all duration-200"
                        asChild
                      >
                        <Link href={`/orders-view/${o.orderNumber}#ocen`}>Oceń</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-6 text-foreground">
            W których brałem udział (zakończone)
          </h2>
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
                  <TableHead className="font-semibold text-foreground text-center">Opis</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-foreground text-center">
                    Uczestnicy
                  </TableHead>
                  <TableHead className="font-semibold text-foreground py-2 text-right">
                    Akcje
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="max-h-[60vh] overflow-y-auto w-full">
                {tookPart.map((o: any, index: number) => (
                  <TableRow
                    key={o.id}
                    className="hover:bg-muted/30 transition-all duration-200 animate-fade-in w-full"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <TableCell className="font-medium text-primary text-left">
                      {o.orderNumber}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-center">
                      {o.realisationDate
                        ? new Date(o.realisationDate).toLocaleDateString('pl-PL', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </TableCell>
                    <TableCell className="font-medium text-center">
                      {(o.store as any)?.name || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground w-full text-center">
                      {o.description || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          Wzięto udział
                        </span>
                        {(() => {
                          const f = (o as any).founder
                          const id = typeof f === 'number' ? f : (f as any)?.id
                          const fu = typeof id === 'number' ? foundersById.get(id) : undefined
                          if (!fu) return null
                          const avg = Number((fu as any)?.ratingAverage || 0)
                          const count = Number((fu as any)?.ratingCount || 0)
                          return (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <span>Organizator:</span>
                              <span className="font-medium text-foreground">
                                {(fu as any)?.name || '—'}
                              </span>
                              <Stars avg={avg} count={count} />
                            </div>
                          )
                        })()}
                      </div>
                    </TableCell>
                    <TableCell className="w-full text-center">
                      {(() => {
                        const items = (o as any).items as any[] | undefined
                        const uniqueIds = new Set<string>()
                        if (Array.isArray(items)) {
                          for (const it of items) {
                            const key = String(it?.userId || it?.userName || '')
                            if (key) uniqueIds.add(key)
                          }
                        }
                        const count = uniqueIds.size || o.participants?.length || 0
                        return (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                            {count} uczestników
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
                        <Link href={`/orders-view/${o.orderNumber}`}>Szczegóły</Link>
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="ml-2 hover:scale-105 transition-all duration-200"
                        asChild
                      >
                        <Link href={`/orders-view/${o.orderNumber}#ocen`}>Oceń</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}
