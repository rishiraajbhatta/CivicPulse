"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  MapPin,
  CalendarDays,
  CheckCircle2,
  XCircle,
  GitCompareArrows,
  Loader2,
  Search,
  ExternalLink,
  ShieldCheck,
  Clock,
} from "lucide-react";

import ModeratorLayout from "@/components/moderator/ModeratorLayout";
import api from "@/lib/api";

interface ComplaintSummary {
  id: string;
  complaintCode: string;
  citizenName: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  status: string;
  createdAt: string;
}

interface DuplicateRecord {
  id: string;
  complaint: ComplaintSummary;
  possibleDuplicate: ComplaintSummary;
  similarityScore: number;
  distanceMeters: number;
  reviewStatus: string;
  createdAt: string;
}

const categoryLabels: Record<string, string> = {
  POTHOLE: "Pothole",
  GARBAGE_DUMPING: "Garbage Dumping",
  WATER_LEAKAGE: "Water Leakage",
  STREETLIGHT: "Streetlight",
  DRAINAGE: "Drainage",
  ROAD_DAMAGE: "Road Damage",
  OTHER: "Other",
};

function formatCategory(category: string) {
  return categoryLabels[category] || category?.replaceAll("_", " ") || "Other";
}

function formatDate(date: string) {
  if (!date) return "Unavailable";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDistance(distance: number) {
  if (distance < 1000) {
    return `${Math.round(distance)} m apart`;
  }

  return `${(distance / 1000).toFixed(2)} km apart`;
}

function similarityPercentage(score: number) {
  return `${Math.round(score * 100)}%`;
}

export default function ModeratorDuplicatesPage() {
  const [duplicates, setDuplicates] = useState<DuplicateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("PENDING");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchDuplicates = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/api/moderators/duplicates");

      setDuplicates(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Failed to load duplicate complaints:", err);

      setError(
        "Unable to load duplicate complaints. The duplicate review API still needs to be connected in the backend."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDuplicates();
  }, [fetchDuplicates]);

  const handleReview = async (
    duplicateId: string,
    reviewStatus: "CONFIRMED_DUPLICATE" | "NOT_DUPLICATE"
  ) => {
    const message =
      reviewStatus === "CONFIRMED_DUPLICATE"
        ? "Confirm that these complaints describe the same issue?"
        : "Mark these complaints as separate issues?";

    if (!window.confirm(message)) return;

    try {
      setProcessingId(duplicateId);
      setError("");
      setSuccess("");

      await api.patch(
        `/api/moderators/duplicates/${duplicateId}/review`,
        { reviewStatus }
      );

      setSuccess(
        reviewStatus === "CONFIRMED_DUPLICATE"
          ? "Duplicate complaints confirmed successfully."
          : "Complaints marked as separate issues."
      );

      await fetchDuplicates(true);
    } catch (err) {
      console.error("Duplicate review failed:", err);

      setError(
        "Unable to submit the duplicate review. Please try again."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const filteredDuplicates = duplicates.filter((item) => {
    const primary = item.complaint;
    const possible = item.possibleDuplicate;

    const searchText = search.toLowerCase();

    const matchesSearch =
      !search ||
      primary?.complaintCode?.toLowerCase().includes(searchText) ||
      possible?.complaintCode?.toLowerCase().includes(searchText) ||
      primary?.citizenName?.toLowerCase().includes(searchText) ||
      possible?.citizenName?.toLowerCase().includes(searchText) ||
      primary?.description?.toLowerCase().includes(searchText) ||
      possible?.description?.toLowerCase().includes(searchText);

    const matchesFilter =
      filter === "ALL" || item.reviewStatus === filter;

    return matchesSearch && matchesFilter;
  });

  const pendingCount = duplicates.filter(
    (item) => item.reviewStatus === "PENDING"
  ).length;

  const confirmedCount = duplicates.filter(
    (item) => item.reviewStatus === "CONFIRMED_DUPLICATE"
  ).length;

  const separateCount = duplicates.filter(
    (item) => item.reviewStatus === "NOT_DUPLICATE"
  ).length;

  return (
    <ModeratorLayout
      title="Duplicate Review"
      description="Review and manage potentially duplicate citizen complaints."
    >
      <div className="space-y-7">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/moderator/dashboard"
              className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-emerald-700"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>

            <h2 className="text-2xl font-extrabold text-gray-900">
              Duplicate Complaints
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Investigate reports that may describe the same civic issue.
            </p>
          </div>

          <button
            onClick={() => fetchDuplicates(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
            <AlertTriangle
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

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500">
                  Total Flagged
                </p>

                <p className="mt-2 text-3xl font-extrabold text-gray-900">
                  {duplicates.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                <GitCompareArrows size={23} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-700">
                  Pending Review
                </p>

                <p className="mt-2 text-3xl font-extrabold text-amber-800">
                  {pendingCount}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Clock size={23} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-700">
                  Confirmed Duplicates
                </p>

                <p className="mt-2 text-3xl font-extrabold text-emerald-800">
                  {confirmedCount}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 size={23} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-700">
                  Separate Issues
                </p>

                <p className="mt-2 text-3xl font-extrabold text-blue-800">
                  {separateCount}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <ShieldCheck size={23} />
              </div>
            </div>
          </div>

        </div>

        {/* Information Banner */}
        <div className="flex items-start gap-4 rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-purple-700 shadow-sm">
            <AlertTriangle size={22} />
          </div>

          <div>
            <h3 className="font-bold text-purple-950">
              Intelligent Duplicate Detection
            </h3>

            <p className="mt-1 text-sm leading-6 text-purple-800">
              CivicPulse identifies potentially similar complaints using
              geographic proximity, complaint categories and description
              similarity. Moderators make the final decision.
            </p>
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
                placeholder="Search complaint ID, citizen or description..."
                className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { label: "Pending", value: "PENDING" },
                { label: "Confirmed", value: "CONFIRMED_DUPLICATE" },
                { label: "Separate", value: "NOT_DUPLICATE" },
                { label: "All", value: "ALL" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
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

        {/* Duplicate Records */}
        {loading ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white">
            <Loader2
              size={32}
              className="animate-spin text-emerald-600"
            />

            <p className="mt-4 text-sm font-medium text-gray-500">
              Loading duplicate complaints...
            </p>
          </div>
        ) : filteredDuplicates.length === 0 ? (
          <div className="rounded-3xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 size={30} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-gray-900">
              {duplicates.length === 0
                ? "No Duplicate Records Found"
                : "No Matching Complaints"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              {duplicates.length === 0
                ? "Potential duplicate complaints will appear here when the detection system flags similar reports."
                : "Try changing your search or selecting another review filter."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredDuplicates.map((record) => {
              const primary = record.complaint;
              const possible = record.possibleDuplicate;

              const isPending = record.reviewStatus === "PENDING";

              return (
                <section
                  key={record.id}
                  className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
                >
                  {/* Record Header */}
                  <div className="flex flex-col justify-between gap-4 border-b border-gray-100 bg-gray-50/70 p-5 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-purple-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-purple-800">
                          Potential Duplicate
                        </span>

                        <span className="text-xs text-gray-400">
                          Detected {formatDate(record.createdAt)}
                        </span>
                      </div>

                      <h3 className="mt-2 text-lg font-extrabold text-gray-900">
                        Complaint Comparison
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="rounded-xl border border-purple-100 bg-purple-50 px-4 py-2">
                        <p className="text-[10px] font-bold uppercase text-purple-600">
                          Description Similarity
                        </p>

                        <p className="mt-1 text-xl font-extrabold text-purple-900">
                          {similarityPercentage(record.similarityScore)}
                        </p>
                      </div>

                      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2">
                        <p className="text-[10px] font-bold uppercase text-blue-600">
                          Distance
                        </p>

                        <p className="mt-1 text-sm font-extrabold text-blue-900">
                          {formatDistance(record.distanceMeters)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Comparison */}
                  <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">

                    {/* Primary Complaint */}
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                          Existing Complaint
                        </span>

                        <span className="text-xs font-semibold text-gray-400">
                          A
                        </span>
                      </div>

                      <h4 className="mt-4 break-all text-base font-extrabold text-gray-900">
                        {primary?.complaintCode || "Unavailable"}
                      </h4>

                      <p className="mt-2 text-xs font-semibold text-emerald-800">
                        {formatCategory(primary?.category || "")}
                      </p>

                      <div className="mt-4 space-y-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase text-gray-400">
                            Reported By
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-800">
                            {primary?.citizenName || "Citizen"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase text-gray-400">
                            Description
                          </p>

                          <p className="mt-1 text-sm leading-6 text-gray-700">
                            {primary?.description || "No description"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase text-gray-400">
                            Location
                          </p>

                          <p className="mt-1 flex items-start gap-2 text-xs leading-5 text-gray-600">
                            <MapPin
                              size={14}
                              className="mt-0.5 shrink-0 text-emerald-600"
                            />

                            {primary?.address || "Address unavailable"}
                          </p>
                        </div>

                        <p className="flex items-center gap-2 text-xs text-gray-400">
                          <CalendarDays size={14} />
                          {formatDate(primary?.createdAt || "")}
                        </p>
                      </div>

                      {primary?.id && (
                        <Link
                          href={`/moderator/complaints/${primary.id}`}
                          className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-900"
                        >
                          View Complaint
                          <ExternalLink size={13} />
                        </Link>
                      )}
                    </div>

                    {/* Comparison Icon */}
                    <div className="flex items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm">
                        <GitCompareArrows size={21} />
                      </div>
                    </div>

                    {/* Possible Duplicate */}
                    <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                          Suspected Duplicate
                        </span>

                        <span className="text-xs font-semibold text-gray-400">
                          B
                        </span>
                      </div>

                      <h4 className="mt-4 break-all text-base font-extrabold text-gray-900">
                        {possible?.complaintCode || "Unavailable"}
                      </h4>

                      <p className="mt-2 text-xs font-semibold text-amber-800">
                        {formatCategory(possible?.category || "")}
                      </p>

                      <div className="mt-4 space-y-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase text-gray-400">
                            Reported By
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-800">
                            {possible?.citizenName || "Citizen"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase text-gray-400">
                            Description
                          </p>

                          <p className="mt-1 text-sm leading-6 text-gray-700">
                            {possible?.description || "No description"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase text-gray-400">
                            Location
                          </p>

                          <p className="mt-1 flex items-start gap-2 text-xs leading-5 text-gray-600">
                            <MapPin
                              size={14}
                              className="mt-0.5 shrink-0 text-amber-600"
                            />

                            {possible?.address || "Address unavailable"}
                          </p>
                        </div>

                        <p className="flex items-center gap-2 text-xs text-gray-400">
                          <CalendarDays size={14} />
                          {formatDate(possible?.createdAt || "")}
                        </p>
                      </div>

                      {possible?.id && (
                        <Link
                          href={`/moderator/complaints/${possible.id}`}
                          className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-amber-700 hover:text-amber-900"
                        >
                          View Complaint
                          <ExternalLink size={13} />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Map Comparison */}
                  {primary &&
                    possible &&
                    Number.isFinite(primary.latitude) &&
                    Number.isFinite(primary.longitude) &&
                    Number.isFinite(possible.latitude) &&
                    Number.isFinite(possible.longitude) && (
                      <div className="mx-5 mb-5 flex flex-col justify-between gap-3 rounded-xl bg-gray-50 p-4 sm:flex-row sm:items-center">
                        <div>
                          <p className="text-xs font-bold text-gray-700">
                            Compare Geographic Locations
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            View both reported locations on the map.
                          </p>
                        </div>

                        <a
                          href={`https://www.google.com/maps/dir/${primary.latitude},${primary.longitude}/${possible.latitude},${possible.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:border-emerald-300 hover:text-emerald-700"
                        >
                          Compare on Map
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    )}

                  {/* Review Actions */}
                  <div className="border-t border-gray-100 p-5">
                    {isPending ? (
                      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">
                            Moderator Decision
                          </h4>

                          <p className="mt-1 text-xs leading-5 text-gray-500">
                            Confirm whether these reports describe the same
                            civic issue. This decision will be recorded.
                          </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                          <button
                            onClick={() =>
                              handleReview(
                                record.id,
                                "NOT_DUPLICATE"
                              )
                            }
                            disabled={processingId === record.id}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-bold text-blue-800 transition hover:bg-blue-100 disabled:opacity-50"
                          >
                            {processingId === record.id ? (
                              <Loader2 size={17} className="animate-spin" />
                            ) : (
                              <XCircle size={17} />
                            )}

                            Separate Issues
                          </button>

                          <button
                            onClick={() =>
                              handleReview(
                                record.id,
                                "CONFIRMED_DUPLICATE"
                              )
                            }
                            disabled={processingId === record.id}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:opacity-50"
                          >
                            {processingId === record.id ? (
                              <Loader2 size={17} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={17} />
                            )}

                            Confirm Duplicate
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        {record.reviewStatus === "CONFIRMED_DUPLICATE" ? (
                          <CheckCircle2
                            size={21}
                            className="text-emerald-600"
                          />
                        ) : (
                          <ShieldCheck
                            size={21}
                            className="text-blue-600"
                          />
                        )}

                        <div>
                          <p className="text-sm font-bold text-gray-800">
                            {record.reviewStatus === "CONFIRMED_DUPLICATE"
                              ? "Duplicate Confirmed"
                              : "Marked as Separate Issues"}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            This duplicate review has already been completed.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}

      </div>
    </ModeratorLayout>
  );
}