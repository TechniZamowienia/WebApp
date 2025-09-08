import { getPayload } from 'payload'
import config from '@/payload.config'

export default async function OrdersView() {
  const payload = await getPayload({ config: config })
  const findResult = await payload.find({ collection: 'orders' })

  return <div>OrdersView</div>
}
