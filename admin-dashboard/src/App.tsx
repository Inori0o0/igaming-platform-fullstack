import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import { LoginPage } from '@/pages/LoginPage/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage/DashboardPage'
import { UsersPage } from '@/pages/UsersPage/UsersPage'
import { UserDetailPage } from '@/pages/UserDetailPage/UserDetailPage'
import { GamesPage } from '@/pages/GamesPage/GamesPage'
import { TransactionsPage } from '@/pages/TransactionsPage/TransactionsPage'
import { ProductsPage } from '@/pages/ProductsPage/ProductsPage'
import { OrdersPage } from '@/pages/OrdersPage/OrdersPage'
import { SettingsPage } from '@/pages/SettingsPage/SettingsPage'

function App() {
  const { init } = useAuthStore()

  useEffect(() => {
    void init()
  }, [init])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/:id" element={<UserDetailPage />} />
          <Route path="games" element={<GamesPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
