"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ThumbsUp,
  MapPin,
  CalendarDays,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Loader2,
  AlertCircle,
  Users,
  PlusCircle,
} from "lucide-react";

import CitizenLayout from "@/components/citizen/CitizenLayout";
import api from "@/lib/api";

interface UpvotedComplaint {
  id: string;
  complaintCode: string;
  citizenName: string;
  category: string;
  description: string;
  address: string;
  status: string;
  upvoteCount?: number;
  departmentName?: string | null;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string | null;
}

const statusStyles: Record<
  string,
  { label: string; badge: string; dot: string }
> = {
  SUBMITTED: {
    label: "Submitted",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
  },
  VERIFIED: {
    label: "Verified",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
  },
  ASSIGNED: {
    label: "Assigned",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
  },
  IN_PROGRESS: {
    label: "In Progress",
    badge: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
  },
  RESOLVED: {
    label: "Resolved",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  REJECTED: {
    label: "Rejected",
    badge: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
  DUPLICATE: {
    label: "Duplicate",
    badge: "bg-gray-100 text-gray-700 border-gray-200",
    dot: "bg-gray-500",
  },
};

function formatDate(date?: string | null) {
  if (!date) return "Unavailable";
  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function UpvotedComplaintsPage() {
  const [complaints, setComplaints] = useState<UpvotedComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchUpvoted = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");

      const res = await api.get<UpvotedComplaint[]>("/api/complaints/upvoted");
      setComplaints(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Unable to load your supported complaints right now.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUpvoted();
  }, [fetchUpvoted]);

  const resolvedCount = complaints.filter((c) => c.status === "RESOLVED").length;

  return (
    <CitizenLayout
      title="Supported Issues"
      description="Track the live resolution status of community complaints you have upvoted."
    >
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col justify-between gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <ThumbsUp size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Issues You Upvoted ({complaints.length})
              </h2>
              <p className="text-sm text-gray-500">
                {resolvedCount} resolved · {complaints.length - resolvedCount} active
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchUpvoted(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-60"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh Status
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={19} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-60 flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white">
            <Loader2 size={30} className="animate-spin text-emerald-600" />
            <p className="mt-3 text-sm text-gray-500">
              Loading your supported issues...
            </p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <ThumbsUp size={28} />
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900">
              No supported issues yet
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
              When you report an issue that another citizen has already submitted nearby, you can upvote it to track its progress here without creating duplicates.
            </p>
            <Link
              href="/citizen/complaints/report"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              <PlusCircle size={17} />
              Report an Issue
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((item) => {
              const style =
                statusStyles[item.status] || statusStyles.SUBMITTED;
              const isResolved = item.status === "RESOLVED";

              return (
                <article
                  key={item.id}
                  className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-emerald-200"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-extrabold text-gray-900">
                          {item.complaintCode}
                        </span>

                        <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-gray-600">
                          {item.category.replace(/_/g, " ")}
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800">
                          <Users size={12} />
                          {item.upvoteCount ?? 2} Citizens Affected
                        </span>
                      </div>

                      <p className="text-sm leading-6 text-gray-700">
                        {item.description}
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold ${style.badge}`}
                    >
                      <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                      {style.label}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 border-t border-gray-100 pt-4 text-xs text-gray-600 sm:grid-cols-3">
                    <div className="flex items-start gap-2">
                      <MapPin size={15} className="mt-0.5 shrink-0 text-emerald-700" />
                      <span className="line-clamp-2">
                        {item.address || "Location pinned on map"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CalendarDays size={15} className="shrink-0 text-amber-600" />
                      <span>Reported: {formatDate(item.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isResolved ? (
                        <>
                          <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
                          <span className="font-semibold text-emerald-700">
                            Resolved: {formatDate(item.resolvedAt || item.updatedAt)}
                          </span>
                        </>
                      ) : (
                        <>
                          <Clock3 size={15} className="shrink-0 text-blue-600" />
                          <span>
                            {item.departmentName
                              ? `Assigned to ${item.departmentName}`
                              : "Awaiting resolution"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </CitizenLayout>
  );
}