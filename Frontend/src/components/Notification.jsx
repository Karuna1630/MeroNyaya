import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  FileText,
  Calendar,
  MessageSquare,
  CreditCard,
  AlertCircle,
  Info,
  X,
} from "lucide-react";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  addNotification,
} from "../Pages/slices/notificationSlice";


// Icon map for notification types
const IconMap = {
  case:        FileText,
  appointment: Calendar,
  message:     MessageSquare,
  payment:     CreditCard,
  alert:       AlertCircle,
  system:      Info,
};

// Color map for notification types
const colorMap = {
  case:        { bg: "bg-blue-100",    icon: "text-blue-600",    dot: "bg-blue-500"    },
  appointment: { bg: "bg-green-100",   icon: "text-green-600",   dot: "bg-green-500"   },
  message:     { bg: "bg-purple-100",  icon: "text-purple-600",  dot: "bg-purple-500"  },
  payment:     { bg: "bg-emerald-100", icon: "text-emerald-600", dot: "bg-emerald-500" },
  alert:       { bg: "bg-amber-100",   icon: "text-amber-600",   dot: "bg-amber-500"   },
  system:      { bg: "bg-slate-100",   icon: "text-slate-500",   dot: "bg-slate-400"   },
};


// WebSocket URL — picks ws:// or wss:// based on current protocol
const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';


const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const dropdownRef = useRef(null);
  const socketRef = useRef(null);
  const reconnectTimer = useRef(null);

  const dispatch = useDispatch();
  const { notifications, unreadCount, notificationsLoading } = useSelector(
    (state) => state.notifications
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch notifications on mount and connect WebSocket
  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 5;

    dispatch(fetchNotifications());

    const connectWebSocket = () => {
      const token = localStorage.getItem("access_token");
      if (!token || !mounted) return;

      const wsUrl = `${WS_BASE}/ws/notifications/?token=${token}`;
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log("Notification WebSocket connected");
        retryCount = 0; // Reset retry count on successful connection
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "new_notification") {
          dispatch(addNotification(data.notification));
        }
        // initial_notifications are sent on connect but we already fetch via REST
      };

      socket.onclose = () => {
        if (!mounted) return; // Don't reconnect if component unmounted
        retryCount += 1;
        if (retryCount <= maxRetries) {
          const delay = Math.min(retryCount * 3000, 15000); // 3s, 6s, 9s... up to 15s
          console.log(`WebSocket disconnected, retry ${retryCount}/${maxRetries} in ${delay / 1000}s`);
          reconnectTimer.current = setTimeout(connectWebSocket, delay);
        } else {
          console.log("WebSocket max retries reached, stopping reconnection");
        }
      };

      socket.onerror = () => {
        socket.close();
      };

      socketRef.current = socket;
    };

    connectWebSocket();

    return () => {
      // Cleanup — prevent reconnections after unmount
      mounted = false;
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
    };
  }, [dispatch]);

  // Filter notifications based on active tab
  const filtered =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => !n.is_read);

  // Handle mark as read
  const handleMarkRead = (id) => {
    dispatch(markNotificationRead(id));
  };

  // Handle mark all as read
  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
  };

  // Handle delete notification
  const handleDelete = (id) => {
    dispatch(deleteNotification(id));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition"
        title="Notifications"
      >
        <Bell size={24} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-0.5">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 mt-3 w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-[#0F1A3D] to-[#1a2d6d]">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-white/80" />
              <span className="text-white font-semibold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-[11px] text-blue-300 hover:text-white font-medium px-2 py-1 rounded transition"
                  title="Mark all as read"
                >
                  <CheckCheck size={13} />
                  All read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full transition text-white/60 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50">
            {[
              { key: "all",    label: "All" },
              { key: "unread", label: `Unread ${unreadCount > 0 ? `(${unreadCount})` : ""}` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2 text-xs font-semibold transition border-b-2 ${
                  activeTab === tab.key
                    ? "border-[#0F1A3D] text-[#0F1A3D]"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notification list */}
          <div className="overflow-y-auto max-h-[360px] divide-y divide-slate-50">
            {notificationsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-slate-300 border-t-[#0F1A3D] rounded-full animate-spin"></div>
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState />
            ) : (
              filtered.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onRead={handleMarkRead}
                  onRemove={handleDelete}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 bg-slate-50">
              <span className="text-[11px] text-slate-400">
                {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


// Individual notification item
const NotificationItem = ({ notification, onRead, onRemove }) => {
  const { id, notif_type, title, message, created_at, is_read } = notification;
  const IconComp = IconMap[notif_type] || Bell;
  const c = colorMap[notif_type] || colorMap.system;

  // Format the time to relative string
  const timeAgo = getTimeAgo(created_at);

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition cursor-default group ${
        !is_read ? "bg-blue-50/40" : ""
      }`}
    >
      {/* Icon */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${c.bg}`}>
        <IconComp size={16} className={c.icon} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <p className={`text-xs font-semibold leading-snug ${is_read ? "text-slate-600" : "text-[#0F1A3D]"}`}>
            {title}
            {!is_read && <span className={`inline-block w-1.5 h-1.5 rounded-full ml-1.5 align-middle ${c.dot}`} />}
          </p>
          {/* Action buttons — visible on hover */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
            {!is_read && (
              <button
                onClick={() => onRead(id)}
                title="Mark as read"
                className="p-1 hover:bg-blue-100 rounded-full transition text-blue-400"
              >
                <Check size={12} />
              </button>
            )}
            <button
              onClick={() => onRemove(id)}
              title="Dismiss"
              className="p-1 hover:bg-red-100 rounded-full transition text-slate-300 hover:text-red-400"
            >
              <X size={12} />
            </button>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{message}</p>
        <p className="text-[10px] text-slate-400 mt-1">{timeAgo}</p>
      </div>
    </div>
  );
};


// Empty state when no notifications
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
      <BellOff size={24} className="text-slate-300" />
    </div>
    <p className="text-sm font-medium text-slate-500">No notifications</p>
    <p className="text-xs text-slate-400 mt-1">You're all caught up!</p>
  </div>
);


// Helper to convert ISO timestamp to relative time string
function getTimeAgo(dateString) {
  if (!dateString) return "";

  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  if (seconds < 172800) return "Yesterday";
  return `${Math.floor(seconds / 86400)} days ago`;
}

export default NotificationDropdown;
