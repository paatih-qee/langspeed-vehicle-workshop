# Langspeed Bengkel - Sistem Manajemen Servis dan Suku Cadang

Aplikasi web modern untuk mengelola servis motor dan penjualan suku cadang dengan fitur laporan keuangan terintegrasi.

## Fitur Utama

✨ **Dashboard Interaktif**
- Ringkasan metrik bisnis real-time
- Akses cepat ke fitur utama
- Riwayat pesanan terbaru

📦 **Manajemen Produk**
- Kelola inventori suku cadang
- Tracking harga beli dan jual
- Perhitungan margin keuntungan otomatis
- Monitoring stok real-time

🔧 **Manajemen Pesanan**
- Buat pesanan servis dengan mudah
- Tambahkan produk dan jasa
- Tracking status pesanan
- Otomatis update stok

💰 **Laporan Keuangan**
- Analisis laba dan rugi komprehensif
- Filter berdasarkan periode tanggal
- Visualisasi data dengan grafik
- Perhitungan margin keuntungan
- Export laporan

🔐 **Keamanan**
- Autentikasi email/password
- Row Level Security (RLS)
- Enkripsi data
- Backup otomatis

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Data Fetching**: SWR

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase account

### Installation

1. Clone repository
\`\`\`bash
git clone https://github.com/yourusername/langspeed-bengkel.git
cd langspeed-bengkel
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables
\`\`\`bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
\`\`\`

4. Run development server
\`\`\`bash
npm run dev
\`\`\`

5. Open http://localhost:3000

For detailed setup instructions, see [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)

## Project Structure

\`\`\`
langspeed-bengkel/
├── app/
│   ├── api/                    # API routes
│   │   ├── products/
│   │   ├── services/
│   │   ├── orders/
│   │   └── reports/
│   ├── auth/                   # Authentication pages
│   ├── dashboard/              # Dashboard pages
│   └── layout.tsx
├── lib/
│   ├── supabase/              # Supabase clients
│   └── hooks/                 # Custom React hooks
├── components/                # Reusable components
├── scripts/                   # Database migration scripts
└── public/                    # Static assets
\`\`\`

## Database Schema

### Products
- `id` - UUID primary key
- `product_id` - Unique identifier
- `name` - Product name
- `price` - Selling price
- `purchase_price` - Cost price (NEW)
- `stock` - Current inventory
- `created_at`, `updated_at` - Timestamps

### Orders
- `id` - UUID primary key
- `order_number` - Unique order number
- `customer_name` - Customer name
- `customer_phone` - Contact number
- `vehicle_type` - Vehicle type
- `plate_number` - License plate
- `complaint` - Service complaint
- `total_amount` - Order total
- `status` - Order status (Diproses/Selesai)
- `created_at`, `updated_at` - Timestamps

### Order Items
- `id` - UUID primary key
- `order_id` - Foreign key to orders
- `item_id` - Product/service ID
- `item_name` - Item name
- `item_type` - Type (product/service)
- `quantity` - Quantity
- `price` - Selling price
- `purchase_price` - Cost price (NEW)
- `subtotal` - Line total
- `created_at` - Timestamp

## API Documentation

See [API_DOCS.md](./API_DOCS.md) for detailed endpoint documentation.

## Profit/Loss Calculation

The system calculates financial metrics as follows:

\`\`\`
Total Revenue = Σ(selling_price × quantity)
Total Cost = Σ(purchase_price × quantity)
Total Profit = Total Revenue - Total Cost
Profit Margin = (Total Profit / Total Revenue) × 100%
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For support, email support@langspeed.com or open an issue on GitHub.

## Changelog

### v1.0.0 (Current)
- ✅ Migrated from Convex to Supabase
- ✅ Added purchase price tracking
- ✅ Implemented financial reporting system
- ✅ Created comprehensive dashboard
- ✅ Added profit/loss calculations

## Roadmap

- [ ] Mobile app (React Native)
- [ ] SMS notifications
- [ ] Email reports
- [ ] Multi-user roles
- [ ] Advanced analytics
- [ ] Inventory alerts
- [ ] Customer management
- [ ] Payment integration
\`\`\`
