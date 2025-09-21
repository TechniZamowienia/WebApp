'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import { revalidatePath } from 'next/cache'
import { ensureUserCart } from '@/actions/set-cart-location'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function addOrderItem(orderNumber: number, formData: FormData) {
  const { userId } = await auth()
  const payload = await getPayload({ config })

  const name = (formData.get('name')?.toString() || '').trim()
  const price = Number(formData.get('price') || 0)
  if (!name || !price || !isFinite(price) || price < 0.01) return

  const now = new Date().toISOString()
  const clerkUser = await currentUser()
  const userName = clerkUser?.fullName || clerkUser?.username || ''

  const found = await payload.find({
    collection: 'orders',
    where: { orderNumber: { equals: Number(orderNumber) } },
    limit: 1,
  })
  const doc = found.docs?.[0]
  if (!doc) return

  await ensureUserCart(orderNumber)

  const nextItems = Array.isArray(doc.items) ? [...doc.items] : []
  nextItems.push({ name, price, userId: userId || 'anonymous', userName, createdAt: now })

  await payload.update({
    collection: 'orders',
    id: String(doc.id),
    data: { items: nextItems },
  })

  revalidatePath(`/orders-view/${orderNumber}`)
}

export async function getUserItemSuggestions(orderNumber: number) {
  const { userId } = await auth()
  const payload = await getPayload({ config })
  if (!userId) return [] as string[]

  const res = await payload.find({ collection: 'orders', limit: 50 })
  const names = new Set<string>()
  for (const o of res.docs || []) {
    const items = (o as any).items as any[] | undefined
    if (!items) continue
    for (const it of items) {
      if (it?.userId === userId && it?.name) names.add(String(it.name))
    }
  }
  return Array.from(names).slice(0, 10)
}


