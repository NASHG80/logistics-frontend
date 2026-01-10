import { useEffect, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiEye,
  FiMap,
  FiEdit,
  FiAlertTriangle,
  FiX,
  FiTruck,
  FiPackage,
  FiTrash,
} from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";

import AdminNavbar from "../../components/AdminNavbar";
import AdminFooter from "../../components/AdminFooter";
import ShipmentFilterPanel from "../../components/ShipmentFilterPanel";
import { shipmentAPI, vehicleAPI } from "../../services/api";

/* ================= ANIMATION VARIANTS ================= */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  },
};

/* ================= ENHANCED BADGES ================= */
const StatusBadge = memo(({ value }) => {
  const config = {
    PENDING: {
      bg: "bg-amber-100/80",
      text: "text-amber-700",
      border: "border-amber-200",
      dot: "bg-amber-500"
    },
    IN_TRANSIT: {
      bg: "bg-blue-100/80",
      text: "text-blue-700",
      border: "border-blue-200",
      dot: "bg-blue-500",
      pulse: true
    },
    DELIVERED: {
      bg: "bg-emerald-100/80",
      text: "text-emerald-700",
      border: "border-emerald-200",
      dot: "bg-emerald-500"
    },
    CANCELLED: {
      bg: "bg-gray-100/80",
      text: "text-gray-600",
      border: "border-gray-200",
      dot: "bg-gray-400"
    },
    IDLE: {
      bg: "bg-gray-100/80",
      text: "text-gray-600",
      border: "border-gray-200",
      dot: "bg-gray-400"
    },
    ACTIVE: {
      bg: "bg-emerald-100/80",
      text: "text-emerald-700",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
      pulse: true
    },
    MAINTENANCE: {
      bg: "bg-amber-100/80",
      text: "text-amber-700",
      border: "border-amber-200",
      dot: "bg-amber-500"
    },
    OUT_OF_SERVICE: {
      bg: "bg-red-100/80",
      text: "text-red-700",
      border: "border-red-200",
      dot: "bg-red-500"
    },
  };

  const style = config[value] || config.PENDING;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
      <span className="relative flex h-2 w-2">
        {style.pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${style.dot} opacity-75`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${style.dot}`} />
      </span>
      {value.replace("_", " ")}
    </span>
  );
});
StatusBadge.displayName = "StatusBadge";

const RiskBadge = memo(({ value }) => {
  const config = {
    LOW: { bg: "bg-emerald-100/80", text: "text-emerald-700", border: "border-emerald-200" },
    MEDIUM: { bg: "bg-amber-100/80", text: "text-amber-700", border: "border-amber-200" },
    HIGH: { bg: "bg-red-100/80", text: "text-red-700", border: "border-red-200" },
  };

  const style = config[value] || config.LOW;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
      {value === "HIGH" && <FiAlertTriangle size={12} />}
      {value}
    </span>
  );
});
RiskBadge.displayName = "RiskBadge";

/* ================= SKELETON LOADER ================= */
const SkeletonRow = () => (
  <tr className="border-t">
    <td className="p-3" colSpan={8}>
      <div className="flex gap-4 items-center">
        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-40 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
      </div>
    </td>
  </tr>
);

