'use server'

import { auth, currentUser } from '@clerk/nextjs/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { revalidatePath } from 'next/cache'

export async function removeOrderUser(orderNumber: number, targetUserId: string) {
  const { userId: clerkViewerId } = await auth()
  if (!clerkViewerId) return

  const payload = await getPayload({ config })

  const found = await payload.find({
    collection: 'orders',
    where: { orderNumber: { equals: Number(orderNumber) } },
    limit: 1,
  })
  const doc = found.docs?.[0] as any
  if (!doc) return

  const viewerUsers = await payload.find({
    collection: 'users',
    where: { clerkId: { equals: clerkViewerId } },
    limit: 1,
  })
  const viewerPayloadId: number | undefined = (viewerUsers.docs?.[0] as any)?.id


  const founderId: number | undefined =
    typeof doc.founder === 'number' ? doc.founder : (doc.founder as any)?.id

  if (!viewerPayloadId || !founderId || viewerPayloadId !== founderId) {
    return
  }

  const nextItems = Array.isArray(doc.items)
    ? doc.items.filter((it: any) => it?.userId !== targetUserId)
    : []
  const nextCarts = Array.isArray(doc.carts)
    ? doc.carts.filter((c: any) => c?.userId !== targetUserId)
    : []

  await payload.update({
    collection: 'orders',
    id: String(doc.id),
    data: { items: nextItems, carts: nextCarts },
  })

  revalidatePath(`/orders-view/${orderNumber}`)
}
