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
  Stack
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { supabase } from '../lib/supabase'

export function Customers() {
  const [modalOpened, setModalOpened] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  })

  const queryClient = useQueryClient()

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const customerData = {
        name: formData.name,
        phone: formData.phone || null
      }

      if (editingCustomer) {
        await supabase
          .from('customers')
          .update(customerData)
          .eq('id', editingCustomer.id)
      } else {
        await supabase
          .from('customers')
          .insert(customerData)
      }

      queryClient.invalidateQueries(['customers'])
      handleCloseModal()
    } catch (error) {
      console.error('Error saving customer:', error)
      alert('Error saving customer')
    }
  }

  const handleEdit = (customer) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name,
      phone: customer.phone || ''
    })
    setModalOpened(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this customer?')) return

    try {
      await supabase
        .from('customers')
        .delete()
        .eq('id', id)
      
      queryClient.invalidateQueries(['customers'])
    } catch (error) {
      console.error('Error deleting customer:', error)
      alert('Error deleting customer')
    }
  }

  const handleCloseModal = () => {
    setModalOpened(false)
    setEditingCustomer(null)
    setFormData({
      name: '',
      phone: ''
    })
  }

  const columns = [
    {
      name: 'name',
      label: 'Name',
      options: {
        filter: true,
        sort: true,
      }
    },
    {
      name: 'phone',
      label: 'Phone',
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => value || '-'
      }
    },
    {
      name: 'actions',
      label: 'Actions',
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value, tableMeta) => {
          const customer = customers[tableMeta.rowIndex]
          return (
            <Box>
              <IconButton 
                size="small" 
                color="primary" 
                onClick={() => handleEdit(customer)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                color="error"
                onClick={() => handleDelete(customer.id)}
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
        Add Customer
      </Button>
    ),
    textLabels: {
      body: {
        noMatch: 'No customers found',
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
              Customers
            </Typography>
          }
          data={customers}
          columns={columns}
          options={options}
        />
      </ThemeProvider>

      <Dialog
        open={modalOpened}
        onClose={handleCloseModal}
        maxWidth="xs"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingCustomer ? 'Edit Customer' : 'Add Customer'}
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
                label="Phone"
                fullWidth
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number (optional)"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingCustomer ? 'Save' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
