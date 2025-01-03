import { useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Paper, 
  Title, 
  Group, 
  Select, 
  Text, 
  Table,
  Button,
  Modal,
  Stack,
  Badge
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { useReactToPrint } from 'react-to-print'
import { supabase } from '../lib/supabase'
import { Receipt } from '../components/Receipt'

export function SalesHistory() {
  const [period, setPeriod] = useState('today')
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [selectedSale, setSelectedSale] = useState(null)
  const receiptRef = useRef()

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
  })

  // Calculate date range based on period
  const getDateRange = () => {
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    
    switch (period) {
      case 'today':
        return { start, end }
      case 'yesterday':
        start.setDate(start.getDate() - 1)
        end.setDate(end.getDate() - 1)
        return { start, end }
      case 'thisWeek':
        start.setDate(start.getDate() - start.getDay())
        return { start, end }
      case 'thisMonth':
        start.setDate(1)
        return { start, end }
      case 'thisYear':
        start.setMonth(0, 1)
        return { start, end }
      case 'custom':
        return {
          start: startDate,
          end: endDate
        }
      default:
        return { start, end }
    }
  }

  // Fetch sales data
  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['sales', period, startDate, endDate],
    queryFn: async () => {
      const { start, end } = getDateRange()
      
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          customer:customers(*),
          sale_items(
            *,
            product:products(*)
          )
        `)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }
  })

  // Calculate summary statistics
  const summary = {
    totalSales: sales.length,
    totalRevenue: sales.reduce((sum, sale) => sum + sale.total, 0),
    averageTransaction: sales.length > 0 
      ? sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length 
      : 0
  }

  return (
    <Stack spacing="md">
      <Title order={2}>Sales History</Title>

      {/* Filters */}
      <Paper p="md">
        <Group align="flex-end">
          <Select
            label="Time Period"
            value={period}
            onChange={setPeriod}
            data={[
              { value: 'today', label: 'Today' },
              { value: 'yesterday', label: 'Yesterday' },
              { value: 'thisWeek', label: 'This Week' },
              { value: 'thisMonth', label: 'This Month' },
              { value: 'thisYear', label: 'This Year' },
              { value: 'custom', label: 'Custom Range' }
            ]}
          />
          
          {period === 'custom' && (
            <>
              <DatePickerInput
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                maxDate={endDate}
              />
              <DatePickerInput
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                minDate={startDate}
              />
            </>
          )}
        </Group>
      </Paper>

      {/* Summary Statistics */}
      <Group grow>
        <Paper p="md">
          <Text size="sm" color="dimmed">Total Sales</Text>
          <Text size="xl" weight={500}>{summary.totalSales}</Text>
        </Paper>
        
        <Paper p="md">
          <Text size="sm" color="dimmed">Total Revenue</Text>
          <Text size="xl" weight={500}>${summary.totalRevenue.toFixed(2)}</Text>
        </Paper>
        
        <Paper p="md">
          <Text size="sm" color="dimmed">Average Transaction</Text>
          <Text size="xl" weight={500}>${summary.averageTransaction.toFixed(2)}</Text>
        </Paper>
      </Group>

      {/* Sales Table */}
      <Paper p="md">
        <Table>
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(sale => (
              <tr key={sale.id}>
                <td>{new Date(sale.created_at).toLocaleString()}</td>
                <td>{sale.customer?.name || 'Walk-in Customer'}</td>
                <td>{sale.sale_items.length} items</td>
                <td>${sale.total.toFixed(2)}</td>
                <td>
                  <Button 
                    variant="subtle" 
                    size="xs"
                    onClick={() => setSelectedSale(sale)}
                  >
                    View Receipt
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Paper>

      {/* Receipt Modal */}
      <Modal
        opened={!!selectedSale}
        onClose={() => setSelectedSale(null)}
        title="Sale Receipt"
        size="md"
      >
        <div ref={receiptRef}>
          {selectedSale && (
            <Receipt
              sale={selectedSale}
              items={selectedSale.sale_items.map(item => ({
                product: item.product,
                quantity: item.quantity,
                price: item.price
              }))}
              customer={selectedSale.customer}
              exchangeRate={4100}
            />
          )}
        </div>

        <Group position="center" mt="xl">
          <Button variant="outline" onClick={() => setSelectedSale(null)}>
            Close
          </Button>
          <Button onClick={handlePrint}>
            Print Receipt
          </Button>
        </Group>
      </Modal>
    </Stack>
  )
}
