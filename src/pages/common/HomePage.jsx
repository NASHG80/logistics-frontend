import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
    FiMapPin,
    FiTrendingUp,
    FiCreditCard,
    FiCpu,
    FiTruck,
    FiBarChart2,
    FiCheckCircle,
    FiArrowRight,
    FiZap,
    FiShield,
    FiClock,
} from "react-icons/fi";

/* ================= FIX LEAFLET ICON ================= */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ================= CUSTOM TRUCK ICON ================= */
const truckIcon = L.divIcon({
    className: "custom-truck-icon",
    html: `
    <div style="
      background: linear-gradient(135deg, #c6ac8f 0%, #a08060 100%);
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      border: 3px solid white;
    ">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M18 18.5a1.5 1.5 0 0 1-1 1.5a1.5 1.5 0 0 1-1.5-1.5a1.5 1.5 0 0 1 1.5-1.5a1.5 1.5 0 0 1 1 1.5M19.5 9.5h-2.5v-6h-11v12a1.5 1.5 0 0 0 1.5 1.5a1.5 1.5 0 0 0 1.5-1.5a1.5 1.5 0 0 0-1.5-1.5h-1v-9h7.5v2.5h2.5l1.5 2z"/>
      </svg>
    </div>
  `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

/* ================= ANIMATION VARIANTS ================= */
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" },
    },
};

const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" },
    },
};

/* ================= FEATURE CARD ================= */
const FeatureCard = ({ icon: Icon, title, description, gradient, iconColor, delay = 0 }) => (
    <motion.div
        variants={cardVariants}
        whileHover={{
            y: -8,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        }}
        className="group relative bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
        {/* Background gradient */}
        <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 blur-2xl ${gradient} group-hover:opacity-30 transition-opacity duration-500`} />

        {/* Icon */}
        <div className={`relative w-14 h-14 rounded-xl flex items-center justify-center ${gradient} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={24} />
        </div>

        {/* Content */}
        <div className="relative mt-5">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
    </motion.div>
);

/* ================= STAT CARD ================= */
const StatCard = ({ value, label }) => (
    <motion.div
        variants={cardVariants}
        className="text-center"
    >
        <div className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-2">
            {value}
        </div>
        <div className="text-sm text-gray-900 font-medium">{label}</div>
    </motion.div>
);

