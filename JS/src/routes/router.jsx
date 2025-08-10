// src/routes/router.jsx
import { Navigate, Route, Routes } from 'react-router-dom';
import AuthLayout from '@/layouts/AuthLayout';
import AdminLayout from '@/layouts/AdminLayout';
import { appRoutes, authRoutes } from '@/routes/index';
import PrivateRoute from '@/components/PrivateRoute';
import Analytics from '@/app/(admin)/dashboard/analytics/page';

const AppRouter = (props) => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      {(authRoutes || []).map((route, idx) => (
        <Route
          key={idx + route.name}
          path={route.path}
          element={<AuthLayout {...props}>{route.element}</AuthLayout>}
        />
      ))}

      {/* Example Protected Dashboard Route */}
      <Route
        path="/dashboard/analytics"
        element={
          <PrivateRoute>
            <AdminLayout {...props}>
              <Analytics />
            </AdminLayout>
          </PrivateRoute>
        }
      />

      {/* Other Protected Routes */}
      {(appRoutes || []).map((route, idx) => (
        <Route
          key={idx + route.name}
          path={route.path}
          element={
            <PrivateRoute>
              <AdminLayout {...props}>{route.element}</AdminLayout>
            </PrivateRoute>
          }
        />
      ))}

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/auth/sign-in" replace />} />
    </Routes>
  );
};

export default AppRouter;
