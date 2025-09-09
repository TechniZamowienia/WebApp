import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CreateOrderForm from '@/components/create-order-form'
import config from '@/payload.config'
import { getPayload } from 'payload'

export default async function CreateOrderPage() {
  const payload = await getPayload({ config: config })
  const stores = await payload.find({ collection: 'store' })
  const orders = await payload.find({ collection: 'orders' })
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Order</CardTitle>
      </CardHeader>
      <CardContent>
        <CreateOrderForm props={{ stores: stores.docs, orders: orders.docs }} />
      </CardContent>
    </Card>
  )
}
