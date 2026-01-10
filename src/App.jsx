import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RouteLoader from "./components/RouteLoader";
import useRouteLoader from "./hooks/useRouteLoader";
import ScrollToTop from "./components/ScrollToTop";

/* ================= COMMON PAGES ================= */
import Home from "./pages/common/HomePage";
import LogIn from "./pages/common/LogIn";
import SignUp from "./pages/common/SignUp";

/* ================= ADMIN PAGES ================= */
import AdminDashboard from "./pages/admin/AdminDashboard";
import ShipmentFleetManagement from "./pages/admin/ShipmentFleetManagement";
import ShipmentDetail from "./pages/admin/ShipmentDetail";
import AssignVehicle from "./pages/admin/AssignVehicle";
import ShipmentForm from "./pages/admin/ShipmentForm";
import PaymentsBilling from "./pages/admin/PaymentsBilling";
import InvoiceDetail from "./pages/admin/InvoiceDetail";
import AIInsights from "./pages/admin/AIInsights";
import LiveTracking from "./pages/admin/LiveTracking";
import Chatbot from "./pages/admin/Chatbot";
import AddVehicle from "./pages/admin/AddVehicle";

/* ================= CUSTOMER PAGES ================= */
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerPayment from "./pages/customer/CustomerPayment";
import CustomerSupport from "./pages/customer/CustomerSupport";
import CustomerShipment from "./pages/customer/CustomerShipment";
import CustomerProfile from "./pages/customer/CustomerProfile";
import CustomerEPOD from "./pages/customer/CustomerEPOD";

/* ================= DRIVER PAGES ================= */
import DriverDashboard from "./pages/driver/DriverDashboard";
import PodUpload from "./pages/driver/PodUpload";
import DriverProfile from "./pages/driver/DriverProfile";

/* ================= COMPONENTS ================= */
import DriverNavbar from "./components/DriverNavbar";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutesWithLoader />
      </Router>
    </AuthProvider>
  );
}

/* ================= ROUTES + GLOBAL LOADER ================= */
function AppRoutesWithLoader() {
  const loading = useRouteLoader(); // 🔥 THIS IS THE KEY

  return (
    <>
      {/* ===== GLOBAL ROUTE LOADER ===== */}
      <RouteLoader show={loading} />
      
      {/* ===== SCROLL TO TOP ON NAVIGATION ===== */}
      <ScrollToTop />

      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* ================= ADMIN ROUTES ================= */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/shipments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ShipmentFleetManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/shipments/create"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ShipmentForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/shipments/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ShipmentForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/shipments/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ShipmentDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/assign"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AssignVehicle />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/fleet/add"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AddVehicle />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/tracking"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <LiveTracking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PaymentsBilling />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/invoices/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <InvoiceDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/ai-insights"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AIInsights />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/chatbot"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Chatbot />
            </ProtectedRoute>
          }
        />

        {/* ================= CUSTOMER ROUTES ================= */}
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/payments"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerPayment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/shipments"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerShipment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/support"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerSupport />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/profile"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerProfile />
            </ProtectedRoute>
          }
        />

        {/* Customer ePOD */}
        <Route
          path="/customer/epod/:shipmentId"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerEPOD />
            </ProtectedRoute>
          }
        />

        {/* ================= DRIVER ROUTES ================= */}
        <Route
          path="/driver/dashboard"
          element={
            <ProtectedRoute allowedRoles={["driver"]}>
              <>
                <DriverNavbar />
                <DriverDashboard />
              </>
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver/pod-upload"
          element={
            <ProtectedRoute allowedRoles={["driver"]}>
              <>
                <DriverNavbar />
                <PodUpload />
              </>
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver/profile"
          element={
            <ProtectedRoute allowedRoles={["driver"]}>
              <>
                <DriverNavbar />
                <DriverProfile />
              </>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
