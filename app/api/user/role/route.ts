import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

    const { data: roleData, error: roleError } = await supabase.rpc("get_user_role_direct", {
      p_user_id: user.id,
    })

    if (roleError) {
      console.error("[v0] Error calling get_user_role_direct:", roleError)
      return NextResponse.json({ error: roleError.message }, { status: 400 })
    }

    // roleData is an array, get the first element
    const userRole = roleData && roleData.length > 0 ? roleData[0] : null

    if (!userRole) {
      // Return default guest role if no role found
      return NextResponse.json({
        role: "guest",
        user_id: user.id,
        email: user.email,
      })
    }

    return NextResponse.json(userRole)
  } catch (error: any) {
    console.error("[v0] Exception in user role API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
