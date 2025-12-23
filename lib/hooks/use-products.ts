"use client"

import useSWR from "swr"

interface Product {
  id: string
  product_id: string
  name: string
  price: number
  purchase_price: number
  stock: number
  created_at: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useProducts() {
  const { data, error, isLoading, mutate } = useSWR<Product[]>("/api/products", fetcher)

  return {
    products: data || [],
    isLoading,
    error,
    mutate,
  }
}
