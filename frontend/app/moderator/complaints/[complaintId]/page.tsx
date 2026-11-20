"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  User,
  FileText,
  Image as ImageIcon,
  Upload,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Clock3,
  ExternalLink,
  Camera,
  X,
  History,
  MessageSquare,
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

interface Department {
  id: string;
  name: string;
  description?: string;
}

interface ComplaintImage {
  id: string;
  imageUrl: string;
  imageType: string;
  caption?: string;
  uploadedAt: string;
}

interface ComplaintUpdate {
  id: string;
  status: string;
  remarks?: string | null;
  updatedByModeratorName?: string | null;
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
  POTHOLE: "Pothole",
  GARBAGE_DUMPING: "Garbage Dumping",
  WATER_LEAKAGE: "Water Leakage",
  STREETLIGHT: "Streetlight",
  DRAINAGE: "Drainage",
  ROAD_DAMAGE: "Road Damage",
  OTHER: "Other",
};

const statusOptions = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "VERIFIED",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED",
];

function formatDate(date: string) {
  if (!date) return "Unavailable";

  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCategory(category: string) {
  return categoryLabels[category] || category?.replaceAll("_", " ") || "Other";
}

function formatStatus(status: string) {
  return statusConfig[status]?.label || status.replaceAll("_", " ");
}

function ModeratorComplaintDetailsContent() {
  const params = useParams();
  const complaintId = params.complaintId as string;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [images, setImages] = useState<ComplaintImage[]>([]);
  const [updates, setUpdates] = useState<ComplaintUpdate[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [remarks, setRemarks] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [updating, setUpdating] = useState(false);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploadType, setUploadType] = useState("PROGRESS");
  const [uploading, setUploading] = useState(false);

  const [imagePreview, setImagePreview] = useState("");

  const fetchData = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const [
          complaintsResponse,
          departmentsResponse,
          imagesResponse,
          updatesResponse,
        ] = await Promise.all([
          api.get("/api/moderators/complaints"),
          api.get("/api/departments"),
          api.get(`/api/moderators/complaints/${complaintId}/images`),
          api.get(`/api/moderators/complaints/${complaintId}/updates`),
        ]);

        const complaintList: Complaint[] = Array.isArray(
          complaintsResponse.data
        )
          ? complaintsResponse.data
          : [];

        const currentComplaint =
          complaintList.find((item) => item.id === complaintId) || null;

        setComplaint(currentComplaint);

        const departmentList: Department[] = Array.isArray(
          departmentsResponse.data
        )
          ? departmentsResponse.data
          : [];

        setDepartments(departmentList);

        setImages(
          Array.isArray(imagesResponse.data) ? imagesResponse.data : []
        );

        setUpdates(
          Array.isArray(updatesResponse.data) ? updatesResponse.data : []
        );

        if (currentComplaint) {
          setSelectedStatus(currentComplaint.status);

          const matchingDepartment = departmentList.find(
            (department) =>
              department.name === currentComplaint.departmentName
          );

          setSelectedDepartment(matchingDepartment?.id || "");
        } else {
          setError("The requested complaint could not be found.");
        }
      } catch (err) {
        console.error("Failed to load complaint details:", err);

        const responseError = (
          err as {
            response?: {
              data?: {
                error?: string;
                message?: string;
              };
            };
          }
        ).response?.data;

        setError(
          responseError?.error ||
            responseError?.message ||
            "Unable to load complaint details or activity history. Please refresh and try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [complaintId]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please select a JPG, PNG or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must not exceed 5 MB.");
      event.target.value = "";
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setError("");
    setUploadFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!uploadFile) {
      setError("Please select an image to upload.");
      return;
    }

    if (
      ["RESOLVED", "REJECTED", "DUPLICATE"].includes(
        complaint?.status || ""
      )
    ) {
      setError("Evidence cannot be uploaded to a closed complaint.");
      return;
    }

    if (uploadType === "FINAL_PROOF" && !uploadCaption.trim()) {
      setError("Please provide a caption for the final proof image.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append("file", uploadFile);
      formData.append("imageType", uploadType);

      if (uploadCaption.trim()) {
        formData.append("caption", uploadCaption.trim());
      }

      await api.post(
        `/api/moderators/complaints/${complaintId}/images`,
        formData
      );

      setSuccess(
        uploadType === "FINAL_PROOF"
          ? "Final proof photograph uploaded successfully."
          : "Progress photograph uploaded successfully."
      );

      setUploadFile(null);
      setUploadCaption("");

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      setImagePreview("");

      const fileInput = document.getElementById(
        "evidence-file"
      ) as HTMLInputElement | null;

      if (fileInput) fileInput.value = "";

      await fetchData(true);
    } catch (err) {
      console.error("Image upload failed:", err);

      const responseError = (
        err as {
          response?: {
            data?: {
              error?: string;
              message?: string;
            };
          };
        }
      ).response?.data;

      setError(
        responseError?.error ||
          responseError?.message ||
          "Image upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleStatusUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!complaint) return;

    if (["RESOLVED", "REJECTED", "DUPLICATE"].includes(complaint.status)) {
      setError("This complaint is already closed and cannot be updated.");
      return;
    }

    if (!selectedStatus) {
      setError("Please select a complaint status.");
      return;
    }

    if (selectedStatus === "ASSIGNED" && !selectedDepartment) {
      setError("Please select a department before assigning the complaint.");
      return;
    }

    if (selectedStatus === "REJECTED" && !rejectionReason.trim()) {
      setError("A rejection reason is required.");
      return;
    }

    if (
      selectedStatus === "RESOLVED" &&
      !images.some((image) => image.imageType === "FINAL_PROOF")
    ) {
      setError(
        "Upload a final proof photograph before resolving this complaint."
      );
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      await api.patch(
        `/api/moderators/complaints/${complaintId}/status`,
        {
          status: selectedStatus,
          remarks: remarks.trim(),
          departmentId:
            selectedStatus === "ASSIGNED" ? selectedDepartment : null,
          rejectionReason:
            selectedStatus === "REJECTED"
              ? rejectionReason.trim()
              : null,
        }
      );

      setSuccess("Complaint status updated successfully.");
      setRemarks("");
      setRejectionReason("");

      await fetchData(true);
    } catch (err) {
      console.error("Complaint status update failed:", err);

      const responseError = (
        err as {
          response?: {
            data?: {
              error?: string;
              message?: string;
            };
          };
        }
      ).response?.data;

      setError(
        responseError?.error ||
          responseError?.message ||
          "Unable to update complaint status. Check the information and try again."
      );
    } finally {
      setUpdating(false);
    }
  };

  const isClosed = ["RESOLVED", "REJECTED", "DUPLICATE"].includes(
    complaint?.status || ""
  );

  const finalProofUploaded = images.some(
    (image) => image.imageType === "FINAL_PROOF"
  );

  if (loading) {
    return (
      <ModeratorLayout
        title="Complaint Details"
        description="Loading complaint information."
      >
        <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white">
          <Loader2 size={34} className="animate-spin text-emerald-600" />
          <p className="mt-4 text-sm font-medium text-gray-500">
            Loading complaint details...
          </p>
        </div>
      </ModeratorLayout>
    );
  }

  if (!complaint) {
    return (
      <ModeratorLayout
        title="Complaint Details"
        description="Complaint information."
      >
        <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center">
          <AlertCircle size={35} className="mx-auto text-red-500" />

          <h2 className="mt-4 text-xl font-bold text-gray-900">
            Complaint Not Found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error || "This complaint could not be found."}
          </p>

          <Link
            href="/moderator/complaints"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800"
          >
            <ArrowLeft size={16} />
            Back to Complaints
          </Link>
        </div>
      </ModeratorLayout>
    );
  }

  const currentStatus =
    statusConfig[complaint.status] || statusConfig.SUBMITTED;

  return (
    <ModeratorLayout
      title="Complaint Details"
      description={`Review and manage complaint ${complaint.complaintCode}.`}
    >
      <div className="space-y-7">
        {/* Back and Refresh */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/moderator/complaints"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-emerald-700"
          >
            <ArrowLeft size={17} />
            Back to All Complaints
          </Link>

          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0 text-emerald-600"
            />
            <p className="text-sm text-emerald-800">{success}</p>
          </div>
        )}

        {/* Complaint Header */}
        <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-emerald-800 to-teal-700 p-6 text-white sm:p-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[1.5px] text-emerald-100">
                  Complaint Reference
                </p>

                <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                  {complaint.complaintCode}
                </h2>

                <p className="mt-3 text-sm text-emerald-100">
                  {formatCategory(complaint.category)}
                </p>
              </div>

              <span
                className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${
                  complaint.status === "RESOLVED"
                    ? "bg-white text-emerald-800"
                    : complaint.status === "REJECTED"
                      ? "bg-red-100 text-red-800"
                      : "bg-white/15 text-white"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    complaint.status === "RESOLVED"
                      ? "bg-emerald-600"
                      : complaint.status === "REJECTED"
                        ? "bg-red-600"
                        : "bg-lime-300"
                  }`}
                />
                {currentStatus.label}
              </span>
            </div>
          </div>

          <div className="grid gap-5 p-6 sm:grid-cols-3 sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <User size={20} />
              </div>

              <div>
                <p className="text-xs text-gray-400">Reported By</p>
                <p className="mt-1 text-sm font-bold text-gray-900">
                  {complaint.citizenName || "Citizen"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <CalendarDays size={20} />
              </div>

              <div>
                <p className="text-xs text-gray-400">Submitted On</p>
                <p className="mt-1 text-sm font-bold text-gray-900">
                  {formatDate(complaint.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Building2 size={20} />
              </div>

              <div>
                <p className="text-xs text-gray-400">Department</p>
                <p className="mt-1 text-sm font-bold text-gray-900">
                  {complaint.departmentName || "Not Assigned"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Complaint Description and Location */}
        <section className="grid gap-6 xl:grid-cols-5">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm xl:col-span-3">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <FileText size={20} />
              </div>

              <div>
                <h3 className="font-bold text-gray-900">
                  Complaint Description
                </h3>
                <p className="text-xs text-gray-500">
                  Details provided by the citizen.
                </p>
              </div>
            </div>

            <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
              {complaint.description}
            </p>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <MapPin size={20} />
              </div>

              <div>
                <h3 className="font-bold text-gray-900">
                  Complaint Location
                </h3>
                <p className="text-xs text-gray-500">
                  Reported issue location.
                </p>
              </div>
            </div>

            <p className="text-sm leading-6 text-gray-700">
              {complaint.address || "No address provided"}
            </p>

            {Number.isFinite(complaint.latitude) &&
              Number.isFinite(complaint.longitude) && (
                <>
                  <div className="mt-4 rounded-xl bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">Latitude</p>
                    <p className="mt-1 text-sm font-semibold text-gray-800">
                      {complaint.latitude}
                    </p>

                    <p className="mt-3 text-xs text-gray-500">Longitude</p>
                    <p className="mt-1 text-sm font-semibold text-gray-800">
                      {complaint.longitude}
                    </p>
                  </div>

                  <a
                    href={`https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
                  >
                    Open in Google Maps
                    <ExternalLink size={16} />
                  </a>
                </>
              )}
          </div>
        </section>

        {/* Complaint Activity Timeline */}
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <History size={20} />
            </div>

            <div>
              <h3 className="font-bold text-gray-900">
                Complaint Activity Timeline
              </h3>
              <p className="text-xs text-gray-500">
                Complete history of status changes and moderator remarks.
              </p>
            </div>

            <span className="ml-auto rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
              {updates.length} updates
            </span>
          </div>

          {updates.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 py-10 text-center">
              <Clock3 size={30} className="mx-auto text-gray-300" />
              <p className="mt-3 text-sm font-semibold text-gray-600">
                No activity recorded yet
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Status changes and moderator remarks will appear here.
              </p>
            </div>
          ) : (
            <div className="relative space-y-0">
              {updates.map((update, index) => {
                const config =
                  statusConfig[update.status] || statusConfig.SUBMITTED;

                return (
                  <div
                    key={update.id}
                    className="relative flex gap-4 pb-8 last:pb-0"
                  >
                    {index !== updates.length - 1 && (
                      <div className="absolute left-[15px] top-8 h-full w-0.5 bg-gray-100" />
                    )}

                    <div
                      className={`relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.dot}`}
                    >
                      <CheckCircle2 size={16} className="text-white" />
                    </div>

                    <div className="min-w-0 flex-1 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${config.color}`}
                        >
                          {formatStatus(update.status)}
                        </span>

                        <span className="text-xs text-gray-400">
                          {formatDate(update.updatedAt)}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                        <User size={14} />
                        <span>
                          {update.updatedByModeratorName
                            ? `Updated by ${update.updatedByModeratorName}`
                            : "System update"}
                        </span>
                      </div>

                      {update.remarks?.trim() && (
                        <div className="mt-3 flex items-start gap-2 rounded-xl border border-gray-100 bg-white p-3">
                          <MessageSquare
                            size={15}
                            className="mt-0.5 shrink-0 text-gray-400"
                          />
                          <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                            {update.remarks}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Evidence Gallery */}
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                <ImageIcon size={20} />
              </div>

              <div>
                <h3 className="font-bold text-gray-900">
                  Photographic Evidence
                </h3>
                <p className="text-xs text-gray-500">
                  Citizen photographs and moderator evidence.
                </p>
              </div>
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
              {images.length} photographs
            </span>
          </div>

          {images.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center">
              <Camera size={30} className="mx-auto text-gray-300" />
              <p className="mt-3 text-sm font-semibold text-gray-600">
                No photographs uploaded
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Evidence uploaded by citizens and moderators will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="overflow-hidden rounded-2xl border border-gray-100"
                >
                  <a
                    href={image.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block aspect-video overflow-hidden bg-gray-100"
                  >
                    <img
                      src={image.imageUrl}
                      alt={image.caption || "Complaint evidence"}
                      className="h-full w-full object-cover transition duration-300 hover:scale-105"
                    />
                  </a>

                  <div className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          image.imageType === "FINAL_PROOF"
                            ? "bg-emerald-50 text-emerald-700"
                            : image.imageType === "PROGRESS"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-purple-50 text-purple-700"
                        }`}
                      >
                        {image.imageType.replaceAll("_", " ")}
                      </span>

                      <span className="text-[10px] text-gray-400">
                        {formatDate(image.uploadedAt)}
                      </span>
                    </div>

                    {image.caption && (
                      <p className="mt-3 text-xs leading-5 text-gray-600">
                        {image.caption}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {finalProofUploaded && (
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2 size={19} className="text-emerald-600" />
              <p className="text-sm font-semibold text-emerald-800">
                Final resolution evidence has been uploaded.
              </p>
            </div>
          )}
        </section>

        {/* Upload Evidence */}
        {!isClosed && (
          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <Upload size={20} />
              </div>

              <div>
                <h3 className="font-bold text-gray-900">
                  Upload Progress Evidence
                </h3>
                <p className="text-xs text-gray-500">
                  Document work progress or provide final resolution proof.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpload} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Evidence Type
                </label>

                <select
                  value={uploadType}
                  onChange={(event) => setUploadType(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-400 sm:max-w-md"
                >
                  <option value="PROGRESS">Progress Photograph</option>
                  <option value="FINAL_PROOF">Final Resolution Proof</option>
                </select>

                {uploadType === "FINAL_PROOF" && (
                  <p className="mt-2 text-xs text-amber-700">
                    A final proof photograph is mandatory before resolving
                    the complaint.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Photograph
                </label>

                <label
                  htmlFor="evidence-file"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center transition hover:border-emerald-400 hover:bg-emerald-50/40"
                >
                  {imagePreview ? (
                    <div className="relative w-full max-w-sm">
                      <img
                        src={imagePreview}
                        alt="Selected evidence preview"
                        className="mx-auto max-h-64 rounded-xl object-contain"
                      />

                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();

                          if (imagePreview) {
                            URL.revokeObjectURL(imagePreview);
                          }

                          setImagePreview("");
                          setUploadFile(null);

                          const input = document.getElementById(
                            "evidence-file"
                          ) as HTMLInputElement | null;

                          if (input) input.value = "";
                        }}
                        className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white"
                        aria-label="Remove selected image"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                        <Upload size={22} />
                      </div>

                      <p className="mt-4 text-sm font-bold text-gray-800">
                        Click to upload a photograph
                      </p>

                      <p className="mt-2 text-xs text-gray-400">
                        JPG, PNG or WEBP · Maximum 5 MB
                      </p>
                    </>
                  )}

                  <input
                    id="evidence-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Photograph Caption
                </label>

                <textarea
                  value={uploadCaption}
                  onChange={(event) => setUploadCaption(event.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Describe the work shown in this photograph..."
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
                />
              </div>

              <button
                type="submit"
                disabled={uploading || !uploadFile}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={17} />
                    Upload Evidence
                  </>
                )}
              </button>
            </form>
          </section>
        )}

        {/* Status Management */}
        {!isClosed ? (
          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <ShieldCheck size={20} />
              </div>

              <div>
                <h3 className="font-bold text-gray-900">
                  Complaint Status Management
                </h3>
                <p className="text-xs text-gray-500">
                  Update the complaint and notify the citizen.
                </p>
              </div>
            </div>

            <form onSubmit={handleStatusUpdate} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Update Status
                </label>

                <select
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-400 sm:max-w-md"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {statusConfig[status]?.label || status}
                    </option>
                  ))}
                </select>
              </div>

              {selectedStatus === "ASSIGNED" && (
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
                    Assign Department
                  </label>

                  <select
                    value={selectedDepartment}
                    onChange={(event) =>
                      setSelectedDepartment(event.target.value)
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-400 sm:max-w-md"
                  >
                    <option value="">Select a department</option>

                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>

                  {departments.length === 0 && (
                    <p className="mt-2 text-xs text-amber-700">
                      No active departments are currently available.
                    </p>
                  )}
                </div>
              )}

              {selectedStatus === "REJECTED" && (
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
                    Rejection Reason *
                  </label>

                  <textarea
                    value={rejectionReason}
                    onChange={(event) =>
                      setRejectionReason(event.target.value)
                    }
                    rows={3}
                    required
                    maxLength={1000}
                    placeholder="Explain why this complaint is being rejected..."
                    className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Moderator Remarks
                </label>

                <textarea
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="Add an update or remarks for this complaint..."
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
                />
              </div>

              {selectedStatus === "RESOLVED" && !finalProofUploaded && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0 text-amber-600"
                  />
                  <p className="text-sm leading-6 text-amber-800">
                    Upload a photograph marked Final Resolution Proof before
                    submitting the resolved status.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={updating}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updating ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={17} />
                    Save Status Update
                  </>
                )}
              </button>
            </form>
          </section>
        ) : (
          <section
            className={`rounded-3xl border p-6 ${
              complaint.status === "RESOLVED"
                ? "border-emerald-200 bg-emerald-50"
                : complaint.status === "DUPLICATE"
                  ? "border-gray-200 bg-gray-50"
                  : "border-red-200 bg-red-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={23}
                className="mt-0.5 shrink-0 text-emerald-700"
              />

              <div>
                <h3 className="font-bold text-gray-900">
                  Complaint {formatStatus(complaint.status)}
                </h3>

                <p className="mt-1 text-sm leading-6 text-gray-700">
                  This complaint has reached a final status. Further updates
                  are disabled.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="flex items-start gap-3">
            <Clock3 size={19} className="mt-0.5 text-gray-400" />

            <div>
              <p className="text-sm font-bold text-gray-800">
                Complaint Record
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Last updated: {formatDate(complaint.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ModeratorLayout>
  );
}

export default function ModeratorComplaintDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 size={32} className="animate-spin text-emerald-600" />
        </div>
      }
    >
      <ModeratorComplaintDetailsContent />
    </Suspense>
  );
}