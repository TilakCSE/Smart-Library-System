import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

// Pages
import Landing from "@/pages/Landing";
import StudentLogin from "@/pages/auth/StudentLogin";
import StudentDashboard from "@/pages/student/Dashboard";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/Dashboard";
import InventoryPage from "@/pages/admin/inventory/InventoryPage";
// IMPORT YOUR NEW UNITY COMPONENT
import StudentSearch from "@/pages/student/StudentSearch";
import MapPage from "@/pages/student/MapPage";
import StudentsPage from "@/pages/admin/StudentsPage";
import LogsPage from "@/pages/admin/LogsPage";

function App() {
  // 1. Pull the initialize function from your Zustand store
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  // 2. Fire it the exact second the app renders to catch the Firebase session
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<StudentLogin />} />
        
        {/* PROTECTED STUDENT ROUTES */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/search" element={<StudentSearch />} />
        <Route path="/student/map" element={<MapPage />} />

        {/* SECURE HIDDEN ADMIN ROUTES */}
        <Route path="/secure-vault-admin-8891" element={<AdminLayout />}>
           <Route path="dashboard" element={<AdminDashboard />} />
           <Route path="students" element={<StudentsPage />} />
           <Route path="inventory" element={<InventoryPage />} />
           <Route path="fines" element={<LogsPage />} />
        </Route>

        {/* CATCH-ALL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;