/* ================= HOME PAGE ================= */
export default function HomePage() {
    const navigate = useNavigate();

    return (
        <>
            <Navbar />

            {/* HERO SECTION */}
            <section id="home" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen relative overflow-hidden gradient-bg-mesh">
                {/* Decorative background */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-[#c6ac8f]/20 to-amber-200/20 rounded-full blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        {/* Left Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="inline-flex items-center gap-2 mb-6 px-4 py-2 text-sm rounded-full bg-gradient-to-r from-[#8a6a50] to-[#a08060] border border-[#6a4a30] text-white font-semibold shadow-lg"
                            >
                                <FiZap size={16} />
                                Next-Gen AI Logistics Platform
                            </motion.span>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
                                Smart Logistics.
                                <br />
                                <span className="bg-gradient-to-r from-[#c6ac8f] to-[#a08060] bg-clip-text text-transparent">
                                    Powered by AI.
                                </span>
                            </h1>

                            <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-2xl leading-relaxed">
                                SaarthiAI simplifies logistics operations using AI-driven
                                automation, real-time shipment tracking, and intelligent
                                decision-making insights.
                            </p>

                            <div className="mt-10 flex flex-col sm:flex-row gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate("/signup")}
                                    className="group px-8 py-4 rounded-xl bg-gradient-to-r from-[#c6ac8f] to-[#a08060] text-white font-semibold hover:from-[#a08060] hover:to-[#8a6a50] transition-all shadow-lg shadow-[#c6ac8f]/30 flex items-center justify-center gap-2"
                                >
                                    Get Started
                                    <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate("/login")}
                                    className="px-8 py-4 rounded-xl border-2 border-[#c6ac8f] text-[#c6ac8f] font-semibold hover:bg-[#c6ac8f]/10 transition-all"
                                >
                                    Sign In
                                </motion.button>
                            </div>

                            {/* Trust Indicators */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8, duration: 0.6 }}
                                className="mt-12 flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-500 justify-center sm:justify-start"
                            >
                                <div className="flex items-center gap-2">
                                    <FiShield className="text-emerald-500" size={20} />
                                    <span>Secure & Compliant</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FiClock className="text-blue-500" size={20} />
                                    <span>24/7 Support</span>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Right Visual - Live Map */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                            className="hidden lg:block"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#c6ac8f]/20 to-purple-200/20 rounded-3xl blur-3xl" />
                                <div className="relative bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl overflow-hidden shadow-2xl">
                                    {/* Live Tracking Map */}
                                    <div className="h-[500px] relative">
                                        {/* Map Header */}
                                        <div className="absolute top-0 left-0 right-0 z-[1000] p-4 bg-gradient-to-b from-white/95 to-transparent">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                    <span className="text-sm font-semibold text-gray-900">Live Fleet Tracking</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="px-3 py-1 bg-white/80 backdrop-blur rounded-lg text-xs font-medium text-gray-600 shadow-sm">
                                                        3 Active
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <MapContainer
                                            center={[20.5937, 78.9629]}
                                            zoom={5}
                                            scrollWheelZoom={false}
                                            zoomControl={false}
                                            className="h-full w-full rounded-3xl"
                                            style={{ background: "#f8fafc" }}
                                        >
                                            <TileLayer
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                            />

                                            {/* Sample Tracking Markers */}
                                            <Marker position={[19.076, 72.8777]} icon={truckIcon}>
                                                <Popup>
                                                    <div className="text-center">
                                                        <strong className="text-gray-900">Mumbai → Pune</strong>
                                                        <br />
                                                        <span className="text-xs text-emerald-600 font-medium">On Time</span>
                                                    </div>
                                                </Popup>
                                            </Marker>

                                            <Marker position={[12.9716, 77.5946]} icon={truckIcon}>
                                                <Popup>
                                                    <div className="text-center">
                                                        <strong className="text-gray-900">Bangalore Route</strong>
                                                        <br />
                                                        <span className="text-xs text-blue-600 font-medium">In Transit</span>
                                                    </div>
                                                </Popup>
                                            </Marker>

                                            <Marker position={[28.7041, 77.1025]} icon={truckIcon}>
                                                <Popup>
                                                    <div className="text-center">
                                                        <strong className="text-gray-900">Delhi Delivery</strong>
                                                        <br />
                                                        <span className="text-xs text-emerald-600 font-medium">On Schedule</span>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        </MapContainer>
                                    </div>
                                </div>
                            </div>
                        </motion.div>                    </div>

                    {/* Stats Section */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8"
                    >
                        <StatCard value="500+" label="Active Shipments" />
                        <StatCard value="98%" label="On-Time Delivery" />
                        <StatCard value="24/7" label="Real-Time Tracking" />
                        <StatCard value="50+" label="Happy Clients" />
                    </motion.div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
                            Everything You Need to Excel
                        </h2>
                        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                            SaarthiAI brings together intelligent automation, real-time
                            visibility, and analytics into one powerful logistics platform.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        <FeatureCard
                            icon={FiMapPin}
                            title="Real-Time Tracking"
                            description="Track shipments and vehicles live with accurate ETAs and instant alerts."
                            gradient="bg-gradient-to-br from-[#c6ac8f] to-[#a08060]"
                        />
                        <FeatureCard
                            icon={FiTrendingUp}
                            title="Google Maps Integration"
                            description="G-Maps assisted routing to reduce delays, fuel usage, and delivery time."
                            gradient="bg-gradient-to-br from-[#c6ac8f] to-[#a08060]"
                        />
                        <FeatureCard
                            icon={FiCreditCard}
                            title="Automated Payments"
                            description="Instant invoicing and seamless digital payment workflows."
                            gradient="bg-gradient-to-br from-[#c6ac8f] to-[#a08060]"
                        />
                        <FeatureCard
                            icon={FiCpu}
                            title="AI Assistant"
                            description="Ask questions and receive actionable insights in natural language."
                            gradient="bg-gradient-to-br from-[#c6ac8f] to-[#a08060]"
                        />
                        <FeatureCard
                            icon={FiTruck}
                            title="Fleet Management"
                            description="Monitor vehicle health, driver activity, and fleet utilization."
                            gradient="bg-gradient-to-br from-[#c6ac8f] to-[#a08060]"
                        />
                        <FeatureCard
                            icon={FiBarChart2}
                            title="Advanced Analytics"
                            description="Data-driven reports on performance, delays, and cost efficiency."
                            gradient="bg-gradient-to-br from-[#c6ac8f] to-[#a08060]"
                        />
                    </motion.div>
                </div>
            </section>

            {/* ABOUT SECTION */}
            <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        {/* Left Visual */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-[#c6ac8f]/20 to-blue-200/20 rounded-3xl blur-3xl" />
                            <div className="relative bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl overflow-hidden shadow-2xl">
                                <img
                                    src="/images/logistics-analytics.png"
                                    alt="Smart Logistics Analytics Dashboard"
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        </motion.div>
                        {/* Right Content */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-4xl font-bold text-gray-900">
                                Built for Modern Logistics
                            </h2>

                            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                                Traditional logistics systems lack visibility and intelligence.
                                SaarthiAI bridges this gap by unifying tracking, automation,
                                payments, and AI-powered insights in a single platform.
                            </p>

                            <ul className="mt-8 space-y-4">
                                <li className="flex items-center gap-3 text-gray-700">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <FiCheckCircle className="text-emerald-600" size={16} />
                                    </div>
                                    <span className="font-medium">Real-time operational visibility</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-700">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <FiCheckCircle className="text-emerald-600" size={16} />
                                    </div>
                                    <span className="font-medium">AI-powered decision making</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-700">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <FiCheckCircle className="text-emerald-600" size={16} />
                                    </div>
                                    <span className="font-medium">Reduced delays and operational costs</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-700">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <FiCheckCircle className="text-emerald-600" size={16} />
                                    </div>
                                    <span className="font-medium">Seamless integration with existing systems</span>
                                </li>
                            </ul>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate("/signup")}
                                className="mt-8 group px-8 py-4 rounded-xl bg-gradient-to-r from-[#c6ac8f] to-[#a08060] text-white font-semibold hover:from-[#a08060] hover:to-[#8a6a50] transition-all shadow-lg shadow-[#c6ac8f]/30 flex items-center gap-2"
                            >
                                Start Your Journey
                                <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* PRICING SECTION */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    {/* Section Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Simple, Transparent Pricing
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Choose the plan that fits your business needs. Scale as you grow.
                        </p>
                    </motion.div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        {/* Basic Plan */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="rounded-2xl border-2 border-gray-200 bg-white p-8 hover:border-[#c6ac8f] transition-all hover:shadow-lg"
                        >
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic</h3>
                                <p className="text-gray-600 text-sm">Perfect for small fleets</p>
                            </div>
                            <div className="mb-6">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-gray-900">₹999</span>
                                    <span className="text-gray-600">/month</span>
                                </div>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-3 text-gray-700">
                                    <FiCheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
                                    <span>Up to 5 vehicles</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-700">
                                    <FiCheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
                                    <span>Real-time tracking</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-700">
                                    <FiCheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
                                    <span>Basic analytics</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-700">
                                    <FiCheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
                                    <span>Email support</span>
                                </li>
                            </ul>
                            <button className="w-full py-3 px-6 rounded-lg border-2 border-gray-300 text-gray-900 font-semibold hover:border-[#c6ac8f] hover:bg-[#c6ac8f] hover:text-white transition-all">
                                Get Started
                            </button>
                        </motion.div>

                        {/* Pro Plan */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="rounded-2xl border-2 border-[#c6ac8f] bg-gradient-to-br from-[#c6ac8f]/5 to-white p-8 relative hover:shadow-xl transition-all transform hover:scale-105"
                        >
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                <span className="bg-gradient-to-r from-[#c6ac8f] to-[#a08060] text-white px-4 py-1 rounded-full text-sm font-semibold">
                                    Most Popular
                                </span>
                            </div>
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                                <p className="text-gray-600 text-sm">For growing businesses</p>
                            </div>
                            <div className="mb-6">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-gray-900">₹2,999</span>
                                    <span className="text-gray-600">/month</span>
                                </div>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-3 text-gray-700">
                                    <FiCheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
                                    <span>Up to 25 vehicles</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-700">
                                    <FiCheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
                                    <span>Advanced analytics</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-700">
                                    <FiCheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
                                    <span>AI-powered insights</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-700">
                                    <FiCheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
                                    <span>Priority support</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-700">
                                    <FiCheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
                                    <span>API access</span>
                                </li>
                            </ul>
                            <button className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-[#c6ac8f] to-[#a08060] text-white font-semibold hover:from-[#a08060] hover:to-[#8a6a50] transition-all shadow-lg">
                                Get Started
                            </button>
                        </motion.div>

                        {/* Enterprise Plan */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="rounded-2xl border-2 border-gray-200 bg-white p-8 hover:border-[#c6ac8f] transition-all hover:shadow-lg"
                        >
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                                <p className="text-gray-600 text-sm">For large operations</p>
                            </div>
                            <div className="mb-6">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-gray-900">Custom</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Contact us for pricing</p>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-3 text-gray-700">
                                    <FiCheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
                                    <span>Unlimited vehicles</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-700">
                                    <FiCheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
                                    <span>Custom integrations</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-700">
                                    <FiCheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
                                    <span>Dedicated account manager</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-700">
                                    <FiCheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
                                    <span>24/7 phone support</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-700">
                                    <FiCheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
                                    <span>SLA guarantee</span>
                                </li>
                            </ul>
                            <button className="w-full py-3 px-6 rounded-lg border-2 border-gray-300 text-gray-900 font-semibold hover:border-[#c6ac8f] hover:bg-[#c6ac8f] hover:text-white transition-all">
                                Contact Sales
                            </button>
                        </motion.div>
                    </div>

                    {/* Transaction Fee Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="max-w-3xl mx-auto"
                    >
                        <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-8 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#c6ac8f]/10 mb-4">
                                <FiCreditCard className="text-[#c6ac8f]" size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Transaction Fee</h3>
                            <p className="text-lg text-gray-700 mb-2">
                                <span className="font-semibold text-[#c6ac8f]">1–3%</span> commission per completed shipment/payment
                            </p>
                            <p className="text-sm text-gray-600">
                                Transparent pricing with no hidden charges. Pay only for successful transactions.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#c6ac8f] to-[#a08060] text-white relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl sm:text-5xl font-extrabold">
                            Ready to Transform Your Logistics?
                        </h2>
                        <p className="mt-6 text-lg text-white/90 max-w-2xl mx-auto">
                            Join hundreds of businesses already using SaarthiAI to streamline their operations and boost efficiency.
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate("/signup")}
                                className="px-8 py-4 rounded-xl bg-white text-[#c6ac8f] font-semibold hover:bg-gray-50 transition-all shadow-xl"
                            >
                                Get Started Free
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 rounded-xl border-2 border-white text-white font-semibold hover:bg-white/10 transition-all"
                            >
                                Schedule a Demo
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </>
    );
}
