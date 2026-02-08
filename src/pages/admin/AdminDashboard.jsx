import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
    FiTruck,
    FiAlertCircle,
    FiCreditCard,
    FiCheckCircle,
    FiCpu,
    FiArrowRight,
    FiTrendingUp,
    FiActivity,
    FiClock,
    FiPackage,
    FiMapPin,
    FiCheck,
    FiX
} from "react-icons/fi";
import AdminNavbar from "../../components/AdminNavbar";
import AdminFooter from "../../components/AdminFooter";
import { toast, Toaster } from "react-hot-toast";
import { io } from "socket.io-client";

/* Leaflet */
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

/* ---------------- FIX LEAFLET ICON PATH ---------------- */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ---------------- CUSTOM STATUS MARKERS ---------------- */
const createIcon = (color) =>
    new L.DivIcon({
        className: "custom-marker",
        html: `
          <div style="
            background:${color};
            width:14px;
            height:14px;
            border-radius:50%;
            border:2px solid white;
            box-shadow:0 0 0 4px ${color}33, 0 2px 8px rgba(0,0,0,0.2);
          "></div>
        `,
    });

const markerIcons = {
    "On Time": createIcon("#22c55e"),
    "At Risk": createIcon("#f59e0b"),
    "Delayed": createIcon("#ef4444"),
};

/* ---------------- ANIMATION VARIANTS ---------------- */
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.5, ease: "easeOut" },
    },
};

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

/* ---------------- KPI CARD (ENHANCED) ---------------- */
const KpiCard = ({
    icon: Icon,
    title,
    value,
    sub,
    gradient,
    iconBg,
    onClick,
    cta,
    trend,
    trendPositive,
    delay = 0,
}) => (
    <motion.div
        variants={cardVariants}
        whileHover={{
            y: -6,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
        }}
        onClick={onClick}
        className="group relative bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl p-5 cursor-pointer 
                   shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
        {/* Background gradient decoration */}
        <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 blur-2xl 
                        group-hover:opacity-30 transition-opacity duration-500 ${gradient || 'bg-gray-200'}`} />

        {/* Icon container with gradient */}
        <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center shadow-md
                        group-hover:scale-110 transition-transform duration-300 ${iconBg || 'bg-gray-100 text-gray-600'}`}>
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
                {trend && (
                    <span className={`flex items-center gap-0.5 text-xs font-medium mb-1 px-1.5 py-0.5 rounded-full
                                    ${trendPositive ? 'text-emerald-600 bg-emerald-100' : 'text-red-600 bg-red-100'}`}>
                        <FiTrendingUp size={12} className={!trendPositive ? 'rotate-180' : ''} />
                        {trend}
                    </span>
                )}
            </div>

            {sub && (
                <p className="mt-1.5 text-xs text-gray-400 font-medium">{sub}</p>
            )}
        </div>

        {cta && (
            <div className="relative mt-4 pt-3 border-t border-gray-100">
                <p className="flex items-center gap-1 text-xs font-semibold text-[#c6ac8f] 
                            group-hover:text-[#a08060] transition-colors">
                    {cta}
                    <FiArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </p>
            </div>
        )}
    </motion.div>
);

/* ---------------- VEHICLE DATA ---------------- */
const vehicles = [
    { id: "MH12 AB 1234", position: [18.5204, 73.8567], status: "On Time" },
    { id: "DL01 CD 5678", position: [19.076, 72.8777], status: "Delayed" },
    { id: "KA05 EF 9101", position: [12.9716, 77.5946], status: "At Risk" },
];

/* ---------------- STATUS BADGE COMPONENT ---------------- */
const StatusBadge = ({ status, color, pulseColor }) => (
    <span className="flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur rounded-full text-xs font-medium text-gray-700 shadow-sm">
        <span className={`relative w-2.5 h-2.5 ${color} rounded-full`}>
            <span className={`absolute inset-0 ${pulseColor} rounded-full animate-ping opacity-75`} />
        </span>
        {status}
    </span>
);

