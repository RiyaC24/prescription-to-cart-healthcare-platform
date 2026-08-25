import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import UnauthorizedPage from "@/pages/UnauthorizedPage";
import NotFoundPage from "@/pages/NotFoundPage";
import PatientDashboard from "@/pages/dashboard/PatientDashboard";
import DoctorDashboard from "@/pages/dashboard/DoctorDashboard";
import AdminDashboard from "@/pages/dashboard/AdminDashboard";
import PatientAppointmentsPage from "@/pages/appointments/PatientAppointmentsPage";
import DoctorAvailabilityPage from "@/pages/appointments/DoctorAvailabilityPage";
import DoctorAppointmentsPage from "@/pages/appointments/DoctorAppointmentsPage";
import AdminAppointmentsPage from "@/pages/appointments/AdminAppointmentsPage";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute allowedRoles={["PATIENT"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/patient/appointments" element={<PatientAppointmentsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["DOCTOR"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/doctor/availability" element={<DoctorAvailabilityPage />} />
          <Route path="/doctor/appointments" element={<DoctorAppointmentsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
