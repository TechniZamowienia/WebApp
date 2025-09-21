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
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-3">Moje ogłoszenia</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numer</TableHead>
                <TableHead>Data realizacji</TableHead>
                <TableHead>Sklep</TableHead>
                <TableHead>Opis</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(createdByMeDocs || []).map((o: any) => (
                <TableRow key={o.id}>
                  <TableCell>{o.orderNumber}</TableCell>
                  <TableCell>
                    {o.realisationDate
                      ? new Date(o.realisationDate).toLocaleDateString('pl-PL', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })
                      : '-'}
                  </TableCell>
                  <TableCell>{(o.store as any)?.name || ''}</TableCell>
                  <TableCell>{o.description}</TableCell>
                  <TableCell>
                    <Button variant="outline" asChild>
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
        <h2 className="text-2xl font-semibold mb-3">W których brałem udział</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numer</TableHead>
                <TableHead>Data realizacji</TableHead>
                <TableHead>Sklep</TableHead>
                <TableHead>Opis</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tookPart.map((o: any) => (
                <TableRow key={o.id}>
                  <TableCell>{o.orderNumber}</TableCell>
                  <TableCell>
                    {o.realisationDate
                      ? new Date(o.realisationDate).toLocaleDateString('pl-PL', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })
                      : '-'}
                  </TableCell>
                  <TableCell>{(o.store as any)?.name || ''}</TableCell>
                  <TableCell>{o.description}</TableCell>
                  <TableCell>
                    <Button variant="outline" asChild>
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
  )
}
