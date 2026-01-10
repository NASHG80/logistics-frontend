import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiDownload,
  FiDollarSign,
  FiPackage,
  FiMapPin,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiFileText,
  FiAlertCircle,
} from "react-icons/fi";

import AdminNavbar from "../../components/AdminNavbar";
import AdminFooter from "../../components/AdminFooter";


/* ---------------- ANIMATION VARIANTS ---------------- */
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/* ---------------- BADGES ---------------- */
const StatusBadge = ({ status }) => {
  const config = {
    PAID: { 
      bg: "bg-emerald-100", 
      text: "text-emerald-700", 
      border: "border-emerald-200",
      icon: FiCheckCircle,
      iconColor: "text-emerald-600"
    },
    PENDING: { 
      bg: "bg-amber-100", 
      text: "text-amber-700", 
      border: "border-amber-200",
      icon: FiClock,
      iconColor: "text-amber-600"
    },
    FAILED: { 
      bg: "bg-red-100", 
      text: "text-red-700", 
      border: "border-red-200",
      icon: FiClock,
      iconColor: "text-red-600"
    },
  };

  const style = config[status] || config.PENDING;
  const Icon = style.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${style.bg} ${style.text} ${style.border} shadow-sm`}>
      <Icon size={14} className={style.iconColor} />
      {status}
    </span>
  );
};

/* ---------------- PAGE ---------------- */
export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/invoices/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setInvoice(data.data);
      } else {
        setError(data.message || "Failed to load invoice");
      }
    } catch (err) {
      console.error("Error fetching invoice:", err);
      setError("Failed to load invoice details");
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = () => {
    // Create HTML content for the invoice
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice ${invoice.invoiceId}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background: #f5f5f5; }
          .invoice-container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; border-bottom: 3px solid #c6ac8f; padding-bottom: 20px; }
          .company-info h1 { color: #c6ac8f; font-size: 28px; margin-bottom: 5px; }
          .company-info p { color: #666; font-size: 14px; }
          .invoice-info { text-align: right; }
          .invoice-info h2 { color: #333; font-size: 24px; margin-bottom: 10px; }
          .invoice-info p { color: #666; font-size: 14px; margin: 5px 0; }
          .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-top: 10px; }
          .status-paid { background: #d1fae5; color: #065f46; }
          .status-pending { background: #fef3c7; color: #92400e; }
          .details-section { margin: 30px 0; }
          .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .detail-item { padding: 15px; background: #f9fafb; border-radius: 8px; }
          .detail-label { color: #6b7280; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
          .detail-value { color: #111827; font-size: 16px; font-weight: 600; }
          .amount-section { background: linear-gradient(135deg, #c6ac8f 0%, #a08060 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0; }
          .amount-label { font-size: 14px; opacity: 0.9; margin-bottom: 10px; }
          .amount-value { font-size: 48px; font-weight: bold; }
          .shipment-section { background: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0; }
          .shipment-section h3 { color: #111827; font-size: 18px; margin-bottom: 15px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
          @media print { body { padding: 0; background: white; } .invoice-container { box-shadow: none; } }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="company-info">
              <h1>SaarthiAI</h1>
              <p>Logistics & Transportation</p>
              <p>Email: support@saarthiai.com</p>
              <p>Phone: +91 1234567890</p>
            </div>
            <div class="invoice-info">
              <h2>INVOICE</h2>
              <p><strong>Invoice ID:</strong> ${invoice.invoiceId}</p>
              <p><strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}</p>
              <span class="status-badge status-${invoice.status.toLowerCase()}">${invoice.status}</span>
            </div>
          </div>

          <div class="details-section">
            <h3 style="color: #111827; font-size: 18px; margin-bottom: 15px;">Bill To:</h3>
            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">Customer Name</div>
                <div class="detail-value">${invoice.customerName}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Shipment ID</div>
                <div class="detail-value">${invoice.shipment?.referenceId || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div class="amount-section">
            <div class="amount-label">Total Amount</div>
            <div class="amount-value">₹${invoice.amount.toLocaleString()}</div>
          </div>

          <div class="shipment-section">
            <h3>Shipment Details</h3>
            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">Route</div>
                <div class="detail-value">${invoice.shipment?.source || 'N/A'} → ${invoice.shipment?.destination || 'N/A'}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Shipment Status</div>
                <div class="detail-value">${invoice.shipment?.status?.replace('_', ' ') || 'N/A'}</div>
              </div>
              ${invoice.transactionId ? `
              <div class="detail-item">
                <div class="detail-label">Transaction ID</div>
                <div class="detail-value" style="font-size: 12px; word-break: break-all;">${invoice.transactionId}</div>
              </div>
              ` : ''}
              ${invoice.paymentDate ? `
              <div class="detail-item">
                <div class="detail-label">Payment Date</div>
                <div class="detail-value">${new Date(invoice.paymentDate).toLocaleDateString()}</div>
              </div>
              ` : ''}
            </div>
          </div>

          <div class="footer">
            <p><strong>Thank you for your business!</strong></p>
            <p>This is a computer-generated invoice and does not require a signature.</p>
            <p>For any queries, please contact us at support@saarthiai.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create a Blob from the HTML content
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${invoice.invoiceId}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 min-h-screen gradient-bg-mesh">
          <div className="max-w-5xl mx-auto flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-[#c6ac8f] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading invoice details...</p>
            </div>
          </div>
        </main>
        <AdminFooter />
      </>
    );
  }

  if (error || !invoice) {
    return (
      <>
        <AdminNavbar />
        <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 min-h-screen gradient-bg-mesh">
          <div className="max-w-5xl mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#c6ac8f] mb-6 transition-colors"
            >
              <FiArrowLeft /> Back
            </button>
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
              <FiAlertCircle className="mx-auto text-red-500 mb-4" size={48} />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Invoice</h2>
              <p className="text-gray-600 mb-4">{error || "Invoice not found"}</p>
              <button
                onClick={fetchInvoice}
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
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
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
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Invoice {invoice.invoiceId}
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Billing & payment details
            </p>
          </motion.div>

          {/* ================= SUMMARY ================= */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm"
          >
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Invoice Amount</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₹{invoice.amount.toLocaleString()}
                </p>
              </div>

              <StatusBadge status={invoice.status} />
            </div>

            <div className="grid sm:grid-cols-3 gap-6 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <FiCreditCard className="text-purple-600" size={18} />
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Transaction ID</p>
                  <p className="font-semibold text-gray-900 font-mono text-xs break-all">
                    {invoice.transactionId || <span className="text-gray-400">—</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FiClock className="text-blue-600" size={18} />
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Payment Date</p>
                  <p className="font-semibold text-gray-900">
                    {invoice.paymentDate ? new Date(invoice.paymentDate).toLocaleDateString() : <span className="text-gray-400">Not paid yet</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <FiFileText className="text-indigo-600" size={18} />
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Customer Name</p>
                  <p className="font-semibold text-gray-900">
                    {invoice.customerName}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ================= SHIPMENT CONTEXT ================= */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                <FiPackage className="text-white" size={18} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                Shipment Context
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Shipment ID</p>
                <button
                  onClick={() =>
                    navigate(`/admin/shipments/${invoice.shipment?._id}`)
                  }
                  className="font-semibold text-[#c6ac8f] hover:underline"
                >
                  {invoice.shipment?.referenceId || 'N/A'}
                </button>
              </div>

              <div>
                <p className="text-gray-500 mb-1">Customer</p>
                <p className="font-semibold text-gray-900">{invoice.shipment?.customerName || invoice.customerName}</p>
              </div>

              <div>
                <p className="text-gray-500 mb-1">Route</p>
                <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                  <FiMapPin size={14} className="text-emerald-600" />
                  {invoice.shipment?.source || 'N/A'} → {invoice.shipment?.destination || 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-gray-500 mb-1">Shipment Status</p>
                <p className="font-semibold text-gray-900">{invoice.shipment?.status?.replace("_", " ") || 'N/A'}</p>
              </div>
            </div>
          </motion.div>

          {/* ================= ACTIONS ================= */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-3 justify-end"
          >
            <button
              onClick={downloadInvoice}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-xl border border-gray-200 
                       rounded-xl text-sm font-medium hover:border-[#c6ac8f] hover:text-[#c6ac8f] 
                       transition-all duration-300"
            >
              <FiDownload size={16} />
              Download Invoice
            </button>

            <button
              onClick={() =>
                navigate(`/admin/shipments/${invoice.shipment?._id}`)
              }
              className="px-5 py-2.5 bg-gradient-to-r from-[#c6ac8f] to-[#a08060] text-white 
                       rounded-xl text-sm font-medium shadow-md shadow-[#c6ac8f]/30
                       hover:shadow-lg hover:shadow-[#c6ac8f]/40 transition-all duration-300
                       hover:scale-105"
            >
              Go to Shipment
            </button>
          </motion.div>
        </div>
      </main>

      <AdminFooter />
    </>
  );
}
