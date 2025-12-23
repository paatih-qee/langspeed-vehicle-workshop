"use client"

import useSWR from "swr"

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  vehicle_type: string
  plate_number: string
  complaint: string
  total_amount: number
  status: "Diproses" | "Selesai"
  created_at: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useOrders() {
  const { data, error, isLoading, mutate } = useSWR<Order[]>("/api/orders", fetcher)

  return {
    orders: data || [],
    isLoading,
    error,
    mutate,
  }
}
