import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiArrowLeft, FiPackage, FiMapPin, FiCalendar, FiSettings } from "react-icons/fi";
import { motion } from "framer-motion";
import AdminNavbar from "../../components/AdminNavbar";
import AdminFooter from "../../components/AdminFooter";
import { shipmentAPI } from "../../services/api";

/* ---------------- ANIMATION VARIANTS ---------------- */
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

/* ---------------- PAGE ---------------- */
export default function ShipmentForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const isEditMode = Boolean(id);
  const from = location.state?.from;

  const [form, setForm] = useState({
    customerName: "",
    customerId: "",
    referenceId: "",
    priority: "NORMAL",
    source: "",
    destination: "",
    pickupDate: "",
    estimatedPickupTime: "",
    approximateWeight: "",
    eta: "",
    status: "PENDING",
    price: "",
    autoAssignVehicle: false,
    assignedVehicleNumber: "",
    requestId: "" // Store delivery request ID for approval
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ---------------- LOAD DATA (EDIT MODE) ---------------- */
  useEffect(() => {
    if (isEditMode) {
      fetchShipment();
    } else if (location.state?.prefillData) {
      // Auto-fill form with delivery request data
      const prefill = location.state.prefillData;
      console.log('📦 ShipmentForm - Received prefillData:', prefill);
      console.log('👤 Customer Name from prefill:', prefill.customerName);

      setForm(prev => ({
        ...prev,
        customerName: prefill.customerName || "",
        customerId: prefill.customerId || "",
        source: prefill.source || "",
        destination: prefill.destination || "",
        pickupDate: prefill.pickupDate ? new Date(prefill.pickupDate).toISOString().split('T')[0] : "",
        estimatedPickupTime: prefill.estimatedPickupTime || "",
        approximateWeight: prefill.approximateLoad ? parseFloat(prefill.approximateLoad) || "" : "",
        // Store request ID for later approval
        requestId: prefill.requestId
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, location.state]);

  const fetchShipment = async () => {
    setFetchLoading(true);
    setError("");
    try {
      const response = await shipmentAPI.getById(id);
      const shipment = response.data;

      setForm({
        customerName: shipment.customerName || "",
        referenceId: shipment.referenceId || "",
        priority: shipment.priority || "NORMAL",
        source: shipment.source || "",
        destination: shipment.destination || "",
        pickupDate: shipment.pickupDate ? new Date(shipment.pickupDate).toISOString().split('T')[0] : "",
        eta: shipment.eta ? new Date(shipment.eta).toISOString().split('T')[0] : "",
        status: shipment.status || "PENDING",
        price: shipment.price || "",
        assignNow: Boolean(shipment.assignedVehicleNumber),
        assignedVehicleNumber: shipment.assignedVehicleNumber || "",
      });
    } catch (err) {
      console.error("Error fetching shipment:", err);
      setError(err.response?.data?.message || "Failed to load shipment");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  /* ---------------- EXIT LOGIC ---------------- */
  const exitEditFlow = () => {
    if (from === "detail") {
      navigate(`/admin/shipments/${id}`, { replace: true });
    } else {
      navigate("/admin/shipments", { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const shipmentData = {
        customerName: form.customerName,
        customerId: form.customerId,
        priority: form.priority,
        source: form.source,
        destination: form.destination,
        pickupDate: form.pickupDate || undefined,
        estimatedPickupTime: form.estimatedPickupTime || undefined,
        approximateWeight: form.approximateWeight ? parseFloat(form.approximateWeight) : undefined,
        eta: form.eta || undefined,
        status: form.status,
        invoiceAmount: form.price ? parseFloat(form.price) : 0,
        autoAssignVehicle: form.autoAssignVehicle || false
      };

      // Only include referenceId when editing (backend auto-generates for new shipments)
      if (isEditMode && form.referenceId) {
        shipmentData.referenceId = form.referenceId;
      }

      if (isEditMode) {
        await shipmentAPI.update(id, shipmentData);
        setSuccess("Shipment updated successfully!");
        setTimeout(() => {
          exitEditFlow();
        }, 1500);
      } else {
        const response = await shipmentAPI.create(shipmentData);

        // If this shipment was created from a delivery request, approve it
        if (form.requestId) {
          try {
            const token = localStorage.getItem("token");
            await fetch(`http://localhost:5000/api/delivery-requests/${form.requestId}/approve`, {
              method: "PUT",
              headers: {
                "Authorization": `Bearer ${token}`
              }
            });
          } catch (err) {
            console.error("Error approving delivery request:", err);
          }
        }

        setSuccess("Shipment created successfully!" + (form.autoAssignVehicle ? " Vehicle assigned automatically." : ""));

        setTimeout(() => {
          navigate("/admin/shipments", { replace: true });
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save shipment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminNavbar />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 min-h-screen gradient-bg-mesh">
        {/* Decorative background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          {/* BACK BUTTON */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={exitEditFlow}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#c6ac8f] mb-4 transition-colors"
          >
            <FiArrowLeft /> Back
          </motion.button>

          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {isEditMode ? `Edit Shipment – ${id}` : "Create Shipment"}
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              {isEditMode
                ? "Update shipment information"
                : "Enter details to create a new shipment"}
            </p>
          </motion.div>

          {/* ERROR/SUCCESS MESSAGES - Always visible */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
            >
              <div className="font-semibold mb-1">Error Loading Shipment</div>
              {error}
              <button
                onClick={() => {
                  setError("");
                  if (isEditMode) fetchShipment();
                }}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm"
            >
              {success}
            </motion.div>
          )}

          {/* LOADING STATE */}
          {fetchLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-[#c6ac8f] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600 text-sm">Loading shipment data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-gray-500">
              <p>Unable to load shipment. Please check the error message above.</p>
            </div>
          ) : (
            /* FORM */
            <motion.form
              onSubmit={handleSubmit}
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* SECTION 1: BASIC INFO */}
              <motion.section
                variants={fadeInUp}
                className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                    <FiPackage className="text-white" size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Basic Shipment Info</h2>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Customer Name *
                    </label>
                    <input
                      name="customerName"
                      placeholder="Enter customer name"
                      value={form.customerName}
                      onChange={handleChange}
                      readOnly={!!location.state?.prefillData?.customerName}
                      className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f]
                             transition-all duration-300 ${location.state?.prefillData?.customerName ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                      required
                    />
                    {location.state?.prefillData?.customerName && (
                      <p className="text-xs text-gray-500 mt-1">
                        Customer name from delivery request (read-only)
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Customer ID (Optional)
                    </label>
                    <input
                      name="customerId"
                      placeholder="Enter customer ID (MongoDB ObjectId)"
                      value={form.customerId}
                      onChange={handleChange}
                      readOnly={!!location.state?.prefillData?.customerId}
                      className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f]
                             transition-all duration-300 ${location.state?.prefillData?.customerId ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    />
                    {!location.state?.prefillData?.customerId && (
                      <p className="text-xs text-gray-500 mt-1">
                        Optional: Helps filter shipments by customer. Leave empty for now.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Reference ID {isEditMode ? "" : "(Auto-generated)"}
                    </label>
                    <input
                      name="referenceId"
                      placeholder={isEditMode ? "Optional reference" : "Will be auto-generated (e.g., SHP001)"}
                      value={form.referenceId}
                      onChange={handleChange}
                      readOnly={!isEditMode}
                      className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f]
                             transition-all duration-300 ${!isEditMode ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    />
                    {!isEditMode && (
                      <p className="text-xs text-gray-500 mt-1">
                        Shipment ID will be automatically generated by the system
                      </p>
                    )}
                  </div>
                </div>
              </motion.section>

              {/* SECTION 2: ROUTE */}
              <motion.section
                variants={fadeInUp}
                className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md">
                    <FiMapPin className="text-white" size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Route Details</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Source Location *
                    </label>
                    <input
                      name="source"
                      placeholder="e.g., Delhi"
                      value={form.source}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f]
                             transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Destination Location *
                    </label>
                    <input
                      name="destination"
                      placeholder="e.g., Mumbai"
                      value={form.destination}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f]
                             transition-all duration-300"
                    />
                  </div>
                </div>
              </motion.section>

              {/* SECTION 3: SCHEDULE */}
              <motion.section
                variants={fadeInUp}
                className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                    <FiCalendar className="text-white" size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Schedule</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Pickup Date
                    </label>
                    <input
                      type="date"
                      name="pickupDate"
                      value={form.pickupDate}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f]
                             transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Estimated Pickup Time
                    </label>
                    <input
                      type="time"
                      name="estimatedPickupTime"
                      value={form.estimatedPickupTime}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f]
                             transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Expected Delivery (ETA)
                    </label>
                    <input
                      type="date"
                      name="eta"
                      value={form.eta}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f]
                             transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Approximate Weight (kg)
                    </label>
                    <input
                      type="number"
                      name="approximateWeight"
                      placeholder="e.g., 500"
                      value={form.approximateWeight}
                      onChange={handleChange}
                      min="0"
                      step="0.1"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f]
                             transition-all duration-300"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Used for automatic vehicle assignment
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Invoice Amount (₹) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      placeholder="e.g., 5000"
                      value={form.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f]
                             transition-all duration-300"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter shipment cost in Indian Rupees
                    </p>
                  </div>
                </div>
              </motion.section>

              {/* SECTION 4: ASSIGNMENT */}
              <motion.section
                variants={fadeInUp}
                className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md">
                    <FiSettings className="text-white" size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Assignment</h2>
                </div>

                {isEditMode ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Assigned Vehicle</p>
                      <p className="font-semibold text-gray-900">
                        {form.assignedVehicleNumber || <span className="text-gray-400">Not assigned</span>}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/admin/assign?shipment=${id}&return=edit`,
                          { replace: true }
                        )
                      }
                      className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium
                             hover:border-[#c6ac8f] hover:text-[#c6ac8f] transition-all duration-300"
                    >
                      {form.assignedVehicleNumber ? "Reassign Vehicle" : "Assign Vehicle"}
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2.5 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      name="autoAssignVehicle"
                      checked={form.autoAssignVehicle}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-gray-300 text-[#c6ac8f] 
                             focus:ring-2 focus:ring-[#c6ac8f]/50 transition-all"
                    />
                    <span className="text-gray-700 font-medium">Assign Suitable Vehicle Automatically</span>
                  </label>
                )}
                {!isEditMode && form.autoAssignVehicle && (
                  <p className="text-xs text-gray-500 mt-2 ml-6">
                    System will automatically assign the first available IDLE vehicle with sufficient capacity based on approximate weight
                  </p>
                )}
              </motion.section>

              {/* SECTION 5: STATUS (EDIT MODE ONLY) */}
              {isEditMode && (
                <motion.section
                  variants={fadeInUp}
                  className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-sm"
                >
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Shipment Status</h2>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Current Status
                    </label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f]
                             transition-all duration-300 bg-white"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_TRANSIT">In Transit</option>
                      <option value="DELIVERED" disabled>
                        Delivered (system managed)
                      </option>
                    </select>
                  </div>
                </motion.section>
              )}

              {/* ACTIONS */}
              <motion.div
                variants={fadeInUp}
                className="flex justify-end gap-3 pt-4"
              >
                <button
                  type="button"
                  onClick={exitEditFlow}
                  disabled={loading}
                  className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium
                         hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#c6ac8f] to-[#a08060] text-white 
                         rounded-xl text-sm font-medium shadow-md shadow-[#c6ac8f]/30
                         hover:shadow-lg hover:shadow-[#c6ac8f]/40 transition-all duration-300
                         hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                         flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {isEditMode ? "Saving..." : "Creating..."}
                    </>
                  ) : (
                    isEditMode ? "Save Changes" : "Create Shipment"
                  )}
                </button>
              </motion.div>
            </motion.form>
          )}
        </div>
      </main>

      <AdminFooter />
    </>
  );
}
