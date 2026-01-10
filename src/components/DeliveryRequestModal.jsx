import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, MapPin, Calendar, MessageSquare } from "lucide-react";

export default function DeliveryRequestModal({ isOpen, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        shipmentDetails: "",
        source: "",
        destination: "",
        pickupDate: "",
        message: ""
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.shipmentDetails.trim()) {
            newErrors.shipmentDetails = "Shipment details are required";
        }
        if (!formData.source.trim()) {
            newErrors.source = "Source location is required";
        }
        if (!formData.destination.trim()) {
            newErrors.destination = "Destination location is required";
        }
        if (!formData.pickupDate) {
            newErrors.pickupDate = "Pickup date is required";
        } else {
            const selectedDate = new Date(formData.pickupDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                newErrors.pickupDate = "Pickup date cannot be in the past";
            }
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            // Reset form on success
            setFormData({
                shipmentDetails: "",
                source: "",
                destination: "",
                pickupDate: "",
                message: ""
            });
            setErrors({});
            onClose();
        } catch (error) {
            console.error("Error submitting request:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setFormData({
                shipmentDetails: "",
                source: "",
                destination: "",
                pickupDate: "",
                message: ""
            });
            setErrors({});
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Request Delivery</h2>
                                    <p className="text-sm text-gray-500 mt-1">Submit a new delivery request for admin approval</p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                    className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                {/* Shipment Details */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <Package size={16} className="text-[#c6ac8f]" />
                                        Shipment Details *
                                    </label>
                                    <input
                                        type="text"
                                        name="shipmentDetails"
                                        value={formData.shipmentDetails}
                                        onChange={handleChange}
                                        placeholder="e.g., 10 boxes of electronics"
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.shipmentDetails ? "border-red-300 bg-red-50" : "border-gray-200"
                                            } focus:outline-none focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f] transition-all`}
                                    />
                                    {errors.shipmentDetails && (
                                        <p className="text-xs text-red-600 mt-1">{errors.shipmentDetails}</p>
                                    )}
                                </div>

                                {/* Source */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <MapPin size={16} className="text-[#c6ac8f]" />
                                        Source Location *
                                    </label>
                                    <input
                                        type="text"
                                        name="source"
                                        value={formData.source}
                                        onChange={handleChange}
                                        placeholder="e.g., Mumbai Warehouse"
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.source ? "border-red-300 bg-red-50" : "border-gray-200"
                                            } focus:outline-none focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f] transition-all`}
                                    />
                                    {errors.source && (
                                        <p className="text-xs text-red-600 mt-1">{errors.source}</p>
                                    )}
                                </div>

                                {/* Destination */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <MapPin size={16} className="text-[#c6ac8f]" />
                                        Destination Location *
                                    </label>
                                    <input
                                        type="text"
                                        name="destination"
                                        value={formData.destination}
                                        onChange={handleChange}
                                        placeholder="e.g., Pune Office"
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.destination ? "border-red-300 bg-red-50" : "border-gray-200"
                                            } focus:outline-none focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f] transition-all`}
                                    />
                                    {errors.destination && (
                                        <p className="text-xs text-red-600 mt-1">{errors.destination}</p>
                                    )}
                                </div>

                                {/* Pickup Date */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <Calendar size={16} className="text-[#c6ac8f]" />
                                        Pickup Date *
                                    </label>
                                    <input
                                        type="date"
                                        name="pickupDate"
                                        value={formData.pickupDate}
                                        onChange={handleChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.pickupDate ? "border-red-300 bg-red-50" : "border-gray-200"
                                            } focus:outline-none focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f] transition-all`}
                                    />
                                    {errors.pickupDate && (
                                        <p className="text-xs text-red-600 mt-1">{errors.pickupDate}</p>
                                    )}
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <MessageSquare size={16} className="text-[#c6ac8f]" />
                                        Additional Message (Optional)
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Any special instructions or notes..."
                                        rows={3}
                                        maxLength={500}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f] transition-all resize-none"
                                    />
                                    <p className="text-xs text-gray-400 mt-1 text-right">
                                        {formData.message.length}/500
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        disabled={isSubmitting}
                                        className="flex-1 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#c6ac8f] to-[#a08060] text-white font-semibold hover:from-[#a08060] hover:to-[#8a6a50] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#c6ac8f]/30"
                                    >
                                        {isSubmitting ? "Submitting..." : "Submit Request"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
