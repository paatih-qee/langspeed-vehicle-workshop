# Panduan Role-Based Access Control (RBAC)

Sistem Langspeed Bengkel sekarang mendukung 3 role user dengan hak akses berbeda.

## Role & Permissions

### 1. Super Admin
**Kapabilitas Penuh:**
- Mengelola semua produk dan jasa
- Mengelola semua pesanan
- Melihat laporan keuangan
- **Mengelola user** (membuat, edit role, dan hapus user Admin/Guest)
- Membuat pesanan/reservasi

**Badge:** Ungu dengan ikon ShieldCheck

### 2. Admin
**Kapabilitas:**
- Mengelola semua produk dan jasa
- Mengelola semua pesanan
- Melihat laporan keuangan
- Membuat pesanan/reservasi
- **TIDAK BISA** mengelola user lain

**Badge:** Biru dengan ikon Shield

### 3. Guest
**Kapabilitas:**
- Hanya bisa membuat reservasi servis
- Akses ke halaman `/reservasi`
- **TIDAK BISA** mengakses dashboard admin

**Badge:** Abu-abu dengan ikon User

---

## Setup Database

### Langkah 1: Jalankan SQL Migration

Di Supabase SQL Editor, jalankan file-file berikut secara berurutan:

```sql
-- 1. Buat tabel user_roles dan trigger
-- File: scripts/03_create_user_roles.sql
```

```sql
-- 2. Setup Row Level Security
-- File: scripts/04_user_roles_rls.sql
```

### Langkah 2: Buat Super Admin Pertama

Setelah sign up akun pertama Anda, dapatkan `user_id` dari tabel `auth.users`, lalu jalankan:

```sql
-- Ganti dengan user_id dan email Anda
INSERT INTO user_roles (user_id, email, role)
VALUES ('your-user-id-here', 'your-email@example.com', 'super_admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
```

---

## Fitur RBAC

### 1. Automatic Role Assignment

Setiap user baru yang sign up akan otomatis mendapat role `guest` melalui database trigger.

### 2. Halaman Kelola User (Super Admin Only)

**URL:** `/dashboard/users`

**Fitur:**
- Lihat semua user dengan role mereka
- Buat user baru (Admin atau Guest)
- Edit role user
- Hapus user (kecuali akun sendiri)

**Cara Akses:**
1. Login sebagai Super Admin
2. Klik menu "Kelola User" di sidebar

### 3. Dashboard Navigation

Navigation menu akan menyesuaikan berdasarkan role:

**Super Admin melihat:**
- Dashboard
- Pesanan
- Produk
- Jasa
- Laporan Keuangan
- Kelola User

**Admin melihat:**
- Dashboard
- Pesanan
- Produk
- Jasa
- Laporan Keuangan

**Guest:** Redirect otomatis ke `/reservasi`

### 4. Halaman Reservasi (Guest)

**URL:** `/reservasi`

Guest dapat membuat reservasi servis dengan mengisi:
- Nama lengkap
- Nomor telepon
- Jenis kendaraan
- Nomor plat (opsional)
- Keluhan/keperluan servis

Setelah submit, reservasi masuk ke sistem dan admin dapat mengelolanya.

---

## API Endpoints

### Get User Role
```
GET /api/user/role
Response: { user_id, email, role, created_at }
```

### Get All Users (Super Admin Only)
```
GET /api/users
Response: { users: [...] }
```

### Create New User (Super Admin Only)
```
POST /api/users
Body: { email, password, role }
Response: { user: {...} }
```

### Update User Role (Super Admin Only)
```
PATCH /api/users/[id]
Body: { role }
Response: { updated user data }
```

### Delete User (Super Admin Only)
```
DELETE /api/users/[id]
Response: { message: "User deleted successfully" }
```

---

## Security Features

### Row Level Security (RLS)

Tabel `user_roles` dilindungi dengan RLS policies:
- User hanya bisa melihat role mereka sendiri
- Super Admin bisa melihat, create, update, delete semua role
- Super Admin tidak bisa menghapus akun mereka sendiri

### API Protection

Semua API endpoints user management:
- Cek autentikasi user
- Verifikasi role Super Admin
- Validasi input data
- Error handling lengkap

### Frontend Protection

- Dashboard layout redirect Guest ke `/reservasi`
- Halaman `/dashboard/users` cek role client-side
- Navigation menu filter berdasarkan role

---

## Workflow Penggunaan

### Super Admin

1. Login dengan akun Super Admin
2. Akses menu "Kelola User"
3. Buat akun Admin baru untuk staff bengkel
4. Kelola produk, jasa, pesanan, laporan
5. Monitor semua aktivitas sistem

### Admin

1. Login dengan akun Admin
2. Kelola pesanan yang masuk
3. Update stok produk
4. Input jasa baru
5. Lihat laporan keuangan

### Guest

1. Sign up/Login sebagai Guest
2. Isi form reservasi servis
3. Tunggu konfirmasi dari admin
4. Datang ke bengkel sesuai jadwal

---

## Troubleshooting

**Q: User baru tidak bisa login ke dashboard?**
A: Periksa role di tabel `user_roles`. User dengan role `guest` hanya bisa akses `/reservasi`.

**Q: Bagaimana membuat Super Admin tambahan?**
A: Super Admin yang ada bisa create user baru, lalu update role-nya ke `super_admin` via SQL.

**Q: Guest tidak bisa submit reservasi?**
A: Periksa RLS policies di tabel `orders`. Pastikan Guest punya permission INSERT.

**Q: Admin bisa akses menu Kelola User?**
A: Tidak seharusnya. Cek implementasi di `app/dashboard/users/page.tsx`, ada redirect jika bukan Super Admin.

---

## Best Practices

1. **Minimal Super Admin**: Hanya buat 1-2 Super Admin untuk keamanan
2. **Regular Password Updates**: Ganti password secara berkala
3. **Audit Log**: Monitor aktivitas user via Supabase Dashboard
4. **Backup Database**: Rutin backup data user roles
5. **Test Permissions**: Test setiap role setelah perubahan sistem

---

## Development Notes

### File Structure

```
app/
├── api/
│   ├── user/role/route.ts        # Get user role
│   └── users/
│       ├── route.ts               # CRUD users
│       └── [id]/route.ts          # Update/delete user
├── dashboard/
│   ├── layout.tsx                 # RBAC navigation
│   └── users/page.tsx             # User management
└── reservasi/page.tsx             # Guest reservation

lib/
├── auth/rbac.ts                   # RBAC helper functions
└── hooks/use-user-role.ts         # React hooks for roles

scripts/
├── 03_create_user_roles.sql       # Database schema
└── 04_user_roles_rls.sql          # RLS policies
```

### Adding New Roles

Untuk menambah role baru:

1. Update type `UserRole` di `lib/auth/rbac.ts`
2. Update `getPermissions()` function
3. Update RLS policies di database
4. Update navigation filter di `dashboard/layout.tsx`
5. Update API validation logic

---

Sistem RBAC sudah siap digunakan. Semua role memiliki akses yang sesuai dengan kebutuhan mereka.
