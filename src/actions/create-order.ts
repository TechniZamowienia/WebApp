'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import { redirect } from 'next/navigation'

export async function createOrder(formData: FormData) {
  const payload = await getPayload({ config })

  const orderNumber = formData.get('orderNumber')

  let selectedStoreId = (formData.get('store')?.toString() || '').trim()
  const maybeNewStoreName = (formData.get('newStoreName')?.toString() || '').trim()

  if (selectedStoreId === 'create-new' && maybeNewStoreName) {
    const createdStore = await payload.create({
      collection: 'store',
      data: { name: maybeNewStoreName },
    })
    selectedStoreId = createdStore.id?.toString() || ''
  }

  const realisationDate = (
    formData.get('realisationDate')?.toString() || new Date().toISOString()
  ).trim()
  const description = (formData.get('description')?.toString() || '').trim()

  let storeDoc: any = undefined
  if (selectedStoreId) {
    const stores = await payload.find({
      collection: 'store',
      where: { id: { equals: selectedStoreId } },
    })
    storeDoc = stores.docs?.[0]
  }
  const tax = formData.get('tax')
  const taxType = formData.get('taxType')

  await payload.create({
    collection: 'orders',
    data: {
      orderNumber: Number(orderNumber),
      store: storeDoc || selectedStoreId || undefined,
      realisationDate,
      description,
      participants: [],
      tax: Number(tax),
      taxType: taxType as 'percentage' | 'fixed' | null,
    },
  })
  redirect(`/orders-view/${orderNumber}`)
}
