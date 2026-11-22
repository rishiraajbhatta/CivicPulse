"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  Search,
  Filter,
  RefreshCw,
  Loader2,
  FileText,
  MapPin,
  CalendarDays,
  User,
  ArrowRight,
  AlertCircle,
  X,
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
  upvoteCount?: number;
  departmentName?: string | null;
  createdAt: string;
  updatedAt: string;
}

const statuses = [
  "ALL",
  "SUBMITTED",
  "UNDER_REVIEW",
  "VERIFIED",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED",
  "DUPLICATE",
];

const categories = [
  "ALL",
  "POTHOLE",
  "GARBAGE_DUMPING",
  "WATER_LEAKAGE",
  "STREETLIGHT",
  "DRAINAGE",
  "ROAD_DAMAGE",
  "OTHER",
];

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
  POTHOLE: "Pothole",
  GARBAGE_DUMPING: "Garbage Dumping",
  WATER_LEAKAGE: "Water Leakage",
  STREETLIGHT: "Streetlight",
  DRAINAGE: "Drainage",
  ROAD_DAMAGE: "Road Damage",
  OTHER: "Other",
};

function formatStatus(status: string) {
  return (
    statusConfig[status]?.label ||
    status.replaceAll("_", " ")
  );
}

function formatCategory(category: string) {
  return (
    categoryLabels[category] ||
    category.replaceAll("_", " ")
  );
}

