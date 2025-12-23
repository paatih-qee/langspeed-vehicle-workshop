import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useUserRole() {
  const { data, error, isLoading, mutate } = useSWR("/api/user/role", fetcher)

  return {
    role: data?.role as "super_admin" | "admin" | "guest" | undefined,
    userRoleData: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useAllUsers() {
  const { data, error, isLoading, mutate } = useSWR("/api/users", fetcher)

  return {
    users: data?.users || [],
    isLoading,
    isError: error,
    mutate,
  }
}
