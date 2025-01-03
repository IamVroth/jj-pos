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

export function Products() {
  const [modalOpened, setModalOpened] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category_id: '',
    image_url: ''
  })

  const queryClient = useQueryClient()

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
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
        .order('name')
      if (error) throw error
      return data
    }
  })

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        image_url: formData.image_url || null
      }

      let productId
      if (editingProduct) {
        const { data } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
          .select()
        productId = editingProduct.id
      } else {
        const { data } = await supabase
          .from('products')
          .insert(productData)
          .select()
        productId = data[0].id
      }

      // Handle category association
      if (formData.category_id) {
        if (editingProduct) {
          await supabase
            .from('product_categories')
            .delete()
            .eq('product_id', productId)
        }
        
        await supabase
          .from('product_categories')
          .insert({
            product_id: productId,
            category_id: formData.category_id
          })
      }

      queryClient.invalidateQueries(['products'])
      handleCloseModal()
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Error saving product')
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category_id: product.product_categories[0]?.category.id || '',
      image_url: product.image_url || ''
    })
    setModalOpened(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      await supabase
        .from('products')
        .delete()
        .eq('id', id)
      
      queryClient.invalidateQueries(['products'])
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Error deleting product')
    }
  }

  const handleCloseModal = () => {
    setModalOpened(false)
    setEditingProduct(null)
    setFormData({
      name: '',
      price: '',
      category_id: '',
      image_url: ''
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
      name: 'image_url',
      label: 'Image',
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value) => (
          <Avatar
            src={value || 'https://placehold.co/400x300?text=No+Image'}
            variant="rounded"
            sx={{ width: 40, height: 40 }}
          />
        )
      }
    },
    {
      name: 'name',
      label: 'Name',
      options: {
        filter: true,
        sort: true,
      }
    },
    {
      name: 'price',
      label: 'Price',
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => formatPrice(value)
      }
    },
    {
      name: 'product_categories',
      label: 'Category',
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => value[0]?.category.name || '-'
      }
    },
    {
      name: 'actions',
      label: 'Actions',
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value, tableMeta) => {
          const product = products[tableMeta.rowIndex]
          return (
            <Box>
              <IconButton 
                size="small" 
                color="primary" 
                onClick={() => handleEdit(product)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                color="error"
                onClick={() => handleDelete(product.id)}
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
        Add Product
      </Button>
    ),
    textLabels: {
      body: {
        noMatch: 'No products found',
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
              Products
            </Typography>
          }
          data={products}
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
            {editingProduct ? 'Edit Product' : 'Add Product'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Name"
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
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
              />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  label="Category"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Image URL"
                fullWidth
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="Enter image URL (optional)"
              />
              {formData.image_url && (
                <Box sx={{ textAlign: 'center' }}>
                  <img 
                    src={formData.image_url} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: 200, 
                      objectFit: 'contain' 
                    }} 
                  />
                </Box>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingProduct ? 'Save' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
