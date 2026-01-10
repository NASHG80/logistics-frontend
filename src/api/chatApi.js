import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Send a message to the chatbot
 * @param {string} message - User's message
 * @param {string} threadId - Thread ID
 * @param {string} token - Auth token
 * @returns {Promise} - AI response
 */
export const sendMessage = async (message, threadId, token) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/chat`,
            {
                message,
                thread_id: threadId,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
};

/**
 * Get all chat threads for the user
 * @param {string} token - Auth token
 * @returns {Promise} - List of threads
 */
export const getAllThreads = async (token) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/chat/threads`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching threads:", error);
        throw error;
    }
};

/**
 * Get chat history for a specific thread
 * @param {string} threadId - Thread ID
 * @param {string} token - Auth token
 * @returns {Promise} - Thread with messages
 */
export const getChatHistory = async (threadId, token) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/chat/threads/${threadId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error fetching chat history:", error);
        throw error;
    }
};

/**
 * Delete a chat thread
 * @param {string} threadId - Thread ID
 * @param {string} token - Auth token
 * @returns {Promise} - Deletion confirmation
 */
export const deleteThread = async (threadId, token) => {
    try {
        const response = await axios.delete(
            `${API_BASE_URL}/chat/threads/${threadId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error deleting thread:", error);
        throw error;
    }
};
