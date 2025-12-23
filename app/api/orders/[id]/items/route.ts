import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const items = Array.isArray(body) ? body : body.items || [body]

    // Calculate total amount from items
    let totalAmount = 0
    for (const item of items) {
      totalAmount += item.price * item.quantity
    }

    // Insert order items
    for (const item of items) {
      const itemData = {
        order_id: params.id,
        item_id: item.item_id || item.id,
        item_name: item.item_name,
        item_type: item.item_type,
        quantity: item.quantity,
        price: item.price,
        purchase_price: item.purchase_price || 0,
        subtotal: item.price * item.quantity,
      }

      const { error: itemError } = await supabase.from("order_items").insert(itemData)

      if (itemError) throw itemError

      // Update product stock if it's a product
      if (item.item_type === "product") {
        const productId = item.item_id || item.id

        const { data: productData } = await supabase.from("products").select("stock").eq("id", productId).single()

        if (productData) {
          const newStock = Math.max(0, productData.stock - item.quantity)
          await supabase.from("products").update({ stock: newStock }).eq("id", productId)
        }
      }
    }

    // Update order total amount
    const { data, error } = await supabase
      .from("orders")
      .update({ total_amount: totalAmount })
      .eq("id", params.id)
      .select()

    if (error) throw error

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add items to order" }, { status: 500 })
  }
}
