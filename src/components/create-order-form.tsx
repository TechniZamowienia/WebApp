'use client'
import { Input } from './ui/input'
import { Select, SelectTrigger } from './ui/select'
import { SelectValue } from './ui/select'
import { SelectContent } from './ui/select'
import { SelectItem } from './ui/select'
import { Button } from './ui/button'
import { useState } from 'react'
import { Order, Store } from '@/payload-types'
import { createOrder } from '@/actions/create-order'

export default function CreateOrderForm({
  props,
}: {
  props: { stores: Store[]; orders: Order[] }
}) {
  'use client'
  const [isSelectedNewStore, setIsSelectedNewStore] = useState(false)
  const [selectedStore, setSelectedStore] = useState<string | undefined>()
  const stores = props.stores
  const orderNumber = props.orders.length + 1

  return (
    <form className="w-full h-full flex flex-col gap-4" action={createOrder}>
      <Input
        type="number"
        name="orderNumber"
        placeholder="Order Number"
        readOnly
        value={orderNumber}
      />
      <Select
        value={selectedStore}
        onValueChange={(v) => {
          setSelectedStore(v)
          setIsSelectedNewStore(v === 'create-new')
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Store" />
        </SelectTrigger>
        <SelectContent>
          {stores.map((store) => (
            <SelectItem key={store.id} value={store.id.toString()}>
              {store.name}
            </SelectItem>
          ))}
          <SelectItem value="create-new">Create New</SelectItem>
        </SelectContent>
      </Select>
      <input type="hidden" name="store" value={selectedStore ?? ''} />
      {isSelectedNewStore && <Input type="text" name="newStoreName" placeholder="New Store Name" />}
      <Input type="datetime-local" name="realisationDate" placeholder="Realisation Date" />
      <Input type="text" name="description" placeholder="Description" />
      <Button type="submit">Create Order</Button>
    </form>
  )
}
