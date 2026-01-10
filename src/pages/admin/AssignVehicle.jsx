import { useEffect, useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiTruck, FiCheck, FiPackage } from "react-icons/fi";
import { motion } from "framer-motion";
import AdminNavbar from "../../components/AdminNavbar";
import AdminFooter from "../../components/AdminFooter";
import { shipmentAPI, vehicleAPI } from "../../services/api";

/* ---------------- ANIMATION VARIANTS ---------------- */
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  },
};

/* ---------------- PAGE ---------------- */
export default function AssignVehicle() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const shipmentFromQuery = params.get("shipment");
  const returnContext = params.get("return");

  const [shipmentId, setShipmentId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [shipments, setShipments] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    fetchData();
  }, []);

  /* ---------------- PRESELECT SHIPMENT ---------------- */
  useEffect(() => {
    if (shipmentFromQuery) {
      setShipmentId(shipmentFromQuery);
    }
  }, [shipmentFromQuery]);

  const fetchData = async () => {
    setFetchLoading(true);
    setError("");
    try {
      // Fetch shipments and vehicles in parallel
      const [shipmentsRes, vehiclesRes] = await Promise.all([
        shipmentAPI.getAll({ status: 'PENDING,IN_TRANSIT' }),
        vehicleAPI.getAll()
      ]);

      setShipments(shipmentsRes.data);
      setVehicles(vehiclesRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setFetchLoading(false);
    }
  };

  /* ---------------- SUBMIT ---------------- */
  const handleAssign = async () => {
    if (!shipmentId || !vehicleId) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await vehicleAPI.assign(vehicleId, shipmentId);
      setSuccess("Vehicle assigned successfully!");
      
      setTimeout(() => {
        if (returnContext === "edit") {
          navigate(`/admin/shipments/${shipmentId}/edit`, { replace: true });
        } else {
          navigate(`/admin/shipments/${shipmentId}`, { replace: true });
        }
      }, 1500);
    } catch (err) {
      console.error("Error assigning vehicle:", err);
      setError(err.response?.data?.message || "Failed to assign vehicle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminNavbar />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 min-h-screen gradient-bg-mesh">
        {/* Decorative background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          {/* BACK BUTTON */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#c6ac8f] mb-4 transition-colors"
          >
            <FiArrowLeft /> Back
          </motion.button>

          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Assign Vehicle
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Select a shipment and assign an available vehicle
            </p>
          </motion.div>

          {/* ERROR/SUCCESS MESSAGES */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
            >
              <div className="font-semibold mb-1">Error</div>
              {error}
              <button
                onClick={fetchData}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm"
            >
              {success}
            </motion.div>
          )}

          {/* LOADING STATE */}
          {fetchLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-[#c6ac8f] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600 text-sm">Loading shipments and vehicles...</p>
              </div>
            </div>
          ) : (
          /* FORM SECTIONS */
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* SHIPMENT SELECT */}
            <motion.section
              variants={fadeInUp}
              className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                  <FiPackage className="text-white" size={18} />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Select Shipment</h2>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Shipment
                </label>
                <select
                  value={shipmentId}
                  onChange={(e) => setShipmentId(e.target.value)}
                  disabled={Boolean(shipmentFromQuery)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f]
                           transition-all duration-300 bg-white disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="">Select Shipment</option>
                  {shipments.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.referenceId || s._id} — {s.source} → {s.destination} ({s.customerName})
                    </option>
                  ))}
                </select>

                {shipmentFromQuery && (
                  <p className="text-xs text-gray-400 mt-2">
                    Shipment locked (opened from shipment context)
                  </p>
                )}
                
                {shipments.length === 0 && !fetchLoading && (
                  <p className="text-xs text-amber-600 mt-2">
                    No pending or in-transit shipments available
                  </p>
                )}
              </div>
            </motion.section>

            {/* VEHICLE SELECT */}
            <motion.section
              variants={fadeInUp}
              className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md">
                  <FiTruck className="text-white" size={18} />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Available Vehicles</h2>
              </div>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid sm:grid-cols-2 gap-3"
              >
                {vehicles.length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-gray-500 text-sm">
                    No vehicles available
                  </div>
                ) : (
                  vehicles.map((v) => (
                    <motion.button
                      key={v._id}
                      variants={cardVariants}
                      onClick={() => setVehicleId(v._id)}
                      disabled={v.status === "ACTIVE"}
                      className={`relative flex items-center justify-between p-4 border-2 rounded-xl text-sm 
                                transition-all duration-300 text-left
                                ${vehicleId === v._id
                                  ? "border-[#c6ac8f] bg-[#c6ac8f]/5 shadow-md shadow-[#c6ac8f]/20"
                                  : v.status === "ACTIVE"
                                  ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                                  : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                                }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-11 h-11 rounded-lg flex items-center justify-center
                                      ${vehicleId === v._id 
                                        ? "bg-[#c6ac8f] text-white" 
                                        : v.status === "ACTIVE"
                                        ? "bg-gray-200 text-gray-400"
                                        : "bg-gray-100 text-gray-600"
                                      } transition-colors`}>
                          <FiTruck size={18} />
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold ${vehicleId === v._id ? "text-[#c6ac8f]" : "text-gray-900"}`}>
                            {v.vehicleNumber}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {v.driverName || 'No driver'} • {v.status}
                          </p>
                        </div>
                      </div>

                      {vehicleId === v._id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className="w-6 h-6 rounded-full bg-[#c6ac8f] flex items-center justify-center"
                        >
                          <FiCheck className="text-white" size={14} />
                        </motion.div>
                      )}

                      {v.status === "ACTIVE" && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs font-medium">
                          In Use
                        </span>
                      )}
                    </motion.button>
                  ))
                )}
              </motion.div>
            </motion.section>

            {/* ACTIONS */}
            <motion.div
              variants={fadeInUp}
              className="flex justify-end gap-3 pt-4"
            >
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium
                         hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
              >
                Cancel
              </button>

              <button
                onClick={handleAssign}
                disabled={!shipmentId || !vehicleId || loading}
                className="px-6 py-2.5 bg-gradient-to-r from-[#c6ac8f] to-[#a08060] text-white 
                         rounded-xl text-sm font-medium shadow-md shadow-[#c6ac8f]/30
                         hover:shadow-lg hover:shadow-[#c6ac8f]/40 transition-all duration-300
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                         hover:scale-105 disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Assigning...
                  </span>
                ) : (
                  "Confirm Assignment"
                )}
              </button>
            </motion.div>
          </motion.div>
          )}
        </div>
      </main>

      <AdminFooter />
    </>
  );
}
