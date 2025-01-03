-- Insert sample categories
insert into public.categories (name, description) values
    ('Beverages', 'Drinks and liquid refreshments'),
    ('Hot Drinks', 'Warm beverages'),
    ('Cold Drinks', 'Chilled beverages'),
    ('Food', 'Meals and snacks'),
    ('Fast Food', 'Quick serve meals'),
    ('Desserts', 'Sweet treats and desserts'),
    ('Healthy Options', 'Nutritious and healthy choices');

-- Insert sample products
insert into public.products (name, price) values
    ('Coffee', 2.50),
    ('Tea', 2.00),
    ('Sandwich', 5.00),
    ('Burger', 8.00),
    ('Pizza', 12.00),
    ('Salad', 6.00),
    ('Soda', 1.50),
    ('Water', 1.00),
    ('Cake', 4.00),
    ('Cookie', 1.50);

-- Associate products with categories
with products_ref as (
    select id, name from public.products
),
categories_ref as (
    select id, name from public.categories
)
insert into public.product_categories (product_id, category_id)
select p.id, c.id
from products_ref p, categories_ref c
where 
    (p.name = 'Coffee' and c.name in ('Beverages', 'Hot Drinks')) or
    (p.name = 'Tea' and c.name in ('Beverages', 'Hot Drinks')) or
    (p.name = 'Sandwich' and c.name in ('Food')) or
    (p.name = 'Burger' and c.name in ('Food', 'Fast Food')) or
    (p.name = 'Pizza' and c.name in ('Food', 'Fast Food')) or
    (p.name = 'Salad' and c.name in ('Food', 'Healthy Options')) or
    (p.name = 'Soda' and c.name in ('Beverages', 'Cold Drinks')) or
    (p.name = 'Water' and c.name in ('Beverages', 'Cold Drinks', 'Healthy Options')) or
    (p.name = 'Cake' and c.name in ('Desserts')) or
    (p.name = 'Cookie' and c.name in ('Desserts'));

-- Insert sample customers
insert into public.customers (name, email) values
    ('Walk-in Customer', null),
    ('John Doe', 'john@example.com'),
    ('Jane Smith', 'jane@example.com'),
    ('Bob Wilson', 'bob@example.com');

-- Insert sample customer-specific prices
insert into public.customer_prices (customer_id, product_id, price)
select 
    c.id as customer_id,
    p.id as product_id,
    p.price * 0.9 as price -- 10% discount for John Doe
from 
    public.customers c,
    public.products p
where 
    c.email = 'john@example.com';

insert into public.customer_prices (customer_id, product_id, price)
select 
    c.id as customer_id,
    p.id as product_id,
    p.price * 0.85 as price -- 15% discount for Jane Smith
from 
    public.customers c,
    public.products p
where 
    c.email = 'jane@example.com';

-- Insert sample sales
with new_sale as (
    insert into public.sales (customer_id, total, status)
    select 
        c.id,
        15.00,
        'completed'
    from public.customers c
    where c.email = 'john@example.com'
    returning id, customer_id
)
insert into public.sale_items (sale_id, product_id, quantity, price)
select 
    ns.id,
    p.id,
    2,
    cp.price
from 
    new_sale ns
    join public.products p on p.name = 'Coffee'
    join public.customer_prices cp on cp.customer_id = ns.customer_id and cp.product_id = p.id;

-- Add another sale for today
with new_sale as (
    insert into public.sales (customer_id, total, status)
    select 
        c.id,
        10.00,
        'completed'
    from public.customers c
    where c.name = 'Walk-in Customer'
    returning id
)
insert into public.sale_items (sale_id, product_id, quantity, price)
select 
    ns.id,
    p.id,
    1,
    p.price
from 
    new_sale ns
    join public.products p on p.name = 'Sandwich';
