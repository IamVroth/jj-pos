import { useState, useRef } from 'react'
import { 
  Grid, 
  Paper, 
  Select, 
  Button, 
  Group, 
  Text, 
  NumberInput, 
  Tabs, 
  Divider, 
  Modal,
  TextInput,
  ActionIcon,
  Card,
  Image,
  Avatar,
  Box
} from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { useReactToPrint } from 'react-to-print'
import { IconSearch, IconMinus, IconPlus } from '@tabler/icons-react'
import { supabase } from '../lib/supabase'
import { Receipt } from '../components/Receipt'

export function POS() {
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [cart, setCart] = useState([])
  const [exchangeRate, setExchangeRate] = useState(4100)
  const [showReceipt, setShowReceipt] = useState(false)
  const [completedSale, setCompletedSale] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const receiptRef = useRef()

  // Fetch customers
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name')
      if (error) throw error
      return data
    }
  })

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      if (error) throw error
      return data
    }
  })

  // Fetch products with their categories
  const { data: products = [] } = useQuery({
    queryKey: ['products', activeTab],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          product_categories!inner (
            category:categories!inner(*)
          )
        `)
        .order('name')

      if (activeTab !== 'all') {
        query = query.eq('product_categories.category_id', activeTab)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    }
  })

  // Fetch customer special prices
  const { data: customerPrices = [] } = useQuery({
    queryKey: ['customerPrices', selectedCustomer],
    queryFn: async () => {
      if (!selectedCustomer) return []
      const { data, error } = await supabase
        .from('customer_prices')
        .select('*')
        .eq('customer_id', selectedCustomer)
      if (error) throw error
      return data
    },
    enabled: !!selectedCustomer
  })

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getProductPrice = (product) => {
    if (selectedCustomer) {
      const specialPrice = customerPrices.find(cp => cp.product_id === product.id)
      if (specialPrice) return specialPrice.price
    }
    return product.price
  }

  const addToCart = (product) => {
    const price = getProductPrice(product)
    const existingItem = cart.find(item => item.product.id === product.id)
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { product, quantity: 1, price }])
    }
  }

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      setCart(cart.filter(item => item.product.id !== productId))
    } else {
      setCart(cart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ))
    }
  }

  const updatePrice = (productId, newPrice) => {
    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, price: newPrice }
        : item
    ))
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const calculateKHRTotal = () => {
    return calculateTotal() * exchangeRate
  }

  const formatKHR = (amount) => {
    return new Intl.NumberFormat('km-KH', {
      style: 'currency',
      currency: 'KHR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
  })

  const handleCheckout = async () => {
    try {
      // Create the sale record
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          customer_id: selectedCustomer,
          total: calculateTotal(),
          status: 'completed'
        })
        .select()
        .single()

      if (saleError) throw saleError

      // Create sale items
      const saleItems = cart.map(item => ({
        sale_id: sale.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.price
      }))

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems)

      if (itemsError) throw itemsError

      // Store completed sale for receipt
      setCompletedSale({
        sale,
        items: cart,
        customer: customers.find(c => c.id === selectedCustomer)
      })
      
      // Show receipt modal
      setShowReceipt(true)

      // Clear the cart
      setCart([])
    } catch (error) {
      console.error('Error during checkout:', error)
      alert('Error during checkout. Please try again.')
    }
  }

  const handleCloseReceipt = () => {
    setShowReceipt(false)
    setCompletedSale(null)
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <Paper p="md" radius={0} style={{ borderBottom: '1px solid #eee' }}>
        <Group position="apart">
          <Group>
            <TextInput
              placeholder="Search menu..."
              icon={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              style={{ width: 300 }}
            />
            <Select
              placeholder="Select customer"
              clearable
              value={selectedCustomer}
              onChange={setSelectedCustomer}
              data={customers.map(c => ({ value: c.id, label: c.name }))}
              style={{ width: 200 }}
            />
          </Group>
          <Group>
            <Avatar radius="xl" size="md" />
            <div>
              <Text size="sm" weight={500}>Cashier</Text>
              <Text size="xs" color="dimmed">Active</Text>
            </div>
          </Group>
        </Group>
      </Paper>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Main Content */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          {/* Categories */}
          <Text size="lg" weight={500} mb="md">Choose Category</Text>
          <Tabs 
            value={activeTab} 
            onChange={setActiveTab}
            mb="xl"
            styles={{
              tab: {
                borderRadius: '12px',
                padding: '12px 24px',
                '&[data-active]': {
                  backgroundColor: '#ffe4e4',
                  color: '#ff4444',
                },
              },
            }}
          >
            <Tabs.List>
              <Tabs.Tab value="all">
                <Group spacing={8}>
                  <IconSearch size={20} />
                  <span>All</span>
                </Group>
              </Tabs.Tab>
              {categories.map(category => (
                <Tabs.Tab key={category.id} value={category.id}>
                  <Group spacing={8}>
                    <span>{category.name}</span>
                  </Group>
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>

          {/* Products Grid */}
          <Grid>
            {filteredProducts.map(product => (
              <Grid.Col span={4} key={product.id}>
                <Card 
                  shadow="sm" 
                  p="lg" 
                  radius="md" 
                  withBorder
                  style={{ cursor: 'pointer' }}
                  onClick={() => addToCart(product)}
                >
                  <Card.Section>
                    <Image
                      src={product.image_url || 'https://placehold.co/400x300?text=No+Image'}
                      height={160}
                      alt={product.name}
                    />
                  </Card.Section>

                  <Group position="apart" mt="md" mb="xs">
                    <Text weight={500}>{product.name}</Text>
                    <Text weight={500} color={
                      selectedCustomer && customerPrices.find(cp => cp.product_id === product.id)
                        ? "green"
                        : "dark"
                    }>
                      ${getProductPrice(product).toFixed(2)}
                    </Text>
                  </Group>

                  <Text size="sm" color="dimmed">
                    {product.product_categories[0]?.category.name}
                  </Text>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </div>

        {/* Cart Sidebar */}
        <Paper 
          p="md" 
          style={{ 
            width: 400, 
            borderLeft: '1px solid #eee',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Group position="apart" mb="md">
            <Text size="lg" weight={500}>Bills</Text>
          </Group>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {cart.map(item => (
              <Paper 
                key={item.product.id} 
                p="sm" 
                withBorder 
                mb="sm"
                radius="md"
              >
                <Group position="apart" noWrap>
                  <div style={{ flex: 1 }}>
                    <Group spacing="sm">
                      <Image
                        src={item.product.image_url || 'https://placehold.co/400x300?text=No+Image'}
                        width={50}
                        height={50}
                        radius="md"
                      />
                      <div>
                        <Text weight={500}>{item.product.name}</Text>
                        <NumberInput
                          value={item.price}
                          onChange={(value) => updatePrice(item.product.id, value)}
                          precision={2}
                          min={0}
                          size="xs"
                          styles={{ input: { width: 80 } }}
                          prefix="$"
                        />
                      </div>
                    </Group>
                  </div>
                  <Group spacing={5}>
                    <ActionIcon 
                      size="sm" 
                      variant="light"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      <IconMinus size={16} />
                    </ActionIcon>
                    <Text size="sm" w={30} ta="center">{item.quantity}</Text>
                    <ActionIcon 
                      size="sm" 
                      variant="light"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    >
                      <IconPlus size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Paper>
            ))}
          </div>

          <div>
            <Divider my="md" />

            <Group position="apart" mb="xs">
              <Text size="sm" color="dimmed">Subtotal</Text>
              <Text>${calculateTotal().toFixed(2)}</Text>
            </Group>

            <NumberInput
              label="Exchange Rate (KHR/USD)"
              value={exchangeRate}
              onChange={setExchangeRate}
              min={1}
              step={10}
              precision={0}
              mb="xs"
            />

            <Group position="apart" mb="md">
              <Text size="sm" color="dimmed">Total (KHR)</Text>
              <Text>{formatKHR(calculateKHRTotal())}</Text>
            </Group>

            <Button
              fullWidth
              size="lg"
              onClick={handleCheckout}
              disabled={cart.length === 0}
            >
              Complete Order
            </Button>
          </div>
        </Paper>
      </div>

      {/* Receipt Modal */}
      <Modal
        opened={showReceipt}
        onClose={() => setShowReceipt(false)}
        title="Sale Complete"
        size="md"
      >
        <div ref={receiptRef}>
          {completedSale && (
            <Receipt
              sale={completedSale.sale}
              items={completedSale.items}
              customer={completedSale.customer}
              exchangeRate={exchangeRate}
            />
          )}
        </div>
        
        <Group position="center" mt="xl">
          <Button variant="outline" onClick={() => setShowReceipt(false)}>
            Close
          </Button>
          <Button onClick={handlePrint}>
            Print Receipt
          </Button>
        </Group>
      </Modal>
    </div>
  )
}
