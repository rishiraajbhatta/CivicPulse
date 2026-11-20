"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  FileText,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Search,
  Loader2,
  ExternalLink,
  Inbox,
  ShieldCheck,
  User,
} from "lucide-react";

import ModeratorLayout from "@/components/moderator/ModeratorLayout";
import api from "@/lib/api";

interface ModeratorNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  notificationType?: string;
  createdAt: string;
  complaintId?: string;
  complaintCode?: string;
}

const notificationStyles: Record<
  string,
  { icon: typeof Bell; background: string; color: string; label: string }
> = {
  NEW_COMPLAINT: {
    icon: FileText,
    background: "bg-blue-50",
    color: "text-blue-700",
    label: "New Complaint",
  },
  COMPLAINT_ASSIGNED: {
    icon: User,
    background: "bg-purple-50",
    color: "text-purple-700",
    label: "Assignment",
  },
  STATUS_UPDATE: {
    icon: RefreshCw,
    background: "bg-amber-50",
    color: "text-amber-700",
    label: "Status Update",
  },
  DUPLICATE_DETECTED: {
    icon: AlertTriangle,
    background: "bg-orange-50",
    color: "text-orange-700",
    label: "Duplicate Alert",
  },
  COMPLAINT_RESOLVED: {
    icon: CheckCircle2,
    background: "bg-emerald-50",
    color: "text-emerald-700",
    label: "Resolution",
  },
  SYSTEM: {
    icon: ShieldCheck,
    background: "bg-gray-100",
    color: "text-gray-700",
    label: "System",
  },
};

function getNotificationStyle(type?: string) {
  return notificationStyles[type || "SYSTEM"] || notificationStyles.SYSTEM;
}

