import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { FaCheckCircle, FaUndo } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { PenTool, AlertCircle } from "lucide-react";
import { epodAPI } from "../../services/api";
import CustomerNavbar from "../../components/CustomerNavbar";
import CustomerFooter from "../../components/CustomerFooter";
import notify from "../../utils/notify";
import { Toaster } from "react-hot-toast";

export default function CustomerEPOD() {
  const { shipmentId } = useParams();
  const navigate = useNavigate();
  const sigRef = useRef();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submitSignature = async () => {
    if (sigRef.current.isEmpty()) {
      setError("Please sign before submitting");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Get signature as base64 image
      const signatureImage = sigRef.current.toDataURL("image/png");

      const response = await epodAPI.submitSignature(shipmentId, {
        signatureImage
      });

      if (response.success) {
        // Check if there's a pending invoice for this shipment
        try {
          const user = JSON.parse(localStorage.getItem("user"));
          const customerName = user?.name;

          if (customerName) {
            // Import the invoice API
            const { getCustomerInvoices } = await import("../../api/invoiceApi");
            const invoiceResponse = await getCustomerInvoices(customerName, "PENDING");

            // Find invoice for this shipment
            const shipmentInvoice = invoiceResponse.data?.find(
              inv => inv.shipmentId === shipmentId
            );

            if (shipmentInvoice) {
              // Redirect to payment page with shipmentId
              notify.info("Delivery confirmed! Please proceed to payment.");
              navigate(`/customer/payments?shipmentId=${shipmentId}`);
              return;
            }
          }
        } catch (invoiceError) {
          console.error("Error checking invoice:", invoiceError);
          // Continue with normal flow if invoice check fails
        }

        // If no invoice or error, show success and redirect to shipments
        notify.success("Delivery confirmed successfully! ✓");
        setTimeout(() => {
          navigate("/customer/shipments");
        }, 1000);
      } else {
        setError(response.message || "Failed to submit signature");
      }
    } catch (err) {
      console.error("Error submitting signature:", err);
      setError(err.response?.data?.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster />
      <CustomerNavbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 sm:p-6 pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl w-full max-w-2xl border border-gray-200"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-3 rounded-full bg-[#c6ac8f]/10 px-4 py-2 text-sm font-medium text-[#c6ac8f]">
              <PenTool size={16} />
              Electronic Signature
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Proof of Delivery
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Please sign below to confirm receipt of your shipment
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-red-800">{error}</p>
            </motion.div>
          )}

          {/* Signature Canvas */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Your Signature
            </label>
            <div className="border-2 border-gray-300 rounded-xl overflow-hidden bg-gray-50 hover:border-[#c6ac8f]/50 transition-colors">
              <SignatureCanvas
                ref={sigRef}
                penColor="black"
                canvasProps={{
                  width: 600,
                  height: 250,
                  className: "w-full h-auto cursor-crosshair",
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Draw your signature in the box above
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => sigRef.current.clear()}
              className="px-6 py-3 rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all font-medium text-gray-700 flex items-center justify-center gap-2"
            >
              <FaUndo size={16} />
              Clear
            </button>

            <button
              onClick={submitSignature}
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-xl bg-[#c6ac8f] text-white font-bold hover:bg-[#b59a7f] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#c6ac8f]/20"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <FaCheckCircle size={18} />
                  Confirm Delivery
                </>
              )}
            </button>
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs sm:text-sm text-blue-900">
              <strong>Note:</strong> By signing, you confirm that you have received the shipment
              in good condition. This signature will be stored as proof of delivery.
            </p>
          </div>
        </motion.div>
      </div>
      <CustomerFooter />
    </>
  );
}
