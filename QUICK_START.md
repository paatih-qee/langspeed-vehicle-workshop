# Quick Start Guide - Langspeed Bengkel

## Prerequisites
- Node.js 18+ installed
- Supabase account (free at supabase.com)

## Step 1: Install Dependencies

\`\`\`bash
npm install
\`\`\`

## Step 2: Set Up Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

Get these values from your Supabase project:
1. Go to supabase.com and create a new project
2. Go to Settings → API
3. Copy the Project URL and Anon Key
4. Copy the Service Role Key

## Step 3: Set Up Database

1. Go to your Supabase project → SQL Editor
2. Create a new query and paste the contents of `scripts/01_create_tables.sql`
3. Click "Run"
4. Create another query with `scripts/02_enable_rls.sql`
5. Click "Run"

## Step 4: Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open http://localhost:3000 in your browser.

## Step 5: Create Your Account

1. Click "Belum punya akun? Daftar" to sign up
2. Enter email and password
3. Check your email for confirmation link
4. Click the link to confirm
5. Log in with your credentials

## Features Available

- **Dashboard**: Overview of your business metrics
- **Produk**: Manage products with purchase and selling prices
- **Pesanan**: Create and track service orders
- **Laporan Keuangan**: View profit/loss analysis with charts

## Troubleshooting

### "Cannot find module" errors
- Delete `node_modules` folder
- Run `npm install` again

### "RLS policy violation" errors
- Make sure you're logged in
- Verify database migrations were run

### "Connection refused" errors
- Check your Supabase URL and keys in `.env.local`
- Verify Supabase project is active

## Next Steps

1. Add your first products
2. Create test orders
3. View financial reports
4. Customize branding and colors
5. Deploy to Vercel

For detailed documentation, see:
- [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) - Comprehensive setup guide
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Technical migration details
- [README.md](./README.md) - Project overview
