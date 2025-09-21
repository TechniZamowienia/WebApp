import config from '@/payload.config'

import { getPayload } from 'payload'
import type { Store } from '@/payload-types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { deleteOrderById } from '@/actions/delete-order'
import { addOrderItem, getUserItemSuggestions } from '@/actions/add-order-item'
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
    ? await payload.find({ collection: 'users', where: { clerkId: { equals: viewerId } }, limit: 1 })
    : null
  const viewerPayloadId: number | undefined = (viewerUserRes?.docs?.[0] as any)?.id
  const founderId: number | undefined =
    typeof doc.founder === 'number' ? doc.founder : (doc.founder as any)?.id
  const isFounder = !!viewerPayloadId && !!founderId && viewerPayloadId === founderId

  // Compute founder's Clerk ID to match against item.userId / cart.userId
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
              {items.length > 0 && (
                <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                  Suma: {pln.format(totalPrice)}
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
                    <dd className="text-sm text-foreground">{doc.tax || '—'}</dd>
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
                ) : (
                  <ul className="divide-y divide-border rounded-md border border-border overflow-hidden max-h-64 overflow-y-auto [scrollbar-width:thin]">
                    {items.map((it: any, idx: number) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between gap-4 px-3 py-2 bg-card/60 odd:bg-card/40"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">{it.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {it.userName || '—'}
                          </span>
                        </div>
                        <span className="text-sm text-foreground font-semibold">
                          {pln.format(Number(it.price) || 0)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
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
                          <span>
                            {p?.name || '—'}
                            {p?.id && founderClerkId && p.id === founderClerkId && (
                              <span className="text-muted-foreground"> (założyciel)</span>
                            )}
                          </span>
                          {isFounder && p?.id && p.id !== viewerId && (
                            <form
                              action={async () => {
                                'use server'
                                await removeOrderUser(Number(orderNumber), String(p.id))
                              }}
                            >
                              <Button type="submit" size="icon" variant="destructive" className="size-6">
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
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
