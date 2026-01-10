import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
    FiMenu,
    FiX,
    FiBell,
    FiUser,
    FiLogOut,
    FiTruck,
    FiPackage,
    FiMapPin,
    FiClock
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminNavbar() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);

    const linkClass =
        "text-sm font-medium text-gray-700 hover:text-[#c6ac8f] transition";

    // Fetch pending requests
    useEffect(() => {
        fetchPendingRequests();
    }, []);

    // Socket.IO for real-time updates
    useEffect(() => {
        const socket = io("http://localhost:5000");

        socket.on("delivery-request-created", (data) => {
            console.log("New delivery request:", data);
            fetchPendingRequests();
        });

        socket.on("delivery-request-updated", (data) => {
            console.log("Request updated:", data);
            fetchPendingRequests();
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const fetchPendingRequests = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/delivery-requests/pending", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setPendingRequests(data.data);
                setNotificationCount(data.count);
            }
        } catch (error) {
            console.error("Error fetching pending requests:", error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const closeMobileMenu = () => {
        setShowMobileMenu(false);
    };

    return (
        <nav className="fixed top-0 w-full bg-white border-b border-gray-200 shadow-sm z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

                {/* ================= LEFT SECTION ================= */}
                <div className="flex items-center gap-4">

                    {/* Mobile Hamburger Toggle */}
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="md:hidden text-gray-700 hover:text-[#c6ac8f] transition"
                    >
                        {showMobileMenu ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>

                    {/* Logo */}
                    <NavLink to="/admin/dashboard" className="flex items-center gap-2.5 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c6ac8f] to-[#b89a7f] flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                            <FiTruck className="text-white" size={22} />
                        </div>
                        <span className="text-xl font-bold text-gray-900">
                            Saarthi<span className="text-[#c6ac8f]">AI</span>
                        </span>
                    </NavLink>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-8 ml-10">
                        <NavLink to="/admin/dashboard" className={linkClass}>
                            Dashboard
                        </NavLink>
                        <NavLink to="/admin/shipments" className={linkClass}>
                            Shipments
                        </NavLink>
                        <NavLink to="/admin/tracking" className={linkClass}>
                            Live Tracking
                        </NavLink>
                        <NavLink to="/admin/payments" className={linkClass}>
                            Payments
                        </NavLink>
                        <NavLink to="/admin/ai-insights" className={linkClass}>
                            AI Insights
                        </NavLink>
                        <NavLink to="/admin/chatbot" className={linkClass}>
                            Chatbot
                        </NavLink>
                    </div>
                </div>

                {/* ================= RIGHT SECTION ================= */}
                <div className="flex items-center gap-3 sm:gap-5">

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative text-gray-700 hover:text-[#c6ac8f] transition"
                        >
                            <FiBell size={20} />
                            {/* Notification Badge */}
                            {notificationCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                                    {notificationCount > 9 ? '9+' : notificationCount}
                                </span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {showNotifications && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowNotifications(false)}
                                />
                                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-20 max-h-[500px] overflow-hidden">
                                    {/* Header */}
                                    <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-[#c6ac8f]/5 to-white">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-gray-900">Delivery Requests</h3>
                                            <span className="text-xs font-semibold text-[#c6ac8f] bg-[#c6ac8f]/10 px-2 py-1 rounded-full">
                                                {notificationCount} Pending
                                            </span>
                                        </div>
                                    </div>

                                    {/* Requests List */}
                                    <div className="max-h-[400px] overflow-y-auto">
                                        {pendingRequests.length === 0 ? (
                                            <div className="px-4 py-8 text-center text-gray-500">
                                                <FiBell size={32} className="mx-auto mb-2 opacity-30" />
                                                <p className="text-sm">No pending requests</p>
                                            </div>
                                        ) : (
                                            pendingRequests.slice(0, 5).map((request) => (
                                                <div
                                                    key={request._id}
                                                    onClick={() => {
                                                        setShowNotifications(false);
                                                        navigate('/admin/dashboard', { state: { scrollToRequests: true } });
                                                    }}
                                                    className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-[#c6ac8f]/10 flex items-center justify-center flex-shrink-0">
                                                            <FiPackage size={16} className="text-[#c6ac8f]" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-sm text-gray-900 truncate">
                                                                {request.customerName}
                                                            </p>
                                                            <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                                                                <FiMapPin size={12} />
                                                                {request.source} → {request.destination}
                                                            </p>
                                                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                                                <FiClock size={12} />
                                                                {new Date(request.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* View All */}
                                    {pendingRequests.length > 0 && (
                                        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                                            <button
                                                onClick={() => {
                                                    setShowNotifications(false);
                                                    navigate('/admin/dashboard', { state: { scrollToRequests: true } });
                                                }}
                                                className="w-full text-sm font-semibold text-[#c6ac8f] hover:text-[#a08060] transition-colors"
                                            >
                                                View All Requests
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Admin Profile */}
                    <div className="flex items-center gap-2 cursor-pointer group">
                        <div className="w-8 h-8 rounded-full bg-[#c6ac8f]/20 flex items-center justify-center text-[#c6ac8f]">
                            <FiUser size={16} />
                        </div>
                        <span className="hidden sm:block text-sm font-medium text-gray-700 group-hover:text-[#c6ac8f] transition">
                            {user?.name || "Admin"}
                        </span>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="text-gray-700 hover:text-red-500 transition"
                        title="Logout"
                    >
                        <FiLogOut size={18} />
                    </button>
                </div>
            </div>

            {/* ================= MOBILE MENU ================= */}
            <AnimatePresence>
                {showMobileMenu && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeMobileMenu}
                            className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        />

                        {/* Mobile Menu Panel */}
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-16 left-0 bottom-0 w-64 bg-white shadow-2xl z-50 md:hidden overflow-y-auto"
                        >
                            <div className="p-6 space-y-2">
                                <MobileNavLink to="/admin/dashboard" onClick={closeMobileMenu}>
                                    Dashboard
                                </MobileNavLink>
                                <MobileNavLink to="/admin/shipments" onClick={closeMobileMenu}>
                                    Shipments
                                </MobileNavLink>
                                <MobileNavLink to="/admin/tracking" onClick={closeMobileMenu}>
                                    Live Tracking
                                </MobileNavLink>
                                <MobileNavLink to="/admin/payments" onClick={closeMobileMenu}>
                                    Payments
                                </MobileNavLink>
                                <MobileNavLink to="/admin/ai-insights" onClick={closeMobileMenu}>
                                    AI Insights
                                </MobileNavLink>
                                <MobileNavLink to="/admin/chatbot" onClick={closeMobileMenu}>
                                    Chatbot
                                </MobileNavLink>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav >
    );
}

/* -------- Mobile Nav Link -------- */
function MobileNavLink({ to, onClick, children }) {
    return (
        <NavLink
            to={to}
            onClick={onClick}
            className={({ isActive }) =>
                `block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? "bg-[#c6ac8f]/10 text-[#c6ac8f]"
                    : "text-gray-700 hover:bg-gray-100"
                }`
            }
        >
            {children}
        </NavLink>
    );
}
