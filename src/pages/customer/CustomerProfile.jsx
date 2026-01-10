import { motion } from "framer-motion";
import { Package, MapPin, Clock, CreditCard, User, Mail, Phone, Calendar, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import CustomerNavbar from "../../components/CustomerNavbar";
import CustomerFooter from "../../components/CustomerFooter";

export default function CustomerProfile() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Get user initials for avatar
    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <>
            <CustomerNavbar />
            <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 min-h-screen gradient-bg-mesh">
                {/* Decorative background */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl" />
                </div>

                <div className="max-w-6xl mx-auto relative z-10 space-y-10">

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <span className="inline-flex items-center gap-2 mb-4 rounded-full bg-gradient-to-r from-[#c6ac8f]/20 to-[#d4b896]/20 backdrop-blur-xl border border-[#c6ac8f]/30 px-4 py-2 text-sm font-medium text-[#c6ac8f]">
                            <User size={16} />
                            My Profile
                        </span>
                        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                            Customer Profile
                        </h1>
                        <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-lg">
                            Manage your account information and preferences
                        </p>
                    </motion.div>

                    {/* Profile Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Profile Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="rounded-2xl border border-gray-200/50 bg-white/80 backdrop-blur-xl p-8 shadow-lg hover:shadow-xl transition-all"
                        >
                            <div className="text-center">
                                <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-[#c6ac8f] to-[#d4b896] flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-lg">
                                    {getInitials(user?.name)}
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">{user?.name || "User"}</h2>
                                <p className="text-sm text-gray-500 mt-1">Customer ID: {user?.id || "N/A"}</p>
                                <span className="inline-block mt-4 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 px-4 py-1.5 text-xs font-semibold text-green-700">
                                    Active Account
                                </span>

                                {/* Logout Button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleLogout}
                                    className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-6 py-3 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-md shadow-red-500/30"
                                >
                                    <LogOut size={18} />
                                    Logout
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Account Information */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-2 rounded-2xl border border-gray-200/50 bg-white/80 backdrop-blur-xl p-8 shadow-lg hover:shadow-xl transition-all"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Account Information
                            </h2>

                            <div className="space-y-6">
                                <InfoRow
                                    icon={User}
                                    label="Full Name"
                                    value={user?.name || "Not provided"}
                                />
                                <InfoRow
                                    icon={Mail}
                                    label="Email Address"
                                    value={user?.email || "Not provided"}
                                />
                                <InfoRow
                                    icon={Phone}
                                    label="Phone Number"
                                    value="+91 98765 43210"
                                />
                                <InfoRow
                                    icon={MapPin}
                                    label="Address"
                                    value="123, MG Road, Pune - 411001, Maharashtra"
                                />
                                <InfoRow
                                    icon={Calendar}
                                    label="Member Since"
                                    value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "January 2024"}
                                />
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="mt-8 rounded-xl bg-gradient-to-r from-[#c6ac8f] to-[#d4b896] px-6 py-3 text-white font-semibold hover:shadow-lg hover:shadow-[#c6ac8f]/30 transition-all shadow-md"
                            >
                                Edit Profile
                            </motion.button>
                        </motion.div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard
                            icon={Package}
                            title="Total Shipments"
                            value="24"
                            subtitle="All time"
                        />
                        <StatCard
                            icon={CreditCard}
                            title="Total Spent"
                            value="₹2,45,000"
                            subtitle="All time"
                        />
                        <StatCard
                            icon={Clock}
                            title="Active Shipments"
                            value="2"
                            subtitle="Currently in transit"
                        />
                    </div>

                </div>
            </main>
            <CustomerFooter />
        </>
    );
}

/* ---------- COMPONENTS ---------- */

function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-start gap-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
            <div className="rounded-xl bg-[#c6ac8f]/10 p-3">
                <Icon size={20} className="text-[#c6ac8f]" />
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{value}</p>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, title, value, subtitle }) {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="rounded-2xl border border-gray-200/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg hover:shadow-xl transition-all"
        >
            <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-[#c6ac8f]/20 to-[#d4b896]/20 p-3">
                    <Icon size={20} className="text-[#c6ac8f]" />
                </div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
            </div>

            <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{value}</p>
            <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
        </motion.div>
    );
}
