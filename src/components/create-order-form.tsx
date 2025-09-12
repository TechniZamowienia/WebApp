"use client"
import { Input } from "./ui/input"
import { Select, SelectTrigger } from "./ui/select"
import { SelectValue } from "./ui/select"
import { SelectContent } from "./ui/select"
import { SelectItem } from "./ui/select"
import { Button } from "./ui/button"
import { useState } from "react"
import type { Order, Store } from "@/payload-types"
import { createOrder } from "@/actions/create-order"

export default function CreateOrderForm({
  props,
}: {
  props: { stores: Store[]; orders: Order[] }
}) {
  "use client"
  const [isSelectedNewStore, setIsSelectedNewStore] = useState(false)
  const [selectedStore, setSelectedStore] = useState<string | undefined>()
  const stores = props.stores
  const orderNumber = props.orders.length + 1

  return (
    <div className="animate-slide-up">
      <form className="w-full h-full flex flex-col gap-6" action={createOrder}>
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
          <Select
            value={selectedStore}
            onValueChange={(v) => {
              setSelectedStore(v)
              setIsSelectedNewStore(v === "create-new")
            }}
          >
            <SelectTrigger className="w-full bg-background border-border/50 focus:border-primary transition-all duration-200 hover:bg-muted/30">
              <SelectValue placeholder="Select a store" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border/50 shadow-lg">
              {stores.map((store) => (
                <SelectItem
                  key={store.id}
                  value={store.id.toString()}
                  className="hover:bg-muted/50 focus:bg-muted/50 transition-colors duration-200"
                >
                  {store.name}
                </SelectItem>
              ))}
              <SelectItem
                value="create-new"
                className="hover:bg-muted/50 focus:bg-muted/50 transition-colors duration-200 text-primary font-medium"
              >
                + Create New Store
              </SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" name="store" value={selectedStore ?? ""} />
        </div>

        {isSelectedNewStore && (
          <div className="space-y-2 animate-slide-up">
            <label className="text-sm font-medium text-foreground">New Store Name</label>
            <Input
              type="text"
              name="newStoreName"
              placeholder="Enter new store name"
              className="bg-background border-border/50 focus:border-primary transition-all duration-200"
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Realisation Date</label>
          <Input
            type="datetime-local"
            name="realisationDate"
            placeholder="Realisation Date"
            className="bg-background border-border/50 focus:border-primary transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Description</label>
          <Input
            type="text"
            name="description"
            placeholder="Enter order description"
            className="bg-background border-border/50 focus:border-primary transition-all duration-200"
          />
        </div>

        <Button
          type="submit"
          className="w-full mt-6 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-primary hover:bg-primary/90"
        >
          Create Order
        </Button>
      </form>
    </div>
  )
}
