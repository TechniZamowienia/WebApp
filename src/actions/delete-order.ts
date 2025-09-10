'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import { redirect } from 'next/navigation'

export async function deleteOrderById(orderId: string | number) {
  const payload = await getPayload({ config })
  try {
    await payload.delete({ collection: 'orders', id: String(orderId) })
  } catch (e) {
    // ignore if missing; dev utility
  }
  redirect('/orders-view')
}


