# Supabase Setup Guide

This project is configured to use **Supabase** for data storage, authentication, and real-time capabilities.

## Getting Started

### 1. Create a Supabase Project

1. Go to [Supabase](https://app.supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in the project details:
   - **Name**: Your project name
   - **Database Password**: Create a strong password
   - **Region**: Choose the region closest to your users

### 2. Get Your API Keys

After your project is created:

1. Navigate to **Project Settings** → **API**
2. Copy the following values:
   - **Project URL** (under "Configuration")
   - **anon public** (under "Project API keys")
   - **service_role secret** (under "Project API keys")

### 3. Configure Environment Variables

1. Update your `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_secret_key
```

> **Security Note**: 
> - The `VITE_` prefix makes it available to the frontend (safe - these are public credentials)
> - `SUPABASE_SERVICE_ROLE_KEY` is secret and must NEVER be exposed to the frontend

### 4. Create Your Database Tables

In the Supabase Dashboard, go to **SQL Editor** and create your tables:

#### Example: Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  wallet_address TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Example: Collections Table
```sql
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Example: Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image TEXT,
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Enable Row Level Security (RLS)

For production security, enable RLS on your tables:

1. Go to **Authentication** → **Policies** in Supabase Dashboard
2. Create policies for your tables based on your needs

Example policy to allow public read access:
```sql
CREATE POLICY "Allow public read" ON collections
  FOR SELECT USING (true);
```

## Usage in Your Application

### Frontend Usage

#### Import and use in React components:

```typescript
import { supabase } from '@/lib/supabase';

// Fetch data
const { data, error } = await supabase
  .from('collections')
  .select('*');

// Create data
const { data, error } = await supabase
  .from('products')
  .insert([{ name: 'Product 1', price: 29.99 }]);

// Update data
const { data, error } = await supabase
  .from('products')
  .update({ price: 39.99 })
  .eq('id', 'product-id');

// Delete data
const { error } = await supabase
  .from('products')
  .delete()
  .eq('id', 'product-id');
```

### Server Usage

#### Use the server Supabase client for sensitive operations:

```typescript
import { supabaseServer } from '@/server/supabase';

// Example: Get user data (server-side)
const { data, error } = await supabaseServer
  .from('users')
  .select('*')
  .eq('id', userId);

// Server-side insertions with service role privileges
const { data, error } = await supabaseServer
  .from('orders')
  .insert([orderData]);
```

## Real-time Subscriptions

Listen to real-time changes:

```typescript
const subscription = supabase
  .channel('products')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'products' },
    (payload) => {
      console.log('Change received!', payload);
    }
  )
  .subscribe();

// Clean up
subscription.unsubscribe();
```

## Authentication (Optional)

Supabase also provides authentication. See docs:
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)

## Database Migrations

For production deployments with schema changes, use SQL migrations:

```bash
# Create a migration
supabase migration new add_users_table

# Apply migrations
supabase db push
```

## Troubleshooting

**Issue**: "Missing Supabase credentials" error
- **Solution**: Ensure `.env` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

**Issue**: CORS errors when accessing Supabase
- **Solution**: Ensure your domain is added to Supabase project settings under **Authentication** → **URL Configuration**

**Issue**: Server can't access Supabase
- **Solution**: Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in `.env`

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Database Guide](https://supabase.com/docs/guides/database)
