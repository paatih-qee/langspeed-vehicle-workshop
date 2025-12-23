# Langspeed Bengkel - Setup Instructions

## Prerequisites
- Node.js 18+ installed
- Supabase account (free tier available at supabase.com)
- Vercel account (optional, for deployment)

## Step 1: Clone and Install Dependencies

\`\`\`bash
# Install dependencies
npm install
# or
pnpm install
\`\`\`

## Step 2: Set Up Supabase

### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details and create
4. Wait for the project to be provisioned

### Get Your Credentials
1. Go to Project Settings → API
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY`

### Create Database Tables
1. Go to SQL Editor in Supabase dashboard
2. Create a new query
3. Copy and paste the contents of `scripts/01_create_tables.sql`
4. Click "Run"
5. Create another query with `scripts/02_enable_rls.sql`
6. Click "Run"

## Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

## Step 4: Run Development Server

\`\`\`bash
npm run dev
\`\`\`

The app will be available at `http://localhost:3000`

## Step 5: Create Your First Account

1. Go to http://localhost:3000
2. Click "Belum punya akun? Daftar" to sign up
3. Enter email and password
4. Check your email for confirmation link
5. Click the confirmation link
6. Log in with your credentials

## Step 6: Add Initial Data

### Add Products
1. Go to Dashboard → Produk
2. Click "Tambah Produk"
3. Fill in:
   - Nama Produk (e.g., "Oli Motor")
   - Harga Jual (e.g., 50000)
   - Harga Beli (e.g., 30000)
   - Stok (e.g., 10)
4. Click "Simpan Produk"

### Add Services
1. Go to Dashboard → Pesanan
2. Click "Pesanan Baru"
3. Add services as needed

## Deployment to Vercel

### Step 1: Push to GitHub
\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/langspeed-bengkel.git
git push -u origin main
\`\`\`

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Click "Deploy"

### Step 3: Update Redirect URL
In Supabase:
1. Go to Authentication → URL Configuration
2. Add your Vercel domain to "Redirect URLs"
3. Format: `https://yourdomain.vercel.app/auth/callback`

## Features Overview

### Dashboard
- Overview of key metrics
- Recent orders
- Quick access to main features

### Produk (Products)
- View all products with purchase and selling prices
- Add new products
- Track inventory levels
- Calculate profit margins

### Pesanan (Orders)
- Create new service orders
- Add products and services to orders
- Track order status (Diproses/Selesai)
- Automatic stock management

### Laporan Keuangan (Financial Reports)
- View total revenue, costs, and profit
- Filter by date range
- Visualize data with charts
- Calculate profit margins
- Track items sold

## API Endpoints Reference

### Authentication
- `POST /auth/login` - User login/signup
- `GET /auth/callback` - OAuth callback

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create product
- `PATCH /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Services
- `GET /api/services` - List all services
- `POST /api/services` - Create service

### Orders
- `GET /api/orders` - List all orders
- `POST /api/orders` - Create order
- `GET /api/orders/[id]` - Get order details
- `PATCH /api/orders/[id]` - Update order status

### Reports
- `GET /api/reports/profit-loss` - Get profit/loss report
  - Optional query params: `startDate`, `endDate`

## Troubleshooting

### "Invalid login credentials"
- Verify email is confirmed in Supabase
- Check that credentials are correct
- Try signing up again

### "RLS policy violation"
- Ensure you're logged in
- Check that RLS policies are enabled
- Verify user has correct permissions

### "Products not showing"
- Confirm database tables were created
- Check Supabase connection string
- Verify RLS policies allow SELECT

### "Stock not updating"
- Check order creation response
- Verify product exists in database
- Check API logs for errors

## Database Backup

### Manual Backup
1. Go to Supabase dashboard
2. Click "Backups" in sidebar
3. Click "Request backup"

### Automated Backups
Supabase automatically backs up your database daily on paid plans.

## Security Best Practices

1. **Never commit `.env.local`** - Add to `.gitignore`
2. **Use Service Role Key only on server** - Never expose in client code
3. **Enable RLS on all tables** - Already configured
4. **Rotate API keys regularly** - Do this in Supabase settings
5. **Use HTTPS in production** - Vercel handles this automatically

## Performance Tips

1. **Enable caching** - SWR hooks already implement this
2. **Use indexes** - Already created on common queries
3. **Paginate large datasets** - Consider adding pagination to orders
4. **Monitor database usage** - Check Supabase dashboard

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Supabase documentation: https://supabase.com/docs
3. Check Next.js documentation: https://nextjs.org/docs
4. Open an issue on GitHub

## Next Steps

1. Customize branding and colors
2. Add more detailed analytics
3. Implement email notifications
4. Add user roles and permissions
5. Create mobile app version
6. Add inventory alerts
7. Implement customer management
8. Add payment integration
\`\`\`
