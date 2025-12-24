import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

type RouteParams = {
  id: string
}

export async function POST(
  request: Request,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    // ✅ Next.js 15: params HARUS di-await
    const { id: orderId } = await params

    const supabase = await createClient()
    const body = await request.json()

    // Normalize payload
    const items = Array.isArray(body) ? body : body.items || [body]

    if (!items.length) {
      return NextResponse.json(
        { error: "Items payload is empty" },
        { status: 400 }
      )
    }

    // Calculate total amount
    let totalAmount = 0
    for (const item of items) {
      totalAmount += (item.price || 0) * (item.quantity || 0)
    }

    // Insert order items
    for (const item of items) {
      const itemId = item.item_id || item.id

      // 🔴 HARD VALIDATION (INI YANG LO TANYA TADI)
      if (!itemId) {
        return NextResponse.json(
          {
            error: "item_id is required for each order item",
            invalidItem: item,
          },
          { status: 400 }
        )
      }

      if (!item.quantity || !item.price) {
        return NextResponse.json(
          {
            error: "quantity and price are required",
            invalidItem: item,
          },
          { status: 400 }
        )
      }

      const itemData = {
        order_id: orderId,
        item_id: itemId,
        item_name: item.item_name,
        item_type: item.item_type,
        quantity: item.quantity,
        price: item.price,
        purchase_price: item.purchase_price || 0,
        subtotal: item.price * item.quantity,
      }

      const { error: itemError } = await supabase
        .from("order_items")
        .insert(itemData)

      if (itemError) throw itemError

      // Update product stock (kalau item = product)
      if (item.item_type === "product") {
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("stock")
          .eq("id", itemId)
          .single()

        if (productError) throw productError

        if (productData) {
          const newStock = Math.max(0, productData.stock - item.quantity)

          const { error: updateStockError } = await supabase
            .from("products")
            .update({ stock: newStock })
            .eq("id", itemId)

          if (updateStockError) throw updateStockError
        }
      }
    }

    // Update order total
    const { data, error } = await supabase
      .from("orders")
      .update({ total_amount: totalAmount })
      .eq("id", orderId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("POST /api/orders/[id]/items error:", error)
    return NextResponse.json(
      { error: "Failed to add items to order" },
      { status: 500 }
    )
  }
}