function formatDate(date: string) {
  if (!date) return "Unavailable";

  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ModeratorComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [showFilters, setShowFilters] = useState(false);

  const fetchComplaints = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/api/moderators/complaints");

      setComplaints(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Failed to fetch complaints:", err);

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

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        (complaint.complaintCode || "").toLowerCase().includes(searchText) ||
        (complaint.citizenName || "").toLowerCase().includes(searchText) ||
        (complaint.description || "").toLowerCase().includes(searchText) ||
        (complaint.address || "").toLowerCase().includes(searchText);

      const matchesStatus =
        selectedStatus === "ALL" ||
        complaint.status === selectedStatus;

      const matchesCategory =
        selectedCategory === "ALL" ||
        complaint.category === selectedCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [complaints, search, selectedStatus, selectedCategory]);

  const counts = useMemo(() => {
    return {
      total: complaints.length,
      submitted: complaints.filter(
        (item) => item.status === "SUBMITTED"
      ).length,
      active: complaints.filter(
        (item) =>
          !["RESOLVED", "REJECTED", "DUPLICATE"].includes(item.status)
      ).length,
      resolved: complaints.filter(
        (item) => item.status === "RESOLVED"
      ).length,
    };
  }, [complaints]);

  const clearFilters = () => {
    setSearch("");
    setSelectedStatus("ALL");
    setSelectedCategory("ALL");
  };

  const hasFilters =
    search.trim() !== "" ||
    selectedStatus !== "ALL" ||
    selectedCategory !== "ALL";

  return (
    <ModeratorLayout
      title="All Complaints"
      description="Review, search and manage civic issues submitted by citizens."
    >
      <div className="space-y-7">

        {/* Page Heading */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">
              Complaint Management
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage citizen reports and monitor their progress.
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
        </section>

        {/* Statistics */}
        <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[
            {
              label: "Total Complaints",
              value: counts.total,
              color: "bg-blue-50 text-blue-700",
            },
            {
              label: "New Submissions",
              value: counts.submitted,
              color: "bg-amber-50 text-amber-700",
            },
            {
              label: "Active Complaints",
              value: counts.active,
              color: "bg-orange-50 text-orange-700",
            },
            {
              label: "Resolved",
              value: counts.resolved,
              color: "bg-emerald-50 text-emerald-700",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-medium text-gray-500">
                {item.label}
              </p>

              <p className="mt-3 text-3xl font-extrabold text-gray-900">
                {loading ? "—" : item.value}
              </p>

              <div
                className={`mt-3 inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${item.color}`}
              >
                Complaint statistics
              </div>
            </div>
          ))}
        </section>

        {/* Search and Filters */}
        <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search complaint ID, citizen, description or address..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition ${
                showFilters
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter size={17} />
              Filters
              {(selectedStatus !== "ALL" ||
                selectedCategory !== "ALL") && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-700 text-[10px] text-white">
                  {(selectedStatus !== "ALL" ? 1 : 0) +
                    (selectedCategory !== "ALL" ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="mt-5 grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2">

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Complaint Status
                </label>

                <select
                  value={selectedStatus}
                  onChange={(event) =>
                    setSelectedStatus(event.target.value)
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-400"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status === "ALL" ? "All Statuses" : formatStatus(status)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Complaint Category
                </label>

                <select
                  value={selectedCategory}
                  onChange={(event) =>
                    setSelectedCategory(event.target.value)
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-400"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "ALL"
                        ? "All Categories"
                        : formatCategory(category)}
                    </option>
                  ))}
                </select>
              </div>

              {hasFilters && (
                <div className="sm:col-span-2">
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700"
                  >
                    <X size={15} />
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-bold text-gray-900">
                {loading ? "—" : filteredComplaints.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-gray-900">
                {complaints.length}
              </span>{" "}
              complaints
            </p>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                Reset search
              </button>
            )}
          </div>
        </section>

        {/* Error */}
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

        {/* Complaint List */}
        <section className="space-y-4">

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white">
              <Loader2
                size={32}
                className="animate-spin text-emerald-600"
              />

              <p className="mt-3 text-sm font-medium text-gray-500">
                Loading citizen complaints...
              </p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white px-6 text-center shadow-sm">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                {hasFilters ? <Search size={29} /> : <ClipboardList size={29} />}
              </div>

              <h3 className="mt-4 text-lg font-bold text-gray-900">
                {hasFilters
                  ? "No matching complaints"
                  : "No complaints available"}
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                {hasFilters
                  ? "Try changing your search or filters to find the complaint you are looking for."
                  : "Citizen complaints will appear here when they are submitted through CivicPulse."}
              </p>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-5 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            filteredComplaints.map((complaint) => {
              const status =
                statusConfig[complaint.status] ||
                statusConfig.SUBMITTED;

              return (
                <article
                  key={complaint.id}
                  className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                >
                  <div className="p-5 sm:p-6">

                    {/* Top Row */}
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-extrabold text-gray-900">
                            {complaint.complaintCode}
                          </span>

                          {(complaint.upvoteCount ?? 1) > 1 && (
                            <span className="rounded-lg bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                              {complaint.upvoteCount} Citizens Affected
                            </span>
                          )}

                          <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-600">
                            {formatCategory(complaint.category)}
                          </span>
                        </div>

                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-700">
                          {complaint.description}
                        </p>
                      </div>

                      <span
                        className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${status.color}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                        />
                        {status.label}
                      </span>
                    </div>

                    {/* Information */}
                    <div className="mt-5 grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2 xl:grid-cols-3">

                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                          <User size={17} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                            Reported By
                          </p>

                          <p className="mt-1 truncate text-sm font-semibold text-gray-800">
                            {complaint.citizenName || "Citizen"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                          <CalendarDays size={17} />
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                            Submitted On
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-800">
                            {formatDate(complaint.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 sm:col-span-2 xl:col-span-1">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                          <MapPin size={17} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                            Location
                          </p>

                          <p className="mt-1 line-clamp-2 text-sm font-medium text-gray-700">
                            {complaint.address || "Location not provided"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-5 flex flex-col justify-between gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center">
                      <div>
                        {complaint.departmentName ? (
                          <p className="text-xs text-gray-500">
                            Assigned Department:{" "}
                            <span className="font-semibold text-gray-800">
                              {complaint.departmentName}
                            </span>
                          </p>
                        ) : (
                          <p className="text-xs text-amber-700">
                            Department not assigned yet
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {Number.isFinite(complaint.latitude) &&
                          Number.isFinite(complaint.longitude) && (
                            <a
                              href={`https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                            >
                              <MapPin size={15} />
                              View Location
                            </a>
                          )}

                        <Link
                          href={`/moderator/complaints/${complaint.id}`}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-800"
                        >
                          Review Complaint
                          <ArrowRight size={15} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>

        {/* Bottom Information */}
        {!loading && complaints.length > 0 && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <div className="flex items-start gap-3">
              <FileText
                size={20}
                className="mt-0.5 shrink-0 text-emerald-700"
              />

              <div>
                <p className="text-sm font-bold text-emerald-900">
                  Complaint Management
                </p>

                <p className="mt-1 text-xs leading-5 text-emerald-700">
                  Open a complaint to inspect its details, review submitted
                  evidence, assign a department and update its status.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModeratorLayout>
  );
}