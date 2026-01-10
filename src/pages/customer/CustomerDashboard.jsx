import { motion } from "framer-motion";
import { Package, MapPin, Clock, CreditCard, TrendingUp, Plus, Calendar, MessageSquare, PenTool, Weight, DollarSign } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import SignatureCanvas from "react-signature-canvas";
import CustomerNavbar from "../../components/CustomerNavbar";
import CustomerFooter from "../../components/CustomerFooter";
import { toast, Toaster } from "react-hot-toast";
import { shipmentAPI, epodAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

/* ================= SOCKET ================= */
const socket = io("http://localhost:5000");


export default function CustomerDashboard() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [signatureModalOpen, setSignatureModalOpen] = useState(false);
    const [selectedShipmentForSignature, setSelectedShipmentForSignature] = useState(null);
    const [customerProfile, setCustomerProfile] = useState(null);
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // Fetch customer profile and shipments on mount
    useEffect(() => {
        fetchCustomerProfile();
        fetchShipments();
    }, []);

    // Listen for real-time shipment updates
    useEffect(() => {
        socket.on('shipment-status-updated', (data) => {
            console.log('📢 Customer Dashboard received status update:', data);
            // Update shipment in list
            setShipments(prev => prev.map(s =>
                s._id === data.shipmentId || s.referenceId === data.referenceId
                    ? { ...s, status: data.status }
                    : s
            ));
        });

        return () => {
            socket.off('shipment-status-updated');
        };
    }, []);

    const fetchShipments = async () => {
        try {
            setLoading(true);
            const response = await shipmentAPI.getAll({});

            if (response.data && response.data.length > 0) {
                // Filter shipments for this customer
                const userId = user?._id || user?.id;
                const customerShipments = response.data.filter(s => {
                    const matchesCustomerId = s.customerId && (s.customerId === userId || s.customerId._id === userId);
                    const matchesCustomerName = !s.customerId && s.customerName === user?.name;
                    const matchesCustomer = matchesCustomerId || matchesCustomerName;
                    const isVisible = s.customerId || s.status !== 'PENDING';
                    return matchesCustomer && isVisible;
                });
                setShipments(customerShipments);
            }
        } catch (error) {
            console.error("Error fetching shipments:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomerProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/auth/me", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setCustomerProfile(data.data);
            }
        } catch (error) {
            console.error("Error fetching customer profile:", error);
        }
    };

    const handleRequestSubmit = async (formData) => {
        try {
            const token = localStorage.getItem("token");

            // Include customer profile information
            const requestData = {
                ...formData,
                customerId: customerProfile?._id,
                customerName: customerProfile?.name,
                customerEmail: customerProfile?.email
            };

            console.log('📤 CustomerDashboard - Submitting request with data:', requestData);
            console.log('👤 Customer Profile:', customerProfile);
            console.log('📝 Customer Name being sent:', requestData.customerName);

            const response = await fetch("http://localhost:5000/api/delivery-requests", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Delivery request submitted successfully! Admin will review it soon.", {
                    duration: 4000,
                    position: "top-center",
                    style: {
                        background: "#10b981",
                        color: "#fff",
                        fontWeight: "600"
                    }
                });
            } else {
                throw new Error(data.message || "Failed to submit request");
            }
        } catch (error) {
            toast.error(error.message || "Failed to submit request. Please try again.", {
                duration: 4000,
                position: "top-center",
                style: {
                    background: "#ef4444",
                    color: "#fff",
                    fontWeight: "600"
                }
            });
            throw error;
        }
    };

    return (
        <>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        zIndex: 9999,
                        marginTop: '80px',
                    },
                }}
                containerStyle={{
                    zIndex: 9999,
                    top: '80px',
                }}
            />
            <CustomerNavbar />

            {/* Gradient Background */}
            <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 min-h-screen gradient-bg-mesh">
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto relative z-10 space-y-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center">
                        <span className="inline-block mb-3 rounded-full bg-white/80 backdrop-blur-xl border border-[#c6ac8f]/20 px-4 py-2 text-sm font-semibold text-[#c6ac8f] shadow-sm">
                            Your Deliveries
                        </span>
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
                            Track your shipments easily
                        </h1>
                        <p className="mt-3 text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
                            See where your packages are, expected delivery times, and pending payments — all in one place.
                        </p>
                    </motion.div>

                    {/* Quick Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <SummaryCard
                            icon={Package}
                            title="Active Shipments"
                            value={shipments.filter(s => s.status === 'IN_TRANSIT' || s.status === 'PENDING').length.toString()}
                            subtitle="Currently on the way"
                            gradient="from-blue-500 to-indigo-600"
                        />
                        <SummaryCard
                            icon={Clock}
                            title="Next Delivery"
                            value={shipments.length > 0 && shipments[0].eta ? new Date(shipments[0].eta).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                            subtitle={shipments.length > 0 ? `${shipments[0].source} → ${shipments[0].destination}` : 'No active shipments'}
                            gradient="from-orange-500 to-amber-600"
                        />
                        <SummaryCard
                            icon={CreditCard}
                            title="Total Shipments"
                            value={shipments.length.toString()}
                            subtitle="All time deliveries"
                            gradient="from-emerald-500 to-green-600"
                        />
                    </div>

                    {/* Main Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Shipment List */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-2 rounded-2xl border border-white/40 bg-white/80 backdrop-blur-xl p-6 sm:p-8 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Your Active Shipments
                                </h2>
                                <TrendingUp className="text-[#c6ac8f]" size={24} />
                            </div>

                            <div className="space-y-4">
                                {loading ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block w-8 h-8 border-4 border-[#c6ac8f] border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-gray-600 mt-2">Loading shipments...</p>
                                    </div>
                                ) : shipments.length > 0 ? (
                                    shipments.slice(0, 5).map(shipment => (
                                        <ShipmentRow
                                            key={shipment._id}
                                            shipment={shipment}
                                            onSignClick={(ship) => {
                                                setSelectedShipmentForSignature(ship);
                                                setSignatureModalOpen(true);
                                            }}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <Package className="mx-auto text-gray-300" size={48} />
                                        <p className="text-gray-600 mt-2">No active shipments</p>
                                    </div>
                                )}
                            </div>

                        </motion.div>

                        {/* Delivery Updates */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="rounded-2xl border border-white/40 bg-white/80 backdrop-blur-xl p-6 sm:p-8 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all"
                        >
                            <h2 className="mb-6 text-2xl font-bold text-gray-900">
                                Delivery Updates
                            </h2>

                            <div className="space-y-4 text-sm text-gray-700">
                                <InfoItem text="All shipments are moving as planned." />
                                <InfoItem text="No delays detected for today." />
                                <InfoItem text="You will be notified before delivery." />
                            </div>
                        </motion.div>
                    </div>

                    {/* Request Delivery Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="rounded-2xl border border-white/40 bg-white/80 backdrop-blur-xl p-6 sm:p-8 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className=" text-2xl font-bold text-gray-900">
                                        Request New Delivery
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Need to ship something? Submit a delivery request for admin approval
                                    </p>
                                </div>
                                <Package className="text-[#c6ac8f]" size={24} />
                            </div>

                            <button
                                onClick={() => setIsModalOpen(!isModalOpen)}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-[#c6ac8f] to-[#a08060] text-white font-bold text-lg hover:from-[#a08060] hover:to-[#8a6a50] transition-all shadow-lg shadow-[#c6ac8f]/30 hover:shadow-xl hover:scale-[1.02]"
                            >
                                <Plus size={24} />
                                {isModalOpen ? "Cancel Request" : "Create Delivery Request"}
                            </button>

                            {/* Inline Request Form */}
                            <motion.div
                                initial={false}
                                animate={{
                                    height: isModalOpen ? "auto" : 0,
                                    opacity: isModalOpen ? 1 : 0,
                                    marginTop: isModalOpen ? 24 : 0
                                }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden"
                            >
                                <InlineRequestForm onSubmit={handleRequestSubmit} />
                            </motion.div>
                        </div>
                    </motion.div>

                </div>
            </main>

            {/* Signature Modal */}
            {signatureModalOpen && selectedShipmentForSignature && (
                <SignatureModal
                    shipment={selectedShipmentForSignature}
                    onClose={() => {
                        setSignatureModalOpen(false);
                        setSelectedShipmentForSignature(null);
                    }}
                    onSuccess={() => {
                        setSignatureModalOpen(false);
                        setSelectedShipmentForSignature(null);
                        fetchShipments(); // Refresh shipments
                        toast.success("Delivery confirmed successfully!", {
                            duration: 4000,
                            position: "top-center",
                            style: {
                                background: "#10b981",
                                color: "#fff",
                                fontWeight: "600"
                            }
                        });
                    }}
                />
            )}

            <CustomerFooter />
        </>
    );
}

/* ---------- COMPONENTS ---------- */


function SummaryCard({ icon: Icon, title, value, subtitle, gradient = "from-[#c6ac8f] to-[#a08060]" }) {
    // Map gradient prop to iconBg classes
    const gradientMap = {
        "from-blue-500 to-indigo-600": "bg-gradient-to-br from-blue-500 to-indigo-600 text-white",
        "from-orange-500 to-amber-600": "bg-gradient-to-br from-orange-500 to-amber-600 text-white",
        "from-emerald-500 to-green-600": "bg-gradient-to-br from-emerald-500 to-green-600 text-white",
    };

    const bgGradientMap = {
        "from-blue-500 to-indigo-600": "bg-gradient-to-br from-blue-500/20 to-indigo-600/20",
        "from-orange-500 to-amber-600": "bg-gradient-to-br from-orange-500/20 to-amber-600/20",
        "from-emerald-500 to-green-600": "bg-gradient-to-br from-emerald-500/20 to-green-600/20",
    };

    const iconBg = gradientMap[gradient] || "bg-gradient-to-br from-[#c6ac8f] to-[#a08060] text-white";
    const bgGradient = bgGradientMap[gradient] || "bg-gradient-to-br from-[#c6ac8f]/20 to-[#a08060]/20";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{
                y: -6,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
            }}
            transition={{ type: "spring", stiffness: 300 }}
            className="group relative bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all duration-300 overflow-hidden"
        >
            {/* Background gradient decoration */}
            <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 blur-2xl 
                            group-hover:opacity-30 transition-opacity duration-500 ${bgGradient}`} />

            {/* Icon container with gradient */}
            <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center shadow-md
                            group-hover:scale-110 transition-transform duration-300 ${iconBg}`}>
                <Icon size={22} className="group-hover:animate-pulse" />
            </div>

            {/* Content */}
            <div className="relative mt-4">
                <h4 className="text-sm font-medium text-gray-500 tracking-wide">
                    {title}
                </h4>

                <div className="flex items-end gap-2 mt-1">
                    <p className="text-3xl font-bold text-gray-900 tracking-tight">
                        {value}
                    </p>
                </div>

                <p className="mt-1.5 text-xs text-gray-400 font-medium">{subtitle}</p>
            </div>
        </motion.div>
    );
}


