import { createClient } from "@/lib/supabase/server"

export type UserRole = "super_admin" | "admin" | "guest"

export interface RBACPermissions {
  canManageUsers: boolean
  canManageProducts: boolean
  canManageServices: boolean
  canManageOrders: boolean
  canViewReports: boolean
  canCreateOrders: boolean
}

export async function getUserRole(): Promise<UserRole | null> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return null
    }

    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single()

    if (roleError || !roleData) {
      return null
    }

    return roleData.role as UserRole
  } catch (error) {
    return null
  }
}

export function getPermissions(role: UserRole | null): RBACPermissions {
  if (!role) {
    return {
      canManageUsers: false,
      canManageProducts: false,
      canManageServices: false,
      canManageOrders: false,
      canViewReports: false,
      canCreateOrders: false,
    }
  }

  switch (role) {
    case "super_admin":
      return {
        canManageUsers: true,
        canManageProducts: true,
        canManageServices: true,
        canManageOrders: true,
        canViewReports: true,
        canCreateOrders: true,
      }
    case "admin":
      return {
        canManageUsers: false,
        canManageProducts: true,
        canManageServices: true,
        canManageOrders: true,
        canViewReports: true,
        canCreateOrders: true,
      }
    case "guest":
      return {
        canManageUsers: false,
        canManageProducts: false,
        canManageServices: false,
        canManageOrders: false,
        canViewReports: false,
        canCreateOrders: true,
      }
    default:
      return {
        canManageUsers: false,
        canManageProducts: false,
        canManageServices: false,
        canManageOrders: false,
        canViewReports: false,
        canCreateOrders: false,
      }
  }
}

export async function checkPermission(requiredRole: UserRole | UserRole[]): Promise<boolean> {
  const role = await getUserRole()
  if (!role) return false

  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  return allowedRoles.includes(role)
}
