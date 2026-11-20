"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  FileText,
  MapPin,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock3,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Filter,
  ClipboardList,
  XCircle,
  Star,
  Send,
  MessageSquare,
  ThumbsUp,
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
  resolvedAt?: string;
  departmentName?: string;
}

interface ComplaintUpdate {
  id: string;
  status: string;
  remarks: string;
  updatedAt: string;
  updatedByModeratorName?: string;
}

interface FeedbackStatus {
  submitted: boolean;
  loading: boolean;
  error?: string;
}

const statusConfig: Record<
  string,
  {
    label: string;
    color: string;
    background: string;
    dot: string;
    icon: typeof Clock3;
  }
> = {
  SUBMITTED: {
    label: "Submitted",
    color: "text-blue-700",
    background: "bg-blue-50",
    dot: "bg-blue-500",
    icon: FileText,
  },
  UNDER_REVIEW: {
    label: "Under Review",
    color: "text-purple-700",
    background: "bg-purple-50",
    dot: "bg-purple-500",
    icon: Clock3,
  },
  VERIFIED: {
    label: "Verified",
    color: "text-indigo-700",
    background: "bg-indigo-50",
    dot: "bg-indigo-500",
    icon: CheckCircle2,
  },
  ASSIGNED: {
    label: "Assigned",
    color: "text-orange-700",
    background: "bg-orange-50",
    dot: "bg-orange-500",
    icon: ClipboardList,
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "text-amber-700",
    background: "bg-amber-50",
    dot: "bg-amber-500",
    icon: RefreshCw,
  },
  RESOLVED: {
    label: "Resolved",
    color: "text-emerald-700",
    background: "bg-emerald-50",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    color: "text-red-700",
    background: "bg-red-50",
    dot: "bg-red-500",
    icon: XCircle,
  },
  DUPLICATE: {
    label: "Duplicate",
    color: "text-gray-700",
    background: "bg-gray-100",
    dot: "bg-gray-500",
    icon: AlertCircle,
  },
};

const categories: Record<string, string> = {
  POTHOLE: "Pothole",
  GARBAGE_DUMPING: "Garbage Dumping",
  WATER_LEAKAGE: "Water Leakage",
  STREETLIGHT: "Streetlight",
  DRAINAGE: "Drainage",
  ROAD_DAMAGE: "Road Damage",
  OTHER: "Other",
};

