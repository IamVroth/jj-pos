import { Grid, Paper, Text, Group, SimpleGrid } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { getDailySales, getMonthlySales } from '../services/queries'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { supabase } from '../lib/supabase'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function Dashboard() {
  const { data: dailySales = 0 } = useQuery({
    queryKey: ['daily-sales'],
    queryFn: getDailySales
  })

  const { data: monthlySales = [] } = useQuery({
    queryKey: ['monthly-sales'],
    queryFn: getMonthlySales
  })

  // Get sales by category
  const { data: categoryStats = [] } = useQuery({
    queryKey: ['category-sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sale_items')
        .select(`
          quantity,
          price,
          products (
            product_categories (
              category: categories (
                name
              )
            )
          )
        `)

      if (error) throw error

      // Calculate sales by category
      const categoryTotals = {}
      data.forEach(item => {
        const categories = item.products.product_categories
        const total = item.quantity * item.price
        
        categories.forEach(pc => {
          const categoryName = pc.category.name
          categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + total
        })
      })

      return Object.entries(categoryTotals).map(([name, value]) => ({
        name,
        value
      }))
    }
  })

  return (
    <div>
      <SimpleGrid cols={3} mb="xl">
        <Paper shadow="xs" p="md">
          <Text size="lg" weight={500}>Today's Sales</Text>
          <Text size="xl" weight={700}>${dailySales.toFixed(2)}</Text>
        </Paper>
        
        <Paper shadow="xs" p="md">
          <Text size="lg" weight={500}>Monthly Sales</Text>
          <Text size="xl" weight={700}>
            ${monthlySales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}
          </Text>
        </Paper>
        
        <Paper shadow="xs" p="md">
          <Text size="lg" weight={500}>Total Categories</Text>
          <Text size="xl" weight={700}>{categoryStats.length}</Text>
        </Paper>
      </SimpleGrid>

      <Grid>
        <Grid.Col span={8}>
          <Paper shadow="xs" p="md">
            <Text size="lg" weight={500} mb="md">Monthly Sales Trend</Text>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="created_at" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value) => ['$' + value.toFixed(2), 'Sales']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Paper>
        </Grid.Col>

        <Grid.Col span={4}>
          <Paper shadow="xs" p="md">
            <Text size="lg" weight={500} mb="md">Sales by Category</Text>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => '$' + value.toFixed(2)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Paper>
        </Grid.Col>
      </Grid>
    </div>
  )
}
