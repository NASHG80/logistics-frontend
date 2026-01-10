import { useState, memo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AskSaarthiAI from "../../components/AskSaarthiAI";
import { fetchInsights } from "../../api/insightApi";

import {
  FiCpu,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertCircle,
  FiUser,
  FiDollarSign,
  FiZap,
  FiAlertTriangle,
  FiCheckCircle,
  FiRefreshCw,
} from "react-icons/fi";

import AdminNavbar from "../../components/AdminNavbar";
import AdminFooter from "../../components/AdminFooter";

/* ================= MOCK DATA ================= */
const AI_INSIGHTS = {
  generatedAt: "2 mins ago",
  confidence: "HIGH",
  dataWindow: "Today",
  overallStatus: "ATTENTION",
  summaryText:
    "Overall operations are stable, but multiple shipments are facing delay risks in the West zone due to traffic congestion.",

  delayInsights: [
    {
      reason: "Traffic congestion near Mumbai",
      affectedShipments: 3,
      severity: "HIGH",
    },
    {
      reason: "Late vehicle dispatch",
      affectedShipments: 1,
      severity: "MEDIUM",
    },
  ],

  fuelInsight: {
    trend: "INCREASED",
    percentageChange: 6,
    reason: "Longer idle times during peak traffic hours",
  },

  driverInsights: [
    {
      driverName: "R. Sharma",
      highlight: "Maintained on-time delivery despite traffic disruptions",
      performanceTag: "GOOD",
    },
    {
      driverName: "A. Patel",
      highlight: "Multiple late departures observed this morning",
      performanceTag: "NEEDS_ATTENTION",
    },
  ],

  costSavingSuggestions: [
    {
      suggestion:
        "Rescheduling early-morning dispatches could reduce fuel costs by ~4%",
      impactLevel: "HIGH",
    },
    {
      suggestion:
        "Avoid assigning heavy-load vehicles during peak traffic windows",
      impactLevel: "MEDIUM",
    },
  ],
};

/* ================= ANIMATION VARIANTS ================= */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
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

/* ================= HELPERS ================= */
const statusConfig = {
  GOOD: {
    bg: "bg-emerald-100/90",
    text: "text-emerald-700",
    border: "border-emerald-300",
    icon: FiCheckCircle,
    iconColor: "text-emerald-600",
  },
  ATTENTION: {
    bg: "bg-amber-100/90",
    text: "text-amber-700",
    border: "border-amber-300",
    icon: FiAlertTriangle,
    iconColor: "text-amber-600",
  },
  CRITICAL: {
    bg: "bg-red-100/90",
    text: "text-red-700",
    border: "border-red-300",
    icon: FiAlertCircle,
    iconColor: "text-red-600",
  },
};

const severityConfig = {
  LOW: { text: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-200" },
  MEDIUM: { text: "text-amber-600", bg: "bg-amber-100", border: "border-amber-200" },
  HIGH: { text: "text-red-600", bg: "bg-red-100", border: "border-red-200" },
};

/* ================= SEVERITY BADGE ================= */
const SeverityBadge = memo(({ severity }) => {
  const style = severityConfig[severity];
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
      {severity}
    </span>
  );
});
SeverityBadge.displayName = "SeverityBadge";

/* ================= PAGE ================= */
export default function AIInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState(null);

  // Load insights on mount
  useEffect(() => {
    loadInsights(false);
  }, []);

  const loadInsights = async (force = false) => {
    try {
      if (force) {
        setRegenerating(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetchInsights(force);
      setInsights(response.insights);
    } catch (err) {
      console.error("Failed to load insights:", err);
      setError(err.message);
      // Fallback to mock data on error
      setInsights(AI_INSIGHTS);
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  const handleRefresh = () => {
    loadInsights(true);
  };

  // Use mock data as fallback or while loading
  const displayInsights = insights || AI_INSIGHTS;
  const StatusIcon = statusConfig[displayInsights.overallStatus].icon;

  return (
    <>
      <AdminNavbar />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 min-h-screen gradient-bg-mesh">
        {/* Decorative background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-indigo-200/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* ================= HEADER ================= */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c6ac8f] to-[#a08060] flex items-center justify-center shadow-md">
                  <FiCpu className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                    AI Operational Insights
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Decisions powered by SaarthiAI
                  </p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={regenerating || loading}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#c6ac8f] to-[#b89968] hover:from-[#b89968] hover:to-[#c6ac8f] text-white rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <FiRefreshCw className={`${regenerating ? 'animate-spin' : ''}`} size={16} />
                {regenerating ? 'Regenerating...' : 'Refresh Insights'}
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-800">
                  ⚠️ Using cached data. {error}
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-full shadow-sm">
                <FiClock className="text-gray-500" size={14} />
                <span className="text-gray-700">Updated {displayInsights.generatedAt}</span>
              </span>
              <span className="px-3 py-1.5 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-full shadow-sm text-gray-700">
                Confidence: <strong className="text-emerald-600">{displayInsights.confidence}</strong>
              </span>
              <span className="px-3 py-1.5 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-full shadow-sm text-gray-700">
                Data: {displayInsights.dataWindow}
              </span>
            </div>
          </motion.div>

          {/* ================= SUMMARY ================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`border-2 rounded-2xl p-6 mb-8 shadow-lg ${statusConfig[displayInsights.overallStatus].bg} ${statusConfig[displayInsights.overallStatus].text} ${statusConfig[displayInsights.overallStatus].border}`}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/40 flex items-center justify-center flex-shrink-0">
                <StatusIcon className={statusConfig[displayInsights.overallStatus].iconColor} size={20} />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-bold mb-2 flex items-center gap-2">
                  AI Status: {displayInsights.overallStatus}
                </h2>
                <p className="text-sm leading-relaxed">
                  {displayInsights.summaryText}
                </p>
              </div>
            </div>
          </motion.div>

          {/* ================= INSIGHTS GRID ================= */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-6 lg:grid-cols-3 mb-8"
          >
            {/* -------- DELAYS -------- */}
            <motion.div
              variants={cardVariants}
              className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-md">
                  <FiAlertCircle className="text-white" size={18} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Delayed Shipment Reasons
                </h3>
              </div>

              <div className="space-y-4 text-sm">
                {displayInsights.delayInsights.map((d, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 + 0.3 }}
                    className="flex justify-between items-start gap-3"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {d.reason}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {d.affectedShipments} shipments affected
                      </p>
                    </div>
                    <SeverityBadge severity={d.severity} />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* -------- FUEL -------- */}
            <motion.div
              variants={cardVariants}
              className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
                  <FiZap className="text-white" size={18} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Fuel Usage Trend
                </h3>
              </div>

              <div className="flex items-center gap-3 mb-3">
                {displayInsights.fuelInsight.trend === "INCREASED" ? (
                  <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                    <FiTrendingUp className="text-red-600" size={22} />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <FiTrendingDown className="text-emerald-600" size={22} />
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {displayInsights.fuelInsight.trend}
                  </p>
                  <p className="text-2xl font-extrabold text-gray-900">
                    +{displayInsights.fuelInsight.percentageChange}%
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg">
                {displayInsights.fuelInsight.reason}
              </p>
            </motion.div>

            {/* -------- DRIVERS -------- */}
            <motion.div
              variants={cardVariants}
              className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <FiUser className="text-white" size={18} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Driver Performance
                </h3>
              </div>

              <div className="space-y-4 text-sm">
                {displayInsights.driverInsights.map((d, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 + 0.3 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                      <FiUser className="text-gray-600" size={14} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {d.driverName}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                        {d.highlight}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* ================= COST SAVING ================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md">
                <FiDollarSign className="text-white" size={18} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Cost-Saving Suggestions
              </h3>
            </div>

            <div className="space-y-3 text-sm">
              {displayInsights.costSavingSuggestions.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.5 }}
                  className="flex items-start justify-between gap-4 p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/50 hover:border-emerald-300 transition-colors"
                >
                  <p className="text-gray-800 flex-1">{c.suggestion}</p>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${c.impactLevel === 'HIGH'
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}>
                    {c.impactLevel} IMPACT
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ================= ASK AI =================
          <AskSaarthiAI /> */}
        </div>
      </main>

      <AdminFooter />
    </>
  );
}
