import { useEffect, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiDownload,
  FiEye,
  FiSearch,
  FiFilter,
  FiX,
  FiCreditCard,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiDollarSign,
  FiTrendingUp,
} from "react-icons/fi";

import AdminNavbar from "../../components/AdminNavbar";
import AdminFooter from "../../components/AdminFooter";

/* ================= MOCK DATA ================= */
const MOCK_INVOICES = [
  {
    id: "INV-001",
    shipmentId: "SHP001",
    customerName: "Amazon",
    amount: 124000,
    currency: "INR",
    paymentStatus: "PENDING",
    transactionId: null,
    paymentDate: null,
    invoiceDate: "2026-01-10",
  },
  {
    id: "INV-002",
    shipmentId: "SHP002",
    customerName: "Flipkart",
    amount: 86000,
    currency: "INR",
    paymentStatus: "PAID",
    transactionId: "pay_Ls8kQ91",
    paymentDate: "2026-01-11",
    invoiceDate: "2026-01-09",
  },
];

/* ================= ANIMATION VARIANTS ================= */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
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

/* ================= BADGE ================= */
const StatusBadge = memo(({ status }) => {
  const config = {
    PAID: {
      bg: "bg-emerald-100/80",
      text: "text-emerald-700",
      border: "border-emerald-200",
      dot: "bg-emerald-500"
    },
    PENDING: {
      bg: "bg-amber-100/80",
      text: "text-amber-700",
      border: "border-amber-200",
      dot: "bg-amber-500",
      pulse: true
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
      {status}
    </span>
  );
});
StatusBadge.displayName = "StatusBadge";

/* ================= KPI CARD ================= */
const KpiCard = memo(({ icon: Icon, title, value, onClick, gradient, iconBg, trend, trendPositive }) => (
  <motion.div
    variants={cardVariants}
    whileHover={{
      y: -4,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    }}
    onClick={onClick}
    className="group relative bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl p-5 cursor-pointer 
               shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all duration-300 overflow-hidden"
  >
    {/* Background gradient decoration */}
    <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 blur-2xl 
                    group-hover:opacity-30 transition-opacity duration-500 ${gradient || 'bg-gray-200'}`} />

    {/* Icon */}
    <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center shadow-md
                    group-hover:scale-110 transition-transform duration-300 ${iconBg || 'bg-gray-100 text-gray-600'}`}>
      <Icon size={20} className="group-hover:animate-pulse" />
    </div>

    {/* Content */}
    <div className="relative mt-4">
      <p className="text-xs font-medium text-gray-500 tracking-wide">{title}</p>
      <div className="flex items-end gap-2 mt-1">
        <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-medium mb-1 px-1.5 py-0.5 rounded-full
                          ${trendPositive ? 'text-emerald-600 bg-emerald-100' : 'text-red-600 bg-red-100'}`}>
            <FiTrendingUp size={11} className={!trendPositive ? 'rotate-180' : ''} />
            {trend}
          </span>
        )}
      </div>
    </div>
  </motion.div>
));
KpiCard.displayName = "KpiCard";

/* ================= PAGE ================= */
export default function PaymentsBilling() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);

  const statusFilter = params.get("status");

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const queryParams = new URLSearchParams();
        
        if (statusFilter) {
          queryParams.append('status', statusFilter);
        }
        if (search) {
          queryParams.append('search', search);
        }

        const url = `http://localhost:5000/api/invoices${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        
        const response = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (data.success) {
          console.log('📊 Fetched invoices:', data.count);
          console.log('📋 Sample invoice data:', data.data[0]);

          // Map backend invoice data to frontend format
          const invoiceData = data.data.map(invoice => ({
            id: invoice.invoiceId,
            _id: invoice._id,
            shipmentId: invoice.shipmentId,
            shipmentObjectId: invoice.shipmentObjectId,
            customerName: invoice.customerName,
            amount: invoice.amount,
            currency: "INR",
            paymentStatus: invoice.status,
            transactionId: invoice.transactionId,
            paymentDate: invoice.paymentDate ? new Date(invoice.paymentDate).toISOString().split('T')[0] : null,
            invoiceDate: new Date(invoice.createdAt).toISOString().split('T')[0],
          }));

          console.log('✅ Total invoices:', invoiceData.length);
          console.log('💵 Total amount:', invoiceData.reduce((sum, i) => sum + i.amount, 0));

          setInvoices(invoiceData);
        } else {
          console.error('❌ Failed to fetch invoices:', data.message);
          setInvoices([]);
        }
      } catch (error) {
        console.error("❌ Error fetching invoices:", error);
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [search, statusFilter]);

  /* ================= KPI CALCULATIONS ================= */
  const totalInvoiced = invoices.reduce((sum, i) => sum + i.amount, 0);
  const pendingAmount = invoices
    .filter((i) => i.paymentStatus === "PENDING")
    .reduce((sum, i) => sum + i.amount, 0);
  const paidCount = invoices.filter((i) => i.paymentStatus === "PAID").length;
  const pendingCount = invoices.filter((i) => i.paymentStatus === "PENDING").length;

  /* ================= FILTER HANDLERS ================= */
  const applyStatusFilter = (status) => {
    setParams(status ? { status } : {});
  };

  return (
    <>
      <AdminNavbar />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 min-h-screen gradient-bg-mesh">
        {/* Decorative background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* ================= HEADER ================= */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Payments & Billing
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Monitor invoices, payments, and cash flow
            </p>
          </motion.div>

          {/* ================= KPI ROW ================= */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          >
            <KpiCard
              icon={FiDollarSign}
              title="Total Invoiced"
              value={`₹${(totalInvoiced / 1000).toFixed(0)}K`}
              gradient="bg-gradient-to-br from-blue-400 to-cyan-500"
              iconBg="bg-gradient-to-br from-blue-500 to-cyan-600 text-white"
              trend="+12%"
              trendPositive={true}
            />
            <KpiCard
              icon={FiClock}
              title="Pending Amount"
              value={`₹${(pendingAmount / 1000).toFixed(0)}K`}
              gradient="bg-gradient-to-br from-amber-400 to-orange-500"
              iconBg="bg-gradient-to-br from-amber-500 to-orange-600 text-white"
              onClick={() => applyStatusFilter("PENDING")}
            />
            <KpiCard
              icon={FiCheckCircle}
              title="Paid Invoices"
              value={paidCount}
              gradient="bg-gradient-to-br from-emerald-400 to-green-500"
              iconBg="bg-gradient-to-br from-emerald-500 to-green-600 text-white"
              onClick={() => applyStatusFilter("PAID")}
            />
            <KpiCard
              icon={FiAlertCircle}
              title="Pending Invoices"
              value={pendingCount}
              gradient="bg-gradient-to-br from-red-400 to-rose-500"
              iconBg="bg-gradient-to-br from-red-500 to-rose-600 text-white"
            />
          </motion.div>

          {/* ================= ACTION BAR ================= */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6"
          >
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoice / shipment / customer"
                className="pl-9 pr-4 py-2.5 bg-white/80 backdrop-blur-xl border border-gray-200 
                         rounded-xl text-sm placeholder:text-gray-400 
                         focus:outline-none focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f]
                         transition-all duration-300 w-full sm:w-80"
              />
            </div>

            <button className="flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-xl border border-gray-200 
                             rounded-xl text-sm font-medium hover:border-[#c6ac8f] hover:text-[#c6ac8f] transition-all">
              <FiFilter size={16} /> Filters
            </button>
          </motion.div>

          {/* ================= ACTIVE FILTER ================= */}
          <AnimatePresence>
            {statusFilter && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 mb-4 text-sm"
              >
                <span className="text-gray-500 font-medium">Active Filter:</span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100/80 text-amber-700 rounded-full border border-amber-200">
                  {statusFilter}
                  <FiX
                    className="cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => setParams({})}
                    size={14}
                  />
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ================= TABLE ================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
          >
            {loading ? (
              <div className="p-10 text-center">
                <div className="inline-block w-8 h-8 border-3 border-[#c6ac8f] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-400 mt-3">Loading invoices...</p>
              </div>
            ) : invoices.length === 0 ? (
              <div className="p-10 text-center text-sm text-gray-500">
                No invoices available.
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="min-w-full text-xs sm:text-sm">
                  <thead className="bg-gray-50/80 text-gray-600 border-b border-gray-200">
                    <tr>
                      <th className="px-2 py-2 sm:px-3 sm:py-3 text-left font-semibold">Invoice</th>
                      <th className="px-2 py-2 sm:px-3 sm:py-3 text-left font-semibold">Shipment</th>
                      <th className="px-2 py-2 sm:px-3 sm:py-3 text-left font-semibold hidden md:table-cell">Customer</th>
                      <th className="px-2 py-2 sm:px-3 sm:py-3 text-left font-semibold">Amount</th>
                      <th className="px-2 py-2 sm:px-3 sm:py-3 text-left font-semibold">Status</th>
                      <th className="px-2 py-2 sm:px-3 sm:py-3 text-left font-semibold hidden lg:table-cell">Transaction</th>
                      <th className="px-2 py-2 sm:px-3 sm:py-3 text-left font-semibold hidden lg:table-cell">Payment Date</th>
                      <th className="px-2 py-2 sm:px-3 sm:py-3 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <motion.tbody
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {invoices.map((inv) => (
                      <motion.tr
                        key={inv.id}
                        variants={rowVariants}
                        className="border-t border-gray-100 hover:bg-gray-50/80 cursor-pointer transition-colors duration-200"
                        onClick={() => navigate(`/admin/invoices/${inv.id}`)}
                      >
                        <td className="px-2 py-2 sm:px-3 sm:py-3 font-semibold text-gray-900">{inv.id}</td>
                        <td className="px-2 py-2 sm:px-3 sm:py-3 text-gray-700">{inv.shipmentId}</td>
                        <td className="px-2 py-2 sm:px-3 sm:py-3 text-gray-700 hidden md:table-cell">{inv.customerName}</td>
                        <td className="px-2 py-2 sm:px-3 sm:py-3 font-semibold text-gray-900">
                          ₹{inv.amount.toLocaleString()}
                        </td>
                        <td className="px-2 py-2 sm:px-3 sm:py-3">
                          <StatusBadge status={inv.paymentStatus} />
                        </td>
                        <td className="px-2 py-2 sm:px-3 sm:py-3 text-xs text-gray-500 font-mono hidden lg:table-cell">
                          {inv.transactionId ?? <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-2 py-2 sm:px-3 sm:py-3 text-gray-700 hidden lg:table-cell">
                          {inv.paymentDate ?? <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-2 py-2 sm:px-3 sm:py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-2 sm:gap-3 text-gray-400">
                            <FiEye
                              title="View Shipment"
                              className="cursor-pointer hover:text-[#c6ac8f] transition-colors"
                              onClick={() => navigate(`/admin/shipments/${inv.shipmentObjectId}`)}
                              size={16}
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
        </div>
      </main>

      <AdminFooter />
    </>
  );
}
