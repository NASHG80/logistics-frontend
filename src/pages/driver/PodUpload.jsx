import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { shipmentAPI, podAPI } from "../../services/api";
import { Upload, FileText, User, Package, CheckCircle, X } from "lucide-react";
import { motion } from "framer-motion";
import notify from "../../utils/notify";
import { Toaster } from "react-hot-toast";

export default function PodUpload() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch driver's assigned shipments
  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const response = await shipmentAPI.getAll({});
        if (response.data) {
          // Get current driver name
          const driverName = user.name;
          
          // Filter shipments assigned to this driver that are IN_TRANSIT or ACTIVE
          // Note: POD should be uploaded BEFORE ending trip
          const driverShipments = response.data.filter((s) => {
            const isAssignedToDriver = s.assignedDriverName === driverName;
            const isValidStatus = s.status === "IN_TRANSIT" || s.status === "ACTIVE";
            
            return isAssignedToDriver && isValidStatus;
          });
          
          console.log("=== POD Upload Shipment Filter ===");
          console.log("Total shipments:", response.data.length);
          console.log("Driver name:", driverName);
          console.log("Available shipments (IN_TRANSIT/ACTIVE):", driverShipments.length);
          
          if (driverShipments.length === 0) {
            console.log("ℹ️ No shipments available. Make sure:");
            console.log("  1. You have started a trip (status should be IN_TRANSIT)");
            console.log("  2. You haven't ended the trip yet");
            console.log("  3. Upload POD BEFORE clicking 'End Trip'");
            
            // Show all your shipments for debugging
            const yourShipments = response.data.filter(s => s.assignedDriverName === driverName);
            console.log("Your shipments (all statuses):", yourShipments.map(s => ({
              id: s.referenceId,
              status: s.status,
              route: `${s.source} → ${s.destination}`
            })));
          } else {
            console.log("Available shipments:", driverShipments.map(s => ({
              id: s.referenceId,
              status: s.status,
              route: `${s.source} → ${s.destination}`
            })));
          }
          
          setShipments(driverShipments);
        }
      } catch (error) {
        console.error("Error fetching shipments:", error);
      }
    };

    if (user) {
      fetchShipments();
    }
  }, [user]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmitPOD = async () => {
    if (!selectedShipment || !receiverName || !uploadedFile) {
      notify.error("Please fill all fields and upload a POD image");
      return;
    }

    try {
      setLoading(true);
      const base64Image = await convertToBase64(uploadedFile);

      const response = await podAPI.uploadPOD({
        shipmentId: selectedShipment,
        receiverName: receiverName,
        podImage: base64Image,
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          // Reset form
          setSelectedShipment("");
          setReceiverName("");
          setUploadedFile(null);
          setPreviewUrl("");
          setSuccess(false);
          // Refresh shipments
          window.location.reload();
        }, 2000);
      } else {
        notify.error(response.message || "Failed to upload POD");
      }
    } catch (error) {
      console.error("Error uploading POD:", error);
      notify.error(error.response?.data?.message || "Failed to upload POD. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-20 pb-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 mb-4 rounded-full bg-[#c6ac8f]/10 px-4 py-2 text-sm font-medium text-[#c6ac8f]">
            <FileText size={16} />
            POD Upload
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Upload Proof of Delivery
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            Upload the delivery receipt and receiver information for completed shipments
          </p>
        </motion.div>

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
          >
            <CheckCircle className="text-green-600" size={24} />
            <div>
              <p className="font-semibold text-green-900">POD Uploaded Successfully!</p>
              <p className="text-sm text-green-700">Awaiting customer signature...</p>
            </div>
          </motion.div>
        )}

        {/* Main Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 p-6 sm:p-8"
        >
          <div className="space-y-6">
            {/* Shipment Selection */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Package size={16} className="text-[#c6ac8f]" />
                Select Shipment
              </label>
              <select
                value={selectedShipment}
                onChange={(e) => setSelectedShipment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c6ac8f] focus:border-transparent transition-all"
              >
                <option value="">-- Choose a shipment --</option>
                {shipments.map((shipment) => (
                  <option key={shipment._id} value={shipment._id}>
                    {shipment.referenceId} - {shipment.source} → {shipment.destination}
                  </option>
                ))}
              </select>
              {shipments.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  No active shipments available for POD upload
                </p>
              )}
            </div>

            {/* Receiver Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <User size={16} className="text-[#c6ac8f]" />
                Receiver Name
              </label>
              <input
                type="text"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="Enter receiver's full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c6ac8f] focus:border-transparent transition-all"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Upload size={16} className="text-[#c6ac8f]" />
                POD Image/Document
              </label>

              {!uploadedFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-center cursor-pointer hover:border-[#c6ac8f] hover:bg-[#c6ac8f]/5 hover:scale-[1.01] transition-all duration-300"
                >
                  <Upload size={40} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 font-medium mb-1 text-sm sm:text-base">
                    Click to upload POD image
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    PNG, JPG or PDF (max 5MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="border border-gray-300 rounded-xl p-4 bg-gray-50/50">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    {previewUrl && uploadedFile.type.startsWith("image/") && (
                      <img
                        src={previewUrl}
                        alt="POD Preview"
                        className="w-full sm:w-32 h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                      />
                    )}
                    <div className="flex-1 w-full">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 truncate">
                            {uploadedFile.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          onClick={clearFile}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-2 flex-shrink-0"
                        >
                          <X size={20} className="text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitPOD}
              disabled={loading || !selectedShipment || !receiverName || !uploadedFile}
              className="w-full py-4 bg-gradient-to-r from-[#c6ac8f] to-[#b59a7f] text-white font-bold rounded-xl hover:from-[#b59a7f] hover:to-[#a08060] hover:scale-[1.01] disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#c6ac8f]/20"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Submit POD
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl"
        >
          <p className="text-xs sm:text-sm text-blue-900">
            <strong>Note:</strong> After uploading the POD, the shipment status will change to
            "Awaiting Customer Signature". The customer will need to sign electronically to
            complete the delivery process.
          </p>
        </motion.div>
        </div>
      </div>
    </>
  );
}
