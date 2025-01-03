import { supabase } from '../lib/supabase'

export async function getProducts() {
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      product_categories (
        category: categories (
          id,
          name
        )
      )
    `)
  
  if (error) throw error
  
  // Transform the data to a more usable format
  return products.map(product => ({
    ...product,
    categories: product.product_categories.map(pc => pc.category)
  }))
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data
}

export async function getCustomerPrice(customerId, productId) {
  if (!customerId) return null
  
  const { data, error } = await supabase
    .from('customer_prices')
    .select('price')
    .eq('customer_id', customerId)
    .eq('product_id', productId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error // PGRST116 is "no rows returned"
  return data?.price
}

export async function getCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data
}

export async function createSale({ customerId, items, total }) {
  // Start a transaction
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert([
      {
        customer_id: customerId,
        total,
        status: 'completed'
      }
    ])
    .select()
    .single()

  if (saleError) throw saleError

  // Insert sale items
  const saleItems = items.map(item => ({
    sale_id: sale.id,
    product_id: item.id,
    quantity: item.quantity,
    price: item.price
  }))

  const { error: itemsError } = await supabase
    .from('sale_items')
    .insert(saleItems)

  if (itemsError) throw itemsError

  return sale
}

export async function getDailySales() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { data, error } = await supabase
    .from('sales')
    .select('total')
    .gte('created_at', today.toISOString())
    .lt('created_at', new Date(today.getTime() + 86400000).toISOString())
  
  if (error) throw error
  return data.reduce((sum, sale) => sum + sale.total, 0)
}

export async function getMonthlySales() {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  
  const { data, error } = await supabase
    .from('sales')
    .select('total, created_at')
    .gte('created_at', startOfMonth.toISOString())
    .order('created_at')
  
  if (error) throw error
  return data
}

export async function getProductsByCategory(categoryId) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_categories!inner (
        category_id
      )
    `)
    .eq('product_categories.category_id', categoryId)
  
  if (error) throw error
  return data
}
