import { Text, Divider } from '@mantine/core'

export function Receipt({ sale, items, customer, exchangeRate }) {
  return (
    <div style={{ padding: '20px', maxWidth: '300px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 5px 0' }}>JJ POS System</h2>
        <p style={{ margin: '0 0 5px 0' }}>Receipt</p>
        <p style={{ margin: '0 0 5px 0' }}>{new Date(sale.created_at).toLocaleString()}</p>
        {customer && (
          <p style={{ margin: '0 0 5px 0' }}>Customer: {customer.name}</p>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        {items.map((item, index) => (
          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <div>
              <div>{item.product.name}</div>
              <div style={{ fontSize: '0.9em', color: '#666' }}>
                ${item.price.toFixed(2)} x {item.quantity}
              </div>
            </div>
            <div>${(item.price * item.quantity).toFixed(2)}</div>
          </div>
        ))}
      </div>

      <Divider style={{ margin: '20px 0' }} />

      <div style={{ marginBottom: '5px', display: 'flex', justifyContent: 'space-between' }}>
        <strong>Total (USD):</strong>
        <strong>${sale.total.toFixed(2)}</strong>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <strong>Total (KHR):</strong>
        <strong>{new Intl.NumberFormat('km-KH', {
          style: 'currency',
          currency: 'KHR',
          maximumFractionDigits: 0
        }).format(sale.total * exchangeRate)}</strong>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9em' }}>
        <p>Thank you for your business!</p>
        <p>Exchange Rate: 1 USD = {exchangeRate} KHR</p>
      </div>
    </div>
  )
}