/* ---------------- ADMIN DASHBOARD ---------------- */
export default function AdminDashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const delayedCount = vehicles.filter(v => v.status === "Delayed").length;
    const [pendingRequests, setPendingRequests] = useState([]);
    const [processingRequest, setProcessingRequest] = useState(null);
    const [shipmentStats, setShipmentStats] = useState({
        total: 0,
        pending: 0,
        inTransit: 0,
        delivered: 0,
        highRisk: 0
    });
    const [vehicleStats, setVehicleStats] = useState({
        total: 0,
        active: 0,
        idle: 0,
        maintenance: 0
    });
    const [pendingPayments, setPendingPayments] = useState(0);
    const [supportTickets, setSupportTickets] = useState([]);
    const pendingRequestsRef = useRef(null);

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const currentTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    // Fetch pending requests, shipment stats, vehicle stats, and pending payments
    useEffect(() => {
        fetchPendingRequests();
        fetchShipmentStats();
        fetchVehicleStats();
        fetchPendingPayments();
        fetchSupportTickets();
    }, []);

    // Scroll to pending requests section if navigated from notification
    useEffect(() => {
        if (location.state?.scrollToRequests && pendingRequestsRef.current) {
            setTimeout(() => {
                pendingRequestsRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);
        }
    }, [location.state]);

    // Socket.IO for real-time updates
    useEffect(() => {
        const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        const socket = io(SOCKET_URL);

        socket.on("delivery-request-created", () => {
            fetchPendingRequests();
        });

        socket.on("delivery-request-updated", () => {
            fetchPendingRequests();
        });

        socket.on("shipment-status-updated", () => {
            fetchShipmentStats();
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const fetchPendingRequests = async () => {
        try {
            const token = localStorage.getItem("token");
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_URL}/delivery-requests/pending`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setPendingRequests(data.data);
            }
        } catch (error) {
            console.error("Error fetching pending requests:", error);
        }
    };

    const fetchShipmentStats = async () => {
        try {
            const token = localStorage.getItem("token");
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_URL}/shipments/stats`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setShipmentStats(data.data);
            }
        } catch (error) {
            console.error("Error fetching shipment stats:", error);
        }
    };

    const fetchVehicleStats = async () => {
        try {
            const token = localStorage.getItem("token");
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_URL}/vehicles/stats`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setVehicleStats(data.data);
            }
        } catch (error) {
            console.error("Error fetching vehicle stats:", error);
        }
    };

    const fetchPendingPayments = async () => {
        try {
            const token = localStorage.getItem("token");
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_URL}/invoices?status=PENDING`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                // Calculate total pending amount
                const totalPending = data.data.reduce((sum, invoice) => sum + invoice.amount, 0);
                setPendingPayments(totalPending);
            }
        } catch (error) {
            console.error("Error fetching pending payments:", error);
        }
    };

    const fetchSupportTickets = async () => {
        try {
            const token = localStorage.getItem("token");
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_URL}/support?status=OPEN`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                // Get latest 5 tickets
                setSupportTickets(data.data.slice(0, 5));
            }
        } catch (error) {
            console.error("Error fetching support tickets:", error);
        }
    };

    const handleApprove = async (requestId) => {
        notify.confirm("Are you sure you want to approve this delivery request? This will create a new shipment.", async () => {
            setProcessingRequest(requestId);
            try {
                const token = localStorage.getItem("token");
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const response = await fetch(`${API_URL}/delivery-requests/${requestId}/approve`, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                const data = await response.json();

                if (data.success) {
                    toast.success("Request approved! Shipment created successfully.", {
                        duration: 4000,
                        position: "top-center",
                        style: {
                            background: "#10b981",
                            color: "#fff",
                            fontWeight: "600"
                        }
                    });
                    fetchPendingRequests();
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                toast.error(error.message || "Failed to approve request", {
                    duration: 4000,
                    position: "top-center"
                });
            } finally {
                setProcessingRequest(null);
            }
        });
    };

    const handleReject = async (requestId) => {
        const reason = window.prompt("Please provide a reason for rejection (optional):");
        if (reason === null) return; // User cancelled

        setProcessingRequest(requestId);
        try {
            const token = localStorage.getItem("token");
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_URL}/delivery-requests/${requestId}/reject`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ reason: reason || "No reason provided" })
            });
            const data = await response.json();

            if (data.success) {
                toast.success("Request rejected successfully.", {
                    duration: 4000,
                    position: "top-center",
                    style: {
                        background: "#ef4444",
                        color: "#fff",
                        fontWeight: "600"
                    }
                });
                fetchPendingRequests();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            toast.error(error.message || "Failed to reject request", {
                duration: 4000,
                position: "top-center"
            });
        } finally {
            setProcessingRequest(null);
        }
    };

    return (
        <>
            <Toaster />
            <AdminNavbar />

            <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 min-h-screen relative z-0 gradient-bg-mesh">
                {/* Decorative background elements */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    {/* ================= HEADER ================= */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-8"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                                    Admin Dashboard
                                </h1>
                                <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                                    <FiActivity size={14} className="text-[#c6ac8f]" />
                                    Real-time operational overview & AI-powered insights
                                </p>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/70 backdrop-blur rounded-full shadow-sm">
                                    <FiClock size={14} />
                                    {currentTime}
                                </span>
                                <span className="hidden sm:block px-3 py-1.5 bg-white/70 backdrop-blur rounded-full shadow-sm">
                                    {currentDate}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* ================= KPI CARDS ================= */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                    >
                        <KpiCard
                            icon={FiTruck}
                            title="Total Shipments"
                            value={shipmentStats.total.toString()}
                            sub={`${shipmentStats.inTransit} In Transit / ${shipmentStats.pending} Pending`}
                            gradient="bg-gradient-to-br from-amber-400 to-orange-500"
                            iconBg="bg-gradient-to-br from-[#c6ac8f] to-[#a08060] text-white"
                            onClick={() => navigate("/admin/shipments")}
                        />

                        <KpiCard
                            icon={FiTruck}
                            title="Vehicles On Road"
                            value={vehicleStats.active.toString()}
                            sub="Currently Active"
                            gradient="bg-gradient-to-br from-emerald-400 to-green-500"
                            iconBg="bg-gradient-to-br from-emerald-500 to-green-600 text-white"
                            onClick={() => navigate("/admin/tracking")}
                        />

                        <KpiCard
                            icon={FiCreditCard}
                            title="Pending Payments"
                            value={`₹${pendingPayments >= 100000 ? (pendingPayments / 100000).toFixed(2) + 'L' : (pendingPayments / 1000).toFixed(0) + 'K'}`}
                            sub="Awaiting Clearance"
                            gradient="bg-gradient-to-br from-amber-400 to-yellow-500"
                            iconBg="bg-gradient-to-br from-amber-500 to-yellow-600 text-white"
                            cta="Review invoices"
                            onClick={() => navigate("/admin/payments")}
                        />

                        <KpiCard
                            icon={FiCheckCircle}
                            title="On-Time Delivery"
                            value="92%"
                            sub="Today's Performance"
                            gradient="bg-gradient-to-br from-emerald-400 to-teal-500"
                            iconBg="bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
                            onClick={() => navigate("/admin/ai-insights")}
                            trend="+4%"
                            trendPositive={true}
                        />
                    </motion.div>

                    {/* ================= MAIN CONTENT ================= */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="mt-8 grid gap-6 lg:grid-cols-3"
                    >
                        {/* ========== LIVE MAP ================= */}
                        <motion.div
                            variants={fadeInUp}
                            className="lg:col-span-2 bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl 
                                      shadow-lg shadow-gray-200/50 overflow-hidden relative z-0"
                        >
                            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                            Live Fleet Map
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {delayedCount} vehicle{delayedCount !== 1 ? 's' : ''} currently delayed
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => navigate("/admin/tracking")}
                                        className="text-xs font-medium text-[#c6ac8f] hover:text-[#a08060] 
                                                  flex items-center gap-1 transition-colors"
                                    >
                                        Full Map <FiArrowRight size={12} />
                                    </button>
                                </div>

                                {/* Status Legend */}
                                <div className="flex flex-wrap gap-2 mt-4">
                                    <StatusBadge status="On Time" color="bg-green-500" pulseColor="bg-green-400" />
                                    <StatusBadge status="At Risk" color="bg-amber-500" pulseColor="bg-amber-400" />
                                    <StatusBadge status="Delayed" color="bg-red-500" pulseColor="bg-red-400" />
                                </div>
                            </div>

                            <div className="h-[320px] sm:h-[380px] lg:h-[400px]">
                                <MapContainer
                                    center={[20.5937, 78.9629]}
                                    zoom={5}
                                    scrollWheelZoom={false}
                                    className="h-full w-full"
                                >
                                    <TileLayer
                                        attribution="&copy; OpenStreetMap contributors & CartoDB"
                                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                    />

                                    {vehicles.map((v) => (
                                        <Marker
                                            key={v.id}
                                            position={v.position}
                                            icon={markerIcons[v.status]}
                                        >
                                            <Popup>
                                                <div className="text-center">
                                                    <strong className="text-gray-900">{v.id}</strong>
                                                    <br />
                                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium
                                                        ${v.status === 'On Time' ? 'bg-green-100 text-green-700' :
                                                            v.status === 'At Risk' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-red-100 text-red-700'}`}>
                                                        {v.status}
                                                    </span>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>
                            </div>
                        </motion.div>

                        {/* ========== SUPPORT REQUESTS ================= */}
                        <motion.div
                            variants={fadeInUp}
                            className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl 
                                      shadow-lg shadow-gray-200/50 flex flex-col overflow-hidden"
                        >
                            {/* Header */}
                            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-[#c6ac8f]/5 to-blue-50/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c6ac8f] to-blue-400 
                                                  flex items-center justify-center shadow-lg shadow-[#c6ac8f]/30">
                                        <FiAlertCircle className="text-white" size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900">
                                            Support Requests
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            Recent customer tickets
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Support Tickets List */}
                            <div className="p-5 flex-1 space-y-3 max-h-[400px] overflow-y-auto">
                                {supportTickets.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <FiCheckCircle className="text-gray-300 mb-3" size={48} />
                                        <p className="text-sm text-gray-500 font-medium">No open support tickets</p>
                                        <p className="text-xs text-gray-400 mt-1">All customer requests have been resolved</p>
                                    </div>
                                ) : (
                                    supportTickets.map((ticket) => (
                                        <div
                                            key={ticket._id}
                                            className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 hover:bg-gray-100/80 
                                                     hover:border-[#c6ac8f]/30 transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-gray-900 group-hover:text-[#c6ac8f] transition-colors">
                                                        {ticket.customerName}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {ticket.ticketId} • {ticket.email}
                                                    </p>
                                                </div>
                                                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                                                    {ticket.status}
                                                </span>
                                            </div>
                                            <p className="text-xs font-medium text-gray-700 mb-1">
                                                {ticket.subject}
                                            </p>
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {ticket.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {new Date(ticket.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>


                        </motion.div>
                    </motion.div>

                    {/* ================= PENDING DELIVERY REQUESTS ================= */}
                    {pendingRequests.length > 0 && (
                        <motion.div
                            ref={pendingRequestsRef}
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                            className="mt-8 bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl 
                                      shadow-lg shadow-gray-200/50 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-amber-50/50 to-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                            <FiPackage className="text-[#c6ac8f]" />
                                            Pending Delivery Requests
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Review and approve customer delivery requests
                                        </p>
                                    </div>
                                    <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                                        {pendingRequests.length} Pending
                                    </span>
                                </div>
                            </div>

                            {/* Requests List */}
                            <div className="p-6 space-y-4">
                                {pendingRequests.map((request) => (
                                    <motion.div
                                        key={request._id}
                                        whileHover={{ scale: 1.01 }}
                                        className="p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 
                                                  hover:border-[#c6ac8f]/30 hover:shadow-md transition-all"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                            {/* Request Info */}
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-lg">
                                                            {request.customerName}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-0.5">
                                                            Request ID: {request.requestId}
                                                        </p>
                                                    </div>
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                                        New
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div className="flex items-start gap-2">
                                                        <FiPackage size={16} className="text-[#c6ac8f] mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-xs text-gray-500 font-medium">Shipment Details</p>
                                                            <p className="text-sm text-gray-900">{request.shipmentDetails}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-2">
                                                        <FiMapPin size={16} className="text-[#c6ac8f] mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-xs text-gray-500 font-medium">Route</p>
                                                            <p className="text-sm text-gray-900">
                                                                {request.source} → {request.destination}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-2">
                                                        <FiClock size={16} className="text-[#c6ac8f] mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-xs text-gray-500 font-medium">Pickup Date</p>
                                                            <p className="text-sm text-gray-900">
                                                                {new Date(request.pickupDate).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {request.estimatedPickupTime && (
                                                        <div className="flex items-start gap-2">
                                                            <FiClock size={16} className="text-[#c6ac8f] mt-0.5 flex-shrink-0" />
                                                            <div>
                                                                <p className="text-xs text-gray-500 font-medium">Pickup Time</p>
                                                                <p className="text-sm text-gray-900">{request.estimatedPickupTime}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {request.approximateLoad && (
                                                        <div className="flex items-start gap-2">
                                                            <FiPackage size={16} className="text-[#c6ac8f] mt-0.5 flex-shrink-0" />
                                                            <div>
                                                                <p className="text-xs text-gray-500 font-medium">Approximate Load</p>
                                                                <p className="text-sm text-gray-900">{request.approximateLoad}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {request.priceRange && (
                                                        <div className="flex items-start gap-2">
                                                            <FiActivity size={16} className="text-[#c6ac8f] mt-0.5 flex-shrink-0" />
                                                            <div>
                                                                <p className="text-xs text-gray-500 font-medium">Price Range</p>
                                                                <p className="text-sm text-gray-900">{request.priceRange}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {request.message && (
                                                        <div className="flex items-start gap-2">
                                                            <FiActivity size={16} className="text-[#c6ac8f] mt-0.5 flex-shrink-0" />
                                                            <div>
                                                                <p className="text-xs text-gray-500 font-medium">Message</p>
                                                                <p className="text-sm text-gray-900">{request.message}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex lg:flex-col gap-3">
                                                <button
                                                    onClick={() => {
                                                        console.log('🚀 AdminDashboard - Navigating with request:', request);
                                                        console.log('👤 Customer Name:', request.customerName);
                                                        console.log('👤 Customer ID:', request.customerId);
                                                        navigate('/admin/shipments/create', {
                                                            state: {
                                                                prefillData: {
                                                                    customerName: request.customerName,
                                                                    customerId: request.customerId?._id || request.customerId,
                                                                    source: request.source,
                                                                    destination: request.destination,
                                                                    pickupDate: request.pickupDate,
                                                                    estimatedPickupTime: request.estimatedPickupTime,
                                                                    approximateLoad: request.approximateLoad,
                                                                    priceRange: request.priceRange,
                                                                    shipmentDetails: request.shipmentDetails,
                                                                    message: request.message,
                                                                    requestId: request._id
                                                                }
                                                            }
                                                        });
                                                    }}
                                                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 
                                                             bg-gradient-to-r from-[#c6ac8f] to-[#a08060] text-white rounded-xl 
                                                             font-semibold hover:from-[#a08060] hover:to-[#8a6a50] 
                                                             transition-all shadow-lg shadow-[#c6ac8f]/30"
                                                >
                                                    <FiPackage size={18} />
                                                    Create Shipment
                                                </button>
                                                <button
                                                    onClick={() => handleReject(request._id)}
                                                    disabled={processingRequest === request._id}
                                                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 
                                                             bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl 
                                                             font-semibold hover:from-red-600 hover:to-rose-700 
                                                             transition-all shadow-lg shadow-red-500/30 
                                                             disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <FiX size={18} />
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>

            <AdminFooter />
        </>
    );
}
