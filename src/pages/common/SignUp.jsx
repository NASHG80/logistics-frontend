import { motion } from "framer-motion";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiTruck, FiMail, FiLock, FiUser, FiArrowRight, FiShield, FiCheckCircle } from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";

const Signup = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("customer");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      toast.success("Account created successfully! Redirecting to login...", {
        duration: 3000,
        style: { background: "#10b981", color: "#fff", fontWeight: "600" }
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: "customer", label: "Customer", icon: FiUser },
    { value: "driver", label: "Driver", icon: FiTruck },
    { value: "admin", label: "Admin", icon: FiShield }
  ];

  return (
    <>
      <Toaster />
      <div className="min-h-screen flex items-center justify-center px-4 py-12 gradient-bg-mesh">
        {/* Decorative background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-[#c6ac8f]/20 to-amber-200/20 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl shadow-gray-200/50 p-8 sm:p-10">

            {/* Logo */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="flex justify-center items-center gap-2 mb-8"
            >
              <div className="p-2 rounded-xl bg-gradient-to-br from-[#c6ac8f] to-[#a08060] shadow-lg">
                <FiTruck className="text-white" size={28} />
              </div>
              <h1 className="text-3xl font-extrabold">
                Saarthi<span className="bg-gradient-to-r from-[#c6ac8f] to-[#a08060] bg-clip-text text-transparent">AI</span>
              </h1>
            </motion.div>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Create Your Account
              </h2>
              <p className="text-sm text-gray-600">
                Join SaarthiAI and start managing logistics
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
              >
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </motion.div>
            )}

            {/* Role Selector */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Select Your Role
              </p>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((r) => {
                  const IconComponent = r.icon;
                  return (
                    <motion.button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative py-3 rounded-xl text-sm font-semibold border-2 transition-all ${role === r.value
                          ? "bg-gradient-to-br from-[#c6ac8f] to-[#a08060] text-white border-[#c6ac8f] shadow-lg shadow-[#c6ac8f]/30"
                          : "bg-white text-gray-700 border-gray-200 hover:border-[#c6ac8f]"
                        }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <IconComponent size={18} />
                        <span className="text-xs">{r.label}</span>
                      </div>
                      {role === r.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"
                        >
                          <FiCheckCircle size={12} className="text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiUser size={18} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f] transition-all text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiMail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f] transition-all text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiLock size={18} />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f] transition-all text-gray-900"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">Minimum 6 characters</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiLock size={18} />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f] transition-all text-gray-900"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full mt-6 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#c6ac8f] to-[#a08060] text-white font-semibold hover:from-[#a08060] hover:to-[#8a6a50] transition-all shadow-lg shadow-[#c6ac8f]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Already have an account?</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <NavLink
                to="/login"
                className="inline-flex items-center gap-2 text-[#c6ac8f] font-semibold hover:text-[#a08060] transition-colors"
              >
                Sign in instead
                <FiArrowRight size={16} />
              </NavLink>
            </div>

            {/* Security Badge */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <FiShield size={14} className="text-emerald-500" />
                <span>Your data is secure and encrypted</span>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <NavLink
              to="/"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              ← Back to Home
            </NavLink>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Signup;
