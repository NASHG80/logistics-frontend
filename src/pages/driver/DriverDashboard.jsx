import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import {
  FiTruck,
  FiMapPin,
  FiPlay,
  FiSquare,
  FiArrowRight,
  FiClock,
  FiCheckCircle,
  FiActivity,
  FiPackage,
  FiNavigation,
} from "react-icons/fi";
import DriverFooter from "../../components/DriverFooter";
import DriverNavbar from "../../components/DriverNavbar";
import { shipmentAPI, vehicleAPI } from "../../services/api";
import api from "../../services/api";
import notify from "../../utils/notify";
import { Toaster } from "react-hot-toast";

/* ================= SOCKET ================= */
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const socket = io(SOCKET_URL);

/* ================= ANIMATION VARIANTS ================= */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const DriverDashboard = () => {
  const navigate = useNavigate();
  const [isTripActive, setIsTripActive] = useState(false);
  const [shipmentData, setShipmentData] = useState(null);
  const [mockRoute, setMockRoute] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completedShipments, setCompletedShipments] = useState([]);

  /* refs so interval survives re-render */
  const intervalRef = useRef(null);
  const routeIndexRef = useRef(0);

  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  /* ================= HELPER FUNCTION FOR TIME AGO ================= */
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  /* ================= FETCH ASSIGNED SHIPMENT ================= */
  useEffect(() => {
    fetchAssignedShipment();
    fetchCompletedShipments();
  }, []);

  /* ================= LISTEN FOR STATUS UPDATES ================= */
  useEffect(() => {
    if (!shipmentData) return;

    socket.on('shipment-status-updated', (data) => {
      if (data.shipmentId === shipmentData._id || data.referenceId === shipmentData.referenceId) {
        setShipmentData(prev => ({
          ...prev,
          status: data.status
        }));
      }
    });

    return () => socket.off('shipment-status-updated');
  }, [shipmentData]);

  const fetchAssignedShipment = async () => {
    try {
      setLoading(true);
      setError("");

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem("token");
      const profileResponse = await fetch(`${API_URL}/auth/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const profileData = await profileResponse.json();
      const driverName = profileData.data?.name;

      if (!driverName) {
        setError("");
        setLoading(false);
        return;
      }

      const response = await shipmentAPI.getAll({});

      if (response.data && response.data.length > 0) {
        const myShipments = response.data.filter(
          shipment => shipment.assignedDriverName === driverName && shipment.status !== 'DELIVERED'
        );

        if (myShipments.length > 0) {
          const shipment = myShipments[0];
          setShipmentData(shipment);

          if (shipment.status === 'IN_TRANSIT') {
            setIsTripActive(true);
            startMockTracking();
          }

          if (shipment.mockRoute && shipment.mockRoute.length > 0) {
            setMockRoute(shipment.mockRoute);
          } else {
            setError("");
          }
        } else {
          setShipmentData(null);
          setError("");
        }
      } else {
        setShipmentData(null);
        setError("");
      }
    } catch (err) {
      console.error("Error fetching shipment:", err);
      setError("");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH COMPLETED SHIPMENTS FOR STATS ================= */
  const fetchCompletedShipments = async () => {
    try {
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

      if (!driverName) return;

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
    }
  };

  /* ================= TRIP DATA ================= */
  const trip = shipmentData ? {
    vehicle: shipmentData.assignedVehicleNumber || "Not Assigned",
    tripId: shipmentData.referenceId || "N/A",
    pickup: shipmentData.source || "Unknown",
    drop: shipmentData.destination || "Unknown",
    status: shipmentData.status || "PENDING",
    distance: shipmentData.routeMetadata?.distance || "N/A",
  } : {
    vehicle: "No Vehicle",
    tripId: "No Active Trip",
    pickup: "-",
    drop: "-",
    status: "No Assignment",
    distance: "0 km",
  };

  const [previousTrip, setPreviousTrip] = useState({
    tripId: "No completed trips",
    pickup: "-",
    drop: "-",
    completedTime: "-",
  });

  // Update previousTrip when completedShipments changes
  useEffect(() => {
    if (completedShipments.length > 0) {
      // Get the most recent completed shipment
      const mostRecent = completedShipments.sort((a, b) =>
        new Date(b.deliveredAt || b.updatedAt) - new Date(a.deliveredAt || a.updatedAt)
      )[0];

      // Helper function to format time difference (assuming it's defined elsewhere or will be added)
      const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
      };

      setPreviousTrip({
        tripId: mostRecent.referenceId,
        pickup: mostRecent.source || "Unknown",
        drop: mostRecent.destination || "Unknown",
        completedTime: mostRecent.deliveredAt
          ? getTimeAgo(new Date(mostRecent.deliveredAt))
          : 'Recently'
      });
    }
  }, [completedShipments]);

  const stats = {
    tripsCompleted: completedShipments.length,
    totalDistance: completedShipments.reduce((sum, s) => {
      const distance = s.routeMetadata?.distance || '0 km';
      const numericDistance = parseFloat(distance.replace(/[^\d.]/g, '')) || 0;
      return sum + numericDistance;
    }, 0).toFixed(0) + ' km',
    onTimeDeliveries: completedShipments.length > 0
      ? Math.round((completedShipments.filter(s => {
        if (!s.eta || !s.deliveredAt) return true;
        return new Date(s.deliveredAt) <= new Date(s.eta);
      }).length / completedShipments.length) * 100) + '%'
      : '100%',
  };

  /* ================= MOCK TRACKING ================= */
  const startMockTracking = () => {
    if (!shipmentData || mockRoute.length === 0) {
      notify.error("No route data available");
      return;
    }

    socket.emit("join-shipment", shipmentData.referenceId);

    intervalRef.current = setInterval(async () => {
      if (routeIndexRef.current >= mockRoute.length) {
        clearInterval(intervalRef.current);
        return;
      }

      const currentLat = mockRoute[routeIndexRef.current][0];
      const currentLng = mockRoute[routeIndexRef.current][1];

      socket.emit("driver-location", {
        shipmentId: shipmentData.referenceId,
        lat: currentLat,
        lng: currentLng,
        timestamp: Date.now(),
        vehicleNumber: shipmentData.assignedVehicleNumber || "N/A",
        driverName: shipmentData.assignedDriverName || "Driver",
      });

      try {
        if (shipmentData.assignedVehicle) {
          await vehicleAPI.updateLocation(shipmentData.assignedVehicle, {
            lat: currentLat,
            lng: currentLng
          });
        }
      } catch (error) {
        console.error('Error updating location:', error);
      }

      routeIndexRef.current += 1;
    }, 5000);
  };

  const stopMockTracking = () => {
    clearInterval(intervalRef.current);
    routeIndexRef.current = 0;
  };

  /* ================= HANDLERS ================= */
  const handleStartTrip = async () => {
    if (!shipmentData) {
      notify.error('No shipment data available');
      return;
    }

    try {
      await api.put(`/shipments/${shipmentData._id}/start-trip`, {
        status: 'IN_TRANSIT'
      });
    } catch (error) {
      console.error('Error updating shipment status:', error);
      notify.error('Failed to start trip. Please try again.');
      return;
    }

    const pickup = shipmentData.source || trip.pickup;
    const drop = shipmentData.destination || trip.drop;

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      pickup
    )}&destination=${encodeURIComponent(
      drop
    )}&travelmode=driving`;

    window.open(googleMapsUrl, "_blank");

    setIsTripActive(true);
    startMockTracking();
  };

  const handleEndTrip = async () => {
    if (!shipmentData) {
      notify.error('No shipment data available');
      return;
    }

    try {
      await api.put(`/shipments/${shipmentData._id}/start-trip`, {
        status: 'DELIVERED'
      });
    } catch (error) {
      console.error('Error updating shipment status:', error);
      notify.error('Failed to end trip. Please try again.');
      return;
    }

    notify.success("Trip completed successfully!");

    setIsTripActive(false);
    stopMockTracking();

    setShipmentData(null);
    // Refetch assignments after a short delay
    setTimeout(() => {
      fetchAssignedShipment();
      fetchCompletedShipments(); // Refresh stats
    }, 1000);
  };

  /* ================= LOADING STATE ================= */
  if (loading) {
    return (
      <>
        <Toaster />
        <DriverNavbar />
        <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 min-h-screen gradient-bg-mesh">
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl" />
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-[#c6ac8f] border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600 text-sm">Loading assignment...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Toaster />
      <DriverNavbar />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 min-h-screen gradient-bg-mesh">
        {/* Decorative background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                  Driver Dashboard
                </h1>
                <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                  <FiActivity size={14} className="text-[#c6ac8f]" />
                  Manage your trips and track deliveries
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/70 backdrop-blur rounded-full shadow-sm">
                  <FiClock size={14} />
                  {currentTime}
                </span>
              </div>
            </div>
          </motion.div>

          {/* KPI CARDS */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          >
            <KpiCard
              icon={FiTruck}
              title="Assigned Vehicle"
              value={trip.vehicle}
              gradient="bg-gradient-to-br from-[#c6ac8f] to-[#a08060]"
              iconBg="bg-gradient-to-br from-[#c6ac8f] to-[#a08060] text-white"
            />
            <KpiCard
              icon={FiCheckCircle}
              title="Trips Completed"
              value={stats.tripsCompleted}
              subtitle="Today"
              gradient="bg-gradient-to-br from-emerald-400 to-green-500"
              iconBg="bg-gradient-to-br from-emerald-500 to-green-600 text-white"
            />
            <KpiCard
              icon={FiNavigation}
              title="Distance Covered"
              value={stats.totalDistance}
              subtitle="This week"
              gradient="bg-gradient-to-br from-blue-400 to-indigo-500"
              iconBg="bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
            />
            <KpiCard
              icon={FiClock}
              title="On-Time Rate"
              value={stats.onTimeDeliveries}
              subtitle="Performance"
              gradient="bg-gradient-to-br from-amber-400 to-orange-500"
              iconBg="bg-gradient-to-br from-amber-500 to-orange-600 text-white"
            />
          </motion.div>

          {/* MAIN CONTENT */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-8 grid gap-6 lg:grid-cols-3"
          >
            {/* ACTIVE TRIP */}
            <motion.div
              variants={cardVariants}
              className="lg:col-span-2 bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl shadow-lg shadow-gray-200/50 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      {isTripActive && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                      Active Assignment
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">{trip.tripId}</p>
                  </div>
                  <StatusBadge status={trip.status} />
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Route */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-1">
                      <FiMapPin size={16} className="text-emerald-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Pickup</p>
                        <p className="font-semibold text-gray-900">{trip.pickup}</p>
                      </div>
                    </div>
                  </div>

                  <FiArrowRight className="mx-4 text-gray-300" size={20} />

                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-1">
                      <FiMapPin size={16} className="text-red-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Drop-off</p>
                        <p className="font-semibold text-gray-900">{trip.drop}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={isTripActive ? handleEndTrip : handleStartTrip}
                  disabled={!shipmentData}
                  className={`w-full group flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all shadow-lg ${isTripActive
                    ? "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-red-500/30"
                    : "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 shadow-emerald-500/30"
                    } disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]`}
                >
                  {isTripActive ? (
                    <>
                      <FiSquare size={18} />
                      <span>End Trip</span>
                    </>
                  ) : (
                    <>
                      <FiPlay size={18} />
                      <span>Start Trip</span>
                    </>
                  )}
                  <FiArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>

                {!shipmentData && (
                  <div className="text-center py-8">
                    <div className="inline-block p-4 rounded-full bg-gray-100 mb-3">
                      <FiPackage className="text-gray-400" size={28} strokeWidth={1.5} />
                    </div>
                    <p className="text-gray-600 font-medium">No Active Assignment</p>
                    <p className="text-sm text-gray-400 mt-1">Check back later for new trips</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* SIDE PANEL */}
            <motion.div
              variants={cardVariants}
              className="space-y-5"
            >
              {/* Last Completed */}
              <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl shadow-lg shadow-gray-200/50 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiCheckCircle className="text-emerald-500" size={16} />
                  Last Completed
                </h3>
                <div className="space-y-2">
                  <p className="font-semibold text-gray-900">{previousTrip.tripId}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiMapPin size={12} className="text-gray-400" />
                    <span className="truncate">{previousTrip.pickup} → {previousTrip.drop}</span>
                  </div>
                  <p className="text-xs text-gray-400">{previousTrip.completedTime}</p>
                </div>
              </div>

              {/* Recent Completed Trips */}
              <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl shadow-lg shadow-gray-200/50 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiCheckCircle className="text-emerald-500" size={16} />
                  Recent Completed Trips
                </h3>
                <div className="space-y-3">
                  {completedShipments.length > 0 ? (
                    completedShipments
                      .sort((a, b) => new Date(b.deliveredAt || b.updatedAt) - new Date(a.deliveredAt || a.updatedAt))
                      .slice(0, 3)
                      .map((shipment) => (
                        <div
                          key={shipment._id}
                          className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 hover:border-emerald-200 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-semibold text-gray-900 text-sm">{shipment.referenceId}</p>
                            <span className="text-xs text-emerald-600 font-medium">✓ Delivered</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                            <FiMapPin size={10} className="text-gray-400" />
                            <span className="truncate">{shipment.source} → {shipment.destination}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">
                              {shipment.deliveredAt ? getTimeAgo(new Date(shipment.deliveredAt)) : 'Recently'}
                            </span>
                            {shipment.routeMetadata?.distance && (
                              <span className="text-gray-500 font-medium">
                                {shipment.routeMetadata.distance}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-6">
                      <div className="inline-block p-3 rounded-full bg-gray-100 mb-2">
                        <FiPackage className="text-gray-400" size={20} />
                      </div>
                      <p className="text-sm text-gray-500">No completed trips yet</p>
                      <p className="text-xs text-gray-400 mt-1">Your deliveries will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <DriverFooter />
    </>
  );
};

/* ========== COMPONENTS ========== */

const KpiCard = ({ icon: Icon, title, value, subtitle, gradient, iconBg }) => (
  <motion.div
    variants={cardVariants}
    whileHover={{ y: -6, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
    className="group relative bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl p-5 cursor-pointer shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all duration-300 overflow-hidden"
  >
    <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 blur-2xl group-hover:opacity-30 transition-opacity duration-500 ${gradient}`} />

    <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 ${iconBg}`}>
      <Icon size={22} className="group-hover:animate-pulse" />
    </div>

    <div className="relative mt-4">
      <h4 className="text-sm font-medium text-gray-500 tracking-wide">{title}</h4>
      <p className="text-3xl font-bold text-gray-900 tracking-tight mt-1">{value}</p>
      {subtitle && <p className="mt-1.5 text-xs text-gray-400 font-medium">{subtitle}</p>}
    </div>
  </motion.div>
);

const StatusBadge = ({ status }) => {
  const colors = {
    'IN_TRANSIT': 'bg-blue-50 text-blue-700 border-blue-200',
    'PENDING': 'bg-amber-50 text-amber-700 border-amber-200',
    'DELIVERED': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'No Assignment': 'bg-gray-50 text-gray-700 border-gray-200',
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium border ${colors[status] || colors['PENDING']}`}>
      {status}
    </span>
  );
};

const QuickAction = ({ icon: Icon, title, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-100/50 hover:border-gray-300 transition-all group"
  >
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-white shadow-sm">
        <Icon size={16} className="text-gray-600" />
      </div>
      <span className="text-sm font-medium text-gray-700">{title}</span>
    </div>
    <FiArrowRight size={14} className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
  </button>
);

export default DriverDashboard;
