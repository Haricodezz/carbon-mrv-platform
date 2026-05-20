"use client";

import { useState, useEffect, useRef } from "react";
import { fetchNotifications, markNotificationAsRead, NotificationResponse } from "@/services/notificationService";

interface DashboardHeaderProps {
  title: string;
  userName: string;
  role?: string;
}

export default function DashboardHeader({
  title,
  userName,
  role,
}: DashboardHeaderProps) {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchNotifications();
        setNotifications(data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
    const interval = setInterval(load, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="w-full bg-white border-b border-slate-200 px-10 py-6 flex items-center justify-between relative">

      {/* Left */}
      <div>
        <h1
          className="text-4xl font-bold text-slate-900"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          {title}
        </h1>

        <p className="text-slate-500 mt-2">
          Welcome back, {userName}
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-6">

        {/* Wallet */}
        {role !== 'auditor' && (
          <div className="rounded-2xl bg-slate-50 px-6 py-3 border border-slate-200">
            <p className="text-xs text-slate-500">Wallet Balance</p>
            <p className="font-bold text-green-700">₹0.00</p>
          </div>
        )}

        {/* Notification */}
        <div className="relative" ref={dropdownRef}>
          <button 
            className="rounded-full bg-slate-100 p-4 hover:bg-slate-200 transition relative"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-sm">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition cursor-pointer ${notif.is_read ? 'opacity-70' : 'bg-blue-50/30'}`}
                      onClick={() => { if (!notif.is_read) handleMarkAsRead(notif.id); }}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-sm text-slate-800">{notif.title}</h4>
                        {!notif.is_read && <span className="w-2 h-2 rounded-full bg-blue-600 mt-1"></span>}
                      </div>
                      <p className="text-xs text-slate-600 mb-2">{notif.message}</p>
                      <p className="text-[10px] text-slate-400">{new Date(notif.created_at).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="w-12 h-12 rounded-full bg-green-700 flex items-center justify-center text-white font-bold">
          {userName.charAt(0)}
        </div>

      </div>
    </header>
  );
}