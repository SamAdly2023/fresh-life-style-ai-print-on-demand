
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS TABLE
create table if not exists public.users (
  id text primary key, -- Google ID or Supabase Auth ID
  email text unique not null,
  name text,
  avatar_url text,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PRODUCTS TABLE
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price decimal(10, 2) not null,
  base_image_url text not null,
  category text check (category in ('tshirt', 'hoodie')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- DESIGNS TABLE (Gallery designs)
create table if not exists public.designs (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  author text not null,
  image_url text not null,
  is_ai boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ORDERS TABLE
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id text references public.users(id),
  total_amount decimal(10, 2) not null,
  status text check (status in ('pending', 'processing', 'shipped', 'delivered', 'paid', 'payment_failed')) default 'pending',
  stripe_payment_intent_id text,
  stripe_client_secret text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ORDER ITEMS TABLE
create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  design_id uuid references public.designs(id), -- Optional, if picked from gallery
  custom_design_url text, -- Optional, if generated/uploaded
  quantity integer not null default 1,
  size text not null,
  color text not null,
  price_at_purchase decimal(10, 2) not null
);

-- RLS POLICIES (Row Level Security)
-- Note: When using direct PostgreSQL connections (pg library), auth.uid() is null
-- So we need permissive policies for backend access

-- Users table - allow all operations from backend
alter table public.users enable row level security;
drop policy if exists "Users can view own profile" on public.users;
drop policy if exists "Allow all users operations" on public.users;
create policy "Allow all users operations" on public.users for all using (true) with check (true);

-- Orders table - allow all operations from backend
alter table public.orders enable row level security;
drop policy if exists "Users can view own orders" on public.orders;
drop policy if exists "Allow all orders operations" on public.orders;
create policy "Allow all orders operations" on public.orders for all using (true) with check (true);

-- Order items table - allow all operations from backend  
alter table public.order_items enable row level security;
drop policy if exists "Allow all order_items operations" on public.order_items;
create policy "Allow all order_items operations" on public.order_items for all using (true) with check (true);

-- Allow public read access to products and designs
alter table public.products enable row level security;
drop policy if exists "Public products are viewable by everyone" on public.products;
create policy "Public products are viewable by everyone" on public.products for all using (true) with check (true);

alter table public.designs enable row level security;
drop policy if exists "Public designs are viewable by everyone" on public.designs;
create policy "Public designs are viewable by everyone" on public.designs for all using (true) with check (true);