const filters = [
  { label: "All complaints", value: "ALL" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Under review", value: "UNDER_REVIEW" },
  { label: "Verified", value: "VERIFIED" },
  { label: "Assigned", value: "ASSIGNED" },
  { label: "In progress", value: "IN_PROGRESS" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Duplicate", value: "DUPLICATE" },
];

export default function CitizenComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [updates, setUpdates] = useState<
    Record<string, ComplaintUpdate[]>
  >({});
  const [loadingUpdates, setLoadingUpdates] = useState(false);
  const [updateErrors, setUpdateErrors] = useState<
    Record<string, string>
  >({});

  const [feedbackStatuses, setFeedbackStatuses] = useState<
    Record<string, FeedbackStatus>
  >({});
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submittingFeedback, setSubmittingFeedback] = useState<
    Record<string, boolean>
  >({});
  const [feedbackErrors, setFeedbackErrors] = useState<
    Record<string, string>
  >({});
  const [feedbackSuccess, setFeedbackSuccess] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    fetchComplaints();
  }, []);

  async function fetchComplaints() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get<Complaint[]>("/api/complaints/my");

      const sortedComplaints = [...response.data].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

      setComplaints(sortedComplaints);
    } catch {
      setError("We couldn't load your complaints. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function loadComplaintUpdates(complaintId: string) {
    setLoadingUpdates(true);

    setUpdateErrors((previous) => ({
      ...previous,
      [complaintId]: "",
    }));

    try {
      const response = await api.get<ComplaintUpdate[]>(
        `/api/complaints/${complaintId}/updates`
      );

      setUpdates((previous) => ({
        ...previous,
        [complaintId]: response.data,
      }));

      setUpdateErrors((previous) => ({
        ...previous,
        [complaintId]: "",
      }));
    } catch {
      setUpdateErrors((previous) => ({
        ...previous,
        [complaintId]: "Unable to load the complaint timeline.",
      }));
    } finally {
      setLoadingUpdates(false);
    }
  }

  async function loadFeedbackStatus(complaintId: string) {
    if (feedbackStatuses[complaintId]) {
      return;
    }

    setFeedbackStatuses((previous) => ({
      ...previous,
      [complaintId]: {
        submitted: false,
        loading: true,
      },
    }));

    try {
      const response = await api.get<{ submitted: boolean }>(
        `/api/feedback/${complaintId}/exists`
      );

      setFeedbackStatuses((previous) => ({
        ...previous,
        [complaintId]: {
          submitted: response.data.submitted,
          loading: false,
        },
      }));
    } catch {
      setFeedbackStatuses((previous) => ({
        ...previous,
        [complaintId]: {
          submitted: false,
          loading: false,
          error: "Unable to check your feedback status.",
        },
      }));
    }
  }

  async function toggleComplaint(complaint: Complaint) {
    const complaintId = complaint.id;

    if (expandedId === complaintId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(complaintId);

    if (!updates[complaintId] && !updateErrors[complaintId]) {
      await loadComplaintUpdates(complaintId);
    }

    if (complaint.status === "RESOLVED") {
      await loadFeedbackStatus(complaintId);
    }
  }

  async function submitFeedback(complaintId: string) {
    const rating = ratings[complaintId] || 0;
    const comment = comments[complaintId] || "";

    if (rating < 1 || rating > 5) {
      setFeedbackErrors((previous) => ({
        ...previous,
        [complaintId]: "Please select a star rating before submitting.",
      }));
      return;
    }

    if (comment.length > 2000) {
      setFeedbackErrors((previous) => ({
        ...previous,
        [complaintId]: "Comments cannot exceed 2000 characters.",
      }));
      return;
    }

    setSubmittingFeedback((previous) => ({
      ...previous,
      [complaintId]: true,
    }));

    setFeedbackErrors((previous) => ({
      ...previous,
      [complaintId]: "",
    }));

    try {
      await api.post("/api/feedback", {
        complaintId,
        rating,
        comments: comment.trim(),
      });

      setFeedbackStatuses((previous) => ({
        ...previous,
        [complaintId]: {
          submitted: true,
          loading: false,
        },
      }));

      setFeedbackSuccess((previous) => ({
        ...previous,
        [complaintId]: true,
      }));

      setRatings((previous) => ({
        ...previous,
        [complaintId]: 0,
      }));

      setComments((previous) => ({
        ...previous,
        [complaintId]: "",
      }));
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof err.response === "object" &&
        err.response !== null &&
        "data" in err.response &&
        typeof err.response.data === "string"
          ? err.response.data
          : "Unable to submit feedback. Please try again.";

      setFeedbackErrors((previous) => ({
        ...previous,
        [complaintId]: message,
      }));
    } finally {
      setSubmittingFeedback((previous) => ({
        ...previous,
        [complaintId]: false,
      }));
    }
  }

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const matchesFilter =
        activeFilter === "ALL" ||
        complaint.status === activeFilter;

      const searchText = search.toLowerCase();

      const matchesSearch =
        complaint.complaintCode?.toLowerCase().includes(searchText) ||
        complaint.description?.toLowerCase().includes(searchText) ||
        complaint.category?.toLowerCase().includes(searchText) ||
        categories[complaint.category]
          ?.toLowerCase()
          .includes(searchText) ||
        complaint.address?.toLowerCase().includes(searchText);

      return matchesFilter && matchesSearch;
    });
  }, [complaints, activeFilter, search]);

  const resolvedCount = complaints.filter(
    (complaint) => complaint.status === "RESOLVED"
  ).length;

  const activeCount = complaints.filter((complaint) =>
    [
      "SUBMITTED",
      "UNDER_REVIEW",
      "VERIFIED",
      "ASSIGNED",
      "IN_PROGRESS",
    ].includes(complaint.status)
  ).length;

  function formatDate(date?: string) {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatDateTime(date?: string) {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <CitizenLayout
      title="My Complaints"
      description="View and track every civic issue you've reported."
    >
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#438B50]">
            <ClipboardList size={15} />
            COMPLAINT MANAGEMENT
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-[#173D2D]">
            Your complaints
          </h2>

          <p className="mt-2 text-sm text-[#91A395]">
            Keep track of the issues you've brought to our attention.
          </p>
        </div>

        <Link
          href="/citizen/report"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#174D35] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#174D35]/10 transition hover:-translate-y-1 hover:bg-[#103D2D]"
        >
          <Plus size={18} />
          Report an issue
        </Link>
      </div>

      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total complaints",
            value: complaints.length,
            icon: FileText,
            color: "text-blue-600",
            background: "bg-blue-50",
          },
          {
            label: "Active complaints",
            value: activeCount,
            icon: Clock3,
            color: "text-amber-600",
            background: "bg-amber-50",
          },
          {
            label: "Resolved complaints",
            value: resolvedCount,
            icon: CheckCircle2,
            color: "text-emerald-600",
            background: "bg-emerald-50",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-2xl border border-[#E6EBE0] bg-white p-5 shadow-sm"
            >
              <div>
                <p className="text-xs font-medium text-[#91A395]">
                  {item.label}
                </p>

                <p className="mt-2 text-2xl font-bold text-[#173D2D]">
                  {loading ? "—" : item.value}
                </p>
              </div>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.background} ${item.color}`}
              >
                <Icon size={23} />
              </div>
            </div>
          );
        })}
      </section>

      <section className="mb-6 rounded-2xl border border-[#E6EBE0] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#91A395]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search complaint ID, category, description or location..."
              className="w-full rounded-xl border border-[#E6EBE0] bg-[#FAFCF8] py-3.5 pl-12 pr-4 text-sm text-[#214832] outline-none transition placeholder:text-[#A1ADA0] focus:border-[#80B88A] focus:ring-4 focus:ring-[#80B88A]/10"
            />
          </div>

          <button
            onClick={fetchComplaints}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#E6EBE0] px-5 py-3 text-sm font-semibold text-[#45634F] transition hover:bg-[#F1F6EA] disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1">
          <Filter size={16} className="shrink-0 text-[#91A395]" />

          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                activeFilter === filter.value
                  ? "bg-[#174D35] text-white shadow-md"
                  : "bg-[#F2F6EF] text-[#718574] hover:bg-[#E5EFDF]"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#173D2D]">
              Report history
            </h3>

            <p className="mt-1 text-xs text-[#91A395]">
              {loading
                ? "Loading complaints..."
                : `${filteredComplaints.length} complaint${filteredComplaints.length === 1 ? "" : "s"} found`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E6EBE0] bg-white py-20">
            <RefreshCw
              size={28}
              className="animate-spin text-[#438B50]"
            />

            <p className="mt-4 text-sm text-[#91A395]">
              Loading your complaint history...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-white px-6 py-16 text-center">
            <AlertCircle
              size={35}
              className="mx-auto text-red-400"
            />

            <p className="mt-4 text-sm font-semibold text-red-600">
              {error}
            </p>

            <button
              onClick={fetchComplaints}
              className="mt-5 rounded-xl bg-[#174D35] px-5 py-3 text-xs font-bold text-white"
            >
              Try again
            </button>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="rounded-2xl border border-[#E6EBE0] bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F0F5EB] text-[#438B50]">
              <FileText size={30} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-[#214832]">
              {complaints.length === 0
                ? "No complaints submitted yet"
                : "No matching complaints"}
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#91A395]">
              {complaints.length === 0
                ? "When you report a civic issue, it will appear here with its tracking information."
                : "Try changing your search or selecting a different status filter."}
            </p>

            {complaints.length === 0 && (
              <Link
                href="/citizen/report"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#174D35] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#103D2D]"
              >
                <Plus size={17} />
                Submit your first complaint
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {filteredComplaints.map((complaint, index) => {
              const status =
                statusConfig[complaint.status] ||
                statusConfig.SUBMITTED;

              const StatusIcon = status.icon;
              const isExpanded = expandedId === complaint.id;
              const feedbackStatus =
                feedbackStatuses[complaint.id];

              return (
                <motion.article
                  key={complaint.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="overflow-hidden rounded-2xl border border-[#E6EBE0] bg-white shadow-sm transition hover:shadow-md"
                >
                  <button
                    type="button"
                    onClick={() => toggleComplaint(complaint)}
                    className="flex w-full flex-col gap-5 p-5 text-left sm:p-6"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F0F5EB] text-[#438B50]">
                          <MapPin size={22} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-[#214832]">
                              {categories[complaint.category] ||
                                complaint.category}
                            </h3>

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold ${status.background} ${status.color}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                              />
                              {status.label}
                            </span>

                            {complaint.status === "RESOLVED" &&
                              feedbackStatus?.submitted && (
                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700">
                                  Feedback submitted
                                </span>
                              )}
                          </div>

                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#829087]">
                            {complaint.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 text-xs font-semibold text-[#438B50]">
                        {isExpanded ? "Hide details" : "View details"}

                        {isExpanded ? (
                          <ChevronUp size={17} />
                        ) : (
                          <ChevronDown size={17} />
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[#EEF1E9] pt-4 text-xs text-[#91A395]">
                      <span className="font-bold text-[#45634F]">
                        {complaint.complaintCode}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={14} />
                        Submitted {formatDate(complaint.createdAt)}
                      </span>

                      {complaint.address && (
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} />
                          <span className="max-w-[220px] truncate">
                            {complaint.address}
                          </span>
                        </span>
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-[#E6EBE0] bg-[#FAFCF8] p-5 sm:p-7">
                          <div className="grid gap-6 md:grid-cols-2">
                            <div>
                              <h4 className="mb-4 text-sm font-bold text-[#214832]">
                                Complaint information
                              </h4>

                              <div className="space-y-4 text-xs">
                                <div>
                                  <p className="text-[#A1ADA0]">
                                    Tracking ID
                                  </p>
                                  <p className="mt-1 font-bold text-[#45634F]">
                                    {complaint.complaintCode}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-[#A1ADA0]">
                                    Assigned department
                                  </p>
                                  <p className="mt-1 font-semibold text-[#45634F]">
                                    {complaint.departmentName ||
                                      "Not assigned yet"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-[#A1ADA0]">
                                    Last updated
                                  </p>
                                  <p className="mt-1 font-semibold text-[#45634F]">
                                    {formatDateTime(
                                      complaint.updatedAt ||
                                        complaint.createdAt
                                    )}
                                  </p>
                                </div>

                                {complaint.resolvedAt && (
                                  <div>
                                    <p className="text-[#A1ADA0]">
                                      Resolved on
                                    </p>
                                    <p className="mt-1 font-semibold text-emerald-700">
                                      {formatDate(complaint.resolvedAt)}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <h4 className="mb-4 text-sm font-bold text-[#214832]">
                                Progress timeline
                              </h4>

                              {loadingUpdates &&
                              !updates[complaint.id] ? (
                                <div className="flex items-center gap-3 py-5 text-xs text-[#91A395]">
                                  <RefreshCw
                                    size={17}
                                    className="animate-spin"
                                  />
                                  Loading timeline...
                                </div>
                              ) : updateErrors[complaint.id] ? (
                                <div className="rounded-xl bg-red-50 p-4 text-xs text-red-600">
                                  {updateErrors[complaint.id]}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      loadComplaintUpdates(complaint.id)
                                    }
                                    className="ml-2 font-bold underline"
                                  >
                                    Retry
                                  </button>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <div className="relative flex gap-3">
                                    <div className="relative flex flex-col items-center">
                                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                        <CheckCircle2 size={15} />
                                      </div>

                                      <div className="absolute top-8 h-full w-px bg-[#DDE8D7]" />
                                    </div>

                                    <div className="pb-4">
                                      <p className="text-xs font-bold text-[#45634F]">
                                        Complaint submitted
                                      </p>
                                      <p className="mt-1 text-[11px] text-[#91A395]">
                                        {formatDateTime(
                                          complaint.createdAt
                                        )}
                                      </p>
                                    </div>
                                  </div>

                                  {(updates[complaint.id] || []).map(
                                    (update) => {
                                      const updateStatus =
                                        statusConfig[update.status] ||
                                        statusConfig.SUBMITTED;

                                      const UpdateIcon =
                                        updateStatus.icon;

                                      return (
                                        <div
                                          key={update.id}
                                          className="relative flex gap-3"
                                        >
                                          <div className="relative flex flex-col items-center">
                                            <div
                                              className={`flex h-7 w-7 items-center justify-center rounded-full ${updateStatus.background} ${updateStatus.color}`}
                                            >
                                              <UpdateIcon size={14} />
                                            </div>

                                            <div className="absolute top-8 h-full w-px bg-[#DDE8D7]" />
                                          </div>

                                          <div className="pb-4">
                                            <p className="text-xs font-bold text-[#45634F]">
                                              {updateStatus.label}
                                            </p>

                                            {update.remarks && (
                                              <p className="mt-1 text-xs leading-5 text-[#829087]">
                                                {update.remarks}
                                              </p>
                                            )}

                                            <p className="mt-1 text-[11px] text-[#91A395]">
                                              {formatDateTime(
                                                update.updatedAt
                                              )}
                                            </p>
                                          </div>
                                        </div>
                                      );
                                    }
                                  )}

                                  {(!updates[complaint.id] ||
                                    updates[complaint.id].length ===
                                      0) && (
                                    <p className="rounded-xl bg-white p-4 text-xs leading-5 text-[#91A395]">
                                      No additional status updates have
                                      been recorded yet. We'll show
                                      progress here as it happens.
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {complaint.status === "RESOLVED" && (
                            <div className="mt-7 border-t border-[#E3EBDD] pt-7">
                              <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                                  <Star size={22} />
                                </div>

                                <div>
                                  <h4 className="text-base font-bold text-[#214832]">
                                    Rate the resolution
                                  </h4>

                                  <p className="mt-1 text-xs text-[#91A395]">
                                    Your feedback helps improve civic
                                    services.
                                  </p>
                                </div>
                              </div>

                              {feedbackStatus?.loading ? (
                                <div className="flex items-center gap-3 rounded-xl bg-white p-5 text-xs text-[#91A395]">
                                  <RefreshCw
                                    size={17}
                                    className="animate-spin"
                                  />
                                  Checking feedback status...
                                </div>
                              ) : feedbackStatus?.error ? (
                                <div className="rounded-xl bg-red-50 p-4 text-xs text-red-600">
                                  {feedbackStatus.error}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFeedbackStatuses((previous) => {
                                        const next = { ...previous };
                                        delete next[complaint.id];
                                        return next;
                                      });

                                      loadFeedbackStatus(complaint.id);
                                    }}
                                    className="ml-2 font-bold underline"
                                  >
                                    Retry
                                  </button>
                                </div>
                              ) : feedbackStatus?.submitted ? (
                                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                                  <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                      <ThumbsUp size={20} />
                                    </div>

                                    <div>
                                      <p className="text-sm font-bold text-emerald-800">
                                        Thank you for your feedback!
                                      </p>

                                      <p className="mt-1 text-xs leading-5 text-emerald-700">
                                        Your feedback for this resolved
                                        complaint has been recorded.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="rounded-2xl border border-[#E6EBE0] bg-white p-5 sm:p-6">
                                  <p className="text-xs font-semibold text-[#45634F]">
                                    How satisfied are you with the
                                    resolution?
                                  </p>

                                  <div className="mt-4 flex flex-wrap items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => {
                                      const selected =
                                        (ratings[complaint.id] || 0) >=
                                        star;

                                      return (
                                        <button
                                          key={star}
                                          type="button"
                                          aria-label={`Rate ${star} out of 5 stars`}
                                          onClick={() =>
                                            setRatings((previous) => ({
                                              ...previous,
                                              [complaint.id]: star,
                                            }))
                                          }
                                          className="rounded-lg p-1 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                        >
                                          <Star
                                            size={30}
                                            className={
                                              selected
                                                ? "fill-amber-400 text-amber-400"
                                                : "text-gray-300"
                                            }
                                          />
                                        </button>
                                      );
                                    })}

                                    <span className="ml-2 text-xs font-semibold text-[#829087]">
                                      {ratings[complaint.id]
                                        ? `${ratings[complaint.id]} / 5`
                                        : "Select a rating"}
                                    </span>
                                  </div>

                                  <div className="mt-5">
                                    <label
                                      htmlFor={`feedback-${complaint.id}`}
                                      className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#45634F]"
                                    >
                                      <MessageSquare size={15} />
                                      Additional comments (optional)
                                    </label>

                                    <textarea
                                      id={`feedback-${complaint.id}`}
                                      value={
                                        comments[complaint.id] || ""
                                      }
                                      onChange={(event) =>
                                        setComments((previous) => ({
                                          ...previous,
                                          [complaint.id]:
                                            event.target.value,
                                        }))
                                      }
                                      maxLength={2000}
                                      rows={3}
                                      placeholder="Tell us about your experience with the resolution..."
                                      className="w-full resize-y rounded-xl border border-[#E6EBE0] bg-[#FAFCF8] p-4 text-sm text-[#214832] outline-none transition placeholder:text-[#A1ADA0] focus:border-[#80B88A] focus:ring-4 focus:ring-[#80B88A]/10"
                                    />

                                    <p className="mt-1 text-right text-[10px] text-[#A1ADA0]">
                                      {(comments[complaint.id] || "").length}
                                      /2000 characters
                                    </p>
                                  </div>

                                  {feedbackErrors[complaint.id] && (
                                    <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-600">
                                      {feedbackErrors[complaint.id]}
                                    </div>
                                  )}

                                  <div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                    <p className="text-[11px] text-[#A1ADA0]">
                                      You can submit feedback only once
                                      per resolved complaint.
                                    </p>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        submitFeedback(complaint.id)
                                      }
                                      disabled={
                                        submittingFeedback[complaint.id]
                                      }
                                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#174D35] px-5 py-3 text-xs font-bold text-white shadow-md transition hover:bg-[#103D2D] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      {submittingFeedback[
                                        complaint.id
                                      ] ? (
                                        <>
                                          <RefreshCw
                                            size={15}
                                            className="animate-spin"
                                          />
                                          Submitting...
                                        </>
                                      ) : (
                                        <>
                                          <Send size={15} />
                                          Submit feedback
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>
    </CitizenLayout>
  );
}
