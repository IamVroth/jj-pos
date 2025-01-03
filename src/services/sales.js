import { supabase } from '../lib/supabase'

export async function createSale(saleData) {
  const { items, customer_id, total } = saleData
  
  const { data, error } = await supabase
    .from('sales')
    .insert([
      {
        customer_id,
        total,
        status: 'completed'
      }
    ])
    .select()
    .single()

  if (error) throw error

  const saleItems = items.map(item => ({
    sale_id: data.id,
    product_id: item.id,
    quantity: item.quantity,
    price: item.price
  }))

  const { error: itemsError } = await supabase
    .from('sale_items')
    .insert(saleItems)

  if (itemsError) throw itemsError

  return data
}

export async function getCustomerPrice(customer_id, product_id) {
  const { data, error } = await supabase
    .from('customer_prices')
    .select('price')
    .eq('customer_id', customer_id)
    .eq('product_id', product_id)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    throw error
  }

  return data?.price
}

export function generateReceiptContent(sale, items, customer) {
  const date = new Date().toLocaleString()
  
  let content = `
JJ POS SYSTEM
-----------------------
Date: ${date}
${customer ? `Customer: ${customer.name}` : ''}

Items:
-----------------------
`

  items.forEach(item => {
    content += `${item.name}
Qty: ${item.quantity} x $${item.price} = $${item.quantity * item.price}
`
  })

  content += `
-----------------------
Total: $${sale.total}
-----------------------

Thank you for your business!
`

  return content
}
