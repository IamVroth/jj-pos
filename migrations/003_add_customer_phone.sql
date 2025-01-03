-- Add phone column to customers table
alter table public.customers
add column if not exists phone text;
