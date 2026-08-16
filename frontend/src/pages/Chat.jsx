import React, { useEffect, useRef, useState } from "react";
import socket, { connectSocket } from "../socket";
import Navbar from "../components/Navbar";
import API from "../api/axios";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  Send,
  Video,
  Check,
  CheckCheck,
  Search,
  MessageSquare,
  ArrowLeft
} from "lucide-react";

export default function Chat() {
  const { recipientId: paramRecipientId } = useParams();
  const [searchParams] = useSearchParams();
  const queryWith = searchParams.get("with");
  const targetRecipientId = paramRecipientId || queryWith;

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = currentUser.id || currentUser._id;

  // Conversations & Active Chat State
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [searchConversation, setSearchConversation] = useState("");

  // Real-time Status States
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const isTypingLocalRef = useRef(false);

  const messagesEndRef = useRef(null);

  // Computed Room ID
  const activePartnerId = activePartner?._id || activePartner?.id;
  const roomId =
    currentUserId && activePartnerId
      ? [currentUserId, activePartnerId].sort().join("_")
      : "";

  // 1. Initial Setup: Connect Socket & Fetch Conversations
  useEffect(() => {
    connectSocket();

    const fetchConversationsList = async () => {
      setConversationsLoading(true);
      try {
        const res = await API.get("/chat/conversations");
        const list = res.data.conversations || [];
        setConversations(list);

        if (targetRecipientId) {
          const existing = list.find((c) => (c.partner?._id || c.partner?.id) === targetRecipientId);
          if (existing) {
            setActivePartner(existing.partner);
          } else {
            const userRes = await API.get(`/users/${targetRecipientId}`);
            if (userRes.data.user) {
              setActivePartner(userRes.data.user);
            }
          }
        } else if (list.length > 0 && !activePartner) {
          setActivePartner(list[0].partner);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setConversationsLoading(false);
      }
    };

    fetchConversationsList();
  }, [targetRecipientId]);

  // 2. Socket Listeners
  useEffect(() => {
    socket.emit("get_online_users");

    const handleOnlineList = (list) => {
      setOnlineUserIds(new Set(list));
    };

    const handleStatusChange = ({ userId, status }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        if (status === "online") next.add(userId);
        else next.delete(userId);
        return next;
      });
    };

    const handleReceiveMessage = (message) => {
      if (message.roomId === roomId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });

        if (message.senderId !== currentUserId) {
          socket.emit("mark_read", { roomId });
        }
      }

      setConversations((prev) => {
        const partnerId = message.senderId === currentUserId ? message.receiverId : message.senderId;
        const exists = prev.some((c) => (c.partner?._id || c.partner?.id) === partnerId);

        if (exists) {
          return prev.map((c) => {
            if ((c.partner?._id || c.partner?.id) === partnerId) {
              return {
                ...c,
                lastMessage: message.message,
                lastMessageTime: message.createdAt || new Date().toISOString(),
                lastMessageStatus: message.status,
                unreadCount: message.senderId !== currentUserId && message.roomId !== roomId ? c.unreadCount + 1 : 0
              };
            }
            return c;
          }).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
        }
        return prev;
      });
    };

    const handleMessagesRead = ({ roomId: readRoomId, readerId }) => {
      if (readRoomId === roomId && readerId !== currentUserId) {
        setMessages((prev) =>
          prev.map((msg) => (msg.senderId === currentUserId ? { ...msg, status: "seen" } : msg))
        );
      }
    };

    const handleUserTyping = ({ roomId: typingRoomId, userId }) => {
      if (typingRoomId === roomId && userId !== currentUserId) {
        setIsPartnerTyping(true);
      }
    };

    const handleUserStopTyping = ({ roomId: typingRoomId, userId }) => {
      if (typingRoomId === roomId && userId !== currentUserId) {
        setIsPartnerTyping(false);
      }
    };

    socket.on("online_users_list", handleOnlineList);
    socket.on("user_status_change", handleStatusChange);
    socket.on("receive_message", handleReceiveMessage);
    socket.on("messages_read", handleMessagesRead);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_stop_typing", handleUserStopTyping);

    return () => {
      socket.off("online_users_list", handleOnlineList);
      socket.off("user_status_change", handleStatusChange);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("messages_read", handleMessagesRead);
      socket.off("user_typing", handleUserTyping);
      socket.off("user_stop_typing", handleUserStopTyping);
    };
  }, [roomId, currentUserId]);

  // 3. Join Room on Active Partner Change
  useEffect(() => {
    if (!roomId) return;

    setLoadingHistory(true);
    setIsPartnerTyping(false);

    socket.emit("join_room", roomId);

    API.get(`/chat/messages/${roomId}`)
      .then((res) => {
        setMessages(res.data.messages || []);
        setConversations((prev) =>
          prev.map((c) => {
            if ((c.partner?._id || c.partner?.id) === activePartnerId) {
              return { ...c, unreadCount: 0 };
            }
            return c;
          })
        );
      })
      .catch((err) => console.error("Load messages error:", err))
      .finally(() => setLoadingHistory(false));
  }, [roomId, activePartnerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPartnerTyping]);

  // 4. Send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !roomId || !activePartnerId) return;

    socket.emit("stop_typing", { roomId });
    isTypingLocalRef.current = false;

    socket.emit("send_message", {
      roomId,
      message: newMessage.trim(),
      receiverId: activePartnerId
    });

    setNewMessage("");
  };

  // 5. Typing Input Handler
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (!roomId) return;

    if (!isTypingLocalRef.current) {
      isTypingLocalRef.current = true;
      socket.emit("typing", { roomId });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingLocalRef.current = false;
      socket.emit("stop_typing", { roomId });
    }, 1500);
  };

  const isPartnerOnline = activePartnerId && onlineUserIds.has(activePartnerId);

  const filteredConversations = conversations.filter((c) => {
    if (!searchConversation.trim()) return true;
    const q = searchConversation.toLowerCase();
    return (
      c.partner?.name?.toLowerCase().includes(q) ||
      c.partner?.title?.toLowerCase().includes(q) ||
      c.partner?.company?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-6xl w-full mx-auto p-3 sm:p-4 gap-3 overflow-hidden">
        {/* Left Sidebar: Conversations */}
        <aside className="w-full sm:w-72 md:w-80 bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden flex-shrink-0">
          <div className="p-3 border-b border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Messages</h2>
              <span className="text-[11px] text-slate-400">{conversations.length} contacts</span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchConversation}
                onChange={(e) => setSearchConversation(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversationsLoading ? (
              <div className="p-3 text-xs text-slate-400">Loading contacts...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No chats yet. Find a mentor to start guidance.
              </div>
            ) : (
              filteredConversations.map((c) => {
                const partner = c.partner;
                const pId = partner?._id || partner?.id;
                const isSelected = activePartnerId === pId;
                const isOnline = pId && onlineUserIds.has(pId);

                return (
                  <button
                    key={pId}
                    onClick={() => setActivePartner(partner)}
                    className={`w-full p-3 text-left flex items-start gap-2.5 transition cursor-pointer ${
                      isSelected ? "bg-slate-100 font-medium" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
                        {partner?.name ? partner.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <span
                        className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white ${
                          isOnline ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-slate-900 truncate">
                          {partner?.name || "User"}
                        </h3>
                        {c.lastMessageTime && (
                          <span className="text-[10px] text-slate-400">
                            {new Date(c.lastMessageTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {c.lastMessage || "Click to open chat"}
                      </p>
                    </div>

                    {c.unreadCount > 0 && (
                      <span className="w-4 h-4 bg-slate-900 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                        {c.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Area: Active Chat */}
        <main className="flex-1 bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden">
          {activePartner ? (
            <>
              {/* Header */}
              <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-white z-10">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
                      {activePartner.name ? activePartner.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white ${
                        isPartnerOnline ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                    />
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-900 text-xs">
                      {activePartner.name}
                    </h2>
                    <p className="text-[10px] text-slate-500">
                      {isPartnerTyping ? (
                        <span className="text-slate-900 font-medium animate-pulse">typing...</span>
                      ) : isPartnerOnline ? (
                        <span className="text-emerald-700">Online</span>
                      ) : (
                        "Offline"
                      )}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/call/${roomId}?with=${activePartnerId}`}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-medium transition flex items-center gap-1.5"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Start Video</span>
                </Link>
              </div>

              {/* Message Flow */}
              <div className="flex-1 p-3.5 overflow-y-auto bg-slate-50 space-y-2 text-xs">
                {loadingHistory ? (
                  <div className="text-center text-slate-400 py-8">Loading history...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-slate-400 py-12">
                    No messages yet. Send a greeting to start your conversation.
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe =
                      msg.senderId === currentUserId ||
                      msg.senderId?._id === currentUserId ||
                      msg.senderName === currentUser.name;

                    return (
                      <div
                        key={msg._id || idx}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[75%] px-3 py-2 rounded-lg ${
                            isMe
                              ? "bg-slate-900 text-white rounded-br-xs"
                              : "bg-white text-slate-900 border border-slate-200 rounded-bl-xs"
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed break-words">{msg.message}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${isMe ? "text-slate-400" : "text-slate-400"}`}>
                            <span>
                              {msg.createdAt
                                ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                : ""}
                            </span>
                            {isMe && (
                              <span>
                                {msg.status === "seen" ? (
                                  <CheckCheck className="w-3 h-3 text-cyan-400" />
                                ) : msg.status === "delivered" ? (
                                  <CheckCheck className="w-3 h-3 text-slate-400" />
                                ) : (
                                  <Check className="w-3 h-3 text-slate-400" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {isPartnerTyping && (
                  <div className="text-[11px] text-slate-500 italic bg-white border border-slate-200 px-2.5 py-1 rounded-md w-fit">
                    {activePartner.name} is typing...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Dock */}
              <form onSubmit={handleSendMessage} className="p-2.5 bg-white border-t border-slate-200 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleInputChange}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-medium transition disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center text-slate-400 text-xs">
              <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">Select a conversation</p>
              <p className="text-slate-400 mt-0.5">Pick a contact from the list on the left to start messaging.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}