import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    HelpCircle,
    MessageSquare,
    Package,
    CreditCard,
    Clock,
    Send,
    Headphones,
    CheckCircle,
    AlertCircle,
} from "lucide-react";
import CustomerNavbar from "../../components/CustomerNavbar";
import CustomerFooter from "../../components/CustomerFooter";
import { submitSupportTicket } from "../../api/supportApi";

export default function CustomerSupport() {
    const [formData, setFormData] = useState({
        subject: "Shipment Issue",
        referenceId: "",
        message: ""
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [ticketId, setTicketId] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.message.trim()) {
            setError("Please describe your issue");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Get user info from localStorage
            const user = JSON.parse(localStorage.getItem("user"));
            const customerName = user?.name || "Guest";
            const email = user?.email || "guest@example.com";

            // Submit ticket
            const response = await submitSupportTicket({
                customerName,
                email,
                subject: formData.subject,
                message: formData.message,
                priority: "MEDIUM"
            });

            if (response.success) {
                setSuccess(true);
                setTicketId(response.data.ticketId);
                // Reset form
                setFormData({
                    subject: "Shipment Issue",
                    referenceId: "",
                    message: ""
                });
            }
        } catch (err) {
            console.error("Error submitting ticket:", err);
            setError(err.response?.data?.message || "Failed to submit request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <CustomerNavbar />
            
            {/* Main Container with Gradient Background */}
            <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 min-h-screen gradient-bg-mesh">
                {/* Animated Background Orbs */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#c6ac8f]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                </div>

                <div className="max-w-6xl mx-auto relative z-10 space-y-12">

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <span className="inline-flex items-center gap-2 mb-4 rounded-full bg-gradient-to-r from-[#c6ac8f]/20 to-[#b89a7f]/20 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-[#c6ac8f] border border-[#c6ac8f]/20 shadow-sm">
                            <Headphones size={18} />
                            Customer Support
                        </span>
                        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 tracking-tight">
                            We're here to <span className="bg-gradient-to-r from-[#c6ac8f] to-[#b89a7f] bg-clip-text text-transparent">help</span>
                        </h1>
                        <p className="mt-5 text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
                            Get help with shipments, payments, or any issues you're facing. Our support team is ready to assist you.
                        </p>
                    </motion.div>

                    {/* Quick Help Options */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        <HelpCard
                            icon={Package}
                            title="Shipment Issue"
                            description="Delay, tracking issue, or delivery concern"
                        />
                        <HelpCard
                            icon={CreditCard}
                            title="Payment Issue"
                            description="Invoice, payment failure, or refund"
                        />
                        <HelpCard
                            icon={MessageSquare}
                            title="General Query"
                            description="Any other questions or feedback"
                        />
                    </motion.div>

                    {/* Support Form + Info */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Support Form */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-2 rounded-3xl border border-gray-200/50 bg-white/80 backdrop-blur-xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c6ac8f] to-[#b89a7f] flex items-center justify-center shadow-md">
                                    <MessageSquare size={20} className="text-white" />
                                </div>
                                Raise a Support Request
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Success Message */}
                                <AnimatePresence>
                                    {success && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl flex items-start gap-3 shadow-sm"
                                        >
                                            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                                            <div>
                                                <p className="text-sm font-semibold text-green-800">Request submitted successfully!</p>
                                                <p className="text-xs text-green-700 mt-1">Ticket ID: <span className="font-mono font-bold">{ticketId}</span></p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Error Message */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl flex items-start gap-3 shadow-sm"
                                    >
                                        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                                        <p className="text-sm text-red-800 font-medium">{error}</p>
                                    </motion.div>
                                )}

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Issue Type
                                    </label>
                                    <select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-900 font-medium focus:outline-none focus:border-[#c6ac8f] focus:ring-2 focus:ring-[#c6ac8f]/20 transition-all shadow-sm"
                                    >
                                        <option>Shipment Issue</option>
                                        <option>Payment Issue</option>
                                        <option>General Query</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Related Shipment / Invoice ID (optional)
                                    </label>
                                    <input
                                        type="text"
                                        name="referenceId"
                                        value={formData.referenceId}
                                        onChange={handleChange}
                                        placeholder="e.g. SHP101 or INV-2041"
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#c6ac8f] focus:ring-2 focus:ring-[#c6ac8f]/20 transition-all shadow-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows="5"
                                        placeholder="Describe your issue briefly..."
                                        required
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#c6ac8f] focus:ring-2 focus:ring-[#c6ac8f]/20 transition-all resize-none shadow-sm"
                                    />
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    whileHover={{ scale: loading ? 1 : 1.02 }}
                                    whileTap={{ scale: loading ? 1 : 0.98 }}
                                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c6ac8f] to-[#b89a7f] px-8 py-4 text-white font-bold hover:shadow-lg hover:shadow-[#c6ac8f]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            Submit Request
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>

                        {/* Support Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="rounded-3xl border border-gray-200/50 bg-white/80 backdrop-blur-xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300"
                        >
                            <h2 className="mb-6 text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                                    <HelpCircle size={20} className="text-white" />
                                </div>
                                What happens next?
                            </h2>

                            <div className="space-y-4">
                                <InfoItem
                                    icon={HelpCircle}
                                    text="Your request is reviewed by our support team."
                                />
                                <InfoItem
                                    icon={Clock}
                                    text="Most issues are resolved within 24 hours."
                                />
                                <InfoItem
                                    icon={MessageSquare}
                                    text="You'll receive updates directly on your dashboard."
                                />
                            </div>
                        </motion.div>
                    </div>

                </div>
            </main>
            <CustomerFooter />
        </>
    );
}

/* ---------- COMPONENTS ---------- */

function HelpCard({ icon: Icon, title, description }) {
    return (
        <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="rounded-3xl border border-gray-200/50 bg-white/80 backdrop-blur-xl p-7 shadow-lg hover:shadow-2xl transition-all duration-300 group"
        >
            <div className="mb-5 rounded-2xl bg-gradient-to-br from-[#c6ac8f]/20 to-[#b89a7f]/20 p-4 w-fit group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <Icon size={28} className="text-[#c6ac8f]" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2.5">{title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </motion.div>
    );
}

function InfoItem({ icon: Icon, text }) {
    return (
        <div className="flex items-start gap-4 rounded-2xl bg-gradient-to-r from-gray-50 to-white px-5 py-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c6ac8f]/20 to-[#b89a7f]/20 flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-[#c6ac8f]" />
            </div>
            <p className="text-sm text-gray-700 leading-relaxed font-medium">{text}</p>
        </div>
    );
}
