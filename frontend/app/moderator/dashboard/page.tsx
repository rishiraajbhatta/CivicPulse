"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  MapPin,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Users,
  XCircle,
  ClipboardList,
} from "lucide-react";

import ModeratorLayout from "@/components/moderator/ModeratorLayout";
import api from "@/lib/api";

interface Complaint {
  id: string;
  complaintCode: string;
  citizenName: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  status: string;
  departmentName?: string | null;
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<
  string,
  { label: string; color: string; dot: string }
> = {
  SUBMITTED: {
    label: "Submitted",
    color: "bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    color: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  VERIFIED: {
    label: "Verified",
    color: "bg-indigo-50 text-indigo-700",
    dot: "bg-indigo-500",
  },
  ASSIGNED: {
    label: "Assigned",
    color: "bg-purple-50 text-purple-700",
    dot: "bg-purple-500",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-orange-50 text-orange-700",
    dot: "bg-orange-500",
  },
  RESOLVED: {
    label: "Resolved",
    color: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  REJECTED: {
    label: "Rejected",
    color: "bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
  DUPLICATE: {
    label: "Duplicate",
    color: "bg-gray-100 text-gray-700",
    dot: "bg-gray-500",
  },
};

const categoryLabels: Record<string, string> = {
  POTHOLE: "Potholes",
  GARBAGE_DUMPING: "Garbage Dumping",
  WATER_LEAKAGE: "Water Leakage",
  STREETLIGHT: "Streetlights",
  DRAINAGE: "Drainage",
  ROAD_DAMAGE: "Road Damage",
  OTHER: "Other Issues",
};

function formatDate(date: string) {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCategory(category: string) {
  return (
    categoryLabels[category] ||
    category.replaceAll("_", " ").toLowerCase()
  );
}

export default function ModeratorDashboardPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchComplaints = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/api/moderators/complaints");

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setComplaints(data);
    } catch (err: unknown) {
      console.error("Failed to load moderator dashboard:", err);

      setError(
        "Unable to load complaints. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const stats = useMemo(() => {
    const count = (status: string) =>
      complaints.filter((complaint) => complaint.status === status).length;

    const active = complaints.filter(
      (complaint) =>
        !["RESOLVED", "REJECTED", "DUPLICATE"].includes(complaint.status)
    ).length;

    return {
      total: complaints.length,
      submitted: count("SUBMITTED"),
      underReview: count("UNDER_REVIEW"),
      inProgress: count("IN_PROGRESS") + count("ASSIGNED"),
      resolved: count("RESOLVED"),
      rejected: count("REJECTED"),
      active,
    };
  }, [complaints]);

  const recentComplaints = useMemo(() => {
    return [...complaints]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(0, 6);
  }, [complaints]);

  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};

    complaints.forEach((complaint) => {
      counts[complaint.category] =
        (counts[complaint.category] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([category, count]) => ({
        category,
        count,
        label: formatCategory(category),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [complaints]);

  const maxCategoryCount = Math.max(
    1,
    ...categoryBreakdown.map((item) => item.count)
  );

  const statCards = [
    {
      label: "Total Complaints",
      value: stats.total,
      icon: FileText,
      color: "bg-blue-50 text-blue-700",
      description: "All reported issues",
    },
    {
      label: "Awaiting Review",
      value: stats.submitted,
      icon: Clock3,
      color: "bg-amber-50 text-amber-700",
      description: "New submissions",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: TrendingUp,
      color: "bg-orange-50 text-orange-700",
      description: "Being addressed",
    },
    {
      label: "Resolved",
      value: stats.resolved,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-700",
      description: "Successfully resolved",
    },
    {
      label: "Under Review",
      value: stats.underReview,
      icon: ClipboardList,
      color: "bg-indigo-50 text-indigo-700",
      description: "Being verified",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      color: "bg-red-50 text-red-700",
      description: "Rejected submissions",
    },
  ];

  return (
    <ModeratorLayout
      title="Dashboard Overview"
      description="Monitor civic complaints, review reports and track resolution progress."
    >
      <div className="space-y-7">

        {/* Welcome Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 p-7 text-white shadow-lg sm:p-8">
          <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-emerald-50">
                <ShieldCheck size={14} />
                BBMP MODERATOR PORTAL
              </div>

              <h2 className="max-w-xl text-2xl font-extrabold leading-tight sm:text-3xl">
                Making communities better, one report at a time.
              </h2>

              <p className="mt-3 max-w-lg text-sm leading-6 text-emerald-100">
                Review citizen complaints, coordinate departments and
                help ensure every reported civic issue receives attention.
              </p>
            </div>

            <Link
              href="/moderator/complaints"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-800 shadow-md transition hover:bg-emerald-50"
            >
              Review Complaints
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border-[35px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 right-40 h-52 w-52 rounded-full bg-lime-300/10 blur-2xl" />
        </section>

        {/* Dashboard Heading */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900">
              Complaint Overview
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Current status of all citizen-reported issues.
            </p>
          </div>

          <button
            onClick={() => fetchComplaints(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <p className="text-sm text-red-700">{error}</p>
            </div>

            <button
              onClick={() => fetchComplaints()}
              className="text-sm font-bold text-red-700 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-3xl border border-gray-100 bg-white">
            <div className="text-center">
              <Loader2
                size={32}
                className="mx-auto animate-spin text-emerald-600"
              />

              <p className="mt-3 text-sm font-medium text-gray-500">
                Loading complaint statistics...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Statistics */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {statCards.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {stat.label}
                        </p>

                        <p className="mt-3 text-3xl font-extrabold text-gray-900">
                          {stat.value}
                        </p>

                        <p className="mt-2 text-xs text-gray-400">
                          {stat.description}
                        </p>
                      </div>

                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.color}`}
                      >
                        <Icon size={23} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Activity and Categories */}
            <section className="grid gap-6 xl:grid-cols-5">

              {/* Status Overview */}
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm xl:col-span-3">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">
                      Resolution Overview
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Distribution of complaint statuses.
                    </p>
                  </div>

                  <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
                    <TrendingUp size={20} />
                  </div>
                </div>

                <div className="space-y-5">
                  {[
                    {
                      label: "Active Complaints",
                      value: stats.active,
                      color: "bg-blue-500",
                    },
                    {
                      label: "Under Review",
                      value: stats.underReview,
                      color: "bg-amber-500",
                    },
                    {
                      label: "In Progress",
                      value: stats.inProgress,
                      color: "bg-orange-500",
                    },
                    {
                      label: "Resolved",
                      value: stats.resolved,
                      color: "bg-emerald-500",
                    },
                    {
                      label: "Rejected",
                      value: stats.rejected,
                      color: "bg-red-500",
                    },
                  ].map((item) => {
                    const percentage =
                      stats.total === 0
                        ? 0
                        : (item.value / stats.total) * 100;

                    return (
                      <div key={item.label}>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">
                            {item.label}
                          </span>

                          <span className="text-sm font-bold text-gray-900">
                            {item.value}
                          </span>
                        </div>

                        <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-7 flex items-center justify-between border-t border-gray-100 pt-5">
                  <p className="text-xs text-gray-400">
                    Based on {stats.total} reported complaints
                  </p>

                  <Link
                    href="/moderator/complaints"
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    View all
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm xl:col-span-2">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">
                      Top Categories
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Most frequently reported issues.
                    </p>
                  </div>

                  <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
                    <ClipboardList size={20} />
                  </div>
                </div>

                {categoryBreakdown.length === 0 ? (
                  <div className="flex min-h-44 flex-col items-center justify-center text-center">
                    <FileText size={30} className="text-gray-300" />

                    <p className="mt-3 text-sm font-semibold text-gray-600">
                      No complaints yet
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Category statistics will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {categoryBreakdown.map((item) => (
                      <div key={item.category}>
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-gray-600">
                            {item.label}
                          </span>

                          <span className="text-xs font-bold text-gray-900">
                            {item.count}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                            style={{
                              width: `${(item.count / maxCategoryCount) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-7 border-t border-gray-100 pt-5">
                  <p className="text-xs text-gray-400">
                    Showing the top five categories.
                  </p>
                </div>
              </div>
            </section>

            {/* Recent Complaints */}
            <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="flex flex-col justify-between gap-3 border-b border-gray-100 p-6 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-bold text-gray-900">
                    Recent Complaints
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Latest issues submitted by citizens.
                  </p>
                </div>

                <Link
                  href="/moderator/complaints"
                  className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800"
                >
                  View all complaints
                  <ArrowRight size={16} />
                </Link>
              </div>

              {recentComplaints.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                    <FileText size={29} />
                  </div>

                  <h4 className="mt-4 font-bold text-gray-800">
                    No complaints available
                  </h4>

                  <p className="mt-2 max-w-sm text-sm text-gray-500">
                    Citizen complaints will appear here when they are
                    submitted through CivicPulse.
                  </p>
                </div>
              ) : (
                <>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                          <th className="px-6 py-4">Complaint</th>
                          <th className="px-6 py-4">Citizen</th>
                          <th className="px-6 py-4">Category</th>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Status</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {recentComplaints.map((complaint) => {
                          const status =
                            statusConfig[complaint.status] ||
                            statusConfig.SUBMITTED;

                          return (
                            <tr
                              key={complaint.id}
                              className="transition hover:bg-gray-50/70"
                            >
                              <td className="px-6 py-4">
                                <p className="text-sm font-bold text-gray-900">
                                  {complaint.complaintCode}
                                </p>

                                <p className="mt-1 max-w-xs truncate text-xs text-gray-400">
                                  {complaint.description}
                                </p>
                              </td>

                              <td className="px-6 py-4 text-sm font-medium text-gray-700">
                                {complaint.citizenName || "Citizen"}
                              </td>

                              <td className="px-6 py-4 text-xs text-gray-600">
                                {formatCategory(complaint.category)}
                              </td>

                              <td className="px-6 py-4 text-xs text-gray-500">
                                {formatDate(complaint.createdAt)}
                              </td>

                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${status.color}`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                                  />
                                  {status.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Complaint Cards */}
                  <div className="divide-y divide-gray-100 md:hidden">
                    {recentComplaints.map((complaint) => {
                      const status =
                        statusConfig[complaint.status] ||
                        statusConfig.SUBMITTED;

                      return (
                        <div key={complaint.id} className="p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-gray-900">
                                {complaint.complaintCode}
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                {complaint.citizenName || "Citizen"}
                              </p>
                            </div>

                            <span
                              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${status.color}`}
                            >
                              {status.label}
                            </span>
                          </div>

                          <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                            {complaint.description}
                          </p>

                          <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                            <span>
                              {formatCategory(complaint.category)}
                            </span>

                            <span>{formatDate(complaint.createdAt)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </section>

            {/* Quick Actions */}
            <section className="grid gap-4 sm:grid-cols-3">
              <Link
                href="/moderator/complaints"
                className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <FileText size={21} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      Manage Complaints
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Review and update issues
                    </p>
                  </div>
                </div>

                <ArrowRight
                  size={17}
                  className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-emerald-600"
                />
              </Link>

              <Link
                href="/moderator/duplicates"
                className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-amber-200 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                    <Users size={21} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      Review Duplicates
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Investigate similar reports
                    </p>
                  </div>
                </div>

                <ArrowRight
                  size={17}
                  className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-amber-600"
                />
              </Link>

              <Link
                href="/moderator/profile"
                className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <ShieldCheck size={21} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      Moderator Profile
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      View account information
                    </p>
                  </div>
                </div>

                <ArrowRight
                  size={17}
                  className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
                />
              </Link>
            </section>
          </>
        )}
      </div>
    </ModeratorLayout>
  );
}