-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create categories table
create table if not exists public.categories (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create products table
create table if not exists public.products (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    price decimal(10,2) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create product_categories junction table
create table if not exists public.product_categories (
    id uuid default uuid_generate_v4() primary key,
    product_id uuid references public.products(id) on delete cascade,
    category_id uuid references public.categories(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(product_id, category_id)
);

-- Create customers table
create table if not exists public.customers (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    email text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create customer_prices table
create table if not exists public.customer_prices (
    id uuid default uuid_generate_v4() primary key,
    customer_id uuid references public.customers(id) on delete cascade,
    product_id uuid references public.products(id) on delete cascade,
    price decimal(10,2) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(customer_id, product_id)
);

-- Create sales table
create table if not exists public.sales (
    id uuid default uuid_generate_v4() primary key,
    customer_id uuid references public.customers(id) on delete set null,
    total decimal(10,2) not null,
    status text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create sale_items table
create table if not exists public.sale_items (
    id uuid default uuid_generate_v4() primary key,
    sale_id uuid references public.sales(id) on delete cascade,
    product_id uuid references public.products(id) on delete restrict,
    quantity integer not null,
    price decimal(10,2) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.categories enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.customer_prices enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;

-- Create policies
-- Categories policies
create policy "Enable read access for all users" on public.categories for select using (true);
create policy "Enable insert for authenticated users only" on public.categories for insert with check (auth.role() = 'authenticated');
create policy "Enable update for authenticated users only" on public.categories for update using (auth.role() = 'authenticated');
create policy "Enable delete for authenticated users only" on public.categories for delete using (auth.role() = 'authenticated');

-- Product categories policies
create policy "Enable read access for all users" on public.product_categories for select using (true);
create policy "Enable insert for authenticated users only" on public.product_categories for insert with check (auth.role() = 'authenticated');
create policy "Enable update for authenticated users only" on public.product_categories for update using (auth.role() = 'authenticated');
create policy "Enable delete for authenticated users only" on public.product_categories for delete using (auth.role() = 'authenticated');

-- Products policies
create policy "Enable read access for all users" on public.products for select using (true);
create policy "Enable insert for authenticated users only" on public.products for insert with check (auth.role() = 'authenticated');
create policy "Enable update for authenticated users only" on public.products for update using (auth.role() = 'authenticated');
create policy "Enable delete for authenticated users only" on public.products for delete using (auth.role() = 'authenticated');

-- Customers policies
create policy "Enable read access for all users" on public.customers for select using (true);
create policy "Enable insert for authenticated users only" on public.customers for insert with check (auth.role() = 'authenticated');
create policy "Enable update for authenticated users only" on public.customers for update using (auth.role() = 'authenticated');
create policy "Enable delete for authenticated users only" on public.customers for delete using (auth.role() = 'authenticated');

-- Customer prices policies
create policy "Enable read access for all users" on public.customer_prices for select using (true);
create policy "Enable insert for authenticated users only" on public.customer_prices for insert with check (auth.role() = 'authenticated');
create policy "Enable update for authenticated users only" on public.customer_prices for update using (auth.role() = 'authenticated');
create policy "Enable delete for authenticated users only" on public.customer_prices for delete using (auth.role() = 'authenticated');

-- Sales policies
create policy "Enable read access for all users" on public.sales for select using (true);
create policy "Enable insert for authenticated users only" on public.sales for insert with check (auth.role() = 'authenticated');
create policy "Enable update for authenticated users only" on public.sales for update using (auth.role() = 'authenticated');
create policy "Enable delete for authenticated users only" on public.sales for delete using (auth.role() = 'authenticated');

-- Sale items policies
create policy "Enable read access for all users" on public.sale_items for select using (true);
create policy "Enable insert for authenticated users only" on public.sale_items for insert with check (auth.role() = 'authenticated');
create policy "Enable update for authenticated users only" on public.sale_items for update using (auth.role() = 'authenticated');
create policy "Enable delete for authenticated users only" on public.sale_items for delete using (auth.role() = 'authenticated');
