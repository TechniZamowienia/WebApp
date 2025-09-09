import { currentUser } from '@clerk/nextjs/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { randomBytes } from 'node:crypto'

export default async function EnsurePayloadUser() {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) return null

    const payload = await getPayload({ config: await config })

    const clerkId = clerkUser.id
    const rawEmail =
      clerkUser.primaryEmailAddress?.emailAddress ||
      clerkUser.emailAddresses?.[0]?.emailAddress ||
      ''
    const email = rawEmail.trim().toLowerCase()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null

    const name = clerkUser.fullName || clerkUser.username || 'Użytkownik'

    // Szukaj po clerkId
    const byClerk = await payload.find({
      collection: 'users',
      where: { clerkId: { equals: clerkId } },
      limit: 1,
    })
    if (byClerk.docs?.length) return null

    // Jeśli istnieje po emailu – uzupełnij clerkId
    const byEmail = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
    })

    if (byEmail.docs?.length) {
      const doc = byEmail.docs[0] as any
      await payload.update({
        collection: 'users',
        id: doc.id,
        // @ts-ignore
        data: { clerkId } as any,
        overrideAccess: true,
      })
      return null
    }

    // Utwórz nowe konto z losowym silnym hasłem (wymagane przez Payload)
    const randomPassword = `${randomBytes(24).toString('base64url')}!A9a`

    try {
      await payload.create({
        collection: 'users',
        // @ts-ignore – dynamiczne pola względem wygenerowanych typów
        data: {
          clerkId,
          email,
          name,
          role: 'zamawiajacy',
          password: randomPassword,
        } as any,
        overrideAccess: true,
      })
    } catch (err: any) {
      // Jeżeli nastąpi kolizja unikalności email/klucza, zignoruj próbę
      const msg = String(err?.message || '')
      if (msg.toLowerCase().includes('unique') || msg.toLowerCase().includes('duplicate')) {
        return null
      }
      throw err
    }

    return null
  } catch (e) {
    console.error('EnsurePayloadUser error:', e)
    return null
  }
}