function formatDate(date: string) {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRelativeTime(date: string) {
  const timestamp = new Date(date).getTime();

  if (!Number.isFinite(timestamp)) return "";

  const difference = Date.now() - timestamp;

  const minutes = Math.floor(difference / 60000);
  const hours = Math.floor(difference / 3600000);
  const days = Math.floor(difference / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  if (days < 7) return `${days} days ago`;

  return formatDate(date);
}

export default function ModeratorNotificationsPage() {
  const [notifications, setNotifications] = useState<
    ModeratorNotification[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchNotifications = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/api/moderators/notifications");

      setNotifications(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Failed to load moderator notifications:", err);

      setError(
        "Unable to load notifications. The moderator notification API still needs to be connected in the backend."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const readCount = notifications.length - unreadCount;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        !search ||
        notification.title?.toLowerCase().includes(searchText) ||
        notification.message?.toLowerCase().includes(searchText) ||
        notification.complaintCode?.toLowerCase().includes(searchText);

      const matchesFilter =
        filter === "ALL" ||
        (filter === "UNREAD" && !notification.read) ||
        (filter === "READ" && notification.read);

      return matchesSearch && matchesFilter;
    });
  }, [notifications, search, filter]);

  const markAsRead = async (notificationId: string) => {
    try {
      setProcessingId(notificationId);
      setError("");
      setSuccess("");

      await api.patch(
        `/api/moderators/notifications/${notificationId}/read`
      );

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      setSuccess("Notification marked as read.");
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      setError("Unable to update this notification. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(
      (notification) => !notification.read
    );

    if (unreadNotifications.length === 0) return;

    try {
      setMarkingAll(true);
      setError("");
      setSuccess("");

      // Update notifications individually until a bulk endpoint is available.
      for (const notification of unreadNotifications) {
        await api.patch(
          `/api/moderators/notifications/${notification.id}/read`
        );
      }

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      setSuccess("All notifications have been marked as read.");
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);

      await fetchNotifications(true);

      setError(
        "Some notifications could not be updated. Please try again."
      );
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <ModeratorLayout
      title="Notifications"
      description="Stay updated on complaints and moderation activities."
    >
      <div className="space-y-7">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">
              Your Notifications
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Important updates about CivicPulse complaint management.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => fetchNotifications(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              onClick={markAllAsRead}
              disabled={markingAll || unreadCount === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {markingAll ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCheck size={16} />
              )}

              Mark All Read
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <p className="text-sm leading-6 text-red-700">{error}</p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <CheckCircle2 size={20} className="text-emerald-600" />

            <p className="text-sm text-emerald-800">{success}</p>
          </div>
        )}

        {/* Welcome Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-700 p-6 text-white sm:p-8">
          <div className="relative z-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2 text-emerald-100">
                <Bell size={17} />

                <span className="text-xs font-bold uppercase tracking-widest">
                  Notification Centre
                </span>
              </div>

              <h3 className="mt-3 text-2xl font-extrabold">
                Stay in the Loop
              </h3>

              <p className="mt-2 max-w-lg text-sm leading-6 text-emerald-100">
                Keep track of new citizen complaints, assignments,
                duplicate alerts and important resolution updates.
              </p>
            </div>

            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-white/20 bg-white/10">
              <Bell size={38} className="text-lime-200" />
            </div>
          </div>

          <div className="absolute -bottom-16 -right-10 h-48 w-48 rounded-full bg-white/5" />
          <div className="absolute -right-5 -top-20 h-48 w-48 rounded-full bg-white/5" />
        </section>

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500">
                  Total Notifications
                </p>

                <p className="mt-2 text-3xl font-extrabold text-gray-900">
                  {notifications.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Inbox size={23} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-700">
                  Unread Notifications
                </p>

                <p className="mt-2 text-3xl font-extrabold text-amber-800">
                  {unreadCount}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Bell size={23} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-700">
                  Read Notifications
                </p>

                <p className="mt-2 text-3xl font-extrabold text-emerald-800">
                  {readCount}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <CheckCheck size={23} />
              </div>
            </div>
          </div>

        </div>

        {/* Search and Filters */}
        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="relative w-full lg:max-w-md">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search notifications..."
                className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { label: "All", value: "ALL" },
                { label: "Unread", value: "UNREAD" },
                { label: "Read", value: "READ" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`rounded-xl px-5 py-2.5 text-xs font-bold transition ${
                    filter === option.value
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

          </div>
        </section>

        {/* Notification List */}
        <section className="space-y-4">

          {loading ? (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white">
              <Loader2
                size={32}
                className="animate-spin text-emerald-600"
              />

              <p className="mt-4 text-sm font-medium text-gray-500">
                Loading notifications...
              </p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="rounded-3xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Bell size={30} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-900">
                {notifications.length === 0
                  ? "No Notifications Yet"
                  : "No Matching Notifications"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                {notifications.length === 0
                  ? "Important complaint and moderation updates will appear here."
                  : "Try changing your search or notification filter."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const style = getNotificationStyle(
                notification.notificationType
              );

              const Icon = style.icon;

              return (
                <article
                  key={notification.id}
                  className={`group rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6 ${
                    notification.read
                      ? "border-gray-100"
                      : "border-emerald-200 bg-emerald-50/20"
                  }`}
                >
                  <div className="flex items-start gap-4">

                    {/* Notification Icon */}
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${style.background} ${style.color}`}
                    >
                      <Icon size={22} />
                    </div>

                    {/* Notification Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-extrabold text-gray-900">
                          {notification.title}
                        </h3>

                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        )}
                      </div>

                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        {notification.message}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${style.background} ${style.color}`}
                        >
                          {style.label}
                        </span>

                        <span className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Clock size={13} />
                          {getRelativeTime(notification.createdAt)}
                        </span>

                        {notification.complaintCode && (
                          <span className="text-xs font-semibold text-gray-500">
                            {notification.complaintCode}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex flex-wrap items-center gap-4">
                        {notification.complaintId && (
                          <Link
                            href={`/moderator/complaints/${notification.complaintId}`}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900"
                          >
                            View Complaint
                            <ExternalLink size={13} />
                          </Link>
                        )}

                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            disabled={processingId === notification.id}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 transition hover:text-emerald-700 disabled:opacity-50"
                          >
                            {processingId === notification.id ? (
                              <Loader2
                                size={14}
                                className="animate-spin"
                              />
                            ) : (
                              <CheckCircle2 size={14} />
                            )}

                            Mark as Read
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Read Status */}
                    <div className="hidden shrink-0 sm:block">
                      {notification.read ? (
                        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-bold text-gray-500">
                          READ
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-[10px] font-bold text-emerald-800">
                          NEW
                        </span>
                      )}
                    </div>

                  </div>
                </article>
              );
            })
          )}

        </section>

        {/* Footer */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={19}
              className="mt-0.5 text-emerald-600"
            />

            <div>
              <p className="text-sm font-bold text-gray-800">
                CivicPulse Notification Centre
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Notifications help moderators stay informed about citizen
                reports and complaint management activities.
              </p>
            </div>
          </div>
        </div>

      </div>
    </ModeratorLayout>
  );
}