import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

type RouteParams = {
  id: string
}

/**
 * GET /api/orders/[id]
 * Ambil detail order + items
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    // ✅ Next.js 15: params HARUS di-await
    const { id: orderId } = await params

    const supabase = await createClient()

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single()

    if (orderError) throw orderError

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId)

    if (itemsError) throw itemsError

    return NextResponse.json({ order, items })
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch order details" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/orders/[id]
 * Update status / approval
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    // ✅ Next.js 15: params HARUS di-await
    const { id: orderId } = await params

    const supabase = await createClient()
    const body = await request.json()

    const updateData: Record<string, any> = {}

    if (body.status) {
      updateData.status = body.status
    }

    if (body.approval_status) {
      updateData.approval_status = body.approval_status

      if (body.approval_status === "approved") {
        updateData.status = "Diproses"
      }

      if (body.approval_status === "rejected") {
        updateData.status = "Ditolak"
      }
    }

    // Guard minimal: jangan update kosong
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("PATCH /api/orders/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    )
  }
}
