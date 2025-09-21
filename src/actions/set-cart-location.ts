'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import { revalidatePath } from 'next/cache'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function setCartLocation(orderNumber: number, formData: FormData) {
  const { userId } = await auth()
  if (!userId) return

  const payload = await getPayload({ config })
  const location = (formData.get('location')?.toString() || '').trim()

  const now = new Date().toISOString()
  const clerkUser = await currentUser()
  const userName = clerkUser?.fullName || clerkUser?.username || ''

  const found = await payload.find({
    collection: 'orders',
    where: { orderNumber: { equals: Number(orderNumber) } },
    limit: 1,
  })
  const doc = found.docs?.[0] as any
  if (!doc) return

  const carts: any[] = Array.isArray(doc.carts) ? [...doc.carts] : []
  const idx = carts.findIndex((c) => c?.userId === userId)
  if (idx === -1) {
    carts.push({ userId, userName, location, createdAt: now, updatedAt: now })
  } else {
    carts[idx] = {
      ...carts[idx],
      userName: carts[idx]?.userName || userName,
      location,
      updatedAt: now,
    }
  }

  await payload.update({
    collection: 'orders',
    id: String(doc.id),
    data: { carts },
  })

  revalidatePath(`/orders-view/${orderNumber}`)
}

export async function ensureUserCart(orderNumber: number) {
  // Creates a cart with empty location if missing. Returns the cart.
  const { userId } = await auth()
  if (!userId) return null as any
  const payload = await getPayload({ config })

  const now = new Date().toISOString()
  const clerkUser = await currentUser()
  const userName = clerkUser?.fullName || clerkUser?.username || ''

  const found = await payload.find({
    collection: 'orders',
    where: { orderNumber: { equals: Number(orderNumber) } },
    limit: 1,
  })
  const doc = found.docs?.[0] as any
  if (!doc) return null as any

  const carts: any[] = Array.isArray(doc.carts) ? [...doc.carts] : []
  let cart = carts.find((c) => c?.userId === userId)
  if (!cart) {
    cart = { userId, userName, location: '', createdAt: now, updatedAt: now }
    carts.push(cart)
    await payload.update({
      collection: 'orders',
      id: String(doc.id),
      data: { carts },
    })
  }
  return cart
}
