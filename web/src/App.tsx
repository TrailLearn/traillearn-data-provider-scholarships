import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, LoginPage, SignupPage } from '@/features/auth'
import { Layout } from '@/components/layout/layout'
import { HomePage } from '@/pages/home-page'
import { BoursesListPage } from '@/pages/bourses-list-page'
import { BourseDetailPage } from '@/pages/bourse-detail-page'
import { AdminDashboardPage } from '@/pages/admin-dashboard-page'
import { AdminEditPage } from '@/pages/admin-edit-page'
import { AdminAuditPage } from '@/pages/admin-audit-page'
import { SubmitBoursePage } from '@/pages/submit-bourse-page'
import { MySubmissionsPage } from '@/pages/my-submissions-page'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth pages (no layout) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* App pages (with layout) */}
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="/bourses" element={<BoursesListPage />} />
            <Route path="/bourses/:id" element={<BourseDetailPage />} />
            <Route path="/submit" element={<SubmitBoursePage />} />
            <Route path="/my-submissions" element={<MySubmissionsPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/edit/:id" element={<AdminEditPage />} />
            <Route path="/admin/audit/:id" element={<AdminAuditPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
