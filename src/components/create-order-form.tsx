'use client'
import { Input } from './ui/input'
import { Select, SelectTrigger } from './ui/select'
import { SelectValue } from './ui/select'
import { SelectContent } from './ui/select'
import { SelectItem } from './ui/select'
import { Button } from './ui/button'
import { useEffect, useState } from 'react'
import type { Order, Store } from '@/payload-types'
import { createOrder } from '@/actions/create-order'
import { Loader2Icon, PlusIcon } from 'lucide-react'

export default function CreateOrderForm({
  props,
}: {
  props: { stores: Store[]; orders: Order[] }
}) {
  'use client'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedStore, setSelectedStore] = useState<string | undefined>('')
  const [tax, setTax] = useState<number | undefined>(0)
  const [newStoreName, setNewStoreName] = useState<string | undefined>('')
  const stores = props.stores
  const orderNumber = props.orders.length + 1
  const [taxType, setTaxType] = useState<'percentage' | 'fixed'>('percentage')

  useEffect(() => {
    console.log('isSubmitting', isSubmitting)
  }, [isSubmitting])
  return (
    <div className="animate-slide-up">
      <form
        className="w-full h-full flex flex-col gap-6"
        onSubmit={async (e) => {
          e.preventDefault()
          setIsSubmitting(true)
          const formData = new FormData(e.currentTarget)
          await createOrder(formData).then(() => {
            setIsSubmitting(false)
          })
        }}
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Order Number</label>
          <Input
            type="number"
            name="orderNumber"
            placeholder="Order Number"
            readOnly
            value={orderNumber}
            className="bg-muted/30 border-border/50 focus:border-primary transition-all duration-200"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Store</label>
          <Select required defaultValue={''} onValueChange={(v) => setSelectedStore(v)}>
            <SelectTrigger className="w-full bg-background border-border/50 focus:border-primary transition-all duration-200 hover:bg-muted/30">
              <SelectValue placeholder="Select a store" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border/50 shadow-lg">
              {stores.map((store) => (
                <SelectItem
                  key={store.id}
                  value={store.id.toString()}
                  className="hover:bg-muted/50 focus:bg-muted/50 transition-colors duration-200 hover:text-white focus:text-white"
                >
                  {store.name}
                </SelectItem>
              ))}
              <SelectItem
                value="create-new"
                className="hover:bg-muted/50 focus:bg-muted/50 transition-colors duration-200 text-primary font-medium hover:text-white focus:text-white"
              >
                + Create New Store
              </SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" name="store" value={selectedStore ?? ''} />
        </div>
        {selectedStore === 'create-new' && (
          <div className="space-y-2 animate-slide-up">
            <label className="text-sm font-medium text-foreground">New Store Name</label>
            <Input
              type="text"
              name="newStoreName"
              required
              defaultValue={''}
              value={newStoreName}
              placeholder="Enter new store name"
              className="bg-background border-border/50 focus:border-primary transition-all duration-200"
              onChange={(e) => setNewStoreName(e.target.value)}
            />
          </div>
        )}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Realisation Date</label>
          <Input
            required
            type="datetime-local"
            name="realisationDate"
            placeholder="Realisation Date"
            className="bg-background border-border/50 focus:border-primary transition-all duration-200"
            defaultValue={new Date(new Date().getTime() + 2 * 60 * 60 * 1000)
              .toISOString()
              .slice(0, 16)}
            min={new Date(
              new Date().setMinutes(new Date().getMinutes() - 1, 0, 0) + 2 * 60 * 60 * 1000,
            )
              .toISOString()
              .slice(0, 16)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Description</label>
          <Input
            type="text"
            name="description"
            required
            placeholder="Enter order description"
            className="bg-background border-border/50 focus:border-primary transition-all duration-200"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Tax</label>
          <div className="flex items-center justify-between gap-2">
            <Input
              type="number"
              name="tax"
              required
              placeholder="Enter tax"
              defaultValue={0}
              className="bg-background border-border/50 focus:border-primary transition-all duration-200"
              onChange={(e) => setTax(Number(e.target.value))}
            />
            <Select value={taxType} onValueChange={(v) => setTaxType(v as 'percentage' | 'fixed')}>
              <SelectTrigger className="w-fit bg-background border-border/50 focus:border-primary transition-all duration-200 hover:bg-muted/30">
                <SelectValue placeholder="Select a tax type" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border/50 shadow-lg">
                <SelectItem
                  value="percentage"
                  defaultChecked
                  className="hover:bg-muted/50 focus:bg-muted/50 transition-colors duration-200 hover:text-white focus:text-white"
                >
                  %
                </SelectItem>
                <SelectItem
                  value="fixed"
                  className="hover:bg-muted/50 focus:bg-muted/50 transition-colors duration-200 hover:text-white focus:text-white"
                >
                  PLN
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          type="submit"
          className="w-full mt-6 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-primary hover:bg-primary/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2Icon className="animate-spin" />
              Please wait
            </>
          ) : (
            <>
              <PlusIcon />
              Create Order
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
