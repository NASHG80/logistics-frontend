import { useEffect, useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import L from "leaflet";
import {
  FiArrowLeft,
  FiTruck,
  FiAlertTriangle,
  FiClock,
  FiMapPin,
  FiNavigation,
  FiActivity,
} from "react-icons/fi";

import CustomerNavbar from "../../components/CustomerNavbar";
import CustomerFooter from "../../components/CustomerFooter";
import { vehicleAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

/* ================= SOCKET ================= */
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const socket = io(SOCKET_URL);

/* ================= CONSTANTS ================= */
const REFRESH_INTERVAL = 5000; // 5 seconds

/* ================= MAP ICONS ================= */
const truckIcon = L.divIcon({
  className: "custom-truck-icon",
  html: `
    <div style="
      font-size: 32px;
      transform: rotate(0deg);
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      animation: pulse 2s infinite;
    ">
      🚚
    </div>
    <style>
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
    </style>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const pickupIcon = L.divIcon({
  className: "custom-pickup-icon",
  html: `
    <div style="
      width: 24px;
      height: 24px;
      background: #10b981;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const dropIcon = L.divIcon({
  className: "custom-drop-icon",
  html: `
    <div style="
      width: 24px;
      height: 24px;
      background: #ef4444;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

/* ================= AUTO PAN ================= */
function AutoPan({ vehicle }) {
  const map = useMap();

  useEffect(() => {
    if (vehicle) {
      map.flyTo([vehicle.location.lat, vehicle.location.lng], 10, {
        duration: 1.2,
      });
    }
  }, [vehicle, map]);

  return null;
}

/* ================= STATUS BADGE ================= */
const StatusBadge = memo(({ status }) => {
  const config = {
    PENDING: {
      bg: "bg-amber-100/80",
      text: "text-amber-700",
      border: "border-amber-200",
      dot: "bg-amber-500",
      pulse: true,
    },
    IN_TRANSIT: {
      bg: "bg-emerald-100/80",
      text: "text-emerald-700",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
      pulse: true,
    },
    DELIVERED: {
      bg: "bg-blue-100/80",
      text: "text-blue-700",
      border: "border-blue-200",
      dot: "bg-blue-500",
    },
  };

  const style = config[status] || config.PENDING;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
      <span className="relative flex h-2 w-2">
        {style.pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${style.dot} opacity-75`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${style.dot}`} />
      </span>
      {status.replace("_", " ")}
    </span>
  );
});
StatusBadge.displayName = "StatusBadge";

/* ================= ANIMATION VARIANTS ================= */
const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

/* ================= PAGE ================= */
export default function CustomerShipment() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleTrackingData, setVehicleTrackingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track vehicle paths for route visualization
  const [vehiclePaths, setVehiclePaths] = useState({});

  /* ================= FETCH ACTIVE VEHICLES (FILTERED FOR CUSTOMER) ================= */
  const fetchActiveVehicles = async () => {
    try {
      console.log('🔍 Fetching active vehicles for customer...');
      const response = await vehicleAPI.getActiveVehicles();
      console.log('📡 API Response:', response);

      if (response.success) {
        // Backend already filters based on user role
        // For customers, it returns only vehicles carrying their shipments
        // Additionally filter out DELIVERED shipments by checking shipmentDetails.status
        const activeVehicles = response.data.filter(v => {
          const shipmentStatus = v.shipmentDetails?.status;
          return shipmentStatus !== 'DELIVERED' && shipmentStatus !== 'COMPLETED';
        });

        console.log('📦 All fetched vehicles:', response.data);
        console.log('📊 Total vehicle count:', response.data.length);
        console.log('🚚 Active (non-delivered) count:', activeVehicles.length);

        if (activeVehicles.length > 0) {
          console.log('🚚 First active vehicle:', activeVehicles[0]);
        } else {
          console.warn('⚠️ No active vehicles (all delivered or none available)');
        }

        setVehicleTrackingData(activeVehicles);
        setError(null);
      } else {
        console.error('❌ API returned success: false');
        setError('Failed to load vehicles');
      }
    } catch (err) {
      console.error('❌ Error fetching active vehicles:', err);
      setError('Failed to load vehicle tracking data');
    } finally {
      setLoading(false);
    }
  };

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    fetchActiveVehicles();
  }, [user]);

  /* ================= AUTO REFRESH ================= */
  useEffect(() => {
    const interval = setInterval(() => {
      fetchActiveVehicles();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [user]);

  /* ================= LISTEN FOR REAL-TIME LOCATION UPDATES ================= */
  useEffect(() => {
    console.log('🔌 Customer socket listener initialized');

    // Listen for location updates from drivers
    socket.on('location-update', (data) => {
      console.log('📍 Customer received location update:', data);
      console.log('📊 Current vehicles:', vehicleTrackingData);

      const newPoint = [data.lat, data.lng];

      // Update vehicle location in real-time
      setVehicleTrackingData(prev => {
        console.log('🔄 Updating vehicles. Current count:', prev.length);
        const updated = prev.map(v => {
          // Match by shipment ID
          if (v.shipmentId === data.shipmentId || v.shipmentId === data.referenceId) {
            console.log('✅ MATCH FOUND! Updating vehicle:', v.vehicleNumber);
            return {
              ...v,
              location: {
                ...v.location,
                lat: data.lat,
                lng: data.lng,
                lastUpdated: 'Just now'
              }
            };
          }
          return v;
        });
        console.log('🔄 Updated vehicles:', updated);
        return updated;
      });

      // Update path for this vehicle
      setVehiclePaths(prev => ({
        ...prev,
        [data.shipmentId]: [...(prev[data.shipmentId] || []), newPoint]
      }));

      console.log('🚚 Truck position updated to:', newPoint);
    });

    // Listen for shipment status updates (when driver ends trip)
    socket.on('shipment-status-updated', (data) => {
      console.log('📢 Customer received status update:', data);

      // If shipment is delivered or completed, remove it from the list
      if (data.status === 'DELIVERED' || data.status === 'COMPLETED') {
        console.log('🎯 Removing delivered vehicle from list:', data.shipmentId);
        setVehicleTrackingData(prev =>
          prev.filter(v =>
            v.shipmentId !== data.shipmentId &&
            v.shipmentId !== data.referenceId
          )
        );
      } else if (data.status === 'IN_TRANSIT') {
        // Update status to IN_TRANSIT when driver starts trip
        console.log('🚀 Updating vehicle status to IN_TRANSIT:', data.shipmentId);
        setVehicleTrackingData(prev => prev.map(v => {
          if (v.shipmentId === data.shipmentId || v.shipmentId === data.referenceId) {
            return {
              ...v,
              status: 'IN_TRANSIT',
              shipmentDetails: {
                ...v.shipmentDetails,
                status: 'IN_TRANSIT'
              }
            };
          }
          return v;
        }));
      }
    });

    return () => {
      console.log('🔌 Customer socket listener cleaned up');
      socket.off('location-update');
      socket.off('shipment-status-updated');
    };
  }, []); // Empty dependency array - only run once on mount

  /* ================= BACK LOGIC ================= */
  const handleBack = () => {
    navigate("/customer/dashboard", { replace: true });
  };

  return (
    <>
      <CustomerNavbar />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 min-h-screen gradient-bg-mesh">
        {/* Decorative background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* ================= HEADER ================= */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#c6ac8f] mb-4 transition-colors"
            >
              <FiArrowLeft /> Back to Dashboard
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md">
                <FiNavigation className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                  Live Shipment Tracking
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Track your shipments in real-time
                </p>
              </div>
            </div>
          </motion.div>

          {/* ================= STATUS BAR ================= */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap items-center gap-3 mb-6 text-xs"
          >
            <div className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="font-medium text-gray-700">
                {vehicleTrackingData.filter((v) => v.status === "PENDING").length} Pending
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-gray-700">
                {vehicleTrackingData.filter((v) => v.status === "IN_TRANSIT").length} In Transit
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="font-medium text-gray-700">
                {vehicleTrackingData.filter((v) => v.status === "DELIVERED").length} Delivered
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-full shadow-sm">
              <FiActivity size={14} className="text-gray-600" />
              <span className="font-medium text-gray-700">
                {vehicleTrackingData.length} Your Active Shipments
              </span>
            </div>
          </motion.div>

          {/* ================= LAYOUT ================= */}
          <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6">
            {/* ================= LEFT PANEL ================= */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="order-2 lg:order-1 lg:col-span-1 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm lg:h-fit lg:sticky lg:top-24"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">
                  {selectedVehicle ? "Shipment Details" : "Your Shipments"}
                </h3>

                {selectedVehicle && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setSelectedVehicle(null)}
                    className="text-xs text-[#c6ac8f] hover:underline font-medium"
                  >
                    ← Back
                  </motion.button>
                )}
              </div>

              {/* VEHICLE LIST */}
              <AnimatePresence mode="wait">
                {!selectedVehicle && (
                  <motion.div
                    key="list"
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-2"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-8 h-8 border-4 border-[#c6ac8f] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : error ? (
                      <div className="text-center py-8 text-red-500 text-sm">{error}</div>
                    ) : vehicleTrackingData.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 text-sm">No active shipments</div>
                    ) : (
                      vehicleTrackingData.map((v) => (
                        <motion.button
                          key={v.vehicleId}
                          variants={itemVariants}
                          onClick={() => setSelectedVehicle(v)}
                          whileTap={{ scale: 0.98 }}
                          className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-[#c6ac8f] bg-white text-sm transition-all duration-200"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <p className="font-semibold text-gray-900">
                              {v.vehicleNumber}
                            </p>
                            <StatusBadge status={v.status} />
                          </div>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <FiMapPin size={12} />
                            {v.shipmentId || "No shipment"}
                          </p>
                        </motion.button>
                      ))
                    )}
                  </motion.div>
                )}

                {/* VEHICLE DETAILS */}
                {selectedVehicle && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    {/* Vehicle Info */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md">
                          <FiTruck className="text-white" size={18} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Vehicle</p>
                          <p className="text-sm font-bold text-gray-900">{selectedVehicle.vehicleNumber}</p>
                        </div>
                      </div>
                      <StatusBadge status={selectedVehicle.status} />
                    </div>

                    {/* Details */}
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2 text-gray-700">
                        <FiTruck className="flex-shrink-0 mt-0.5 text-gray-400" size={16} />
                        <div>
                          <p className="text-xs text-gray-500">Driver</p>
                          <p className="font-semibold">{selectedVehicle.driver.name}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-gray-700">
                        <FiMapPin className="flex-shrink-0 mt-0.5 text-gray-400" size={16} />
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="font-semibold">{selectedVehicle.location.city}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Updated {selectedVehicle.location.lastUpdated}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-gray-700">
                        <FiClock className="flex-shrink-0 mt-0.5 text-gray-400" size={16} />
                        <div>
                          <p className="text-xs text-gray-500">ETA</p>
                          <p className="font-semibold">{selectedVehicle.eta.expectedAt}</p>
                        </div>
                      </div>

                      {selectedVehicle.alerts.delay && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-red-700">
                          <FiAlertTriangle className="flex-shrink-0" size={16} />
                          <span className="text-xs font-medium">Delay Detected</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ================= MAP ================= */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="order-1 lg:order-2 lg:col-span-3 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl overflow-hidden shadow-lg"
            >
              <MapContainer
                center={[20.5937, 78.9629]}
                zoom={5}
                className="h-[400px] sm:h-[500px] lg:h-[620px] w-full"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {vehicleTrackingData.map((v) => {
                  // Ensure we have valid location data
                  if (!v.location || !v.location.lat || !v.location.lng) {
                    console.warn(`Vehicle ${v.vehicleId} has invalid location data`);
                    return null;
                  }

                  const currentPosition = [v.location.lat, v.location.lng];
                  const vehiclePath = vehiclePaths[v.shipmentId] || [currentPosition];

                  // Get shipment route data if available
                  const hasRouteData = v.shipmentRoute && v.shipmentRoute.length > 0;

                  return (
                    <div key={v.vehicleId}>
                      {/* Show route if available */}
                      {hasRouteData && (
                        <>
                          {/* Pickup marker */}
                          <Marker position={v.shipmentRoute[0]} icon={pickupIcon} />

                          {/* Drop marker */}
                          <Marker
                            position={v.shipmentRoute[v.shipmentRoute.length - 1]}
                            icon={dropIcon}
                          />

                          {/* Full route path (dotted line) */}
                          <Polyline
                            positions={v.shipmentRoute}
                            pathOptions={{
                              color: "#c6ac8f",
                              weight: 4,
                              opacity: 0.5,
                              dashArray: "10, 10"
                            }}
                          />

                          {/* Traveled path (solid green line) */}
                          {vehiclePath.length > 1 && (
                            <Polyline
                              positions={vehiclePath}
                              pathOptions={{
                                color: "#10b981",
                                weight: 5,
                                opacity: 1
                              }}
                            />
                          )}
                        </>
                      )}

                      {/* Truck marker at current location */}
                      <Marker
                        position={currentPosition}
                        icon={truckIcon}
                        eventHandlers={{ click: () => setSelectedVehicle(v) }}
                      />
                    </div>
                  );
                })}

                {selectedVehicle && <AutoPan vehicle={selectedVehicle} />}
              </MapContainer>
            </motion.div>
          </div>
        </div>
      </main>

      <CustomerFooter />
    </>
  );
}
