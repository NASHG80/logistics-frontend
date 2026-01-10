import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMessageSquare,
  FiLoader,
  FiAlertCircle,
  FiMap,
  FiTruck,
  FiDollarSign,
  FiSend,
  FiCpu,
  FiCheckCircle,
  FiZap,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

/* ================= MOCK AI RESPONSE ================= */
const MOCK_AI_RESPONSE = {
  status: "ATTENTION NEEDED",
  confidence: 85,
  basedOn: "Today's shipment & fleet data",

  findings: [
    "3 shipments delayed near Mumbai",
    "Traffic congestion on NH48",
    "Vehicle MH12 AB 1234 affected",
  ],

  impact: [
    "Average ETA increased by 1.4 hrs",
    "Fuel cost up by 6% today",
  ],

  actions: [
    "Reroute delayed vehicles",
    "Notify customers proactively",
    "Monitor fuel usage on NH48",
  ],
};

/* ================= SUGGESTED QUESTIONS ================= */
const SUGGESTED_QUESTIONS = [
  "Why are shipments delayed today?",
  "Which route is costing the most?",
  "Any driver performance issues?",
  "How can we reduce fuel cost?",
];

/* ================= COMPONENT ================= */
export default function AskSaarthiAI() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  /* ================= ASK HANDLER ================= */
  const handleAsk = () => {
    if (!query.trim()) return;

    setLoading(true);
    setResponse(null);

    // Simulate AI processing
    setTimeout(() => {
      setResponse(MOCK_AI_RESPONSE);
      setLoading(false);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="mt-10"
    >
      {/* ================= ASK INPUT ================= */}
      <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
            <FiCpu className="text-white" size={18} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Ask SaarthiAI</h3>
        </div>

        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-200 focus-within:border-[#c6ac8f] focus-within:ring-2 focus-within:ring-[#c6ac8f]/20 transition-all">
          <FiMessageSquare className="text-gray-400 flex-shrink-0" size={20} />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            disabled={loading}
            placeholder="Ask about operations, delays, fuel costs, driver performance..."
            className="flex-1 text-sm bg-transparent outline-none disabled:opacity-50"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAsk}
            disabled={loading || !query.trim()}
            className="px-4 py-2 bg-gradient-to-r from-[#c6ac8f] to-[#a08060] text-white rounded-lg 
                     text-sm font-medium shadow-md shadow-[#c6ac8f]/30
                     hover:shadow-lg hover:shadow-[#c6ac8f]/40 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                     flex items-center gap-2"
          >
            <FiSend size={14} />
            Ask
          </motion.button>
        </div>

        {/* ================= SUGGESTED QUESTIONS ================= */}
        <AnimatePresence>
          {!response && !loading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <p className="text-xs font-medium text-gray-500 mb-3">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <motion.button
                    key={q}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setQuery(q)}
                    className="px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg 
                             hover:border-[#c6ac8f] hover:text-[#c6ac8f] hover:bg-gray-50
                             transition-all duration-200"
                  >
                    {q}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ================= LOADER ================= */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <FiLoader className="animate-spin text-purple-600" size={18} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Analyzing operational data...</p>
                <p className="text-xs text-gray-500 mt-0.5">Processing your query with AI</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= AI RESPONSE ================= */}
      <AnimatePresence>
        {response && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-lg text-sm"
          >
            {/* Header */}
            <div className="flex items-start gap-3 mb-6 pb-5 border-b border-gray-200">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <FiAlertCircle className="text-amber-600" size={20} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-amber-700 flex items-center gap-2">
                  AI Status: {response.status}
                </p>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <FiZap size={12} />
                  Based on: {response.basedOn}
                </p>
              </div>
            </div>

            {/* Key Findings */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-5 p-4 rounded-xl bg-blue-50 border border-blue-200"
            >
              <p className="font-bold mb-3 text-gray-900 flex items-center gap-2">
                <span className="text-blue-600">🔍</span> Key Findings
              </p>
              <ul className="space-y-2 text-gray-700">
                {response.findings.map((f, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.2 }}
                    className="flex items-start gap-2"
                  >
                    <FiCheckCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={14} />
                    <span>{f}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Impact */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-200"
            >
              <p className="font-bold mb-3 text-gray-900 flex items-center gap-2">
                <span className="text-amber-600">📊</span> Impact
              </p>
              <ul className="space-y-2 text-gray-700">
                {response.impact.map((imp, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 + 0.3 }}
                    className="flex items-start gap-2"
                  >
                    <FiAlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={14} />
                    <span>{imp}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200"
            >
              <p className="font-bold mb-3 text-gray-900 flex items-center gap-2">
                <span className="text-emerald-600">✅</span> Recommended Actions
              </p>
              <ul className="space-y-2 text-gray-700">
                {response.actions.map((a, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.4 }}
                    className="flex items-start gap-2"
                  >
                    <FiCheckCircle className="text-emerald-600 flex-shrink-0 mt-0.5" size={14} />
                    <span>{a}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Confidence */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-6 p-4 rounded-xl bg-gray-50"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-600">Confidence Level</p>
                <p className="text-xs font-bold text-gray-900">{response.confidence}%</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${response.confidence}%` }}
                  transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[#c6ac8f] to-[#a08060]"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Generated using today's operational data
              </p>
            </motion.div>

            {/* ================= FOLLOW-UP ACTIONS ================= */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <p className="text-xs font-medium text-gray-500 mb-3">Quick Actions:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => navigate("/admin/shipments?filter=delayed")}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg 
                           hover:border-[#c6ac8f] hover:text-[#c6ac8f] hover:bg-gray-50 transition-all duration-200"
                >
                  <FiMap size={14} />
                  View Affected Shipments
                </button>

                <button
                  onClick={() => navigate("/admin/tracking")}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg 
                           hover:border-[#c6ac8f] hover:text-[#c6ac8f] hover:bg-gray-50 transition-all duration-200"
                >
                  <FiTruck size={14} />
                  Open Fleet Map
                </button>

                <button
                  onClick={() => navigate("/admin/payments")}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg 
                           hover:border-[#c6ac8f] hover:text-[#c6ac8f] hover:bg-gray-50 transition-all duration-200"
                >
                  <FiDollarSign size={14} />
                  Go to Payments
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
