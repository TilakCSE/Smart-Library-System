import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "@/pages/Landing";
import StudentLogin from "@/pages/auth/StudentLogin";
import StudentDashboard from "@/pages/student/Dashboard";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/Dashboard";
import InventoryPage from "@/pages/admin/inventory/InventoryPage";
// IMPORT YOUR NEW UNITY COMPONENT
import LibraryDigitalTwin from "@/components/LibraryDigitalTwin";
import StudentSearch from "@/pages/student/StudentSearch";
import MapPage from "@/pages/student/MapPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<StudentLogin />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        
        {/* Student Section */}
        <Route path="/student/search" element={<StudentSearch />} />
        <Route path="/student/map" element={<MapPage />} />

        {/* Admin Section */}
        <Route path="/admin" element={<AdminLayout />}>
           <Route path="dashboard" element={<AdminDashboard />} />
           <Route path="inventory" element={<InventoryPage />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;