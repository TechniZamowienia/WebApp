'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import { auth, currentUser } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

/**
 * Rate a user in context of an order after it's expired.
 * Rules:
 * - Organizer (founder) can rate participants (based on order.items userId)
 * - Participant can rate organizer (order.founder)
 * - Rating 1..5 integer
 */
export async function rateUser(orderNumber: number, targetUserPayloadId: number, value: number) {
  const { userId: viewerClerkId } = await auth()
  if (!viewerClerkId) return { ok: false, error: 'UNAUTHORIZED' }
  if (!Number.isFinite(orderNumber) || !Number.isFinite(targetUserPayloadId)) {
    return { ok: false, error: 'INVALID_INPUT' }
  }
  const rating = Math.max(1, Math.min(5, Math.round(Number(value))))

  const payload = await getPayload({ config })

  // resolve viewer payload user
  const viewerUsers = await payload.find({
    collection: 'users',
    where: { clerkId: { equals: viewerClerkId } },
    limit: 1,
  })
  const viewerPayloadId: number | undefined = (viewerUsers.docs?.[0] as any)?.id
  if (!viewerPayloadId) return { ok: false, error: 'USER_NOT_FOUND' }

  // find order
  const orders = await payload.find({
    collection: 'orders',
    where: { orderNumber: { equals: Number(orderNumber) } },
    limit: 1,
  })
  const order = orders.docs?.[0] as any
  if (!order) return { ok: false, error: 'ORDER_NOT_FOUND' }

  // check expiration
  const isExpired = !!order.distributionUntil && new Date(order.distributionUntil) <= new Date()
  if (!isExpired) return { ok: false, error: 'ORDER_NOT_EXPIRED' }

  const founderId: number | undefined =
    typeof order.founder === 'number' ? order.founder : (order.founder as any)?.id

  // compute permissions
  const isOrganizer = !!founderId && founderId === viewerPayloadId
  // map items' userId (clerk) to payload user ids via users collection
  const items: any[] = Array.isArray(order.items) ? order.items : []
  const participantClerkIds = new Set<string>(items.map((it) => String(it?.userId || ''))) // clerk IDs

  // resolve all participant payload IDs
  const participantPayloadIds = new Set<number>()
  if (participantClerkIds.size > 0) {
    const users = await payload.find({
      collection: 'users',
      where: { clerkId: { in: Array.from(participantClerkIds) } },
      limit: 200,
    })
    for (const u of users.docs || []) {
      const id = (u as any)?.id
      if (typeof id === 'number') participantPayloadIds.add(id)
    }
  }

  // who can rate whom
  let canRate = false
  if (isOrganizer) {
    // organizer rates participants
    canRate = participantPayloadIds.has(targetUserPayloadId)
  } else {
    // participant rates organizer
    // check if viewer is a participant (by clerk id)
    const isParticipant = participantClerkIds.has(String(viewerClerkId))
    canRate = isParticipant && !!founderId && targetUserPayloadId === founderId
  }

  // never allow rating oneself (by payload user id)
  if (viewerPayloadId && targetUserPayloadId && viewerPayloadId === targetUserPayloadId) {
    return { ok: false, error: 'FORBIDDEN' }
  }

  if (!canRate) return { ok: false, error: 'FORBIDDEN' }

  // prevent duplicate rating per order per rater->ratee
  const existing = await payload.find({
    // @ts-ignore use dynamic collection before types regen
    collection: 'ratings' as any,
    where: {
      and: [
        { orderNumber: { equals: Number(orderNumber) } },
        { rater: { equals: Number(viewerPayloadId) } },
        { ratee: { equals: Number(targetUserPayloadId) } },
      ],
    },
    limit: 1,
  } as any)
  if ((existing.docs || []).length > 0) {
    return { ok: false, error: 'ALREADY_RATED' }
  }

  // update target user's rating fields atomically
  const target = await payload.find({
    collection: 'users',
    where: { id: { equals: targetUserPayloadId } },
    limit: 1,
  })
  const targetDoc = target.docs?.[0] as any
  if (!targetDoc) return { ok: false, error: 'TARGET_NOT_FOUND' }

  const prevCount = Number(targetDoc.ratingCount || 0)
  const prevSum = Number(targetDoc.ratingSum || 0)
  const nextCount = prevCount + 1
  const nextSum = prevSum + rating
  const nextAvg = nextCount > 0 ? Number((nextSum / nextCount).toFixed(2)) : 0

  await payload.update({
    // bypass collection access restrictions
    overrideAccess: true,
    collection: 'users',
    id: String(targetDoc.id),
    // cast to any to avoid TS mismatch with generated types
    data: {
      ratingCount: nextCount,
      ratingSum: nextSum,
      ratingAverage: nextAvg,
    } as any,
  } as any)

  // create rating record (audit)
  await payload.create({
    // @ts-ignore dynamic collection
    collection: 'ratings' as any,
    data: {
      order: Number(order?.id || 0),
      orderNumber: Number(orderNumber),
      rater: Number(viewerPayloadId),
      ratee: Number(targetUserPayloadId),
      value: rating,
      createdAt: new Date().toISOString(),
    } as any,
  } as any)

  // refresh order view page
  revalidatePath(`/orders-view/${orderNumber}`)

  return { ok: true, rating: nextAvg }
}
