import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import CreateOrderForm from "@/components/create-order-form"
import config from "@/payload.config"
import { getPayload } from "payload"

export default async function CreateOrderPage() {
  const payload = await getPayload({ config: config })
  const stores = await payload.find({ collection: "store" })
  const orders = await payload.find({ collection: "orders" })
  return (
    <div className="animate-fade-in">
      <Card className="w-full border-0 shadow-xl bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">+</span>
            </div>
            Create New Order
          </CardTitle>
          <p className="text-muted-foreground mt-2">Fill in the details below to create a new order</p>
        </CardHeader>
        <CardContent className="pt-0">
          <CreateOrderForm props={{ stores: stores.docs, orders: orders.docs }} />
        </CardContent>
      </Card>
    </div>
  )
}
