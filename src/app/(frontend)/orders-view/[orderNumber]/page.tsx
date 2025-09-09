'use server'
import config from '@/payload.config'

import { getPayload } from 'payload'
import { Store } from '@/payload-types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function OrderViewPage({ params }: { params: { orderNumber: string } }) {
  const { orderNumber } = params
  console.log(orderNumber)
  const payload = await getPayload({ config: config })
  const order = await payload.find({
    collection: 'orders',
    where: { orderNumber: { equals: Number(orderNumber) } },
  })
  console.log(order)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order {order.docs[0].orderNumber}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{order.docs[0].description}</p>
        <p>{order.docs[0].realisationDate}</p>
        <p>{(order.docs[0].store as Store)?.name}</p>
        <p>{order.docs[0].participants?.map((participant) => participant.name).join(', ')}</p>
      </CardContent>
    </Card>
  )
}
