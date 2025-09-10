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
import { Store } from '@/payload-types'
import Link from 'next/link'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

export default async function OrdersView({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config: config })
  const findResult = await payload.find({ collection: 'orders' })
  return (
    <div className="flex flex-row gap-4 h-full w-full">
      <Sheet>
        <SheetTitle className="hidden">Orders View</SheetTitle>
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Order Number</TableHead>
              <TableHead>Realisation Date</TableHead>
              <TableHead>Store</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead>Tax</TableHead>
              <TableHead>
                <SheetTrigger asChild>
                  <Button variant="outline" asChild>
                    <Link href="/orders-view/create">Create Order</Link>
                  </Button>
                </SheetTrigger>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {findResult.docs.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.orderNumber}</TableCell>
                <TableCell>{order.realisationDate}</TableCell>
                <TableCell>{(order.store as Store)?.name || ''}</TableCell>
                <TableCell>{order.description}</TableCell>
                <TableCell>{order.participants?.length || 0}</TableCell>
                <TableCell>{order.tax || 0}%</TableCell>
                <TableCell>
                  <SheetTrigger asChild>
                    <Button variant="outline" asChild>
                      <Link href={`/orders-view/${order.id}`}>View</Link>
                    </Button>
                  </SheetTrigger>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <SheetContent className="w-full h-full p-7">{children}</SheetContent>
      </Sheet>
    </div>
  )
}