/* ================= MAIN PAGE ================= */
export default function ShipmentFleetManagement() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState("shipments");
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const [shipments, setShipments] = useState([]);
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const filterStatus = params.get("status");
  const filterRisk = params.get("delayRisk");

  /* ================= INITIALIZE TAB FROM URL ================= */
  useEffect(() => {
    const tabParam = params.get("tab");
    if (tabParam === "fleet") {
      setActiveTab("fleet");
    }
  }, [params]);

  /* ================= FETCH DATA ON MOUNT ================= */
  useEffect(() => {
    // Fetch both shipments and fleet on initial mount to populate counts
    fetchShipments();
    fetchFleet();
  }, []);

  /* ================= FETCH DATA ON TAB CHANGE ================= */
  useEffect(() => {
    if (activeTab === "shipments") {
      fetchShipments();
    } else {
      fetchFleet();
    }
  }, [search, params, activeTab]);

  const fetchShipments = async () => {
    setLoading(true);
    setError("");
    try {
      const filters = {
        search: search || undefined,
        status: filterStatus || undefined,
        delayRisk: filterRisk || undefined,
      };

      const response = await shipmentAPI.getAll(filters);

      // Transform the data to match the expected format
      const transformedShipments = response.data.map(shipment => ({
        id: shipment.referenceId || shipment._id,
        customerName: shipment.customerName,
        source: shipment.source,
        destination: shipment.destination,
        assignedVehicleNumber: shipment.assignedVehicleNumber,
        assignedDriverName: shipment.assignedDriverName,
        status: shipment.status,
        eta: shipment.eta ? new Date(shipment.eta).toISOString().split('T')[0] : 'N/A',
        delayRisk: shipment.delayRisk,
        _id: shipment._id // Keep the MongoDB ID for navigation
      }));

      setShipments(transformedShipments);
    } catch (err) {
      console.error("Error fetching shipments:", err);
      setError(err.response?.data?.message || "Failed to load shipments");
      setShipments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFleet = async () => {
    setLoading(true);
    setError("");
    try {
      const filters = {
        search: search || undefined,
      };

      const response = await vehicleAPI.getAll(filters);

      // Transform the data to match the expected format
      const transformedFleet = response.data.map(vehicle => ({
        id: vehicle._id,
        vehicleNumber: vehicle.vehicleNumber,
        driverName: vehicle.driverName,
        status: vehicle.status,
        currentShipmentId: vehicle.currentShipmentId,
        currentShipment: vehicle.currentShipment, // Include populated shipment data
        lastLocation: vehicle.lastLocation,
        maintenanceRequired: vehicle.maintenanceRequired,
        _id: vehicle._id
      }));

      setFleet(transformedFleet);
    } catch (err) {
      console.error("Error fetching fleet:", err);
      setError(err.response?.data?.message || "Failed to load fleet");
      setFleet([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE HANDLER ================= */
  const handleDeleteShipment = async (shipmentId, shipmentRef) => {
    if (!window.confirm(`Are you sure you want to delete shipment ${shipmentRef}? This will also delete any related invoices.`)) {
      return;
    }

    try {
      await shipmentAPI.delete(shipmentId);
      // Refresh the shipments list
      fetchShipments();
      alert('Shipment and related invoice deleted successfully');
    } catch (err) {
      console.error('Error deleting shipment:', err);
      alert(err.response?.data?.message || 'Failed to delete shipment');
    }
  };

  /* ================= FILTER HANDLERS ================= */
  const applyFilters = (filters) => {
    const newParams = {};
    if (filters.status?.length) newParams.status = filters.status.join(",");
    if (filters.delayRisk?.length) newParams.delayRisk = filters.delayRisk.join(",");
    setParams(newParams);
    setShowFilter(false);
  };

  const clearFilters = () => setParams({});

  return (
    <>
      <AdminNavbar />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 min-h-screen gradient-bg-mesh">
        {/* Decorative background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* ================= HEADER ================= */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Shipment & Fleet Management
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Create, assign, and monitor shipments and fleet resources
            </p>
          </motion.div>

          {/* ================= ACTION BAR ================= */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6"
          >
            <div className="flex gap-2">

              <button
                onClick={() => navigate("/admin/assign")}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-xl border border-gray-200 
                         rounded-xl text-sm font-medium text-gray-700 hover:border-[#c6ac8f] 
                         hover:text-[#c6ac8f] transition-all duration-300"
              >
                <FiTruck size={16} /> Assign Vehicle
              </button>
              <button
                onClick={() => navigate("/admin/fleet/add")}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-xl border border-gray-200 
                        rounded-xl text-sm font-medium text-gray-700 hover:border-[#c6ac8f] 
                        hover:text-[#c6ac8f] transition-all duration-300"
              >
                <FiPlus size={16} /> Add Vehicle
              </button>

            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search shipment / vehicle"
                  className="pl-9 pr-4 py-2.5 bg-white/80 backdrop-blur-xl border border-gray-200 
                           rounded-xl text-sm placeholder:text-gray-400 
                           focus:outline-none focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f]
                           transition-all duration-300 w-48 sm:w-64"
                />
              </div>

              {/* Filter */}
              <button
                onClick={() => setShowFilter(true)}
                className="relative p-2.5 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-xl
                         hover:border-[#c6ac8f] hover:text-[#c6ac8f] transition-all duration-300"
              >
                <FiFilter size={16} />
                {(filterStatus || filterRisk) && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#c6ac8f] rounded-full" />
                )}
              </button>
            </div>
          </motion.div>

          {/* ================= ACTIVE FILTERS ================= */}
          <AnimatePresence>
            {(filterStatus || filterRisk) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 mb-4 text-sm"
              >
                <span className="text-gray-500 font-medium">Active Filters:</span>

                {filterStatus && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100/80 text-blue-700 rounded-full border border-blue-200">
                    Status
                    <FiX onClick={clearFilters} className="cursor-pointer hover:scale-110 transition-transform" size={14} />
                  </span>
                )}

                {filterRisk && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100/80 text-red-700 rounded-full border border-red-200">
                    Risk
                    <FiX onClick={clearFilters} className="cursor-pointer hover:scale-110 transition-transform" size={14} />
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ================= TABS ================= */}
          <div className="relative flex gap-8 border-b border-gray-200 mb-6">
            {[
              { key: "shipments", label: "Shipments", icon: FiPackage, count: shipments.length },
              { key: "fleet", label: "Fleet", icon: FiTruck, count: fleet.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative pb-3 text-sm font-semibold flex items-center gap-2 transition-colors duration-300
                  ${activeTab === tab.key ? "text-[#c6ac8f]" : "text-gray-500 hover:text-gray-700"}`}
              >
                <tab.icon size={16} />
                {tab.label}
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.key ? "bg-[#c6ac8f]/20 text-[#c6ac8f]" : "bg-gray-100 text-gray-600"}`}>
                  {tab.count}
                </span>

                {/* Animated underline */}
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#c6ac8f] to-[#a08060]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* ================= TABLES ================= */}
          <AnimatePresence mode="wait">
            {activeTab === "shipments" && (
              <motion.div
                key="shipments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
              >
                {loading ? (
                  <div className="p-10 text-center">
                    <div className="inline-block w-8 h-8 border-3 border-[#c6ac8f] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-400 mt-3">Loading shipments...</p>
                  </div>
                ) : error ? (
                  <div className="p-10 text-center">
                    <div className="text-red-500 mb-2">
                      <FiAlertTriangle size={32} className="mx-auto" />
                    </div>
                    <p className="text-sm text-red-600 mb-3">{error}</p>
                    <button
                      onClick={fetchShipments}
                      className="px-4 py-2 bg-[#c6ac8f] text-white rounded-lg text-sm hover:bg-[#b89968] transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : shipments.length === 0 ? (
                  <div className="p-10 text-center text-sm text-gray-500">
                    No shipments found matching your criteria.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50/80 text-gray-600 border-b border-gray-200">
                        <tr>
                          <th className="p-3 text-left font-semibold">Shipment</th>
                          <th className="p-3 text-left font-semibold">Customer</th>
                          <th className="p-3 text-left font-semibold">Route</th>
                          <th className="p-3 text-left font-semibold">Vehicle</th>
                          <th className="p-3 text-left font-semibold">Status</th>
                          <th className="p-3 text-left font-semibold">ETA</th>
                          <th className="p-3 text-left font-semibold">Risk</th>
                          <th className="p-3 text-left font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <motion.tbody
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {shipments.map((s) => (
                          <motion.tr
                            key={s._id || s.id}
                            variants={rowVariants}
                            onClick={() => navigate(`/admin/shipments/${s._id || s.id}`)}
                            className="border-t border-gray-100 hover:bg-gray-50/80 cursor-pointer transition-colors duration-200"
                          >
                            <td className="p-3 font-semibold text-gray-900">{s.id}</td>
                            <td className="p-3 text-gray-700">{s.customerName}</td>
                            <td className="p-3 text-gray-700">
                              {s.source} → {s.destination}
                            </td>
                            <td className="p-3 text-gray-700">
                              {s.assignedVehicleNumber ?? <span className="text-gray-400">—</span>}
                            </td>
                            <td className="p-3">
                              <StatusBadge value={s.status} />
                            </td>
                            <td className="p-3 text-gray-700">{s.eta}</td>
                            <td className="p-3">
                              <RiskBadge value={s.delayRisk} />
                            </td>
                            <td className="p-3" onClick={(e) => e.stopPropagation()}>
                              <div className="flex gap-3 text-gray-400">
                                <FiEye
                                  onClick={() => navigate(`/admin/shipments/${s._id || s.id}`)}
                                  className="hover:text-[#c6ac8f] cursor-pointer transition-colors duration-200"
                                  size={16}
                                  title="View Details"
                                />
                                <FiEdit
                                  onClick={() =>
                                    navigate(`/admin/shipments/${s._id || s.id}/edit`, { state: { from: "list" } })
                                  }
                                  className="hover:text-[#c6ac8f] cursor-pointer transition-colors duration-200"
                                  size={16}
                                  title="Edit Shipment"
                                />
                                <FiMap
                                  onClick={() => navigate(`/admin/tracking?shipment=${s._id || s.id}`)}
                                  className="hover:text-[#c6ac8f] cursor-pointer transition-colors duration-200"
                                  size={16}
                                  title="Track on Map"
                                />
                                <FiTrash
                                  onClick={() => handleDeleteShipment(s._id || s.id, s.id)}
                                  className="hover:text-red-600 cursor-pointer transition-colors duration-200"
                                  size={16}
                                  title="Delete Shipment"
                                />
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </motion.tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "fleet" && (
              <motion.div
                key="fleet"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
              >
                {loading ? (
                  <div className="p-10 text-center">
                    <div className="inline-block w-8 h-8 border-3 border-[#c6ac8f] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-400 mt-3">Loading fleet data...</p>
                  </div>
                ) : fleet.length === 0 ? (
                  <div className="p-10 text-center text-sm text-gray-500">
                    No fleet vehicles available.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50/80 text-gray-600 border-b border-gray-200">
                        <tr>
                          <th className="p-3 text-left font-semibold">Vehicle</th>
                          <th className="p-3 text-left font-semibold">Driver</th>
                          <th className="p-3 text-left font-semibold">Status</th>
                          <th className="p-3 text-left font-semibold">Shipment</th>
                          <th className="p-3 text-left font-semibold">Route</th>
                          <th className="p-3 text-left font-semibold">Maintenance</th>
                        </tr>
                      </thead>
                      <motion.tbody
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {fleet.map((v) => (
                          <motion.tr
                            key={v.id}
                            variants={rowVariants}
                            onClick={() => navigate(`/admin/vehicles/${v.id}`)}
                            className="border-t border-gray-100 hover:bg-gray-50/80 cursor-pointer transition-colors duration-200"
                          >
                            <td className="p-3 font-semibold text-gray-900">{v.vehicleNumber}</td>
                            <td className="p-3 text-gray-700">
                              {v.driverName ?? <span className="text-gray-400">—</span>}
                            </td>
                            <td className="p-3">
                              <StatusBadge value={v.status} />
                            </td>
                            <td className="p-3 text-gray-700">
                              {v.currentShipmentId ?? <span className="text-gray-400">—</span>}
                            </td>
                            <td className="p-3 text-gray-700">
                              {v.currentShipment ? (
                                <span>{v.currentShipment.source} → {v.currentShipment.destination}</span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="p-3">
                              {v.maintenanceRequired ? (
                                <span className="flex items-center gap-1.5 text-amber-600">
                                  <FiAlertTriangle size={14} />
                                  <span className="text-xs font-medium">Required</span>
                                </span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                      </motion.tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <ShipmentFilterPanel
        open={showFilter}
        onClose={() => setShowFilter(false)}
        onApply={applyFilters}
        defaultFilters={{}}
      />

      <AdminFooter />
    </>
  );
}
