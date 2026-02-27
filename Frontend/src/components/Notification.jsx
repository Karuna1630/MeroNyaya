import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "case",
    title: "New Proposal Received",
    message: "Lawyer Rajesh Sharma submitted a proposal for 'Property Dispute'.",
    time: "2 min ago",
    read: false,
    icon: "file",
    color: "blue",
  },
  {
    id: 2,
    type: "appointment",
    title: "Appointment Confirmed",
    message: "Your appointment with Adv. Priya Thapa is confirmed for tomorrow.",
    time: "1 hr ago",
    read: false,
    icon: "calendar",
    color: "green",
  },
  {
    id: 3,
    type: "message",
    title: "New Message",
    message: "Adv. Ramesh Basnet sent you a message.",
    time: "3 hrs ago",
    read: false,
    icon: "message",
    color: "purple",
  },
  {
    id: 4,
    type: "payment",
    title: "Payment Successful",
    message: "Payment of NPR 5,000 for consultation has been processed.",
    time: "Yesterday",
    read: true,
    icon: "payment",
    color: "emerald",
  },
  {
    id: 5,
    type: "case",
    title: "Case Status Updated",
    message: "Your case 'Labor Dispute' moved to 'In Progress'.",
    time: "Yesterday",
    read: true,
    icon: "file",
    color: "blue",
  },
  {
    id: 6,
    type: "alert",
    title: "Document Required",
    message: "Upload your citizenship document to complete KYC.",
    time: "2 days ago",
    read: true,
    icon: "alert",
    color: "amber",
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const IconMap = {
  file: FileText,
  calendar: Calendar,
  message: MessageSquare,
  payment: CreditCard,
  alert: AlertCircle,
  info: Info,
};

const colorMap = {
  blue:    { bg: "bg-blue-100",    icon: "text-blue-600",    dot: "bg-blue-500"    },
  green:   { bg: "bg-green-100",   icon: "text-green-600",   dot: "bg-green-500"   },
  purple:  { bg: "bg-purple-100",  icon: "text-purple-600",  dot: "bg-purple-500"  },
  emerald: { bg: "bg-emerald-100", icon: "text-emerald-600", dot: "bg-emerald-500" },
  amber:   { bg: "bg-amber-100",   icon: "text-amber-600",   dot: "bg-amber-500"   },
  slate:   { bg: "bg-slate-100",   icon: "text-slate-500",   dot: "bg-slate-400"   },
};

// ─── Notification Dropdown ─────────────────────────────────────────────────────
const NotificationDropdown = ({ role = "client" }) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState("all");
  const ref = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered =
    activeTab === "all"
      ? notifications
      : activeTab === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const markAsRead = (id) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const remove = (id) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <div className="relative" ref={ref}>
      {/* ── Bell Button ── */}
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

      {/* ── Dropdown Panel ── */}
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
                  onClick={markAllRead}
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

          {/* List */}
          <div className="overflow-y-auto max-h-[360px] divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <EmptyState />
            ) : (
              filtered.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onRead={markAsRead}
                  onRemove={remove}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 bg-slate-50">
              <button
                onClick={() => setNotifications([])}
                className="text-[11px] text-red-400 hover:text-red-600 flex items-center gap-1 font-medium transition"
              >
                <Trash2 size={12} />
                Clear all
              </button>
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

// ─── Individual Item ───────────────────────────────────────────────────────────
const NotificationItem = ({ notification, onRead, onRemove }) => {
  const { id, icon, color, title, message, time, read } = notification;
  const IconComp = IconMap[icon] || Bell;
  const c = colorMap[color] || colorMap.slate;

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition cursor-default group ${
        !read ? "bg-blue-50/40" : ""
      }`}
    >
      {/* Icon */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${c.bg}`}>
        <IconComp size={16} className={c.icon} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <p className={`text-xs font-semibold leading-snug ${read ? "text-slate-600" : "text-[#0F1A3D]"}`}>
            {title}
            {!read && <span className={`inline-block w-1.5 h-1.5 rounded-full ml-1.5 align-middle ${c.dot}`} />}
          </p>
          {/* Action buttons — visible on hover */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
            {!read && (
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
        <p className="text-[10px] text-slate-400 mt-1">{time}</p>
      </div>
    </div>
  );
};

// ─── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
      <BellOff size={24} className="text-slate-300" />
    </div>
    <p className="text-sm font-medium text-slate-500">No notifications</p>
    <p className="text-xs text-slate-400 mt-1">You're all caught up!</p>
  </div>
);

export default NotificationDropdown;
