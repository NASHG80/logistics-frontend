import React, { useEffect, useRef, useState } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import AdminFooter from "../../components/AdminFooter";
import { FaPaperPlane, FaRobot, FaUser, FaPlus, FaTrash } from "react-icons/fa";
import { HiSparkles, HiLightningBolt, HiTruck, HiCreditCard, HiMenu, HiX } from "react-icons/hi";
import { BiMessageSquareDetail } from "react-icons/bi";
import { v4 as uuidv4 } from "uuid";
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";
import { sendMessage, getAllThreads, getChatHistory, deleteThread } from "../../api/chatApi";

// Register Chart.js components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hi! I'm SaarthiAI, your intelligent logistics assistant. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "text",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentThreadId, setCurrentThreadId] = useState(uuidv4());
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Get auth token from localStorage
  const getAuthToken = () => {
    // Token is stored directly in localStorage, not in user object
    return localStorage.getItem("token");
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat threads on mount
  useEffect(() => {
    loadAllThreads();
  }, []);

  // Load all threads from backend
  const loadAllThreads = async () => {
    try {
      setLoadingThreads(true);
      const token = getAuthToken();
      const response = await getAllThreads(token);

      if (response.success) {
        setChatHistory(response.threads);
      }
    } catch (error) {
      console.error("Error loading threads:", error);
    } finally {
      setLoadingThreads(false);
    }
  };

  // Quick action suggestions
  const quickActions = [
    { icon: HiTruck, text: "Shipment status", query: "Show me shipments by status" },
    { icon: HiLightningBolt, text: "Delayed shipments", query: "How many shipments are delayed?" },
    { icon: HiCreditCard, text: "Payment breakdown", query: "Show payment status breakdown" },
  ];

  const handleQuickAction = (query) => {
    setInput(query);
    inputRef.current?.focus();
  };

  const createNewChat = () => {
    const newThreadId = uuidv4();
    setCurrentThreadId(newThreadId);
    setMessages([
      {
        sender: "ai",
        text: "Hi! I'm SaarthiAI, your intelligent logistics assistant. How can I help you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "text",
      },
    ]);
  };

  const loadChat = async (threadId) => {
    try {
      setCurrentThreadId(threadId);
      setLoading(true);

      const token = getAuthToken();
      const response = await getChatHistory(threadId, token);

      if (response.success) {
        const loadedMessages = response.thread.messages.map(msg => ({
          sender: msg.role,
          text: msg.content,
          type: msg.type,
          chart_data: msg.chart_data,
          timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
        setMessages(loadedMessages);
      }
    } catch (error) {
      console.error("Error loading chat:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteChatThread = async (threadId, e) => {
    e.stopPropagation();

    try {
      const token = getAuthToken();
      await deleteThread(threadId, token);

      // Remove from local state
      setChatHistory(chatHistory.filter(chat => chat.thread_id !== threadId));

      // If current thread was deleted, create new chat
      if (currentThreadId === threadId) {
        createNewChat();
      }
    } catch (error) {
      console.error("Error deleting thread:", error);
    }
  };

  const sendMessageToAI = async () => {
    if (!input.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage = { sender: "user", text: input, timestamp, type: "text" };
    setMessages((prev) => [...prev, userMessage]);

    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      const token = getAuthToken();
      console.log('🔑 Auth token:', token ? 'Found' : 'Missing');
      console.log('📤 Sending message:', currentInput);
      console.log('🧵 Thread ID:', currentThreadId);

      const response = await sendMessage(currentInput, currentThreadId, token);

      console.log('📥 Received response:', response);

      if (response.success) {
        const aiTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const aiResponse = response.response;

        console.log('✅ AI Response type:', aiResponse.type);
        console.log('✅ AI Response data:', aiResponse);

        let aiMessage = {
          sender: "ai",
          timestamp: aiTimestamp,
          type: aiResponse.type,
        };

        if (aiResponse.type === "text") {
          aiMessage.text = aiResponse.data;
        } else if (aiResponse.type === "chart") {
          aiMessage.chart_data = {
            chart_type: aiResponse.chart_type,
            title: aiResponse.title,
            labels: aiResponse.labels,
            data: aiResponse.data_values, // Map data_values to data for chart rendering
          };
          // Also add a text description
          aiMessage.text = aiResponse.title || "Chart generated";
        }

        setMessages((prev) => [...prev, aiMessage]);

        // Reload threads to update sidebar
        loadAllThreads();
      } else {
        console.error('❌ Response success is false:', response);
      }
    } catch (error) {
      console.error("❌ Error sending message:", error);
      console.error("❌ Error details:", error.response?.data || error.message);
      const errorTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "⚠️ Sorry, I'm having trouble connecting to the AI service. Please try again.",
          timestamp: errorTimestamp,
          type: "text"
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Render chart based on type
  const renderChart = (chartData) => {
    const chartColors = {
      backgroundColor: [
        'rgba(198, 172, 143, 0.8)',
        'rgba(160, 128, 96, 0.8)',
        'rgba(139, 115, 85, 0.8)',
        'rgba(184, 153, 104, 0.8)',
        'rgba(205, 179, 139, 0.8)',
      ],
      borderColor: [
        'rgba(198, 172, 143, 1)',
        'rgba(160, 128, 96, 1)',
        'rgba(139, 115, 85, 1)',
        'rgba(184, 153, 104, 1)',
        'rgba(205, 179, 139, 1)',
      ],
    };

    const data = {
      labels: chartData.labels,
      datasets: [
        {
          label: chartData.title,
          data: chartData.data,
          backgroundColor: chartColors.backgroundColor,
          borderColor: chartColors.borderColor,
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
        title: {
          display: true,
          text: chartData.title,
          font: {
            size: 14,
            weight: 'bold',
          },
        },
      },
    };

    const chartStyle = { height: '300px', maxWidth: '500px' };

    switch (chartData.chart_type) {
      case 'pie':
        return <div style={chartStyle}><Pie data={data} options={options} /></div>;
      case 'bar':
        return <div style={chartStyle}><Bar data={data} options={options} /></div>;
      case 'line':
        return <div style={chartStyle}><Line data={data} options={options} /></div>;
      default:
        return <p>Unsupported chart type</p>;
    }
  };

  // Group chats by date
  const groupChatsByDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups = {
      Today: [],
      Yesterday: [],
      "Previous 7 Days": [],
      Older: [],
    };

    chatHistory.forEach(chat => {
      const chatDate = new Date(chat.date);
      chatDate.setHours(0, 0, 0, 0);

      if (chatDate.getTime() === today.getTime()) {
        groups.Today.push(chat);
      } else if (chatDate.getTime() === yesterday.getTime()) {
        groups.Yesterday.push(chat);
      } else if (chatDate >= lastWeek) {
        groups["Previous 7 Days"].push(chat);
      } else {
        groups.Older.push(chat);
      }
    });

    return groups;
  };

  const groupedChats = groupChatsByDate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <AdminNavbar />

      {/* Main Container */}
      <div className="flex-grow flex mt-16 h-[calc(100vh-4rem)]">

        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-72' : 'w-0'} bg-white transition-all duration-300 flex flex-col overflow-hidden border-r border-gray-200 shadow-xl`}>

          {/* Brand Accent Bar */}
          <div className="h-1 bg-gradient-to-r from-[#c6ac8f] via-[#b89968] to-[#c6ac8f]"></div>

          {/* New Chat Button */}
          <div className="p-4 border-b border-gray-100">
            <button
              onClick={createNewChat}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-[#c6ac8f] to-[#b89968] hover:from-[#b89968] hover:to-[#c6ac8f] text-white rounded-xl transition-all shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
            >
              <FaPlus className="text-sm" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {loadingThreads ? (
              <p className="text-center text-gray-500 text-sm">Loading...</p>
            ) : (
              Object.entries(groupedChats).map(([period, chats]) => (
                chats.length > 0 && (
                  <div key={period}>
                    <h3 className="text-xs font-semibold text-gray-500 mb-2 px-2 uppercase tracking-wider">{period}</h3>
                    <div className="space-y-1">
                      {chats.map((chat) => (
                        <div
                          key={chat.thread_id}
                          onClick={() => loadChat(chat.thread_id)}
                          className={`group flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all ${currentThreadId === chat.thread_id
                            ? 'bg-[#c6ac8f]/10 border border-[#c6ac8f]/30 shadow-sm'
                            : 'hover:bg-white hover:shadow-sm'
                            }`}
                        >
                          <BiMessageSquareDetail className={`text-base flex-shrink-0 ${currentThreadId === chat.thread_id ? 'text-[#c6ac8f]' : 'text-gray-400'}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm truncate ${currentThreadId === chat.thread_id ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>{chat.title}</p>
                          </div>
                          <button
                            onClick={(e) => deleteChatThread(chat.thread_id, e)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center justify-center gap-2 px-3 py-2 text-xs text-gray-500">
              <HiSparkles className="text-[#c6ac8f]" />
              <span>SaarthiAI v1.0</span>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white">

          {/* Toggle Sidebar Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`fixed top-20 ${sidebarOpen ? 'left-[19rem]' : 'left-4'} z-50 w-11 h-11 bg-gradient-to-br from-[#c6ac8f] to-[#b89968] rounded-xl shadow-lg hover:shadow-2xl transition-all flex items-center justify-center text-white hover:scale-110`}
            title={sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
          >
            {sidebarOpen ? <HiX size={22} /> : <HiMenu size={22} />}
          </button>

          {/* Chat Header */}
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50">
            <div className="ml-12 max-w-4xl mx-auto flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c6ac8f] to-[#b89968] flex items-center justify-center shadow-lg">
                <FaRobot className="text-white text-lg" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                  SaarthiAI Assistant
                  <HiSparkles className="text-[#c6ac8f] animate-pulse" />
                </h2>
                <p className="text-xs text-gray-600 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></span>
                  Always ready to help
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50">
            <div className="ml-12 max-w-4xl mx-auto space-y-6">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-4 animate-fadeIn ${msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  {msg.sender === "ai" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c6ac8f] to-[#b89968] flex items-center justify-center flex-shrink-0 shadow-md">
                      <FaRobot className="text-white text-sm" />
                    </div>
                  )}

                  <div className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"} max-w-[70%]`}>
                    {msg.type === "text" ? (
                      <div
                        className={`px-5 py-3.5 rounded-2xl text-sm shadow-sm transition-all hover:shadow-md
                          ${msg.sender === "user"
                            ? "bg-gradient-to-br from-[#c6ac8f] to-[#b89968] text-white"
                            : "bg-white text-gray-800 border border-gray-100"
                          }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    ) : msg.type === "chart" && msg.chart_data ? (
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        {renderChart(msg.chart_data)}
                      </div>
                    ) : null}
                    <span className="text-xs text-gray-400 mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>

                  {msg.sender === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center flex-shrink-0 shadow-md">
                      <FaUser className="text-white text-sm" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-4 animate-fadeIn">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c6ac8f] to-[#b89968] flex items-center justify-center flex-shrink-0 shadow-md">
                    <FaRobot className="text-white text-sm" />
                  </div>
                  <div className="bg-white border border-gray-200 px-5 py-3 rounded-2xl shadow-md">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-[#c6ac8f] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-[#c6ac8f] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-[#c6ac8f] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                      <span className="text-sm text-gray-500">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gradient-to-b from-white to-gray-50">
              <div className="ml-12 max-w-4xl mx-auto">
                <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Suggested Actions</p>
                <div className="flex flex-wrap gap-2.5">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickAction(action.query)}
                      className="flex items-center gap-2.5 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-[#c6ac8f] hover:text-[#c6ac8f] hover:shadow-md transition-all font-medium"
                    >
                      <action.icon className="text-base text-[#c6ac8f]" />
                      {action.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-200 px-6 py-5 bg-white shadow-lg">
            <div className="ml-12 max-w-4xl mx-auto flex items-center gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessageToAI()}
                placeholder="Ask me anything about your logistics..."
                className="flex-1 border border-gray-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c6ac8f]/50 focus:border-[#c6ac8f] transition-all placeholder:text-gray-400 bg-gray-50 focus:bg-white shadow-sm"
                disabled={loading}
              />
              <button
                onClick={sendMessageToAI}
                disabled={loading || !input.trim()}
                className="bg-gradient-to-br from-[#c6ac8f] to-[#b89968] text-white px-7 py-3.5 rounded-2xl shadow-md hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 font-medium"
              >
                <FaPaperPlane className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      {/* <AdminFooter /> */}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        /* Custom scrollbar */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thumb-gray-700::-webkit-scrollbar-thumb {
          background-color: #374151;
          border-radius: 3px;
        }
        .scrollbar-track-gray-800::-webkit-scrollbar-track {
          background-color: #1f2937;
        }
      `}</style>
    </div>
  );
};

export default ChatBot;
