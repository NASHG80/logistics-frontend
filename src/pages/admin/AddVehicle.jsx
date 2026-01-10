  import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiTruck,
  FiUser,
  FiBattery,
  FiDroplet,
} from "react-icons/fi";

import AdminNavbar from "../../components/AdminNavbar";
import AdminFooter from "../../components/AdminFooter";
import { vehicleAPI, userAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import notify from "../../utils/notify";
import { Toaster } from "react-hot-toast";



/* ================= ANIMATION ================= */
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

/* ================= PAGE ================= */
export default function AddVehicle() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    vehicleNumber: "",
    driverId: "",
    capacity: "",
    fuelType: "DIESEL",
  });

  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);

  /* ================= ROLE CHECK & FETCH DRIVERS ================= */
  useEffect(() => {
    // Only allow admins to access this page
    if (user && user.role !== 'admin') {
      notify.error("Only admins can add vehicles.");
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    // Fetch drivers list for admin
    const fetchDrivers = async () => {
      setLoadingDrivers(true);
      try {
        const response = await userAPI.getDrivers();
        setDrivers(response.data || []);
      } catch (error) {
        console.error("Error fetching drivers:", error);
        notify.error("Failed to load drivers list");
      } finally {
        setLoadingDrivers(false);
      }
    };

    if (user?.role === 'admin') {
      fetchDrivers();
    }
  }, [user, navigate]);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.vehicleNumber || !form.capacity || !form.driverId) {
      notify.error("Please fill in all required fields");
      return;
    }

    if (!user) {
      notify.error("You must be logged in to add a vehicle");
      return;
    }

    if (user.role !== 'admin') {
      notify.error("Only admins can add vehicles");
      return;
    }

    setLoading(true);

    try {
      // Find selected driver
      const selectedDriver = drivers.find(d => d._id === form.driverId);
      
      // Call the vehicle API to create the vehicle
      const response = await vehicleAPI.create({
        vehicleNumber: form.vehicleNumber,
        driverName: selectedDriver?.name,
        capacity: parseFloat(form.capacity),
        fuelType: form.fuelType,
      });

      if (response.success) {
        // Show success message
        notify.success("Vehicle added successfully!");
        
        // Navigate to fleet section of shipment management page
        navigate("/admin/shipments?tab=fleet", { replace: true });
      }
    } catch (error) {
      console.error("Error creating vehicle:", error);
      const errorMessage = error.response?.data?.message || "Failed to add vehicle. Please try again.";
      notify.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster />
      <AdminNavbar />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 min-h-screen gradient-bg-mesh">
        {/* Background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-3xl mx-auto relative z-10">
          {/* BACK */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#c6ac8f] mb-4"
          >
            <FiArrowLeft /> Back
          </button>

          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Add New Vehicle
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Register a vehicle to make it available for shipment assignment
            </p>
          </motion.div>

          {/* FORM */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* VEHICLE INFO */}
            <section className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c6ac8f] to-[#a08060] flex items-center justify-center">
                  <FiTruck className="text-white" size={18} />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Vehicle Details
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Vehicle Number *
                  </label>
                  <input
                    name="vehicleNumber"
                    placeholder="MH12 AB 1234"
                    value={form.vehicleNumber}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Vehicle Capacity (kg) *
                  </label>
                  <input
                    name="capacity"
                    type="number"
                    placeholder="e.g., 1000"
                    value={form.capacity}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f]"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    Enter capacity in kilograms for automatic assignment
                  </p>
                </div>
              </div>
            </section>

            {/* DRIVER ASSIGNMENT */}
            <section className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <FiUser className="text-white" size={18} />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Assign Driver
                </h2>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Select Driver *
                </label>
                {loadingDrivers ? (
                  <div className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-500">
                    Loading drivers...
                  </div>
                ) : (
                  <select
                    name="driverId"
                    value={form.driverId}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white
                             focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f]"
                  >
                    <option value="">Select a driver</option>
                    {drivers.map((driver) => (
                      <option key={driver._id} value={driver._id}>
                        {driver.name} ({driver.email})
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-gray-500 mt-1.5">
                  One vehicle can be assigned to one driver
                </p>
              </div>
            </section>

            {/* FUEL */}
            <section className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                  <FiDroplet className="text-white" size={18} />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Fuel Type
                </h2>
              </div>

              <select
                name="fuelType"
                value={form.fuelType}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white
                         focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f]"
              >
                <option value="DIESEL">Diesel</option>
                <option value="PETROL">Petrol</option>
                <option value="CNG">CNG</option>
                <option value="ELECTRIC">Electric</option>
              </select>
            </section>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium
                         hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-[#c6ac8f] to-[#a08060]
                         text-white rounded-xl text-sm font-medium
                         shadow-md hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? "Adding Vehicle..." : "Add Vehicle"}
              </button>
            </div>
          </motion.div>
        </div>
      </main>

      <AdminFooter />
    </>
  );
}

