import { NavLink } from "react-router-dom";
import { FiTruck } from "react-icons/fi";

export default function Navbar() {
    const linkClass =
        "text-sm font-medium text-gray-700 hover:text-[#c6ac8f] transition";

    return (
        <nav className="fixed top-0 w-full bg-white border-b border-gray-200 shadow-sm z-50">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

                {/* ================= LEFT SECTION ================= */}
                <div className="flex items-center gap-4">
                    {/* Logo */}
                    <NavLink to="/" className="flex items-center gap-2.5 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c6ac8f] to-[#b89a7f] flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                            <FiTruck className="text-white" size={22} />
                        </div>
                        <span className="text-xl font-bold text-gray-900">
                            Saarthi<span className="text-[#c6ac8f]">AI</span>
                        </span>
                    </NavLink>

                    {/* Nav Links */}
                    <div className="hidden md:flex items-center gap-8 ml-10">
                        <a 
                            href="#home" 
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className={linkClass}
                        >
                            Home
                        </a>
                        <a 
                            href="#features" 
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className={linkClass}
                        >
                            Features
                        </a>
                        <a 
                            href="#about" 
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className={linkClass}
                        >
                            About
                        </a>
                        <a 
                            href="#contact" 
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className={linkClass}
                        >
                            Contact
                        </a>
                    </div>
                </div>

                {/* ================= RIGHT SECTION ================= */}
                <div className="flex items-center gap-4">
                    <NavLink
                        to="/login"
                        className="text-sm font-medium text-gray-700 hover:text-[#c6ac8f] transition"
                    >
                        Login
                    </NavLink>

                    <NavLink
                        to="/signup"
                        className="px-5 py-2 rounded-lg bg-[#c6ac8f] text-white text-sm font-medium shadow-sm hover:opacity-90 transition"
                    >
                        Sign Up
                    </NavLink>
                </div>
            </div>
        </nav>
    );
}
