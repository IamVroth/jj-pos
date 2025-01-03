import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MainLayout } from './layouts/MainLayout'
import { POS } from './pages/POS'
import { Dashboard } from './pages/Dashboard'
import { Categories } from './pages/Categories'
import { Products } from './pages/Products'
import { Customers } from './pages/Customers'
import { CustomerPrices } from './pages/CustomerPrices'
import { SalesHistory } from './pages/SalesHistory'
import { useAuth } from './contexts/AuthContext'
import { Login } from './pages/Login'

const queryClient = new QueryClient()

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider
        theme={{
          primaryColor: 'blue',
          defaultRadius: 'sm',
        }}
      >
        <Notifications />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
              <Route index element={<Navigate to="/pos" />} />
              <Route path="pos" element={<POS />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="categories" element={<Categories />} />
              <Route path="products" element={<Products />} />
              <Route path="customers" element={<Customers />} />
              <Route path="customer-prices" element={<CustomerPrices />} />
              <Route path="sales-history" element={<SalesHistory />} />
            </Route>
          </Routes>
        </Router>
      </MantineProvider>
    </QueryClientProvider>
  )
}

export default App
