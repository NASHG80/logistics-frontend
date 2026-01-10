import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiTruck, FiLogOut, FiMenu, FiX, FiHome, FiUpload, FiUser } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const DriverNavbar = () => {
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden text-gray-700 hover:text-[#c6ac8f] transition"
          >
            {showMobileMenu ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          {/* Logo */}
          <NavLink
            to="/driver/dashboard"
            className="flex items-center gap-2.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c6ac8f] to-[#b89a7f] flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
              <FiTruck className="text-white" size={22} />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Saarthi<span className="text-[#c6ac8f]">AI</span>
            </span>
          </NavLink>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 ml-10">
            <NavLink
              to="/driver/dashboard"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive
                  ? "text-[#c6ac8f]"
                  : "text-gray-700 hover:text-[#c6ac8f]"
                }`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/driver/pod-upload"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive
                  ? "text-[#c6ac8f]"
                  : "text-gray-700 hover:text-[#c6ac8f]"
                }`
              }
            >
              POD Upload
            </NavLink>

            <NavLink
              to="/driver/profile"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive
                  ? "text-[#c6ac8f]"
                  : "text-gray-700 hover:text-[#c6ac8f]"
                }`
              }
            >
              Profile
            </NavLink>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Driver Name (Desktop) */}
          <span className="hidden sm:block text-sm font-medium text-gray-700">
            {user?.name || "Driver"}
          </span>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <FiLogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
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
                {/* User Info */}
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#c6ac8f]/20 flex items-center justify-center text-[#c6ac8f]">
                      <FiUser size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{user?.name || "Driver"}</p>
                      <p className="text-xs text-gray-500">Driver Account</p>
                    </div>
                  </div>
                </div>

                {/* Navigation Links */}
                <MobileNavLink to="/driver/dashboard" icon={FiHome} onClick={closeMobileMenu}>
                  Dashboard
                </MobileNavLink>
                <MobileNavLink to="/driver/pod-upload" icon={FiUpload} onClick={closeMobileMenu}>
                  POD Upload
                </MobileNavLink>
                <MobileNavLink to="/driver/profile" icon={FiUser} onClick={closeMobileMenu}>
                  Profile
                </MobileNavLink>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

/* -------- Mobile Nav Link -------- */
function MobileNavLink({ to, icon: Icon, onClick, children }) {
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
      {children}
    </NavLink>
  );
}

export default DriverNavbar;
