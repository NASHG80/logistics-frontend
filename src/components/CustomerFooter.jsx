import { Link } from "react-router-dom";
import { FiTruck, FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { FaTwitter, FaLinkedin, FaGithub, FaFacebook } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

                    {/* Company Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c6ac8f] to-[#b89a7f] flex items-center justify-center shadow-md">
                                <FiTruck className="text-white" size={22} />
                            </div>
                            <span className="text-xl font-bold text-gray-900">
                                Saarthi<span className="text-[#c6ac8f]">AI</span>
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Revolutionizing logistics with AI-powered solutions for smarter, faster, and more efficient deliveries.
                        </p>
                        {/* Social Links */}
                        <div className="flex items-center gap-3 pt-2">
                            <a href="#" className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-[#c6ac8f] flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                                <FaTwitter className="text-gray-600 group-hover:text-white transition-colors" size={16} />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-[#c6ac8f] flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                                <FaLinkedin className="text-gray-600 group-hover:text-white transition-colors" size={16} />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-[#c6ac8f] flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                                <FaGithub className="text-gray-600 group-hover:text-white transition-colors" size={16} />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-[#c6ac8f] flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                                <FaFacebook className="text-gray-600 group-hover:text-white transition-colors" size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-gray-900 font-bold text-sm uppercase tracking-wider mb-4">Quick Links</h3>
                        <ul className="space-y-2.5">
                            <li>
                                <Link to="/customer/dashboard" className="text-sm text-gray-600 hover:text-[#c6ac8f] transition-colors duration-200 flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-[#c6ac8f] transition-colors"></span>
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link to="/customer/payments" className="text-sm text-gray-600 hover:text-[#c6ac8f] transition-colors duration-200 flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-[#c6ac8f] transition-colors"></span>
                                    Payments
                                </Link>
                            </li>
                            <li>
                                <Link to="/customer/support" className="text-sm text-gray-600 hover:text-[#c6ac8f] transition-colors duration-200 flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-[#c6ac8f] transition-colors"></span>
                                    Support
                                </Link>
                            </li>
                            <li>
                                <Link to="/customer/shipments" className="text-sm text-gray-600 hover:text-[#c6ac8f] transition-colors duration-200 flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-[#c6ac8f] transition-colors"></span>
                                    Shipments
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="text-gray-900 font-bold text-sm uppercase tracking-wider mb-4">Services</h3>
                        <ul className="space-y-2.5">
                            <li>
                                <a href="#" className="text-sm text-gray-600 hover:text-[#c6ac8f] transition-colors duration-200 flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-[#c6ac8f] transition-colors"></span>
                                    Real-time Tracking
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-sm text-gray-600 hover:text-[#c6ac8f] transition-colors duration-200 flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-[#c6ac8f] transition-colors"></span>
                                    Route Optimization
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-sm text-gray-600 hover:text-[#c6ac8f] transition-colors duration-200 flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-[#c6ac8f] transition-colors"></span>
                                    Fleet Management
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-sm text-gray-600 hover:text-[#c6ac8f] transition-colors duration-200 flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-[#c6ac8f] transition-colors"></span>
                                    Analytics Dashboard
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-gray-900 font-bold text-sm uppercase tracking-wider mb-4">Contact Us</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <FiMail className="text-[#c6ac8f]" size={14} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Email</p>
                                    <a href="mailto:info@saarthiai.com" className="text-sm text-gray-600 hover:text-[#c6ac8f] transition-colors">
                                        info@saarthiai.com
                                    </a>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <FiPhone className="text-[#c6ac8f]" size={14} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Phone</p>
                                    <a href="tel:+911234567890" className="text-sm text-gray-600 hover:text-[#c6ac8f] transition-colors">
                                        +91 123 456 7890
                                    </a>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <FiMapPin className="text-[#c6ac8f]" size={14} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Location</p>
                                    <p className="text-sm text-gray-600">
                                        Mumbai, Maharashtra
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-200">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-gray-500">
                            © {new Date().getFullYear()} SaarthiAI. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <a href="#" className="text-sm text-gray-500 hover:text-[#c6ac8f] transition-colors">
                                Privacy Policy
                            </a>
                            <a href="#" className="text-sm text-gray-500 hover:text-[#c6ac8f] transition-colors">
                                Terms of Service
                            </a>
                            <a href="#" className="text-sm text-gray-500 hover:text-[#c6ac8f] transition-colors">
                                Cookie Policy
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
