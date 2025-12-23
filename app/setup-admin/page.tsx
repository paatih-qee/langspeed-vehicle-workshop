"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { createSuperAdmin } from "../actions/create-super-admin"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SetupAdminPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; error?: string; message?: string } | null>(null)
  const router = useRouter()

  const handleCreateSuperAdmin = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await createSuperAdmin()
      setResult(response)
    } catch (error) {
      setResult({ error: "Failed to create super admin" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Setup Super Admin</CardTitle>
          <CardDescription>Buat akun super admin pertama untuk Langspeed Motor</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-2">
            <p className="text-sm font-semibold text-blue-900">Kredensial Super Admin:</p>
            <div className="space-y-1">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Email:</span> superadmin@mail.com
              </p>
              <p className="text-sm text-blue-800">
                <span className="font-medium">Password:</span> admin123
              </p>
            </div>
          </div>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              <div className="flex items-center gap-2">
                {result.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <AlertDescription>{result.message || result.error}</AlertDescription>
              </div>
            </Alert>
          )}

          {result?.success ? (
            <div className="space-y-3">
              <Button onClick={() => router.push("/auth/login")} className="w-full" size="lg">
                Login Sekarang
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button onClick={() => router.push("/")} variant="outline" className="w-full">
                Kembali ke Beranda
              </Button>
            </div>
          ) : (
            <Button onClick={handleCreateSuperAdmin} disabled={loading} className="w-full" size="lg">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Buat Akun Super Admin
            </Button>
          )}

          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
            <p className="text-xs text-amber-800">
              <strong>Catatan:</strong> Halaman ini hanya perlu diakses sekali saat setup awal. Setelah membuat super
              admin, Anda dapat login dengan kredensial di atas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
