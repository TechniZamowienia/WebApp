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
  const tookPart = (tookPartRes.docs || []).filter((o: any) => {
    const items = (o as any).items as any[] | undefined
    if (!Array.isArray(items)) return false
    return items.some((it) => String(it?.userId || '') === String(userId))
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <div>
          <h2 className="text-3xl font-bold mb-6 text-foreground">Moje ogłoszenia</h2>
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
                {(createdByMeDocs || []).map((o: any, index: number) => (
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600 border border-red-500/20">
                        Moje Ogłoszenie
                      </span>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-6 text-foreground">W których brałem udział</h2>
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        Wzięto udział
                      </span>
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
