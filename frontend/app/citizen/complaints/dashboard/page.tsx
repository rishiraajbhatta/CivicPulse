"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  ArrowUpRight,
  FileText,
  Clock3,
  CheckCircle2,
  AlertCircle,
  MapPin,
  CalendarDays,
  Bell,
  RefreshCw,
  Leaf,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

import CitizenLayout from "@/components/citizen/CitizenLayout";
import api from "@/lib/api";

interface Complaint {
  id: string;
  complaintCode: string;
  category: string;
  description: string;
  address: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

interface CitizenUser {
  fullName: string;
}

const statusConfig: Record<
  string,
  { label: string; color: string; background: string }
> = {
  SUBMITTED: {
    label: "Submitted",
    color: "text-blue-700",
    background: "bg-blue-50",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    color: "text-purple-700",
    background: "bg-purple-50",
  },
  VERIFIED: {
    label: "Verified",
    color: "text-indigo-700",
    background: "bg-indigo-50",
  },
  ASSIGNED: {
    label: "Assigned",
    color: "text-orange-700",
    background: "bg-orange-50",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "text-amber-700",
    background: "bg-amber-50",
  },
  RESOLVED: {
    label: "Resolved",
    color: "text-emerald-700",
    background: "bg-emerald-50",
  },
  REJECTED: {
    label: "Rejected",
    color: "text-red-700",
    background: "bg-red-50",
  },
  DUPLICATE: {
    label: "Duplicate",
    color: "text-gray-700",
    background: "bg-gray-100",
  },
};

const categoryLabels: Record<string, string> = {
  POTHOLE: "Pothole",
  GARBAGE_DUMPING: "Garbage Dumping",
  WATER_LEAKAGE: "Water Leakage",
  STREETLIGHT: "Streetlight",
  DRAINAGE: "Drainage",
  ROAD_DAMAGE: "Road Damage",
  OTHER: "Other",
};

export default function CitizenDashboardPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [user, setUser] = useState<CitizenUser | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("civicpulse_user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("civicpulse_user");
      }
    }

    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    setError("");

    try {
      const [complaintsResponse, notificationsResponse] =
        await Promise.allSettled([
          api.get<Complaint[]>("/api/complaints/my"),
          api.get<number>("/api/notifications/unread-count"),
        ]);

      if (complaintsResponse.status === "fulfilled") {
        setComplaints(complaintsResponse.value.data);
      } else {
        setError(
          "Unable to load your complaints. Please refresh the page."
        );
      }

      if (notificationsResponse.status === "fulfilled") {
        setUnreadCount(Number(notificationsResponse.value.data) || 0);
      }
    } catch {
      setError("Unable to connect to CivicPulse. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const totalComplaints = complaints.length;

  const resolvedComplaints = complaints.filter(
    (complaint) => complaint.status === "RESOLVED"
  ).length;

  const inProgressComplaints = complaints.filter((complaint) =>
    ["ASSIGNED", "IN_PROGRESS"].includes(complaint.status)
  ).length;

  const pendingComplaints = complaints.filter((complaint) =>
    ["SUBMITTED", "UNDER_REVIEW", "VERIFIED"].includes(
      complaint.status
    )
  ).length;

  const recentComplaints = complaints.slice(0, 5);

  const firstName = user?.fullName?.split(" ")[0] || "Citizen";

  function formatDate(date: string) {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <CitizenLayout
      title="Overview"
      description="Here's what's happening with your civic reports."
    >
      {/* WELCOME BANNER */}
      <section className="relative mb-9 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#174D35] via-[#103D2D] to-[#09291D] p-7 text-white shadow-xl shadow-[#103D2D]/10 sm:p-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border border-white/10" />
          <div className="absolute -right-5 -top-16 h-64 w-64 rounded-full border border-white/10" />
          <div className="absolute -bottom-40 right-1/4 h-80 w-80 rounded-full bg-[#B9E77C]/10 blur-[90px]" />
          <div className="absolute right-20 top-10 h-40 w-40 rounded-full bg-[#B9E77C]/10 blur-[70px]" />
        </div>

        <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-[#D6F2B4]">
              <Leaf size={14} />
              CITIZEN COMMUNITY PORTAL
            </div>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Good to see you,
              <br />
              <span className="text-[#B9E77C]">{firstName}!</span>
            </h2>

            <p className="mt-4 max-w-md text-sm leading-7 text-white/65">
              Every report brings your neighbourhood one step closer
              to becoming a better place. Keep making your voice count.
            </p>

            <Link
              href="/citizen/complaints/report"
              className="mt-7 inline-flex items-center gap-3 rounded-xl bg-[#B9E77C] px-6 py-3.5 text-sm font-bold text-[#103D2D] shadow-lg transition hover:-translate-y-1 hover:bg-[#D0F19E]"
            >
              <Plus size={19} />
              Report a civic issue
              <ArrowUpRight size={17} />
            </Link>
          </div>

          <div className="hidden h-44 w-44 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] md:flex">
            <div className="flex h-32 w-32 items-center justify-center rounded-full border border-[#B9E77C]/30 bg-[#B9E77C]/10">
              <Leaf size={65} className="text-[#B9E77C]" />
            </div>
          </div>
        </div>
      </section>

      {/* PAGE ACTIONS */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#173D2D]">
            Your activity
          </h2>
          <p className="mt-1 text-sm text-[#91A395]">
            A snapshot of your civic contributions.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-[#DDE7DB] bg-white px-4 py-2.5 text-xs font-bold text-[#45634F] shadow-sm transition hover:bg-[#F1F6EA] disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* STATISTICS */}
      <section className="mb-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Total Reports",
            value: totalComplaints,
            description: "All reports submitted",
            icon: FileText,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
            accent: "bg-blue-500",
          },
          {
            title: "Pending Review",
            value: pendingComplaints,
            description: "Awaiting verification",
            icon: Clock3,
            iconBg: "bg-amber-50",
            iconColor: "text-amber-600",
            accent: "bg-amber-500",
          },
          {
            title: "In Progress",
            value: inProgressComplaints,
            description: "Being worked on",
            icon: TrendingUp,
            iconBg: "bg-purple-50",
            iconColor: "text-purple-600",
            accent: "bg-purple-500",
          },
          {
            title: "Resolved",
            value: resolvedComplaints,
            description: "Successfully addressed",
            icon: CheckCircle2,
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-600",
            accent: "bg-emerald-500",
          },
        ].map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -4 }}
              className="relative overflow-hidden rounded-2xl border border-[#E6EBE0] bg-white p-6 shadow-sm transition-shadow hover:shadow-lg"
            >
              <div
                className={`absolute left-0 top-0 h-full w-1 ${stat.accent}`}
              />

              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#829087]">
                    {stat.title}
                  </p>

                  <p className="mt-3 text-3xl font-bold text-[#173D2D]">
                    {loading ? "—" : stat.value}
                  </p>

                  <p className="mt-2 text-xs text-[#A1ADA0]">
                    {stat.description}
                  </p>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.iconBg} ${stat.iconColor}`}
                >
                  <Icon size={23} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* NOTIFICATION AND IMPACT CARDS */}
      <section className="mb-9 grid gap-5 lg:grid-cols-3">
        <Link
          href="/citizen/notifications"
          className="group flex items-center justify-between rounded-2xl border border-[#E6EBE0] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md lg:col-span-2"
        >
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EDF6E5] text-[#438B50]">
              <Bell size={25} />

              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>

            <div>
              <h3 className="font-bold text-[#214832]">
                Your notifications
              </h3>

              <p className="mt-1 text-sm text-[#91A395]">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notifications.`
                  : "You're all caught up with your updates."}
              </p>
            </div>
          </div>

          <ChevronRight
            size={21}
            className="text-[#91A395] transition group-hover:translate-x-1 group-hover:text-[#438B50]"
          />
        </Link>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#E8F2DB] to-[#D6EAC8] p-6">
          <div className="absolute -bottom-10 -right-10 h-36 w-36 rounded-full bg-white/30 blur-2xl" />

          <div className="relative">
            <div className="flex items-center gap-2 text-[#438B50]">
              <Leaf size={19} />
              <span className="text-xs font-bold uppercase tracking-wider">
                Your contribution
              </span>
            </div>

            <p className="mt-4 text-3xl font-bold text-[#174D35]">
              {loading ? "—" : resolvedComplaints}
            </p>

            <p className="mt-2 text-xs leading-5 text-[#62826A]">
              Issues you've helped move towards resolution.
            </p>
          </div>
        </div>
      </section>

      {/* RECENT COMPLAINTS */}
      <section className="overflow-hidden rounded-2xl border border-[#E6EBE0] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EEF1E9] px-6 py-6 sm:px-8">
          <div>
            <h2 className="text-lg font-bold text-[#173D2D]">
              Recent complaints
            </h2>

            <p className="mt-1 text-xs text-[#91A395]">
              Track the latest issues you've reported.
            </p>
          </div>

          <Link
            href="/citizen/complaints"
            className="flex items-center gap-2 text-xs font-bold text-[#438B50] transition hover:text-[#103D2D]"
          >
            View all
            <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="p-6 sm:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-14">
              <RefreshCw
                size={27}
                className="animate-spin text-[#438B50]"
              />
              <p className="mt-4 text-sm text-[#91A395]">
                Loading your complaints...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle size={30} className="text-red-400" />
              <p className="mt-4 text-sm font-semibold text-red-600">
                {error}
              </p>

              <button
                onClick={fetchDashboardData}
                className="mt-4 rounded-lg bg-[#103D2D] px-5 py-2.5 text-xs font-bold text-white"
              >
                Try again
              </button>
            </div>
          ) : recentComplaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F0F5EB] text-[#438B50]">
                <FileText size={30} />
              </div>

              <h3 className="mt-5 font-bold text-[#214832]">
                No complaints yet
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-[#91A395]">
                You haven't reported any civic issues. Start by
                reporting a problem in your neighbourhood.
              </p>

              <Link
                href="/citizen/complaints/report"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#103D2D] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#18563D]"
              >
                <Plus size={16} />
                Report your first issue
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentComplaints.map((complaint, index) => {
                const status =
                  statusConfig[complaint.status] ||
                  statusConfig.SUBMITTED;

                return (
                  <motion.div
                    key={complaint.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.07 }}
                    className="group flex flex-col justify-between gap-4 rounded-xl border border-[#EEF1E9] p-5 transition hover:border-[#C9DCC2] hover:bg-[#FAFCF8] sm:flex-row sm:items-center"
                  >
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F0F5EB] text-[#438B50]">
                        <MapPin size={21} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-[#214832]">
                          {categoryLabels[complaint.category] ||
                            complaint.category}
                        </h3>

                        <p className="mt-1 line-clamp-1 text-xs text-[#829087]">
                          {complaint.description}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] text-[#A1ADA0]">
                          <span className="font-semibold">
                            {complaint.complaintCode}
                          </span>

                          <span className="flex items-center gap-1">
                            <CalendarDays size={12} />
                            {formatDate(complaint.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
                      <span
                        className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${status.background} ${status.color}`}
                      >
                        {status.label}
                      </span>

                      <ChevronRight
                        size={18}
                        className="text-[#A1ADA0] transition group-hover:translate-x-1 group-hover:text-[#438B50]"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        {!loading && complaints.length > 0 && (
          <div className="flex items-center justify-center border-t border-[#EEF1E9] px-6 py-4">
            <Link
              href="/citizen/complaints"
              className="flex items-center gap-2 text-xs font-bold text-[#438B50] transition hover:text-[#103D2D]"
            >
              Explore all your complaints
              <ChevronRight size={15} />
            </Link>
          </div>
        )}
      </section>
    </CitizenLayout>
  );
}