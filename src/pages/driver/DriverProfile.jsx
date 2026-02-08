import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { shipmentAPI } from "../../services/api";
import { FiUser, FiLogOut, FiTruck, FiMail, FiPhone, FiCreditCard } from "react-icons/fi";
import { FaCheckCircle, FaClock, FaRoute } from "react-icons/fa";
import { motion } from "framer-motion";
import DriverFooter from "../../components/DriverFooter";
import notify from "../../utils/notify";
import { Toaster } from "react-hot-toast";

const DriverProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [completedShipments, setCompletedShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Driver data - use auth user data or fallback to dummy data
  const driver = {
    name: user?.name || "Rajesh Kumar",
    email: user?.email || "rajesh.kumar@saarthiai.com",
    phone: "+91 98765 43210",
    vehicle: "MH 12 AB 4321",
    licenseNumber: "MH-2020123456",
    joinDate: "January 2023",
    status: "Active",
  };

  // Fetch completed shipments for stats
  useEffect(() => {
    const fetchCompletedShipments = async () => {
      try {
        setLoading(true);
        // Get current driver's profile
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const token = localStorage.getItem("token");
        const profileResponse = await fetch(`${API_URL}/auth/me`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const profileData = await profileResponse.json();
        const driverName = profileData.data?.name;

        if (!driverName) {
          setLoading(false);
          return;
        }

        // Fetch all shipments
        const response = await shipmentAPI.getAll({});

        if (response.data && response.data.length > 0) {
          // Filter shipments assigned to this driver that are DELIVERED
          const delivered = response.data.filter(
            shipment => shipment.assignedDriverName === driverName && shipment.status === 'DELIVERED'
          );
          setCompletedShipments(delivered);
        }
      } catch (err) {
        console.error("Error fetching completed shipments:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCompletedShipments();
    }
  }, [user]);

  // Calculate dynamic stats from completed shipments
  const stats = {
    totalTrips: completedShipments.length,
    completedToday: completedShipments.filter(s => {
      if (!s.deliveredAt) return false;
      const deliveredDate = new Date(s.deliveredAt);
      const today = new Date();
      return deliveredDate.toDateString() === today.toDateString();
    }).length,
    onTimeRate: completedShipments.length > 0
      ? Math.round((completedShipments.filter(s => {
        if (!s.eta || !s.deliveredAt) return true;
        return new Date(s.deliveredAt) <= new Date(s.eta);
      }).length / completedShipments.length) * 100) + '%'
      : '100%',
    totalDistance: completedShipments.reduce((sum, s) => {
      const distance = s.routeMetadata?.distance || '0 km';
      const numericDistance = parseFloat(distance.replace(/[^\d.]/g, '')) || 0;
      return sum + numericDistance;
    }, 0).toFixed(0) + ' km',
  };

  const handleLogout = () => {
    notify.confirm("Are you sure you want to logout?", () => {
      logout();
      navigate("/login");
    });
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl border border-white/40"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-24 sm:w-28 h-24 sm:h-28 rounded-3xl bg-gradient-to-br from-[#c6ac8f] to-[#b89a7f] flex items-center justify-center shadow-xl">
                  <FiUser className="text-white" size={56} />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-green-500 border-4 border-white flex items-center justify-center shadow-lg">
                  <FaCheckCircle className="text-white" size={20} />
                </div>
              </div>

              {/* Driver Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{driver.name}</h1>
                <p className="text-sm sm:text-base text-gray-600 mb-3">Professional Driver • {driver.joinDate}</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm font-semibold text-green-700">{driver.status}</span>
                </div>
              </div>

              {/* Logout Button - Desktop */}
              <div className="hidden md:block">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 text-white font-bold shadow-lg hover:shadow-xl hover:from-red-700 hover:to-red-600 transition-all duration-200"
                >
                  <FiLogOut size={20} />
                  <span>Logout</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              whileHover={{ y: -4, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-lg border border-white/40 text-center transition-all"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <FaCheckCircle className="text-blue-600" size={20} />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{loading ? '...' : stats.totalTrips}</p>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Trips</p>
            </motion.div>

            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              whileHover={{ y: -4, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-lg border border-white/40 text-center transition-all"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <FaClock className="text-green-600" size={20} />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{loading ? '...' : stats.completedToday}</p>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Today</p>
            </motion.div>

            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
              whileHover={{ y: -4, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-lg border border-white/40 text-center transition-all"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <FaCheckCircle className="text-purple-600" size={20} />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{loading ? '...' : stats.onTimeRate}</p>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">On-Time</p>
            </motion.div>

            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
              whileHover={{ y: -4, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-lg border border-white/40 text-center transition-all"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <FaRoute className="text-orange-600" size={20} />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{loading ? '...' : stats.totalDistance}</p>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Distance</p>
            </motion.div>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl border border-white/40"
            >
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                Personal Information
              </h2>

              <div className="space-y-5">
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <FiMail className="text-blue-600" size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                      Email Address
                    </p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">{driver.email}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-green-50 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <FiPhone className="text-green-600" size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                      Phone Number
                    </p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900">{driver.phone}</p>
                  </div>
                </div>

                {/* License */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-50 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <FiCreditCard className="text-purple-600" size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                      License Number
                    </p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900">{driver.licenseNumber}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Vehicle Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl border border-white/40"
            >
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
                <FiTruck className="text-[#c6ac8f]" size={24} />
                Vehicle Information
              </h2>

              <div className="space-y-5">
                {/* Assigned Vehicle */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#c6ac8f]/20 to-[#b89a7f]/20 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <FiTruck className="text-[#c6ac8f]" size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                      Assigned Vehicle
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{driver.vehicle}</p>
                  </div>
                </div>

                {/* Vehicle Status */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Vehicle Status</span>
                    <span className="px-3 py-1 rounded-full bg-green-100 border border-green-200 text-xs font-semibold text-green-700">
                      Active
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Vehicle is in good condition and ready for trips.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Mobile Logout Button */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 text-white font-bold shadow-xl hover:shadow-2xl hover:from-red-700 hover:to-red-600 transition-all duration-200"
            >
              <FiLogOut size={22} />
              <span className="text-lg">Logout</span>
            </motion.button>
          </div>
        </div>
      </div>

      <DriverFooter />
    </>
  );
};


export default DriverProfile;

