'use client'
import { Input } from './ui/input'
import { Select, SelectTrigger } from './ui/select'
import { SelectValue } from './ui/select'
import { SelectContent } from './ui/select'
import { SelectItem } from './ui/select'
import { Button } from './ui/button'
import { useState } from 'react'
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
  const [selectedStore, setSelectedStore] = useState<string | undefined>()
  const [newStoreName, setNewStoreName] = useState<string>('')
  const [realisationDate, setRealisationDate] = useState<string>('')
  const [distributionUntil, setDistributionUntil] = useState<string>('')
  const [taxType, setTaxType] = useState<'none' | 'percentage' | 'fixed'>('none')
  const [taxValue, setTaxValue] = useState<string>('')
  const hasRealisation = !!realisationDate
  const hasUntil = !!distributionUntil
  const invalidEnd = hasRealisation && hasUntil && new Date(distributionUntil) <= new Date(realisationDate)
  const stores = props.stores
  const orderNumber = props.orders.length + 1

  return (
    <div className="animate-slide-up">
      <form
        className="w-full h-full flex flex-col gap-6"
        action={async (formData) => {
          setIsSubmitting(true)
          await createOrder(formData)
          setIsSubmitting(false)
        }}
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Numer ogłoszenia</label>
          <Input
            type="number"
            name="orderNumber"
            placeholder="Numer ogłoszenia"
            readOnly
            value={orderNumber}
            className="bg-muted/30 border-border/50 focus:border-primary transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Sklep</label>
          <Select
            value={selectedStore}
            onValueChange={(v) => {
              setSelectedStore(v)
            }}
          >
            <SelectTrigger className="w-full bg-background border-border/50 focus:border-primary transition-all duration-200 hover:bg-muted/30">
              <SelectValue placeholder="Wybierz sklep" />
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
                + Utwórz nowy sklep
              </SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" name="store" value={selectedStore ?? ''} />
        </div>

        {selectedStore === 'create-new' && (
          <div className="space-y-2 animate-slide-up">
            <label className="text-sm font-medium text-foreground">Nazwa nowego sklepu</label>
            <Input
              type="text"
              name="newStoreName"
              value={newStoreName}
              placeholder="Wpisz nazwę nowego sklepu"
              className="bg-background border-border/50 focus:border-primary transition-all duration-200"
              onChange={(e) => setNewStoreName(e.target.value)}
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Data realizacji</label>
          <Input
            type="datetime-local"
            name="realisationDate"
            placeholder="Data realizacji"
            value={realisationDate}
            onChange={(e) => setRealisationDate(e.target.value)}
            required
            className="bg-background border-border/50 focus:border-primary transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Aktywne do (koniec dystrybucji)</label>
          <Input
            type="datetime-local"
            name="distributionUntil"
            placeholder="Aktywne do"
            value={distributionUntil}
            onChange={(e) => setDistributionUntil(e.target.value)}
            required
            className="bg-background border-border/50 focus:border-primary transition-all duration-200"
          />
          {invalidEnd && (
            <p className="text-xs text-destructive">Czas zakończenia musi być po dacie realizacji.</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Opis</label>
          <Input
            type="text"
            name="description"
            placeholder="Wpisz opis ogłoszenia"
            className="bg-background border-border/50 focus:border-primary transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Podatek (opcjonalnie)</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Select
                value={taxType}
                onValueChange={(v) => setTaxType((v as 'none' | 'percentage' | 'fixed') ?? 'none')}
              >
                <SelectTrigger className="w-full bg-background border-border/50 focus:border-primary transition-all duration-200 hover:bg-muted/30">
                  <SelectValue placeholder="Typ podatku" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/50 shadow-lg">
                  <SelectItem value="none">Brak</SelectItem>
                  <SelectItem value="percentage">Procentowy (%)</SelectItem>
                  <SelectItem value="fixed">Stała kwota (PLN)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Input
                type="number"
                name="tax"
                placeholder={taxType === 'fixed' ? 'np. 7.50' : 'np. 5'}
                min="0"
                step="0.01"
                value={taxValue}
                onChange={(e) => setTaxValue(e.target.value)}
                disabled={taxType === 'none'}
                className="bg-background border-border/50 focus:border-primary transition-all duration-200 pr-12"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                {taxType === 'fixed' ? 'PLN' : '%'}
              </span>
            </div>
          </div>
          <input type="hidden" name="taxType" value={taxType === 'none' || !taxValue ? '' : taxType} />
        </div>

        <Button
          type="submit"
          className="w-full mt-6 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-primary hover:bg-primary/90"
          disabled={
            isSubmitting ||
            !selectedStore ||
            (selectedStore === 'create-new' && !newStoreName) ||
            !hasRealisation ||
            !hasUntil ||
            invalidEnd
          }
        >
      {isSubmitting ? (
            <>
              <Loader2Icon className="animate-spin" />
        Proszę czekać
            </>
          ) : (
            <>
              <PlusIcon />
        Utwórz ogłoszenie
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
