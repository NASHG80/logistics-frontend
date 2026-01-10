import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Fetch AI insights
 * @param {boolean} force - If true, forces regeneration of insights
 * @returns {Promise} Insights data
 */
export const fetchInsights = async (force = false) => {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const url = force ? `${API_URL}/insights?force=true` : `${API_URL}/insights`;

        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching insights:", error);
        throw error;
    }
};
