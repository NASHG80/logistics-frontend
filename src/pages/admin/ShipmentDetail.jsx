import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiMap,
  FiEdit,
  FiTruck,
  FiUser,
  FiClock,
  FiAlertCircle,
  FiPackage,
  FiMapPin,
  FiCheckCircle,
  FiDownload,
  FiDollarSign,
} from "react-icons/fi";

import AdminNavbar from "../../components/AdminNavbar";
import AdminFooter from "../../components/AdminFooter";
import { shipmentAPI } from "../../services/api";


/* ---------------- ANIMATION VARIANTS ---------------- */
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/* ---------------- BADGES ---------------- */
const StatusBadge = ({ value }) => {
  const config = {
    PENDING: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
    IN_TRANSIT: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
    DELIVERED: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
    CANCELLED: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" },
  };

  const style = config[value] || config.PENDING;

  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${style.bg} ${style.text} ${style.border} shadow-sm`}>
      {value.replace("_", " ")}
    </span>
  );
};

const RiskBadge = ({ value }) => {
  const config = {
    LOW: { text: "text-emerald-600", icon: "text-emerald-600", bg: "bg-emerald-100" },
    MEDIUM: { text: "text-amber-600", icon: "text-amber-600", bg: "bg-amber-100" },
    HIGH: { text: "text-red-600", icon: "text-red-600", bg: "bg-red-100" },
  };

  const style = config[value] || config.LOW;

  return (
    <span className={`flex items-center gap-2 text-sm font-semibold ${style.text}`}>
      <span className={`p-1.5 rounded-lg ${style.bg}`}>
        <FiAlertCircle size={16} className={style.icon} />
      </span>
      {value} Risk
    </span>
  );
};

/* ---------------- TIMELINE ITEM ---------------- */
const TimelineItem = ({ step, index, isLast }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative flex items-start gap-4 pb-6"
    >
      {/* Connector line */}
      {!isLast && (
        <div className="absolute left-[13px] top-8 w-0.5 h-full bg-gray-200">
          {step.done && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "100%" }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
              className="w-full bg-gradient-to-b from-emerald-500 to-emerald-400"
            />
          )}
        </div>
      )}

      {/* Status dot */}
      <div className="relative z-10 flex items-center justify-center">
        {step.done ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md"
          >
            <FiCheckCircle className="text-white" size={14} />
          </motion.div>
        ) : (
          <div className="w-7 h-7 rounded-full border-2 border-gray-300 bg-white" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pt-0.5">
        <div className="flex justify-between items-start">
          <div>
            <p className={`text-sm font-semibold ${step.done ? "text-gray-900" : "text-gray-400"}`}>
              {step.label}
            </p>
            {step.time && (
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <FiClock size={12} />
                {new Date(step.time).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ---------------- PAGE ---------------- */
export default function ShipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchShipment();
  }, [id]);

  const fetchShipment = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await shipmentAPI.getById(id);
      setShipment(response.data);
    } catch (err) {
      console.error("Error fetching shipment:", err);
      setError(err.response?.data?.message || "Failed to load shipment details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 min-h-screen gradient-bg-mesh">
          <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-[#c6ac8f] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading shipment details...</p>
            </div>
          </div>
        </main>
        <AdminFooter />
      </>
    );
  }

  if (error || !shipment) {
    return (
      <>
        <AdminNavbar />
        <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 min-h-screen gradient-bg-mesh">
          <div className="max-w-6xl mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#c6ac8f] mb-6 transition-colors"
            >
              <FiArrowLeft /> Back
            </button>
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
              <FiAlertCircle className="mx-auto text-red-500 mb-4" size={48} />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Shipment</h2>
              <p className="text-gray-600 mb-4">{error || "Shipment not found"}</p>
              <button
                onClick={fetchShipment}
                className="px-6 py-2.5 bg-gradient-to-r from-[#c6ac8f] to-[#a08060] text-white rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
        <AdminFooter />
      </>
    );
  }

  return (
    <>
      <AdminNavbar />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 min-h-screen gradient-bg-mesh">
        {/* Decorative background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* ================= HEADER ================= */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#c6ac8f] mb-3 transition-colors"
            >
              <FiArrowLeft /> Back
            </button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  Shipment {shipment.referenceId || shipment._id}
                </h1>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                  <FiClock size={14} />
                  Last updated {new Date(shipment.lastUpdated || shipment.updatedAt).toLocaleString()}
                </p>
              </div>

              <StatusBadge value={shipment.status} />
            </div>
          </motion.div>

          {/* ================= MAIN GRID ================= */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* -------- LEFT: DETAILS -------- */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="lg:col-span-2 space-y-6"
            >
              {/* Shipment Info Card */}
              <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                    <FiPackage className="text-white" size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Shipment Details</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Customer</p>
                    <p className="font-semibold text-gray-900">{shipment.customerName}</p>
                  </div>

                  <div>
                    <p className="text-gray-500 mb-1">Route</p>
                    <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                      <FiMapPin size={14} className="text-emerald-600" />
                      {shipment.source} → {shipment.destination}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 mb-1">ETA</p>
                    <p className="font-semibold text-gray-900">
                      {shipment.eta ? new Date(shipment.eta).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 mb-1">Delay Risk</p>
                    <RiskBadge value={shipment.delayRisk} />
                  </div>
                </div>
              </div>

              {/* Assignment Card */}
              <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md">
                    <FiTruck className="text-white" size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Assignment</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <FiTruck className="text-gray-600" size={18} />
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Vehicle</p>
                      <p className="font-semibold text-gray-900">
                        {shipment.assignedVehicleNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <FiUser className="text-gray-600" size={18} />
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Driver</p>
                      <p className="font-semibold text-gray-900">
                        {shipment.assignedDriverName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Card */}
              <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Shipment Timeline</h2>

                <div>
                  {shipment.timeline.map((step, idx) => (
                    <TimelineItem
                      key={idx}
                      step={step}
                      index={idx}
                      isLast={idx === shipment.timeline.length - 1}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* -------- RIGHT: ACTIONS -------- */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 h-fit shadow-sm"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-5">Quick Actions</h2>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate(`/admin/tracking?shipment=${shipment.id}`)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-[#c6ac8f] 
                           hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-[#c6ac8f] 
                           transition-all duration-300 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center 
                                group-hover:bg-[#c6ac8f] group-hover:text-white transition-colors">
                    <FiMap size={16} />
                  </div>
                  <span className="flex-1 text-left">Track Shipment</span>
                </button>

                <button
                  onClick={() => navigate(`/admin/assign?shipment=${shipment.id}`)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-[#c6ac8f] 
                           hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-[#c6ac8f] 
                           transition-all duration-300 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center 
                                group-hover:bg-[#c6ac8f] group-hover:text-white transition-colors">
                    <FiTruck size={16} />
                  </div>
                  <span className="flex-1 text-left">Reassign Vehicle</span>
                </button>

                <button
                  onClick={() => navigate(`/admin/shipments/${shipment.id}/edit`)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-[#c6ac8f] 
                           hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-[#c6ac8f] 
                           transition-all duration-300 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center 
                                group-hover:bg-[#c6ac8f] group-hover:text-white transition-colors">
                    <FiEdit size={16} />
                  </div>
                  <span className="flex-1 text-left">Edit Shipment</span>
                </button>

                {shipment.invoice && (
                  <>
                    <div className="border-t my-2" />
                    
                    <button
                      onClick={() => navigate(`/admin/invoices/${shipment.invoice.invoiceId}`)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-[#c6ac8f] 
                               hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-[#c6ac8f] 
                               transition-all duration-300 group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center 
                                    group-hover:bg-[#c6ac8f] group-hover:text-white transition-colors">
                        <FiDollarSign size={16} />
                      </div>
                      <span className="flex-1 text-left">View Invoice</span>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <AdminFooter />
    </>
  );
}
