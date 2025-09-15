import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Center, Spinner } from '@chakra-ui/react'
import { AuthProvider } from "@/features/auth"
import ProtectedRoute from '@/features/auth/components/ProtectedRoute'
import Layout from '@/components/layout/Layout'

// Core pages - immediate import for smooth navigation
import LoginPage from '@/features/auth/pages/LoginPage'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'
import AdminUsersPage from '@/features/admin-users/pages/AdminUsersPage'
import MembersPage from '@/features/members/pages/MembersPage'
import FacilitiesPage from '@/features/facilities/pages/FacilitiesPage'
import AnnouncementsPage from '@/features/announcements/pages/AnnouncementsPage'
import QuestionsPage from '@/features/questions/pages/QuestionsPage'
import ServiceInquiriesPage from '@/features/service-inquiries/pages/ServiceInquiriesPage'
import ServiceInquiryDetailPage from '@/features/service-inquiries/pages/ServiceInquiryDetailPage'

// Less frequently used pages - keep lazy loading
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
            <Route path='questions' element={<QuestionsPage />} />
            <Route path='service-inquiries' element={<ServiceInquiriesPage />} />
            <Route path='service-inquiries/:id' element={<ServiceInquiryDetailPage />} />
            {/* Only monitoring page uses Suspense */}
            <Route 
              path='monitoring' 
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <MonitoringPage />
                </Suspense>
              } 
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
