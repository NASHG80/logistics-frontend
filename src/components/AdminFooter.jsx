import { motion } from "framer-motion";
import {
    FiGrid,
    FiTruck,
    FiMap,
    FiCreditCard,
    FiCpu,
} from "react-icons/fi";

export default function AdminFooter() {
    return (
        <footer className="bg-white border-t mt-16">
            {/* ================= MAIN FOOTER ================= */}
            <div className="max-w-7xl mx-auto px-6 py-14 grid gap-12 md:grid-cols-4">

                {/* ================= BRAND ================= */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <h3 className="text-xl font-bold text-gray-900">
                        Saarthi<span className="text-[#c6ac8f]">AI</span>
                    </h3>
                    <p className="mt-4 text-sm text-gray-600 max-w-sm">
                        Admin Console for intelligent logistics operations,
                        real-time monitoring, and AI-driven decision support.
                    </p>
                </motion.div>

                {/* ================= QUICK ACCESS ================= */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 }}
                >
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">
                        Quick Access
                    </h4>
                    <ul className="space-y-3 text-sm text-gray-600">
                        <li className="flex items-center gap-2 hover:text-[#c6ac8f] transition cursor-pointer">
                            <FiGrid size={14} /> Dashboard
                        </li>
                        <li className="flex items-center gap-2 hover:text-[#c6ac8f] transition cursor-pointer">
                            <FiTruck size={14} /> Shipments & Fleet
                        </li>
                        <li className="flex items-center gap-2 hover:text-[#c6ac8f] transition cursor-pointer">
                            <FiMap size={14} /> Live Tracking
                        </li>
                        <li className="flex items-center gap-2 hover:text-[#c6ac8f] transition cursor-pointer">
                            <FiCreditCard size={14} /> Payments & Billing
                        </li>
                        <li className="flex items-center gap-2 hover:text-[#c6ac8f] transition cursor-pointer">
                            <FiCpu size={14} /> AI Insights
                        </li>
                    </ul>
                </motion.div>

                {/* ================= SYSTEM ================= */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">
                        System
                    </h4>
                    <ul className="space-y-3 text-sm text-gray-600">
                        <li className="hover:text-[#c6ac8f] transition cursor-pointer">
                            System Status
                        </li>
                        <li className="hover:text-[#c6ac8f] transition cursor-pointer">
                            Logs & Monitoring
                        </li>
                        <li className="hover:text-[#c6ac8f] transition cursor-pointer">
                            Data Security
                        </li>
                    </ul>
                </motion.div>

                {/* ================= SUPPORT ================= */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                >
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">
                        Support
                    </h4>
                    <ul className="space-y-3 text-sm text-gray-600">
                        <li className="hover:text-[#c6ac8f] transition cursor-pointer">
                            Help Center
                        </li>
                        <li className="hover:text-[#c6ac8f] transition cursor-pointer">
                            Contact Support
                        </li>
                        <li className="hover:text-[#c6ac8f] transition cursor-pointer">
                            Privacy Policy
                        </li>
                    </ul>
                </motion.div>

            </div>

            {/* ================= BOTTOM BAR ================= */}
            <div className="border-t py-6">
                <p className="text-center text-xs text-gray-500">
                    © {new Date().getFullYear()} SaarthiAI — Admin Dashboard
                </p>
            </div>
        </footer>
    );
}
