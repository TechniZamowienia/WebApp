'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'

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
    selectedStoreId = String(createdStore.id ?? '')
  }

  const realisationDate = (
    formData.get('realisationDate')?.toString() || new Date().toISOString()
  ).trim()
  const distributionUntil = (formData.get('distributionUntil')?.toString() || '').trim()
  const description = (formData.get('description')?.toString() || '').trim()
  const taxRaw = (formData.get('tax')?.toString() || '').trim()
  const taxTypeRaw = (formData.get('taxType')?.toString() || '').trim()
  const taxProvided = taxRaw !== '' && !Number.isNaN(Number(taxRaw))
  const taxTypeValid = taxTypeRaw === 'fixed' || taxTypeRaw === 'percentage'
  const tax = taxProvided && taxTypeValid ? Number(taxRaw) : undefined
  const taxType: 'fixed' | 'percentage' | undefined = taxProvided && taxTypeValid ? (taxTypeRaw as any) : undefined

  let storeId: number | undefined = undefined
  if (selectedStoreId) {
    const stores = await payload.find({
      collection: 'store',
      where: { id: { equals: selectedStoreId } },
      limit: 1,
    })
    const found = stores.docs?.[0] as any
    if (typeof found?.id === 'number') {
      storeId = found.id
    } else if (!Number.isNaN(Number(selectedStoreId))) {
      storeId = Number(selectedStoreId)
    }
  }

  await payload.create({
    collection: 'orders',
    data: {
      orderNumber: Number(orderNumber),
      store: storeId,
      realisationDate,
  distributionUntil: distributionUntil || undefined,
      description,
      tax,
      taxType,
      participants: [],
      // @ts-ignore founder jest nowym polem dodanym w kolekcji Orders
      founder: await (async () => {
        const cu = await currentUser()
        const clerkId = cu?.id
        if (!clerkId) return undefined
        const u = await payload.find({
          collection: 'users',
          where: { clerkId: { equals: clerkId } },
          limit: 1,
        })
        const doc = u.docs?.[0] as any
        return typeof doc?.id === 'number' ? doc.id : undefined
      })(),
    },
  })
  redirect(`/orders-view/${orderNumber}`)
}
