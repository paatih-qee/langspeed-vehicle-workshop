"use server"

import { createClient } from "@/lib/supabase/server"

export async function createSuperAdmin() {
  const supabase = await createClient()

  const email = "superadmin@mail.com"
  const password = "admin123"

  try {
    // Create super admin user via Supabase Auth Admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
    })

    if (authError) {
      // Check if user already exists
      if (authError.message.includes("already registered")) {
        // Get existing user
        const { data: existingUser } = await supabase.auth.admin.listUsers()
        const user = existingUser.users.find((u) => u.email === email)

        if (user) {
          // Update role to super_admin
          const { error: roleError } = await supabase
            .from("user_roles")
            .upsert({ user_id: user.id, email: email, role: "super_admin" }, { onConflict: "user_id" })

          if (roleError) {
            return { error: `Failed to update role: ${roleError.message}` }
          }

          return { success: true, message: "Super admin role assigned to existing user" }
        }
      }

      return { error: authError.message }
    }

    // Wait a bit for trigger to complete
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update the user role to super_admin (trigger creates it as guest first)
    const { error: roleError } = await supabase
      .from("user_roles")
      .update({ role: "super_admin", updated_at: new Date().toISOString() })
      .eq("user_id", authData.user.id)

    if (roleError) {
      return { error: `User created but failed to assign super_admin role: ${roleError.message}` }
    }

    return { success: true, message: "Super admin account created successfully!" }
  } catch (error) {
    return { error: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}` }
  }
}
