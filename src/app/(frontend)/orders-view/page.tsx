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

export default async function OrdersView() {
  const payload = await getPayload({ config: config })
  const findResult = await payload.find({ collection: 'orders' })

  return (
    <div className="flex flex-col gap-4">
      <h1>Orders</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order Number</TableHead>
            <TableHead>Realisation Date</TableHead>
            <TableHead>Store</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Participants</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
          <TableBody>
            {findResult.docs.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.orderNumber}</TableCell>
                <TableCell>{order.realisationDate}</TableCell>
                <TableCell>{(order.store as Store)?.name || ''}</TableCell>
                <TableCell>{order.description}</TableCell>
                <TableCell>{order.participants?.length || 0}</TableCell>
                <TableCell>
                  <Button>View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableHeader>
      </Table>
    </div>
  )
}
