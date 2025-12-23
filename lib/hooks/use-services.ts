"use client"

import useSWR from "swr"

interface Service {
  id: string
  service_id: string
  name: string
  price: number
  created_at: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useServices() {
  const { data, error, isLoading, mutate } = useSWR<Service[]>("/api/services", fetcher)

  return {
    services: data || [],
    isLoading,
    error,
    mutate,
  }
}
