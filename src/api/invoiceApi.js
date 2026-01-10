import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Get invoices for a specific customer
 * @param {string} customerName - Customer name
 * @param {string} status - Optional status filter (PENDING or PAID)
 * @returns {Promise} Customer invoices
 */
export const getCustomerInvoices = async (customerName, status = null) => {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const url = status
            ? `${API_URL}/invoices/customer/${encodeURIComponent(customerName)}?status=${status}`
            : `${API_URL}/invoices/customer/${encodeURIComponent(customerName)}`;

        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching customer invoices:", error);
        throw error;
    }
};

/**
 * Mark invoice as paid (fake payment)
 * @param {string} invoiceId - Invoice ID to mark as paid
 * @returns {Promise} Payment confirmation
 */
export const markInvoiceAsPaid = async (invoiceId) => {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await axios.post(
            `${API_URL}/invoices/${invoiceId}/pay`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error marking invoice as paid:", error);
        throw error;
    }
};