function ShipmentRow({ shipment, onSignClick }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'IN_TRANSIT': return 'blue';
            case 'DELIVERED': return 'green';
            case 'AWAITING_CUSTOMER_SIGNATURE': return 'orange';
            default: return 'yellow';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'IN_TRANSIT': return 'In Transit';
            case 'DELIVERED': return 'Delivered';
            case 'AWAITING_CUSTOMER_SIGNATURE': return 'Awaiting Signature';
            default: return 'Pending';
        }
    };

    const statusColor = getStatusColor(shipment.status);
    const statusText = getStatusText(shipment.status);

    const colorMap = {
        blue: "bg-blue-50 text-blue-700 border-blue-200",
        green: "bg-green-50 text-green-700 border-green-200",
        yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
        orange: "bg-orange-50 text-orange-700 border-orange-200",
    };

    return (
        <motion.div
            whileHover={{ x: 4 }}
            className="rounded-xl border border-gray-100 bg-gray-50 p-5 hover:bg-gray-100 transition-colors"
        >
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="font-bold text-gray-900 text-lg">{shipment.referenceId}</p>
                    <p className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <MapPin size={16} className="text-[#c6ac8f]" /> {shipment.source} → {shipment.destination}
                    </p>
                </div>

                <div className="text-right">
                    <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold border ${colorMap[statusColor]}`}>
                        {statusText}
                    </span>
                    <p className="flex items-center justify-end gap-1 text-sm text-gray-500 mt-2">
                        <Clock size={14} /> {shipment.eta ? new Date(shipment.eta).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
                    </p>
                </div>
            </div>

            {/* Sign for Delivery Button */}
            {shipment.status === 'AWAITING_CUSTOMER_SIGNATURE' && (
                <motion.button
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => onSignClick(shipment)}
                    className="mt-4 w-full py-3 bg-[#c6ac8f] text-white font-bold rounded-xl hover:bg-[#b59a7f] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#c6ac8f]/20"
                >
                    <PenTool size={18} />
                    Sign for Delivery
                </motion.button>
            )}
        </motion.div>
    );
}

function InfoItem({ text }) {
    return (
        <div className="rounded-xl bg-gray-50 px-5 py-4 border border-gray-100">
            <p className="text-sm text-gray-700">{text}</p>
        </div>
    );
}

function InlineRequestForm({ onSubmit }) {
    const [formData, setFormData] = useState({
        shipmentDetails: "",
        source: "",
        destination: "",
        pickupDate: "",
        estimatedPickupTime: "",
        approximateLoad: "",
        priceRange: "",
        message: ""
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.shipmentDetails.trim()) {
            newErrors.shipmentDetails = "Shipment details are required";
        }
        if (!formData.source.trim()) {
            newErrors.source = "Source location is required";
        }
        if (!formData.destination.trim()) {
            newErrors.destination = "Destination location is required";
        }
        if (!formData.pickupDate) {
            newErrors.pickupDate = "Pickup date is required";
        } else {
            const selectedDate = new Date(formData.pickupDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                newErrors.pickupDate = "Pickup date cannot be in the past";
            }
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            setFormData({
                shipmentDetails: "",
                source: "",
                destination: "",
                pickupDate: "",
                estimatedPickupTime: "",
                approximateLoad: "",
                priceRange: "",
                message: ""
            });
            setErrors({});
        } catch (error) {
            console.error("Error submitting request:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="rounded-2xl border-2 border-[#c6ac8f]/30 bg-gradient-to-br from-[#c6ac8f]/5 to-white p-8 shadow-lg">
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Package className="text-[#c6ac8f]" />
                    New Delivery Request
                </h3>
                <p className="text-sm text-gray-600 mt-1">Fill in the details below to submit your delivery request</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Shipment Details */}
                    <div className="md:col-span-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <Package size={16} className="text-[#c6ac8f]" />
                            Shipment Details *
                        </label>
                        <input
                            type="text"
                            name="shipmentDetails"
                            value={formData.shipmentDetails}
                            onChange={handleChange}
                            placeholder="e.g., 10 boxes of electronics"
                            className={`w-full px-4 py-3 rounded-xl border ${errors.shipmentDetails ? "border-red-300 bg-red-50" : "border-gray-200"
                                } focus:outline-none focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f] transition-all`}
                        />
                        {errors.shipmentDetails && (
                            <p className="text-xs text-red-600 mt-1">{errors.shipmentDetails}</p>
                        )}
                    </div>

                    {/* Source */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <MapPin size={16} className="text-[#c6ac8f]" />
                            Source Location *
                        </label>
                        <input
                            type="text"
                            name="source"
                            value={formData.source}
                            onChange={handleChange}
                            placeholder="e.g., Mumbai Warehouse"
                            className={`w-full px-4 py-3 rounded-xl border ${errors.source ? "border-red-300 bg-red-50" : "border-gray-200"
                                } focus:outline-none focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f] transition-all`}
                        />
                        {errors.source && (
                            <p className="text-xs text-red-600 mt-1">{errors.source}</p>
                        )}
                    </div>

                    {/* Destination */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <MapPin size={16} className="text-[#c6ac8f]" />
                            Destination Location *
                        </label>
                        <input
                            type="text"
                            name="destination"
                            value={formData.destination}
                            onChange={handleChange}
                            placeholder="e.g., Pune Office"
                            className={`w-full px-4 py-3 rounded-xl border ${errors.destination ? "border-red-300 bg-red-50" : "border-gray-200"
                                } focus:outline-none focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f] transition-all`}
                        />
                        {errors.destination && (
                            <p className="text-xs text-red-600 mt-1">{errors.destination}</p>
                        )}
                    </div>

                    {/* Pickup Date */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <Calendar size={16} className="text-[#c6ac8f]" />
                            Pickup Date *
                        </label>
                        <input
                            type="date"
                            name="pickupDate"
                            value={formData.pickupDate}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                            className={`w-full px-4 py-3 rounded-xl border ${errors.pickupDate ? "border-red-300 bg-red-50" : "border-gray-200"
                                } focus:outline-none focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f] transition-all`}
                        />
                        {errors.pickupDate && (
                            <p className="text-xs text-red-600 mt-1">{errors.pickupDate}</p>
                        )}
                    </div>

                    {/* Estimated Pickup Time */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <Clock size={16} className="text-[#c6ac8f]" />
                            Estimated Pickup Time
                        </label>
                        <input
                            type="time"
                            name="estimatedPickupTime"
                            value={formData.estimatedPickupTime}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f] transition-all"
                        />
                    </div>

                    {/* Approximate Load */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <Weight size={16} className="text-[#c6ac8f]" />
                            Approximate Load
                        </label>
                        <input
                            type="text"
                            name="approximateLoad"
                            value={formData.approximateLoad}
                            onChange={handleChange}
                            placeholder="e.g., 500 kg"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f] transition-all"
                        />
                    </div>

                    {/* Suitable Price Range */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <DollarSign size={16} className="text-[#c6ac8f]" />
                            Suitable Price Range
                        </label>
                        <input
                            type="text"
                            name="priceRange"
                            value={formData.priceRange}
                            onChange={handleChange}
                            placeholder="e.g., ₹5,000 - ₹10,000"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f] transition-all"
                        />
                    </div>

                    {/* Message */}
                    <div className="md:col-span-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <MessageSquare size={16} className="text-[#c6ac8f]" />
                            Additional Message (Optional)
                        </label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Any special instructions or notes..."
                            rows={3}
                            maxLength={500}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f] transition-all resize-none"
                        />
                        <p className="text-xs text-gray-400 mt-1 text-right">
                            {formData.message.length}/500
                        </p>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-lg hover:from-emerald-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 hover:shadow-xl"
                    >
                        {isSubmitting ? "Submitting Request..." : "Submit Delivery Request"}
                    </button>
                </div>
            </form>
        </div>
    );
}

/* ================= SIGNATURE MODAL ================= */
function SignatureModal({ shipment, onClose, onSuccess }) {
    const sigRef = useRef();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const submitSignature = async () => {
        if (sigRef.current.isEmpty()) {
            setError("Please sign before submitting");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Get signature as base64 image
            const signatureImage = sigRef.current.toDataURL("image/png");

            console.log("=== Submitting EPOD Signature ===");
            console.log("Shipment ID:", shipment._id);
            console.log("Signature length:", signatureImage.length);

            const response = await epodAPI.submitSignature(shipment._id, {
                signatureImage
            });

            console.log("EPOD Response:", response);

            if (response.success) {
                onSuccess();
            } else {
                setError(response.message || "Failed to submit signature");
            }
        } catch (err) {
            console.error("=== EPOD Submission Error ===");
            console.error("Full error:", err);
            console.error("Error response:", err.response);
            console.error("Error message:", err.message);
            setError(err.response?.data?.message || err.message || "Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-2xl border border-gray-200"
            >
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 mb-3 rounded-full bg-[#c6ac8f]/10 px-4 py-2 text-sm font-medium text-[#c6ac8f]">
                        <PenTool size={16} />
                        Electronic Signature
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Confirm Delivery
                    </h2>
                    <p className="text-gray-600">
                        Shipment: {shipment.referenceId}
                    </p>
                    <p className="text-sm text-gray-500">
                        {shipment.source} → {shipment.destination}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
                    >
                        <Package className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                        <p className="text-sm text-red-800">{error}</p>
                    </motion.div>
                )}

                {/* Signature Canvas */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Your Signature
                    </label>
                    <div className="border-2 border-gray-300 rounded-xl overflow-hidden bg-gray-50">
                        <SignatureCanvas
                            ref={sigRef}
                            penColor="black"
                            canvasProps={{
                                width: 600,
                                height: 250,
                                className: "w-full h-auto cursor-crosshair",
                            }}
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Draw your signature in the box above
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all font-medium text-gray-700"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={() => sigRef.current.clear()}
                        className="px-6 py-3 rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all font-medium text-gray-700"
                    >
                        Clear
                    </button>

                    <button
                        onClick={submitSignature}
                        disabled={loading}
                        className="flex-1 px-6 py-3 rounded-xl bg-[#c6ac8f] text-white font-bold hover:bg-[#b59a7f] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#c6ac8f]/20"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Package size={18} />
                                Confirm Delivery
                            </>
                        )}
                    </button>
                </div>

                {/* Info */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-900">
                        <strong>Note:</strong> By signing, you confirm that you have received the shipment
                        in good condition. This signature will be stored as proof of delivery.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
