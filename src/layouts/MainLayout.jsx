import { AppShell, Box, Text, Burger, useMantineTheme, Button } from '@mantine/core'
import { useState } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { IconShoppingCart, IconChartBar, IconTags, IconBox, IconUsers, IconCoin, IconHistory } from '@tabler/icons-react'

export function MainLayout() {
  const theme = useMantineTheme()
  const [opened, setOpened] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut } = useAuth()

  const navItems = [
    { label: 'POS', path: '/pos', icon: <IconShoppingCart size={16} /> },
    { label: 'Dashboard', path: '/dashboard', icon: <IconChartBar size={16} /> },
    { label: 'Categories', path: '/categories', icon: <IconTags size={16} /> },
    { label: 'Products', path: '/products', icon: <IconBox size={16} /> },
    { label: 'Customers', path: '/customers', icon: <IconUsers size={16} /> },
    { label: 'Special Prices', path: '/customer-prices', icon: <IconCoin size={16} /> },
    { label: 'Sales History', path: '/sales-history', icon: <IconHistory size={16} /> },
  ]

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: !opened
      }}
      padding="md"
    >
      <AppShell.Header>
        <Box p="md" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Burger
            opened={opened}
            onClick={() => setOpened((o) => !o)}
            size="sm"
            color={theme.colors.gray[6]}
            mr="xl"
            hiddenFrom="sm"
          />
          <Text size="lg" fw={500}>JJ POS System</Text>
        </Box>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div>
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? "filled" : "subtle"}
                fullWidth
                onClick={() => {
                  navigate(item.path)
                  setOpened(false)
                }}
                mb="xs"
                leftSection={item.icon}
                justify="flex-start"
              >
                {item.label}
              </Button>
            ))}
          </div>
          <Button
            variant="subtle"
            color="red"
            onClick={() => signOut()}
            style={{ marginTop: 'auto' }}
            fullWidth
          >
            Sign Out
          </Button>
        </Box>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
