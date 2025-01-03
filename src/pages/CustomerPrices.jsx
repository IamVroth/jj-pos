import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import MUIDataTable from 'mui-datatables'
import { 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  IconButton,
  Typography,
  ThemeProvider,
  createTheme,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { supabase } from '../lib/supabase'

export function CustomerPrices() {
  const [modalOpened, setModalOpened] = useState(false)
  const [editingPrice, setEditingPrice] = useState(null)
  const [formData, setFormData] = useState({
    customer_id: '',
    product_id: '',
    price: ''
  })

  const queryClient = useQueryClient()

  const { data: customerPrices = [] } = useQuery({
    queryKey: ['customerPrices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_prices')
        .select(`
          id,
          customer_id,
          product_id,
          price,
          customers (
            id,
            name
          ),
          products (
            id,
            name,
            image_url,
            price
          )
        `)
        .order('customer_id')
      if (error) throw error
      return data
    }
  })

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

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name')
      if (error) throw error
      return data
    }
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const priceData = {
        customer_id: formData.customer_id,
        product_id: formData.product_id,
        price: parseFloat(formData.price)
      }

      if (editingPrice) {
        await supabase
          .from('customer_prices')
          .update(priceData)
          .eq('id', editingPrice.id)
      } else {
        await supabase
          .from('customer_prices')
          .insert(priceData)
      }

      queryClient.invalidateQueries(['customerPrices'])
      handleCloseModal()
    } catch (error) {
      console.error('Error saving customer price:', error)
      alert('Error saving customer price')
    }
  }

  const handleEdit = (price) => {
    setEditingPrice(price)
    setFormData({
      customer_id: price.customer_id,
      product_id: price.product_id,
      price: price.price.toString()
    })
    setModalOpened(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this customer price?')) return

    try {
      await supabase
        .from('customer_prices')
        .delete()
        .eq('id', id)
      
      queryClient.invalidateQueries(['customerPrices'])
    } catch (error) {
      console.error('Error deleting customer price:', error)
      alert('Error deleting customer price')
    }
  }

  const handleCloseModal = () => {
    setModalOpened(false)
    setEditingPrice(null)
    setFormData({
      customer_id: '',
      product_id: '',
      price: ''
    })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const columns = [
    {
      name: 'products',
      label: 'Product Image',
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value) => (
          <Avatar
            src={value?.image_url || 'https://placehold.co/400x300?text=No+Image'}
            variant="rounded"
            sx={{ width: 40, height: 40 }}
          />
        )
      }
    },
    {
      name: 'customers',
      label: 'Customer',
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => value?.name || '-'
      }
    },
    {
      name: 'products',
      label: 'Product',
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => value?.name || '-'
      }
    },
    {
      name: 'products',
      label: 'Default Price',
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => formatPrice(value?.price || 0)
      }
    },
    {
      name: 'price',
      label: 'Custom Price',
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => formatPrice(value)
      }
    },
    {
      name: 'actions',
      label: 'Actions',
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value, tableMeta) => {
          const price = customerPrices[tableMeta.rowIndex]
          return (
            <Box>
              <IconButton 
                size="small" 
                color="primary" 
                onClick={() => handleEdit(price)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                color="error"
                onClick={() => handleDelete(price.id)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          )
        }
      }
    }
  ]

  const options = {
    filterType: 'dropdown',
    responsive: 'standard',
    selectableRows: 'none',
    download: false,
    print: false,
    viewColumns: false,
    customToolbar: () => (
      <Button
        variant="contained"
        size="small"
        onClick={() => setModalOpened(true)}
        style={{ marginRight: '16px' }}
      >
        Add Customer Price
      </Button>
    ),
    textLabels: {
      body: {
        noMatch: 'No customer prices found',
      },
    },
    elevation: 0,
    rowsPerPageOptions: [10, 25, 50],
  }

  const theme = createTheme({
    components: {
      MUIDataTableHeadCell: {
        styleOverrides: {
          root: {
            fontWeight: '500',
            backgroundColor: 'white',
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '16px',
          }
        }
      },
      MUIDataTableToolbar: {
        styleOverrides: {
          root: {
            padding: '16px',
          }
        }
      }
    }
  })

  return (
    <Box p={3}>
      <ThemeProvider theme={theme}>
        <MUIDataTable
          title={
            <Typography variant="h6" component="div">
              Customer Prices
            </Typography>
          }
          data={customerPrices}
          columns={columns}
          options={options}
        />
      </ThemeProvider>

      <Dialog
        open={modalOpened}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingPrice ? 'Edit Customer Price' : 'Add Customer Price'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <FormControl fullWidth required>
                <InputLabel>Customer</InputLabel>
                <Select
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  label="Customer"
                >
                  {customers.map(customer => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Product</InputLabel>
                <Select
                  value={formData.product_id}
                  onChange={(e) => {
                    const product = products.find(p => p.id === e.target.value)
                    setFormData({ 
                      ...formData, 
                      product_id: e.target.value,
                      price: product ? product.price.toString() : ''
                    })
                  }}
                  label="Product"
                >
                  {products.map(product => (
                    <MenuItem key={product.id} value={product.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          src={product.image_url || 'https://placehold.co/400x300?text=No+Image'}
                          variant="rounded"
                          sx={{ width: 24, height: 24 }}
                        />
                        <span>{product.name} ({formatPrice(product.price)})</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Price"
                type="number"
                fullWidth
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                inputProps={{
                  min: 0,
                  step: 0.01
                }}
                helperText="Custom price for this customer"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingPrice ? 'Save' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
