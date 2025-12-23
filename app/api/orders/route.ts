import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    let totalAmount = 0
    for (const item of body.items) {
      totalAmount += item.price * item.quantity
    }

    const status = body.isReservation ? "Menunggu Persetujuan" : "Diproses"
    const approvalStatus = body.isReservation ? "pending" : "approved"

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: body.customerName,
        customer_phone: body.customerPhone,
        vehicle_type: body.vehicleType,
        plate_number: body.plateNumber,
        complaint: body.complaint,
        total_amount: totalAmount,
        status: status,
        is_reservation: body.isReservation || false,
        approval_status: approvalStatus,
      })
      .select()

    if (orderError) throw orderError

    const orderId = orderData[0].id

    // Insert order items
    for (const item of body.items) {
      const { error: itemError } = await supabase.from("order_items").insert({
        order_id: orderId,
        item_id: item.itemId,
        item_name: item.itemName,
        item_type: item.itemType,
        quantity: item.quantity,
        price: item.price,
        purchase_price: item.purchase_price,
        subtotal: item.price * item.quantity,
      })

      if (itemError) throw itemError

      // Update product stock if it's a product
      if (item.itemType === "product") {
        const { data: productData } = await supabase
          .from("products")
          .select("stock")
          .eq("product_id", item.itemId)
          .single()

        if (productData) {
          const newStock = Math.max(0, productData.stock - item.quantity)
          await supabase.from("products").update({ stock: newStock }).eq("product_id", item.itemId)
        }
      }
    }

    return NextResponse.json(orderData[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
