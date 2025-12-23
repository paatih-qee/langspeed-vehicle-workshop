import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

interface ProfitLossReport {
  period: string
  totalRevenue: number
  totalCost: number
  totalProfit: number
  profitMargin: number
  orderCount: number
  itemsSold: number
  productRevenue: number
  serviceRevenue: number
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Build query for order items
    let query = supabase.from("order_items").select("price, purchase_price, quantity, item_type, created_at")

    if (startDate) {
      query = query.gte("created_at", startDate)
    }
    if (endDate) {
      query = query.lte("created_at", endDate)
    }

    const { data: orderItems, error } = await query

    if (error) throw error

    // Services have no purchase price, so they contribute full revenue as profit
    let totalRevenue = 0
    let totalCost = 0
    let itemsSold = 0
    let productRevenue = 0
    let serviceRevenue = 0

    for (const item of orderItems) {
      const revenue = item.price * item.quantity

      totalRevenue += revenue
      itemsSold += item.quantity

      if (item.item_type === "product") {
        const cost = (item.purchase_price || 0) * item.quantity
        totalCost += cost
        productRevenue += revenue
      } else if (item.item_type === "service") {
        // Services have no cost, so they contribute full revenue as profit
        serviceRevenue += revenue
      }
    }

    const totalProfit = totalRevenue - totalCost
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

    const report: ProfitLossReport = {
      period: `${startDate || "All"} to ${endDate || "Now"}`,
      totalRevenue,
      totalCost,
      totalProfit,
      profitMargin: Math.round(profitMargin * 100) / 100,
      orderCount: orderItems.length,
      itemsSold,
      productRevenue,
      serviceRevenue,
    }

    return NextResponse.json(report)
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate profit/loss report" }, { status: 500 })
  }
}
