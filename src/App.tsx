import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Center, Spinner } from '@chakra-ui/react'
import { AuthProvider } from '@/features/auth/contexts/AuthContext'
import ProtectedRoute from '@/features/auth/components/ProtectedRoute'
import Layout from '@/components/layout/Layout'

// Lazy load pages
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'))
const AdminUsersPage = lazy(() => import('@/features/admin-users/pages/AdminUsersPage'))
const MembersPage = lazy(() => import('@/features/members/pages/MembersPage'))
const FacilitiesPage = lazy(() => import('@/features/facilities/pages/FacilitiesPage'))
const AnnouncementsPage = lazy(() => import('@/features/announcements/pages/AnnouncementsPage'))
const MonitoringPage = lazy(() => import('@/features/monitoring/pages/MonitoringPage'))

const LoadingFallback = () => (
  <Center h='100vh'>
    <Spinner size='xl' color='brand.500' thickness='4px' />
  </Center>
)

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path='/login' element={<LoginPage />} />
            <Route
              path='/'
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to='/dashboard' replace />} />
              <Route path='dashboard' element={<DashboardPage />} />
              <Route path='admin-users' element={<AdminUsersPage />} />
              <Route path='members' element={<MembersPage />} />
              <Route path='facilities' element={<FacilitiesPage />} />
              <Route path='announcements' element={<AnnouncementsPage />} />
              <Route path='monitoring' element={<MonitoringPage />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
