import toast from "react-hot-toast";

// System-themed notification utility
const notify = {
  success: (message) => {
    toast.success(message, {
      duration: 4000,
      position: "top-center",
      style: {
        background: "#10b981",
        color: "#fff",
        fontWeight: "600",
        padding: "16px",
        borderRadius: "12px",
      },
      iconTheme: {
        primary: "#fff",
        secondary: "#10b981",
      },
    });
  },

  error: (message) => {
    toast.error(message, {
      duration: 4000,
      position: "top-center",
      style: {
        background: "#ef4444",
        color: "#fff",
        fontWeight: "600",
        padding: "16px",
        borderRadius: "12px",
      },
      iconTheme: {
        primary: "#fff",
        secondary: "#ef4444",
      },
    });
  },

  info: (message) => {
    toast(message, {
      duration: 4000,
      position: "top-center",
      icon: "ℹ️",
      style: {
        background: "#3b82f6",
        color: "#fff",
        fontWeight: "600",
        padding: "16px",
        borderRadius: "12px",
      },
    });
  },

  warning: (message) => {
    toast(message, {
      duration: 4000,
      position: "top-center",
      icon: "⚠️",
      style: {
        background: "#f59e0b",
        color: "#fff",
        fontWeight: "600",
        padding: "16px",
        borderRadius: "12px",
      },
    });
  },

  confirm: (message, onConfirm) => {
    if (window.confirm(message)) {
      onConfirm();
    }
  },
};

export default notify;
