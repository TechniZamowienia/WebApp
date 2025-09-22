import config from '@/payload.config'

import { getPayload } from 'payload'
import type { Store } from '@/payload-types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { deleteOrderById } from '@/actions/delete-order'
import { addOrderItem, getUserItemSuggestions } from '@/actions/add-order-item'
import { rateUser } from '@/actions/rate-user'
import { Input } from '@/components/ui/input'
import { setCartLocation } from '@/actions/set-cart-location'
import { currentUser } from '@clerk/nextjs/server'
import { removeOrderUser } from '@/actions/remove-order-user'
import { Trash2Icon } from 'lucide-react'

export default async function OrderViewPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>
}) {
  const { orderNumber } = await params
  const payload = await getPayload({ config })
  const order = await payload.find({
    collection: 'orders',
    where: { orderNumber: { equals: Number(orderNumber) } },
    limit: 1,
  })

  const doc = order?.docs?.[0] as any
  if (!doc) {
    return (
      <div className="max-w-3xl mx-auto p-6 md:p-8">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-center text-xl md:text-2xl">
              Nie znaleziono zamówienia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Zamówienie o numerze {orderNumber} nie istnieje.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const store = doc.store as Store | undefined
  const participants = Array.isArray(doc.participants) ? doc.participants : []
  const formattedDate = doc.realisationDate
    ? new Date(doc.realisationDate).toLocaleDateString()
    : '—'

  const suggestions = await getUserItemSuggestions(Number(orderNumber))

  const pln = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' })
  const items = Array.isArray(doc.items) ? doc.items : []
  const totalPrice = items.reduce((sum: number, it: any) => sum + (Number(it?.price) || 0), 0)
  const taxType: 'percentage' | 'fixed' | '' =
    String(doc?.taxType || '') === 'percentage'
      ? 'percentage'
      : String(doc?.taxType || '') === 'fixed'
        ? 'fixed'
        : ''
  const taxValue = Number.isFinite(Number(doc?.tax)) ? Number(doc.tax) : 0
  const groupsMap = items.reduce((map: Map<string, number>, it: any) => {
    const uid = String(it?.userId || 'unknown')
    const price = Number(it?.price) || 0
    map.set(uid, (map.get(uid) || 0) + price)
    return map
  }, new Map<string, number>())
  const organizerTotalWithTax = (Array.from(groupsMap.values()) as number[]).reduce(
    (sum: number, subtotal: number) => {
      const taxAmt =
        taxType === 'percentage' ? (subtotal * taxValue) / 100 : taxType === 'fixed' ? taxValue : 0
      return sum + subtotal + taxAmt
    },
    0,
  )
  const uniqueParticipantsFromItems = Array.from(
    new Map(
      items
        .filter((it: any) => it?.userId || it?.userName)
        .map((it: any) => {
          const id = String(it.userId || it.userName)
          const name = String(it.userName || 'Użytkownik')
          return [id, { id, name }]
        }),
    ).values(),
  )

  const cu = await currentUser()
  const viewerId = cu?.id || null
  const carts: any[] = Array.isArray((doc as any).carts) ? (doc as any).carts : []
  const yourCart = viewerId ? carts.find((c) => c?.userId === viewerId) : null
  const yourLocation = yourCart?.location || ''

  const viewerUserRes = viewerId
    ? await payload.find({
        collection: 'users',
        where: { clerkId: { equals: viewerId } },
        limit: 1,
      })
    : null
  const viewerPayloadId: number | undefined = (viewerUserRes?.docs?.[0] as any)?.id
  const founderId: number | undefined =
    typeof doc.founder === 'number' ? doc.founder : (doc.founder as any)?.id
  const isFounder = !!viewerPayloadId && !!founderId && viewerPayloadId === founderId

  const founderClerkId: string | null = await (async () => {
    if (!doc?.founder) return null
    if (typeof doc.founder === 'object' && (doc.founder as any)?.clerkId) {
      return (doc.founder as any).clerkId as string
    }
    if (typeof doc.founder === 'number') {
      const fr = await payload.find({
        collection: 'users',
        where: { id: { equals: doc.founder } },
        limit: 1,
      })
      return ((fr.docs?.[0] as any)?.clerkId as string) || null
    }
    return null
  })()

  const now = new Date()
  const isExpired = !!doc.distributionUntil && new Date(doc.distributionUntil) <= now

  const participantClerkIds = Array.from(
    new Set<string>(items.map((it: any) => String(it?.userId || '')).filter(Boolean)),
  )
  const participantUsersRes =
    participantClerkIds.length > 0
      ? await payload.find({
          collection: 'users',
          where: { clerkId: { in: participantClerkIds } },
          limit: 200,
        })
      : { docs: [] as any[] }
  const participantUsers = (participantUsersRes.docs || []).map((u: any) => ({
    id: u?.id as number,
    name: u?.name as string,
    ratingAverage: Number(u?.ratingAverage || 0),
    ratingCount: Number(u?.ratingCount || 0),
    clerkId: String(u?.clerkId || ''),
  }))

  const founderUserRes = founderId
    ? await payload.find({ collection: 'users', where: { id: { equals: founderId } }, limit: 1 })
    : null
  const founderUser: { id?: number; name?: string; ratingAverage?: number; ratingCount?: number } =
    founderUserRes
      ? {
          id: (founderUserRes.docs?.[0] as any)?.id,
          name: (founderUserRes.docs?.[0] as any)?.name,
          ratingAverage: Number((founderUserRes.docs?.[0] as any)?.ratingAverage || 0),
          ratingCount: Number((founderUserRes.docs?.[0] as any)?.ratingCount || 0),
        }
      : {}

  const isParticipant = !!viewerId && participantClerkIds.includes(String(viewerId))
  const participantSubtotal = viewerId
    ? items
        .filter((it: any) => String(it?.userId || '') === String(viewerId))
        .reduce((s: number, it: any) => s + (Number(it?.price) || 0), 0)
    : 0
  const participantTax =
    taxType === 'percentage'
      ? (participantSubtotal * taxValue) / 100
      : taxType === 'fixed'
        ? participantSubtotal > 0
          ? taxValue
          : 0
        : 0
  const participantTotalWithTax = participantSubtotal + participantTax
  const headerSum = isFounder ? organizerTotalWithTax : isParticipant ? participantTotalWithTax : 0
  const headerNet = isFounder ? totalPrice : isParticipant ? participantSubtotal : 0
  const headerTax = isFounder
    ? Math.max(0, organizerTotalWithTax - totalPrice)
    : isParticipant
      ? participantTax
      : 0
  const headerTooltip =
    (taxType === 'percentage' || taxType === 'fixed') && headerNet > 0
      ? taxType === 'percentage'
        ? `Suma netto: ${pln.format(headerNet)} + Tax ${taxValue}%: ${pln.format(headerTax)} = Razem: ${pln.format(headerSum)}`
        : `Suma netto: ${pln.format(headerNet)} + Tax: ${pln.format(headerTax)} = Razem: ${pln.format(headerSum)}`
      : ''

  const ratingsByViewerRes = viewerPayloadId
    ? await payload.find({
        collection: 'ratings',
        where: {
          and: [
            { orderNumber: { equals: Number(orderNumber) } },
            { rater: { equals: Number(viewerPayloadId) } },
          ],
        },
        limit: 200,
      })
    : null
  const alreadyRatedIds = new Set<number>(
    (ratingsByViewerRes?.docs || []).map((r: any) =>
      typeof r?.ratee === 'number' ? (r.ratee as number) : Number((r?.ratee as any)?.id || 0),
    ),
  )
  const organizerAlreadyRated = founderId ? alreadyRatedIds.has(Number(founderId)) : false
  const rateableParticipants = participantUsers.filter(
    (p) => typeof p.id === 'number' && p.id !== founderId && !alreadyRatedIds.has(Number(p.id)),
  )
  const defaultRateeId = rateableParticipants.length > 0 ? String(rateableParticipants[0].id) : ''

  return (
    <div className="animate-fade-in">
      <Card className="w-full border-0 shadow-xl bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-primary-foreground font-bold">#</span>
              </div>
              Ogłoszenie #{doc.orderNumber}
            </CardTitle>
            {isExpired && (
              <span className="text-xs px-2 py-1 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                Ogłoszenie wygasło
              </span>
            )}
            {/* dev */}
            <div className="flex items-center gap-3">
              {items.length > 0 && (isFounder || isParticipant) && (
                <span
                  className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20"
                  title={headerTooltip || undefined}
                >
                  Suma: {pln.format(headerSum)}
                </span>
              )}
              <span className="text-xs px-2 py-1 rounded-md bg-muted/60 text-muted-foreground border">
                DEV
              </span>
              <form
                action={async () => {
                  'use server'
                  await deleteOrderById(doc.id)
                }}
              >
                <Button type="submit" variant="destructive" size="sm" className="hover:shadow-md">
                  Usuń
                </Button>
              </form>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <section className="p-5 bg-muted/20 rounded-xl border border-border/60">
                <h3 className="font-semibold text-foreground mb-4">Szczegóły</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">Opis</dt>
                    <dd className="text-sm text-foreground">{doc.description || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                      Realizacja
                    </dt>
                    <dd className="text-sm text-foreground">{formattedDate}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">Sklep</dt>
                    <dd className="text-sm text-foreground">{store?.name || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                      Podatek
                    </dt>
                    <dd className="text-sm text-foreground">
                      {taxType === 'percentage'
                        ? `${taxValue}%`
                        : taxType === 'fixed'
                          ? pln.format(taxValue)
                          : '—'}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="p-5 bg-muted/20 rounded-xl border border-border/60">
                <h3 className="font-semibold text-foreground mb-3">Dodaj produkt</h3>
                <form
                  action={async (formData) => {
                    'use server'
                    await addOrderItem(Number(orderNumber), formData)
                  }}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-end"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label
                        htmlFor="item-name"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Nazwa
                      </label>
                      <Input
                        id="item-name"
                        name="name"
                        list="item-suggestions"
                        placeholder="np. kanapka, cola"
                        required
                      />
                      <datalist id="item-suggestions">
                        {suggestions.map((s) => (
                          <option key={s} value={s} />
                        ))}
                      </datalist>
                    </div>
                    <div className="space-y-1">
                      <label
                        htmlFor="item-price"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Cena
                      </label>
                      <div className="relative">
                        <Input
                          id="item-price"
                          name="price"
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="0,00"
                          required
                          className="pr-12"
                        />
                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                          PLN
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="h-10 px-6 justify-self-start sm:justify-self-auto"
                    disabled={isExpired}
                  >
                    Dodaj
                  </Button>
                </form>
                <p className="mt-2 text-xs text-muted-foreground">
                  Podpowiedzi uzupełnią nazwę na podstawie Twoich wcześniejszych zamówień.
                </p>
              </section>
              <section className="p-5 bg-muted/20 rounded-xl border border-border/60">
                <h3 className="font-semibold text-foreground mb-3">Produkty</h3>
                {items.length === 0 ? (
                  <p className="text-muted-foreground">Brak produktów. Dodaj pierwszy poniżej.</p>
                ) : isFounder ? (
                  <div className="space-y-2">
                    {(
                      Array.from(
                        items
                          .reduce(
                            (
                              map: Map<string, { userId: string; userName: string; items: any[] }>,
                              it: any,
                            ) => {
                              const uid = String(it?.userId || 'unknown')
                              const name = String(it?.userName || 'Użytkownik')
                              if (!map.has(uid))
                                map.set(uid, { userId: uid, userName: name, items: [] })
                              map.get(uid)!.items.push(it)
                              return map
                            },
                            new Map<string, { userId: string; userName: string; items: any[] }>(),
                          )
                          .values(),
                      ) as Array<{ userId: string; userName: string; items: any[] }>
                    ).map((group, i) => {
                      const subtotal = group.items.reduce(
                        (s: number, it: any) => s + (Number(it?.price) || 0),
                        0,
                      )
                      const taxAmt =
                        taxType === 'percentage'
                          ? (subtotal * taxValue) / 100
                          : taxType === 'fixed'
                            ? taxValue
                            : 0
                      const total = subtotal + taxAmt
                      return (
                        <details
                          key={group.userId || i}
                          className="rounded-md border border-border bg-card/50"
                        >
                          <summary className="flex items-center gap-3 px-3 py-2 cursor-pointer select-none">
                            <span className="inline-flex items-center justify-center size-6 rounded-full bg-primary/15 text-primary text-xs font-bold">
                              {(group.userName || 'U')?.slice(0, 1).toUpperCase()}
                            </span>
                            <span className="text-sm font-medium text-foreground">
                              Koszyk: {group.userName || 'Użytkownik'}
                            </span>
                            <span className="ml-auto text-xs text-muted-foreground">
                              {taxType === 'percentage' && taxValue > 0 ? (
                                <>
                                  Suma: {pln.format(subtotal)} + Tax {taxValue}%:{' '}
                                  {pln.format(taxAmt)} ={' '}
                                  <span className="font-semibold text-foreground">
                                    {pln.format(total)}
                                  </span>
                                </>
                              ) : taxType === 'fixed' && taxValue > 0 ? (
                                <>
                                  Suma: {pln.format(subtotal)} + Tax {pln.format(taxValue)} ={' '}
                                  <span className="font-semibold text-foreground">
                                    {pln.format(total)}
                                  </span>
                                </>
                              ) : (
                                <>
                                  Suma:{' '}
                                  <span className="font-semibold text-foreground">
                                    {pln.format(subtotal)}
                                  </span>
                                </>
                              )}
                            </span>
                          </summary>
                          <ul className="divide-y divide-border">
                            {group.items.map((it: any, idx: number) => (
                              <li
                                key={idx}
                                className="flex items-center justify-between gap-4 px-3 py-2 bg-card/60 odd:bg-card/40"
                              >
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-foreground">
                                    {it.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {group.userName}
                                  </span>
                                </div>
                                <span className="text-sm text-foreground font-semibold">
                                  {pln.format(Number(it.price) || 0)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </details>
                      )
                    })}
                  </div>
                ) : (
                  (() => {
                    const myItems = viewerId
                      ? items.filter((it: any) => String(it?.userId || '') === String(viewerId))
                      : []
                    const subtotal = myItems.reduce(
                      (s: number, it: any) => s + (Number(it?.price) || 0),
                      0,
                    )
                    const taxAmt =
                      taxType === 'percentage'
                        ? (subtotal * taxValue) / 100
                        : taxType === 'fixed'
                          ? taxValue
                          : 0
                    const total = subtotal + taxAmt
                    return (
                      <div className="space-y-2">
                        {myItems.length === 0 ? (
                          <p className="text-muted-foreground">
                            Nie masz jeszcze produktów w tym ogłoszeniu.
                          </p>
                        ) : (
                          <ul className="divide-y divide-border rounded-md border border-border overflow-hidden max-h-64 overflow-y-auto [scrollbar-width:thin]">
                            {myItems.map((it: any, idx: number) => (
                              <li
                                key={idx}
                                className="flex items-center justify-between gap-4 px-3 py-2 bg-card/60 odd:bg-card/40"
                              >
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-foreground">
                                    {it.name}
                                  </span>
                                </div>
                                <span className="text-sm text-foreground font-semibold">
                                  {pln.format(Number(it.price) || 0)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="text-sm text-foreground flex flex-wrap items-center gap-3 pt-1">
                          <span>Twoja suma:</span>
                          <span className="font-medium">{pln.format(subtotal)}</span>
                          {taxType === 'percentage' && taxValue > 0 && (
                            <>
                              <span className="text-muted-foreground">+ Tax {taxValue}%:</span>
                              <span className="font-medium">{pln.format(taxAmt)}</span>
                            </>
                          )}
                          {taxType === 'fixed' && taxValue > 0 && (
                            <>
                              <span className="text-muted-foreground">+ Tax:</span>
                              <span className="font-medium">{pln.format(taxValue)}</span>
                            </>
                          )}
                          <span className="text-muted-foreground">Razem do zapłaty:</span>
                          <span className="font-semibold">{pln.format(total)}</span>
                        </div>
                      </div>
                    )
                  })()
                )}
              </section>
              {isExpired && isFounder && participantUsers.length > 0 && (
                <section id="ocen" className="p-5 bg-muted/20 rounded-xl border border-border/60">
                  <h3 className="font-semibold text-foreground mb-3">Oceń uczestnika</h3>
                  <form
                    action={async (formData) => {
                      'use server'
                      const val = Number(formData.get('rating') || 0)
                      const ratee = Number(formData.get('ratee') || 0)
                      if (ratee && val >= 1 && val <= 5) {
                        await rateUser(Number(orderNumber), ratee, val)
                      }
                    }}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 rounded-md border bg-card/50"
                  >
                    <div className="flex-1 flex items-center gap-2">
                      <label className="text-xs font-medium text-muted-foreground min-w-28">
                        Uczestnik
                      </label>
                      <select
                        name="ratee"
                        className="h-9 rounded-md border bg-background px-2 text-sm w-full"
                        defaultValue={defaultRateeId}
                        required
                        disabled={rateableParticipants.length === 0}
                      >
                        {rateableParticipants.map((p) => (
                          <option key={p.id} value={String(p.id)}>
                            {p.name} (Śr. {Number(p.ratingAverage || 0).toFixed(2)} /{' '}
                            {Number(p.ratingCount || 0)})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        name="rating"
                        className="h-9 rounded-md border bg-background px-2 text-sm"
                        defaultValue={5}
                        disabled={rateableParticipants.length === 0}
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                      <Button type="submit" size="sm" disabled={rateableParticipants.length === 0}>
                        Oceń
                      </Button>
                    </div>
                  </form>
                </section>
              )}
              <section className="p-5 bg-muted/20 rounded-xl border border-border/60">
                <h3 className="font-semibold text-foreground mb-3">Uczestnicy</h3>
                <div className="flex flex-wrap gap-2">
                  {(uniqueParticipantsFromItems.length > 0
                    ? uniqueParticipantsFromItems
                    : participants
                  ).length > 0 ? (
                    (uniqueParticipantsFromItems.length > 0
                      ? uniqueParticipantsFromItems
                      : participants
                    ).map((p: any, index: number) => (
                      <span
                        key={p?.id || `${p?.name}-${index}`}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border bg-card/60"
                      >
                        <span className="inline-flex items-center justify-center size-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                          {(p?.name || 'U')?.slice(0, 1).toUpperCase()}
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <span>
                              {p?.name || '—'}
                              {p?.id && founderClerkId && p.id === founderClerkId && (
                                <span className="text-muted-foreground"> (założyciel)</span>
                              )}
                            </span>
                            {(() => {
                              const match = participantUsers.find(
                                (u) => p?.id && u.clerkId && String(p.id) === String(u.clerkId),
                              )
                              if (!match) return null
                              const avg = Number(match.ratingAverage || 0)
                              const count = Number(match.ratingCount || 0)
                              const full = Math.floor(Math.max(0, Math.min(5, avg)))
                              const empty = 5 - full
                              return (
                                <span className="ml-1 text-xs text-muted-foreground">
                                  <span className="text-amber-500">{'★'.repeat(full)}</span>
                                  <span className="text-muted-foreground/40">
                                    {'☆'.repeat(empty)}
                                  </span>
                                  <span className="ml-1">
                                    ({avg.toFixed(2)} / {count})
                                  </span>
                                </span>
                              )
                            })()}
                          </span>
                          {isFounder && p?.id && p.id !== viewerId && (
                            <form
                              action={async () => {
                                'use server'
                                await removeOrderUser(Number(orderNumber), String(p.id))
                              }}
                            >
                              <Button
                                type="submit"
                                size="icon"
                                variant="destructive"
                                className="size-6"
                              >
                                <Trash2Icon className="size-4" />
                              </Button>
                            </form>
                          )}
                        </span>
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground">Brak uczestników</span>
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-4">
              <section className="p-5 bg-muted/20 rounded-xl border border-border/60">
                <h3 className="font-semibold text-foreground mb-3">Twój koszyk</h3>
                {viewerId ? (
                  <form
                    action={async (formData) => {
                      'use server'
                      await setCartLocation(Number(orderNumber), formData)
                    }}
                    className="space-y-3"
                  >
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        Miejsce dostarczenia / odbioru
                      </label>
                      <Input
                        name="location"
                        placeholder="np. Pokój 203, recepcja, klasa 1B"
                        defaultValue={yourLocation}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isExpired}>
                      Zapisz miejsce
                    </Button>
                    {yourCart?.userName && (
                      <p className="text-xs text-muted-foreground">
                        Koszyk: <span className="font-medium">{yourCart.userName}</span>
                      </p>
                    )}
                  </form>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Zaloguj się, aby ustawić miejsce dostarczenia dla swojego koszyka.
                  </p>
                )}
              </section>

              <section className="p-5 bg-muted/20 rounded-xl border border-border/60">
                <h3 className="font-semibold text-foreground mb-3">Miejsca odbioru</h3>
                {carts.length === 0 ? (
                  <p className="text-muted-foreground">Brak koszyków.</p>
                ) : (
                  <ul className="divide-y divide-border rounded-md border border-border overflow-hidden">
                    {carts.map((c, i) => (
                      <li key={c?.id || c?.userId || i} className="px-3 py-2 bg-card/60">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center size-6 rounded-full bg-primary/15 text-primary text-xs font-bold">
                              {(c?.userName || 'U')?.slice(0, 1).toUpperCase()}
                            </span>
                            <span className="text-sm font-medium text-foreground">
                              {c?.userName || 'Użytkownik'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">
                              {c?.location || '—'}
                            </span>
                          </div>
                        </div>
                        {founderClerkId && c?.userId === founderClerkId && (
                          <div className="pl-8 text-xs text-muted-foreground">(założyciel)</div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              {isExpired && isParticipant && !isFounder && founderUser?.id && (
                <section id="ocen" className="p-5 bg-muted/20 rounded-xl border border-border/60">
                  <h3 className="font-semibold text-foreground mb-3">Oceń organizatora</h3>
                  <form
                    action={async (formData) => {
                      'use server'
                      const val = Number(formData.get('rating') || 0)
                      await rateUser(Number(orderNumber), Number(founderUser.id), val)
                    }}
                    className="flex items-center justify-between gap-3 p-3 rounded-md border bg-card/50"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {founderUser?.name || 'Organizator'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Śr.: {Number(founderUser?.ratingAverage || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        name="rating"
                        className="h-9 rounded-md border bg-background px-2 text-sm"
                        defaultValue={5}
                        disabled={organizerAlreadyRated}
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                      <Button
                        type="submit"
                        className="min-w-20"
                        size="sm"
                        disabled={organizerAlreadyRated}
                      >
                        Oceń
                      </Button>
                    </div>
                    <div className="w-full text-right text-xs text-muted-foreground">
                      <span>
                        Średnia: {Number(founderUser?.ratingAverage || 0).toFixed(2)} (
                        {Number(founderUser?.ratingCount || 0)} ocen)
                      </span>
                      {organizerAlreadyRated && (
                        <div className="mt-1 text-amber-600">
                          Już oceniłeś tego organizatora w tym ogłoszeniu.
                        </div>
                      )}
                    </div>
                  </form>
                </section>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
