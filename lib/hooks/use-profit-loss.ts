"use client"

import useSWR from "swr"

interface ProfitLossReport {
  period: string
  totalRevenue: number
  totalCost: number
  totalProfit: number
  profitMargin: number
  orderCount: number
  itemsSold: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useProfitLoss(startDate?: string, endDate?: string) {
  const params = new URLSearchParams()
  if (startDate) params.append("startDate", startDate)
  if (endDate) params.append("endDate", endDate)

  const url = `/api/reports/profit-loss${params.toString() ? `?${params.toString()}` : ""}`
  const { data, error, isLoading, mutate } = useSWR<ProfitLossReport>(url, fetcher)

  return {
    report: data,
    isLoading,
    error,
    mutate,
  }
}
