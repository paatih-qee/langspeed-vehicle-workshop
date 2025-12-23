# Convex to Supabase Migration Guide

## Overview
This project has been successfully migrated from Convex to Supabase. All backend logic has been converted to Next.js API routes, and a new financial reporting system has been added.

## Key Changes

### 1. Database Migration
- **Old**: Convex backend with real-time database
- **New**: Supabase PostgreSQL with Row Level Security (RLS)

### 2. New Features Added
- **Purchase Price Field**: Added `purchase_price` to products table for cost tracking
- **Financial Reporting**: Complete profit/loss analysis system with:
  - Total Revenue calculation
  - Total Cost (COGS) calculation
  - Profit/Loss calculation
  - Profit Margin percentage
  - Date range filtering

### 3. Authentication
- **Old**: Convex Auth
- **New**: Supabase Auth (Email/Password)

### 4. API Structure
- **Old**: Convex mutations and queries
- **New**: Next.js API routes in `/app/api/`

## Setup Instructions

### Step 1: Run Database Migrations
Execute the SQL scripts in order:

1. First, run `scripts/01_create_tables.sql` to create all tables
2. Then, run `scripts/02_enable_rls.sql` to enable Row Level Security

You can run these directly in the Supabase SQL editor or use the v0 script execution feature.

### Step 2: Environment Variables
Ensure these environment variables are set in your Vercel project:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

### Step 3: Update Your App
The app now uses:
- `/app/auth/login` - Authentication page
- `/app/dashboard` - Main dashboard
- `/app/dashboard/products` - Product management
- `/app/dashboard/orders` - Order management
- `/app/dashboard/reports` - Financial reports

## API Endpoints

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create new product
- `PATCH /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Services
- `GET /api/services` - List all services
- `POST /api/services` - Create new service

### Orders
- `GET /api/orders` - List all orders
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get order details
- `PATCH /api/orders/[id]` - Update order status

### Reports
- `GET /api/reports/profit-loss` - Get profit/loss report
  - Query params: `startDate`, `endDate` (optional)

## Data Structure

### Products Table
\`\`\`sql
- id (UUID)
- product_id (TEXT) - Unique identifier
- name (TEXT)
- price (DECIMAL) - Selling price
- purchase_price (DECIMAL) - Cost price (NEW)
- stock (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
\`\`\`

### Orders Table
\`\`\`sql
- id (UUID)
- order_number (TEXT) - Unique order number
- customer_name (TEXT)
- customer_phone (TEXT)
- vehicle_type (TEXT)
- plate_number (TEXT)
- complaint (TEXT)
- total_amount (DECIMAL)
- status (TEXT) - 'Diproses' or 'Selesai'
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
\`\`\`

### Order Items Table
\`\`\`sql
- id (UUID)
- order_id (UUID) - Foreign key to orders
- item_id (TEXT)
- item_name (TEXT)
- item_type (TEXT) - 'product' or 'service'
- quantity (INTEGER)
- price (DECIMAL) - Selling price
- purchase_price (DECIMAL) - Cost price (NEW)
- subtotal (DECIMAL)
- created_at (TIMESTAMP)
\`\`\`

## Profit/Loss Calculation Logic

The financial reporting system calculates:

1. **Total Revenue** = Sum of (selling_price × quantity) for all items
2. **Total Cost** = Sum of (purchase_price × quantity) for all items
3. **Total Profit** = Total Revenue - Total Cost
4. **Profit Margin** = (Total Profit / Total Revenue) × 100%

Example:
- Item sold at Rp 100,000 with purchase price Rp 60,000
- Quantity: 5 units
- Revenue: 100,000 × 5 = Rp 500,000
- Cost: 60,000 × 5 = Rp 300,000
- Profit: 500,000 - 300,000 = Rp 200,000
- Margin: (200,000 / 500,000) × 100 = 40%

## Custom Hooks

The app includes reusable SWR hooks for data fetching:

\`\`\`typescript
// Fetch products
const { products, isLoading, error, mutate } = useProducts()

// Fetch services
const { services, isLoading, error, mutate } = useServices()

// Fetch orders
const { orders, isLoading, error, mutate } = useOrders()

// Fetch profit/loss report
const { report, isLoading, error, mutate } = useProfitLoss(startDate, endDate)

// Get current user
const { user, loading } = useAuth()
\`\`\`

## Cleanup Tasks

To fully complete the migration, you can:

1. Delete the `/convex` folder (no longer needed)
2. Remove Convex dependencies from `package.json`:
   - `convex`
   - `@convex-dev/auth`
   - `convex/react`

3. Delete old component files that used Convex:
   - `/src/SignInForm.tsx`
   - `/src/SignOutButton.tsx`
   - `/src/Dashboard.tsx`
   - `/src/components/` (old components)

4. Update `package.json` to ensure these are installed:
   - `@supabase/ssr`
   - `@supabase/supabase-js`
   - `swr`
   - `recharts` (for charts)

## Troubleshooting

### Authentication Issues
- Ensure email confirmation is enabled in Supabase Auth settings
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct

### RLS Policy Errors
- Make sure you're authenticated before accessing protected tables
- Verify RLS policies are enabled with `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY`

### Data Not Showing
- Check that the database migrations have been run
- Verify the Supabase connection string is correct
- Check browser console for API errors

## Next Steps

1. Test all features in the dashboard
2. Verify profit/loss calculations with sample data
3. Set up automated backups in Supabase
4. Configure email notifications for important events
5. Add more detailed analytics and reporting features as needed
\`\`\`

```typescript file="" isHidden
