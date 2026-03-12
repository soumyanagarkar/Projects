import React, { useState, useEffect, useRef } from "react";
import { FiSend, FiMessageSquare, FiUser } from "react-icons/fi";
import { useSocket } from "../hooks/useSocket";
import { useAuthStore } from "../stores/useStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  PRIMARY_BLUE,
  PRIMARY_BLUE_LIGHT,
  ACCENT_CYAN,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  BORDER_COLOR,
  SHADOW_MD,
  BACKGROUND_LIGHT,
  GRADIENT_CYAN
} from "../color-constants";

const ProjectChat = ({ projectId }) => {
  const { user } = useAuthStore();
  const socket = useSocket();

  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Scroll to bottom on load and new messages
    scrollToBottom();
  }, [messageList]);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token;
        const res = await fetch(`http://localhost:5000/api/chat/${projectId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        const formatted = (data || []).map(msg => {
          const senderId = msg.sender?._id || msg.sender || msg.senderId;
          const senderName = msg.sender?.name || msg.senderName || "User";
          const createdAt = msg.createdAt || msg.timestamp || new Date();

          return {
            ...msg,
            senderId,
            senderName,
            time: new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        });
        setMessageList(formatted);
      } catch (err) {
        console.error("Chat fetch error:", err);
      }
    };

    if (projectId) fetchMessages();
  }, [projectId]);

  // Socket setup
  useEffect(() => {
    if (!socket || !projectId || !user) return;

    socket.emit("join_room", { roomName: projectId, userId: user.id });

    const handleReceiveMessage = (data) => {
      setMessageList((prev) => [...prev, data]);
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket, projectId, user]);

  const sendMessage = async () => {
    if (!message.trim() || !user || !socket) return;

    const messageData = {
      projectId,
      senderId: user.id,
      senderName: user.name, // Send name for optimistic UI
      message: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Emit via socket
    socket.emit("send_message", messageData);

    // Optimistic update? No, socket will broadcast back to us if we are in the room. 
    // But usually sender wants instant feedback. 
    // However, if we listen to 'receive_message', we might get double if we add manually.
    // Let's rely on socket broadcast for simplicity or check if backend excludes sender.
    // Standard socket.io `io.to(room).emit` sends to everyone in room including sender.

    setMessage("");
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <FiMessageSquare size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Team Chat</h3>
            <p className="text-xs text-slate-500">{messageList.length} messages</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FAFAFA]">
        {messageList.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
            <FiMessageSquare size={48} className="mb-2" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messageList.map((msg, idx) => {
            const isMe = user && (String(msg.senderId) === String(user.id) || String(msg.sender?._id) === String(user.id));
            const isSystem = msg.senderId === "system";

            if (isSystem) {
              return (
                <div key={idx} className="flex justify-center my-4">
                  <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                    {msg.message}
                  </span>
                </div>
              );
            }

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isMe ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
                  }`}>
                  {msg.senderName ? msg.senderName.charAt(0).toUpperCase() : <FiUser />}
                </div>

                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[70%]`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-700">{msg.senderName}</span>
                    <span className="text-[10px] text-slate-400">{msg.time}</span>
                  </div>

                  <div className={`px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-white border border-slate-100 text-slate-700 rounded-tl-none"
                    }`}>
                    {msg.message}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            className="w-full pl-5 pr-14 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={!message.trim()}
            className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-200"
          >
            <FiSend size={18} />
          </button>
        </div>
        <div className="text-center mt-2">
          <p className="text-[10px] text-slate-400">Press Enter to send</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectChat;