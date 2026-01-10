import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Submit a support ticket
 * @param {Object} ticketData - Support ticket data
 * @returns {Promise} Created ticket response
 */
export const submitSupportTicket = async (ticketData) => {
    try {
        const response = await axios.post(`${API_URL}/support`, ticketData);
        return response.data;
    } catch (error) {
        console.error("Error submitting support ticket:", error);
        throw error;
    }
};

/**
 * Get all support tickets (Admin only)
 * @param {string} status - Optional status filter
 * @returns {Promise} List of tickets
 */
export const getAllSupportTickets = async (status = null) => {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const url = status
            ? `${API_URL}/support?status=${status}`
            : `${API_URL}/support`;

        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching support tickets:", error);
        throw error;
    }
};
