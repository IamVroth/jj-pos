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

export function Categories() {
  const [modalOpened, setModalOpened] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const queryClient = useQueryClient()

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
      const categoryData = {
        name,
        description: description || null // Convert empty string to null
      }

      if (editingCategory) {
        await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id)
      } else {
        await supabase
          .from('categories')
          .insert(categoryData)
      }

      queryClient.invalidateQueries(['categories'])
      handleCloseModal()
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Error saving category')
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setName(category.name)
    setDescription(category.description || '')
    setModalOpened(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      await supabase
        .from('categories')
        .delete()
        .eq('id', id)
      
      queryClient.invalidateQueries(['categories'])
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Error deleting category')
    }
  }

  const handleCloseModal = () => {
    setModalOpened(false)
    setEditingCategory(null)
    setName('')
    setDescription('')
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
      name: 'description',
      label: 'Description',
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
          const category = categories[tableMeta.rowIndex]
          return (
            <Box>
              <IconButton 
                size="small" 
                color="primary" 
                onClick={() => handleEdit(category)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                color="error"
                onClick={() => handleDelete(category.id)}
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
        Add Category
      </Button>
    ),
    textLabels: {
      body: {
        noMatch: 'No categories found',
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
              Categories
            </Typography>
          }
          data={categories}
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
            {editingCategory ? 'Edit Category' : 'Add Category'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                autoFocus
                label="Name"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <TextField
                label="Description"
                fullWidth
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={3}
                placeholder="Enter category description (optional)"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingCategory ? 'Save' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
