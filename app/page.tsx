"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserCircle, Shield, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/assets/img/logo langspeed.png"
              alt="Langspeed Motor"
              width={50}
              height={50}
              className="object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">LANGSPEED MOTOR</h1>
              <p className="text-sm text-slate-600">Bengkel Motor Terpercaya</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Selamat Datang di Langspeed Motor</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Sistem manajemen bengkel modern untuk pelayanan terbaik
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Guest Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <UserCircle className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Pelanggan</CardTitle>
              <CardDescription className="text-base">Buat reservasi servis motor Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Reservasi servis online</span>
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Pilih jadwal yang sesuai</span>
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Tanpa perlu login</span>
                </li>
              </ul>
              <Button onClick={() => router.push("/reservasi")} className="w-full" size="lg">
                Buat Reservasi
              </Button>
            </CardContent>
          </Card>

          {/* Admin Card */}
          <Card className="hover:shadow-lg transition-shadow border-slate-300">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-slate-600" />
              </div>
              <CardTitle className="text-2xl">Admin / Super Admin</CardTitle>
              <CardDescription className="text-base">Kelola operasional bengkel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-600" />
                  <span>Kelola produk dan jasa</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-600" />
                  <span>Proses pesanan servis</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-600" />
                  <span>Laporan keuangan</span>
                </li>
              </ul>
              <Button onClick={() => router.push("/auth/login")} variant="outline" className="w-full" size="lg">
                Login Admin
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <div className="mt-16 text-center">
          <p className="text-slate-600">Untuk informasi lebih lanjut, hubungi kami:</p>
          <p className="text-slate-900 font-semibold mt-2">Email: [email protected] | Telp: (021) 1234-5678</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-slate-600">
          <p>Nota ini dicetak pada: {new Date().toLocaleString("id-ID")}</p>
          <p className="mt-2">© 2025 Langspeed Motor. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
