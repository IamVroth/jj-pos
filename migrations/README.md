# Database Migrations

This directory contains SQL migration files for setting up the JJ POS system database.

## Files

1. `001_initial_schema.sql`: Creates the initial database schema including:
   - Categories table
   - Products table
   - Product-Categories relationship table
   - Customers table
   - Customer-specific prices table
   - Sales table
   - Sale items table
   - Row Level Security policies

2. `002_sample_data.sql`: Inserts sample data including:
   - Sample categories (Beverages, Food, etc.)
   - Sample products with prices
   - Product-category associations
   - Sample customers
   - Customer-specific pricing examples
   - Sample sales records

## How to Apply Migrations

1. Go to your Supabase project's SQL Editor
2. Copy and paste the contents of each migration file in order
3. Execute each SQL script

## Schema Overview

### Categories
- Stores product categories
- Categories can contain multiple products
- Examples: Beverages, Food, Desserts

### Products
- Stores product information (name, price)
- Base prices for all customers
- Products can belong to multiple categories

### Product Categories
- Junction table linking products to categories
- Allows products to be in multiple categories
- Example: Coffee can be in both "Beverages" and "Hot Drinks"

### Customers
- Customer information
- Includes a default "Walk-in Customer" for quick sales

### Customer Prices
- Stores customer-specific pricing
- Links customers to products with special prices

### Sales
- Records of completed sales
- Includes total amount and customer reference

### Sale Items
- Individual items in each sale
- Records quantity and price at time of sale
