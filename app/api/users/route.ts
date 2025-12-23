import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Get all users (Super Admin only)
export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is super admin
    const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", user.id).single()

    if (roleData?.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get all users
    const { data: users, error } = await supabase
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ users })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Create new admin user (Super Admin only)
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { email, password, role } = body

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is super admin
    const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", user.id).single()

    if (roleData?.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Create new user using admin API
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    // Update role if specified
    if (role && newUser.user) {
      const { error: updateError } = await supabase.from("user_roles").update({ role }).eq("user_id", newUser.user.id)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 })
      }
    }

    return NextResponse.json({ user: newUser.user }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
