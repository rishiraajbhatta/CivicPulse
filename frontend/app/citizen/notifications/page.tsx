"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  FileText,
  Loader2,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  Info,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Inbox,
} from "lucide-react";

import CitizenLayout from "@/components/citizen/CitizenLayout";
import api from "@/lib/api";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  notificationType?: string;
  createdAt: string;
  complaintId?: string;
  complaintCode?: string;
}

const getNotificationIcon = (type?: string) => {
  switch (type?.toUpperCase()) {
    case "RESOLVED":
      return CheckCircle2;
    case "REJECTED":
      return XCircle;
    case "STATUS_UPDATE":
      return RefreshCw;
    case "COMPLAINT":
      return FileText;
    case "WARNING":
      return AlertCircle;
    case "SUCCESS":
      return ShieldCheck;
    default:
      return Info;
  }
};

const getNotificationColor = (type?: string) => {
  switch (type?.toUpperCase()) {
    case "RESOLVED":
    case "SUCCESS":
      return "bg-emerald-100 text-emerald-700";
    case "REJECTED":
    case "WARNING":
      return "bg-red-100 text-red-700";
    case "STATUS_UPDATE":
      return "bg-blue-100 text-blue-700";
    case "COMPLAINT":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
};

const formatDate = (date: string) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function CitizenNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [error, setError] = useState("");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get<Notification[]>("/api/notifications");

      setNotifications(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err: unknown) {
      const message = (
        err as {
          response?: {
            data?: {
              message?: string;
            };
          };
        }
      ).response?.data?.message;

      setError(message || "Unable to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    setUpdatingId(notificationId);

    try {
      await api.patch(`/api/notifications/${notificationId}/read`);

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch {
      setError("Unable to update this notification. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const readCount = notifications.length - unreadCount;

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "UNREAD") return !notification.read;
    if (filter === "READ") return notification.read;
    return true;
  });

  return (
    <CitizenLayout
      title="Notifications"
      description="Stay updated about your civic complaints and their progress."
    >
      <div className="mx-auto max-w-5xl space-y-7 pb-10">

        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 p-7 text-white shadow-lg sm:p-9">
          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">
              <Bell size={14} />
              NOTIFICATION CENTER
            </div>

            <h2 className="text-2xl font-bold sm:text-3xl">
              Stay in the loop.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50 sm:text-base">
              Get updates whenever your complaints are reviewed,
              assigned, worked on, or resolved.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                <p className="text-2xl font-bold">{notifications.length}</p>
                <p className="text-xs text-emerald-50">Total notifications</p>
              </div>

              <div className="rounded-xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                <p className="text-2xl font-bold">{unreadCount}</p>
                <p className="text-xs text-emerald-50">Unread</p>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full border-[35px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 right-32 h-52 w-52 rounded-full bg-lime-300/10 blur-2xl" />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">All notifications</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {notifications.length}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Bell size={21} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Unread</p>
                <p className="mt-2 text-2xl font-bold text-emerald-700">
                  {unreadCount}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Inbox size={21} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Read</p>
                <p className="mt-2 text-2xl font-bold text-gray-700">
                  {readCount}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                <CheckCheck size={21} />
              </div>
            </div>
          </div>
        </div>

        {/* Notification List */}
        <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">

          <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:p-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Your Notifications
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Updates related to your submitted complaints.
              </p>
            </div>

            <button
              onClick={fetchNotifications}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto border-b border-gray-100 px-5 py-4 sm:px-6">
            {[
              { value: "ALL", label: "All", count: notifications.length },
              { value: "UNREAD", label: "Unread", count: unreadCount },
              { value: "READ", label: "Read", count: readCount },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() =>
                  setFilter(item.value as "ALL" | "UNREAD" | "READ")
                }
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  filter === item.value
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {item.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    filter === item.value
                      ? "bg-white/20 text-white"
                      : "bg-white text-gray-600"
                  }`}
                >
                  {item.count}
                </span>
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="m-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-emerald-600" />
              <p className="mt-4 text-sm text-gray-500">
                Loading your notifications...
              </p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
                <Inbox size={35} />
              </div>

              <h3 className="mt-6 text-lg font-bold text-gray-900">
                {filter === "UNREAD"
                  ? "You're all caught up!"
                  : filter === "READ"
                    ? "No read notifications yet"
                    : "No notifications yet"}
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                {filter === "UNREAD"
                  ? "There are no unread notifications at the moment."
                  : "When there are updates about your complaints, they'll appear here."}
              </p>

              <Link
                href="/citizen/complaints/dashboard"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Back to Dashboard
                <ArrowRight size={17} />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => {
                const NotificationIcon = getNotificationIcon(
                  notification.notificationType
                );

                const iconColor = getNotificationColor(
                  notification.notificationType
                );

                return (
                  <div
                    key={notification.id}
                    className={`p-5 transition hover:bg-gray-50/80 sm:p-6 ${
                      !notification.read ? "bg-emerald-50/30" : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconColor}`}
                      >
                        <NotificationIcon size={22} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-gray-900">
                            {notification.title}
                          </h4>

                          {!notification.read && (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                              New
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-sm leading-6 text-gray-600">
                          {notification.message}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} />
                            {formatDate(notification.createdAt)}
                          </span>

                          {notification.complaintCode && (
                            <span className="font-semibold text-emerald-700">
                              {notification.complaintCode}
                            </span>
                          )}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          {notification.complaintId && (
                            <Link
                              href="/citizen/complaints"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 transition hover:text-emerald-800"
                            >
                              View My Complaints
                              <ArrowRight size={14} />
                            </Link>
                          )}

                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              disabled={updatingId === notification.id}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
                            >
                              {updatingId === notification.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Check size={14} />
                              )}
                              Mark as read
                            </button>
                          )}

                          {notification.read && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
                              <CheckCheck size={14} />
                              Read
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Footer Information */}
        <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <ShieldCheck size={21} className="mt-0.5 shrink-0 text-blue-700" />

          <div>
            <p className="text-sm font-bold text-blue-900">
              Stay informed about your reports
            </p>

            <p className="mt-1 text-xs leading-5 text-blue-700">
              CivicPulse keeps you updated when authorities review,
              assign, or resolve your complaints. You can also track
              individual complaint progress from My Complaints.
            </p>
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}