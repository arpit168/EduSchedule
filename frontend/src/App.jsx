import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/useAuthStore';
import useThemeStore from './store/useThemeStore';

// Layouts & Guards
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleRoute from './components/auth/RoleRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Main Application Pages
import DashboardPage from './pages/DashboardPage';
import TimetableBuilderPage from './pages/timetable/TimetableBuilderPage';
import TeacherViewPage from './pages/TeacherViewPage';
import ClassTimetablePage from './pages/ClassTimetablePage';
import ReportsPage from './pages/ReportsPage';
import TeachersPage from './pages/TeachersPage';
import SubjectsPage from './pages/SubjectsPage';
import ClassesPage from './pages/ClassesPage';
import RoomsPage from './pages/RoomsPage';
import DepartmentsPage from './pages/DepartmentsPage';
import AssignmentsPage from './pages/AssignmentsPage';
import CalendarPage from './pages/CalendarPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const { checkAuth, isAuthenticated, isLoading } = useAuthStore();
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
    checkAuth();
  }, [initTheme, checkAuth]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-400 animate-pulse">
            Loading Antigravity Timetable OS...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0f172a',
              color: '#fff',
              borderRadius: '1rem',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              fontSize: '13px',
              fontWeight: '600',
            },
          }}
        />

        <Routes>
          {/* Public Auth Routes */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
          />
          <Route
            path="/forgot-password"
            element={isAuthenticated ? <Navigate to="/" replace /> : <ForgotPasswordPage />}
          />
          <Route
            path="/reset-password/:token"
            element={isAuthenticated ? <Navigate to="/" replace /> : <ResetPasswordPage />}
          />

          {/* Protected Dashboard Layout Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/timetable" element={<TimetableBuilderPage />} />
              <Route path="/my-schedule" element={<TeacherViewPage />} />
              <Route path="/my-timetable" element={<TeacherViewPage />} />
              <Route path="/class-schedule" element={<ClassTimetablePage />} />
              <Route path="/class-timetable" element={<ClassTimetablePage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/teachers" element={<TeachersPage />} />
              <Route path="/subjects" element={<SubjectsPage />} />
              <Route path="/classes" element={<ClassesPage />} />
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/departments" element={<DepartmentsPage />} />
              <Route path="/assignments" element={<AssignmentsPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              
              <Route element={<RoleRoute allowedRoles={['Admin']} />}>
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
              
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* 404 Not Found & Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
