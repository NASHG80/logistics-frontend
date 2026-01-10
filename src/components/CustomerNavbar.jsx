import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, CreditCard, HelpCircle, User, Truck, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function CustomerNavbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 w-full bg-white border-b border-gray-200 shadow-sm z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden text-gray-700 hover:text-[#c6ac8f] transition"
          >
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <NavLink to="/customer/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c6ac8f] to-[#b89a7f] flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
              <Truck className="text-white" size={22} />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Saarthi<span className="text-[#c6ac8f]">AI</span>
            </span>
          </NavLink>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 ml-10">
            <NavItem to="/customer/dashboard" icon={Package} label="Dashboard" />
            <NavItem to="/customer/payments" icon={CreditCard} label="Payments" />
            <NavItem to="/customer/support" icon={HelpCircle} label="Support" />
            <NavItem to="/customer/shipments" icon={Package} label="Shipments" />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Customer Profile */}
          <NavLink to="/customer/profile" className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-[#c6ac8f]/20 flex items-center justify-center text-[#c6ac8f]">
              <User size={16} />
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700 group-hover:text-[#c6ac8f] transition">
              {user?.name || "Customer"}
            </span>
          </NavLink>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="text-gray-700 hover:text-red-500 transition"
            title="Logout"
          >
            <LogOut size={18} />
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
                <MobileNavItem to="/customer/dashboard" icon={Package} label="Dashboard" onClick={closeMobileMenu} />
                <MobileNavItem to="/customer/payments" icon={CreditCard} label="Payments" onClick={closeMobileMenu} />
                <MobileNavItem to="/customer/support" icon={HelpCircle} label="Support" onClick={closeMobileMenu} />
                <MobileNavItem to="/customer/shipments" icon={Package} label="Shipments" onClick={closeMobileMenu} />
                <MobileNavItem to="/customer/profile" icon={User} label="Profile" onClick={closeMobileMenu} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

/* -------- Desktop Nav Item -------- */
function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 text-sm font-medium transition ${isActive
          ? "text-[#c6ac8f]"
          : "text-gray-600 hover:text-gray-900"
        }`
      }
    >
      <Icon size={16} />
      {label}
    </NavLink>
  );
}

/* -------- Mobile Nav Item -------- */
function MobileNavItem({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
          ? "bg-[#c6ac8f]/10 text-[#c6ac8f]"
          : "text-gray-700 hover:bg-gray-100"
        }`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  );
}
