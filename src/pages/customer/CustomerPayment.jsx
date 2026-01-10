import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, FileText, CheckCircle, AlertCircle, Shield, Zap } from "lucide-react";
import { useLocation } from "react-router-dom";
import CustomerNavbar from "../../components/CustomerNavbar";
import CustomerFooter from "../../components/CustomerFooter";
import { getCustomerInvoices, markInvoiceAsPaid } from "../../api/invoiceApi";

export default function CustomerPayments() {
    const [pendingInvoices, setPendingInvoices] = useState([]);
    const [paidInvoices, setPaidInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const location = useLocation();

    // Load invoices on mount
    useEffect(() => {
        fetchInvoices();
    }, []);

    // Check for shipmentId in URL and auto-open modal
    useEffect(() => {
        if (pendingInvoices.length > 0 && !loading) {
            const params = new URLSearchParams(location.search);
            const shipmentId = params.get('shipmentId');

            if (shipmentId) {
                // Find the invoice for this shipment
                const invoice = pendingInvoices.find(inv => inv.shipmentId === shipmentId);
                if (invoice) {
                    // Auto-open the payment modal
                    setTimeout(() => {
                        handlePayNow(invoice);
                    }, 500);
                }
            }
        }
    }, [pendingInvoices, loading, location.search]);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem("user"));
            const customerName = user?.name;

            if (!customerName) {
                setError("Customer name not found");
                return;
            }

            // Fetch pending invoices
            const pendingResponse = await getCustomerInvoices(customerName, "PENDING");
            setPendingInvoices(pendingResponse.data || []);

            // Fetch paid invoices
            const paidResponse = await getCustomerInvoices(customerName, "PAID");
            setPaidInvoices(paidResponse.data || []);
        } catch (err) {
            console.error("Error fetching invoices:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    const handlePayNow = (invoice) => {
        setSelectedInvoice(invoice);
        setShowPaymentModal(true);
    };

    const handleClosePayment = (shouldRefresh = false) => {
        setShowPaymentModal(false);
        setSelectedInvoice(null);
        if (shouldRefresh) {
            fetchInvoices(); // Refresh the invoice list
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <CustomerNavbar />
            <div className="max-w-6xl mx-auto px-8 py-10 space-y-12">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <span className="inline-flex items-center gap-2 mb-4 rounded-full bg-[#c6ac8f]/10 px-4 py-2 text-sm font-medium text-[#c6ac8f]">
                        <Shield size={16} />
                        Secure Payments
                    </span>
                    <h1 className="text-5xl font-bold text-gray-900">
                        Manage your payments securely
                    </h1>
                    <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-lg">
                        View invoices, pay securely, and track your payment history with full transparency.
                    </p>
                </motion.div>

                {/* Pending Invoices */}
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Loading invoices...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-red-500">Error: {error}</p>
                    </div>
                ) : pendingInvoices.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12 rounded-2xl border border-gray-200 bg-gray-50"
                    >
                        <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
                        <p className="text-gray-600">You have no pending invoices at the moment.</p>
                    </motion.div>
                ) : (
                    pendingInvoices.map((invoice, index) => (
                        <motion.div
                            key={invoice._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-3">

                                {/* Invoice Details */}
                                <div className="lg:col-span-2 p-8 space-y-6">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Pending Invoice
                                    </h2>

                                    <div className="grid grid-cols-2 gap-6">
                                        <DetailItem label="Invoice ID" value={invoice.invoiceId} />
                                        <DetailItem label="Shipment ID" value={invoice.shipmentId} />
                                        <DetailItem label="Amount" value={formatCurrency(invoice.amount)} highlight />
                                        <DetailItem label="Due Date" value={formatDate(invoice.dueDate)} urgent />
                                    </div>

                                    <div className="flex items-center gap-3 rounded-xl bg-[#c6ac8f]/5 border border-[#c6ac8f]/20 px-5 py-4 text-sm text-gray-700">
                                        <FileText size={18} className="text-[#c6ac8f]" />
                                        <span className="font-medium">Invoice generated after successful delivery</span>
                                    </div>
                                </div>

                                {/* Pay Action */}
                                <div className="bg-gray-50 p-8 flex flex-col justify-center items-start gap-5 border-l border-gray-200">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-2">Payable Amount</p>
                                        <p className="text-4xl font-bold text-gray-900">{formatCurrency(invoice.amount)}</p>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handlePayNow(invoice)}
                                        className="w-full rounded-xl bg-[#c6ac8f] px-6 py-4 text-white font-semibold hover:bg-[#b89d7f] transition-colors flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <Zap size={18} />
                                        Pay Now
                                    </motion.button>

                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Shield size={14} className="text-[#c6ac8f]" />
                                        Secure payments powered by Razorpay
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}

                {/* Payment History */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow"
                >
                    <h2 className="mb-6 text-2xl font-bold text-gray-900">
                        Payment History
                    </h2>

                    <div className="space-y-4">
                        {paidInvoices.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No payment history yet</p>
                        ) : (
                            paidInvoices.map((invoice) => (
                                <HistoryRow
                                    key={invoice._id}
                                    invoice={invoice.invoiceId}
                                    amount={formatCurrency(invoice.amount)}
                                    status="Paid"
                                    date={formatDate(invoice.paymentDate)}
                                />
                            ))
                        )}
                    </div>
                </motion.div>

            </div>
            <CustomerFooter />

            {/* Payment Modal */}
            {showPaymentModal && selectedInvoice && (
                <RazorpayModal
                    invoice={selectedInvoice}
                    onClose={handleClosePayment}
                    formatCurrency={formatCurrency}
                />
            )}
        </div>
    );
}

/* ---------- COMPONENTS ---------- */

function SummaryCard({ icon: Icon, title, value, subtitle }) {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-[#c6ac8f]/10 p-3">
                    <Icon size={20} className="text-[#c6ac8f]" />
                </div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
            </div>

            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
        </motion.div>
    );
}

function DetailItem({ label, value, highlight, urgent }) {
    return (
        <div>
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className={`font-bold text-lg ${highlight ? "text-[#c6ac8f]" :
                urgent ? "text-red-600" :
                    "text-gray-900"
                }`}>
                {value}
            </p>
        </div>
    );
}

function HistoryRow({ invoice, amount, status, date }) {
    const paid = status === "Paid";

    return (
        <motion.div
            whileHover={{ x: 4 }}
            className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-5 hover:bg-gray-100 transition-colors"
        >
            <div>
                <p className="font-bold text-gray-900 text-lg">{invoice}</p>
                <p className="text-sm text-gray-500 mt-1">{date}</p>
            </div>

            <div className="flex items-center gap-6">
                <p className="text-lg font-semibold text-gray-900">{amount}</p>
                <span className={`rounded-full px-4 py-1.5 text-xs font-semibold border ${paid
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
                    }`}>
                    {status}
                </span>
            </div>
        </motion.div>
    );
}

function RazorpayModal({ invoice, onClose, formatCurrency }) {
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [processing, setProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const handlePayment = async () => {
        setProcessing(true);
        try {
            await markInvoiceAsPaid(invoice.invoiceId);
            setPaymentSuccess(true);
            // Close modal and refresh after 2 seconds
            setTimeout(() => {
                onClose(true); // Pass true to indicate payment was successful
            }, 2000);
        } catch (error) {
            console.error("Payment failed:", error);
            notify.error("Payment failed. Please try again.");
            setProcessing(false);
        }
    };

    if (paymentSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 pt-20"
            >
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                        <CheckCircle className="text-green-600" size={48} />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                    <p className="text-gray-600 mb-4">Your payment has been processed successfully.</p>
                    <p className="text-sm text-gray-500">Amount: {formatCurrency(invoice.amount)}</p>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 pt-20"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="bg-white border-b border-gray-200 p-5 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Complete Payment</h2>
                        <p className="text-sm text-gray-500 mt-1">Powered by Razorpay</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto flex-1">

                    {/* Amount Section */}
                    <div className="bg-gradient-to-r from-[#c6ac8f] to-[#b89968] p-6 text-white">
                        <p className="text-sm opacity-90">Amount to Pay</p>
                        <p className="text-4xl font-bold mt-1">{formatCurrency(invoice.amount)}</p>
                        <p className="text-sm opacity-75 mt-2">Invoice: {invoice.invoiceId}</p>
                    </div>

                    {/* Payment Methods */}
                    <div className="p-6 space-y-6">
                        {/* Method Tabs */}
                        <div className="flex gap-2 border-b border-gray-200">
                            <button
                                onClick={() => setPaymentMethod('card')}
                                className={`px-4 py-2 font-medium transition-colors ${paymentMethod === 'card'
                                    ? 'text-[#c6ac8f] border-b-2 border-[#c6ac8f]'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Card
                            </button>
                            <button
                                onClick={() => setPaymentMethod('upi')}
                                className={`px-4 py-2 font-medium transition-colors ${paymentMethod === 'upi'
                                    ? 'text-[#c6ac8f] border-b-2 border-[#c6ac8f]'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                UPI
                            </button>
                            <button
                                onClick={() => setPaymentMethod('netbanking')}
                                className={`px-4 py-2 font-medium transition-colors ${paymentMethod === 'netbanking'
                                    ? 'text-[#c6ac8f] border-b-2 border-[#c6ac8f]'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Net Banking
                            </button>
                        </div>

                        {/* Card Payment Form */}
                        {paymentMethod === 'card' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Card Number
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="1234 5678 9012 3456"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c6ac8f] focus:border-transparent outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Expiry Date
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="MM/YY"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c6ac8f] focus:border-transparent outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            CVV
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="123"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c6ac8f] focus:border-transparent outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Cardholder Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="JOHN DOE"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c6ac8f] focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* UPI Payment */}
                        {paymentMethod === 'upi' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        UPI ID
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="yourname@upi"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c6ac8f] focus:border-transparent outline-none"
                                    />
                                </div>
                                <div className="text-center py-6">
                                    <div className="inline-block p-4 bg-gray-100 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-2">Scan QR Code</p>
                                        <div className="w-32 h-32 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                                            <p className="text-xs text-gray-400">QR Code</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Net Banking */}
                        {paymentMethod === 'netbanking' && (
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Your Bank
                                </label>
                                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c6ac8f] focus:border-transparent outline-none">
                                    <option>Select Bank</option>
                                    <option>State Bank of India</option>
                                    <option>HDFC Bank</option>
                                    <option>ICICI Bank</option>
                                    <option>Axis Bank</option>
                                    <option>Kotak Mahindra Bank</option>
                                </select>
                            </div>
                        )}

                        {/* Pay Button */}
                        <motion.button
                            whileHover={{ scale: processing ? 1 : 1.02 }}
                            whileTap={{ scale: processing ? 1 : 0.98 }}
                            onClick={handlePayment}
                            disabled={processing}
                            className="w-full bg-gradient-to-r from-[#c6ac8f] to-[#b89968] text-white font-semibold py-4 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Shield size={20} />
                                    Pay {formatCurrency(invoice.amount)}
                                </>
                            )}
                        </motion.button>

                        {/* Security Badge */}
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                            <Shield size={14} className="text-green-600" />
                            <span>Secured by 256-bit SSL encryption</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
