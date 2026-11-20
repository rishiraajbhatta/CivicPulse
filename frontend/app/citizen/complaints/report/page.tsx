"use client";

import { useEffect, useRef, useState } from "react";

import {
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  type MapMouseEvent,
} from "maplibre-gl";

import "maplibre-gl/dist/maplibre-gl.css";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Crosshair,
  FileText,
  ImagePlus,
  Loader2,
  MapPin,
  Navigation,
  Trash2,
  Upload,
} from "lucide-react";

import Link from "next/link";

import CitizenLayout from "@/components/citizen/CitizenLayout";
import api from "@/lib/api";

const categories = [
  {
    value: "POTHOLE",
    label: "Pothole",
    description: "Potholes and damaged road surfaces",
    icon: "🕳️",
  },
  {
    value: "GARBAGE_DUMPING",
    label: "Garbage Dumping",
    description: "Uncollected garbage and illegal dumping",
    icon: "🗑️",
  },
  {
    value: "WATER_LEAKAGE",
    label: "Water Leakage",
    description: "Water pipe leakage and wastage",
    icon: "💧",
  },
  {
    value: "STREETLIGHT",
    label: "Streetlight",
    description: "Broken or non-functional streetlights",
    icon: "💡",
  },
  {
    value: "DRAINAGE",
    label: "Drainage",
    description: "Blocked drains and overflowing sewage",
    icon: "🚰",
  },
  {
    value: "ROAD_DAMAGE",
    label: "Road Damage",
    description: "Damaged roads and unsafe surfaces",
    icon: "🚧",
  },
  {
    value: "OTHER",
    label: "Other",
    description: "Any other civic issue",
    icon: "📍",
  },
];

interface ComplaintResponse {
  id: string;
  complaintCode: string;
  category: string;
  description: string;
  address: string;
  status: string;
}

export default function ReportIssuePage() {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [mapVisible, setMapVisible] = useState(false);

  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState<ComplaintResponse | null>(null);
  const [uploadWarning, setUploadWarning] = useState("");

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);

  const latitudeRef = useRef<number | null>(null);
  const longitudeRef = useRef<number | null>(null);

  useEffect(() => {
    latitudeRef.current = latitude;
    longitudeRef.current = longitude;
  }, [latitude, longitude]);

  // Initialize map.
  useEffect(() => {
    if (!mapVisible || !mapContainerRef.current || mapRef.current) {
      return;
    }

    const initialLatitude = latitudeRef.current ?? 12.9716;
    const initialLongitude = longitudeRef.current ?? 77.5946;

    const map = new MapLibreMap({
      container: mapContainerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [initialLongitude, initialLatitude],
      zoom: 12,
    });

    mapRef.current = map;

    map.addControl(new NavigationControl(), "top-right");

    const marker = new Marker({
      color: "#059669",
      draggable: true,
    })
      .setLngLat([initialLongitude, initialLatitude])
      .addTo(map);

    markerRef.current = marker;

    marker.on("dragend", () => {
      const coordinates = marker.getLngLat();

      setLatitude(coordinates.lat);
      setLongitude(coordinates.lng);
    });

    map.on("click", (event: MapMouseEvent) => {
      const { lng, lat } = event.lngLat;

      marker.setLngLat([lng, lat]);

      setLatitude(lat);
      setLongitude(lng);
    });

    return () => {
      marker.remove();
      map.remove();

      markerRef.current = null;
      mapRef.current = null;
    };
  }, [mapVisible]);

  // Update map location.
  const updateMapLocation = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);

    if (mapRef.current && markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);

      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 16,
      });
    }
  };

  // Get current GPS location.
  const getCurrentLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        updateMapLocation(lat, lng);

        setMapVisible(true);
        setLoadingLocation(false);
      },
      (locationError) => {
        setLoadingLocation(false);

        if (locationError.code === locationError.PERMISSION_DENIED) {
          setError(
            "Location permission was denied. Please allow location access or select a location manually on the map."
          );
        } else {
          setError(
            "Unable to retrieve your location. Please select it manually on the map."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // Handle photo selection.
  const handlePhotoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setError("");

    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a JPG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must not exceed 5 MB.");
      event.target.value = "";
      return;
    }

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  // Remove selected photo.
  const removePhoto = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhoto(null);
    setPhotoPreview("");
  };

  // Submit complaint.
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setUploadWarning("");

    if (!category) {
      setError("Please select an issue category.");
      return;
    }

    if (description.trim().length < 10) {
      setError("Please provide at least 10 characters in the description.");
      return;
    }

    if (description.trim().length > 5000) {
      setError("Description cannot exceed 5000 characters.");
      return;
    }

    if (latitude === null || longitude === null) {
      setError("Please select the issue location on the map.");
      return;
    }

    if (!address.trim()) {
      setError("Please enter the location address.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post<ComplaintResponse>(
        "/api/complaints",
        {
          category,
          description: description.trim(),
          latitude,
          longitude,
          address: address.trim(),
        }
      );

      const complaint = response.data;

      // Upload photo after complaint creation.
      if (photo) {
        try {
          const formData = new FormData();

          formData.append("file", photo);
          formData.append("caption", "Citizen submitted evidence");

          await api.post(
            `/api/complaints/${complaint.id}/images`,
            formData
          );
        } catch {
          setUploadWarning(
            "Your complaint was submitted successfully, but the photo could not be uploaded. You can try again later."
          );
        }
      }

      setSuccess(complaint);
    } catch (err: unknown) {
      const errorMessage = (
        err as {
          response?: {
            data?: {
              message?: string;
            };
          };
        }
      ).response?.data?.message;

      setError(
        errorMessage ||
          "Something went wrong while submitting your complaint. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Clean up photo preview.
  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  // Successful submission screen.
  if (success) {
    return (
      <CitizenLayout
        title="Report an Issue"
        description="Your civic complaint has been submitted."
      >
        <div className="mx-auto max-w-2xl py-10">
          <div className="rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-xl shadow-emerald-900/5 sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2
                size={42}
                className="text-emerald-600"
              />
            </div>

            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Complaint Submitted!
            </h2>

            <p className="mx-auto mt-3 max-w-md text-gray-500">
              Thank you for helping improve your community. Your
              complaint has been registered successfully.
            </p>

            <div className="mt-8 rounded-2xl bg-emerald-50 p-6">
              <p className="text-sm font-medium text-emerald-700">
                Your Complaint Tracking ID
              </p>

              <p className="mt-2 text-2xl font-extrabold tracking-wide text-emerald-800">
                {success.complaintCode}
              </p>

              <p className="mt-3 text-xs text-emerald-700">
                Save this ID to track the progress of your complaint.
              </p>
            </div>

            {uploadWarning && (
              <div className="mt-5 rounded-xl bg-amber-50 p-4 text-left text-sm text-amber-800">
                {uploadWarning}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/citizen/complaints"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
              >
                Track Complaint
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/citizen/dashboard"
                className="flex flex-1 items-center justify-center rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </CitizenLayout>
    );
  }

  return (
    <CitizenLayout
      title="Report an Issue"
      description="Help make your neighbourhood better by reporting civic problems."
    >
      <div className="mx-auto max-w-5xl space-y-7 pb-10">

        {/* Introduction */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 p-7 text-white shadow-lg sm:p-9">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">
              <FileText size={14} />
              CIVIC ISSUE REPORTING
            </div>

            <h2 className="text-2xl font-bold sm:text-3xl">
              See a problem? Let&apos;s fix it together.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50 sm:text-base">
              Report potholes, garbage, water leakage, damaged
              roads, and other civic issues. Your report helps
              authorities take action.
            </p>
          </div>

          <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full border-[35px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 right-32 h-52 w-52 rounded-full bg-lime-300/10 blur-2xl" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">

          {/* Category */}
          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <AlertCircle size={21} />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    What issue are you reporting?
                  </h3>

                  <p className="text-sm text-gray-500">
                    Select the category that best describes the issue.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((item) => {
                const selected = category === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setCategory(item.value)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100"
                        : "border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">
                        {item.icon}
                      </span>

                      {selected && (
                        <CheckCircle2
                          size={19}
                          className="text-emerald-600"
                        />
                      )}
                    </div>

                    <p className="mt-3 font-bold text-gray-900">
                      {item.label}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      {item.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Description */}
          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <FileText size={21} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Describe the issue
                </h3>

                <p className="text-sm text-gray-500">
                  Provide enough detail to help authorities understand the problem.
                </p>
              </div>
            </div>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              maxLength={5000}
              placeholder="Describe what happened, how serious the issue is, and any nearby landmarks..."
              className="w-full resize-y rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />

            <div className="mt-2 flex justify-between text-xs text-gray-400">
              <span>Minimum 10 characters</span>
              <span>{description.length}/5000</span>
            </div>
          </section>

          {/* Location */}
          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <MapPin size={21} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Where is the issue?
                </h3>

                <p className="text-sm text-gray-500">
                  Use GPS or select the exact location on the map.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={loadingLocation}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60 sm:w-auto"
            >
              {loadingLocation ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Crosshair size={18} />
              )}

              {loadingLocation
                ? "Getting your location..."
                : "Use My Current Location"}
            </button>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />

              <span className="text-xs font-medium text-gray-400">
                OR SELECT MANUALLY
              </span>

              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <button
              type="button"
              onClick={() => setMapVisible(!mapVisible)}
              className="flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              <Navigation size={17} />

              {mapVisible ? "Hide Map" : "Open Map to Select Location"}
            </button>

            {mapVisible && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200">
                <div
                  ref={mapContainerRef}
                  className="h-80 w-full"
                />

                <div className="bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
                  Click anywhere on the map or drag the green marker
                  to select the exact issue location.
                </div>
              </div>
            )}

            {latitude !== null && longitude !== null && (
              <div className="mt-4 rounded-xl bg-emerald-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                  <CheckCircle2 size={17} />
                  Location selected
                </div>

                <p className="mt-2 text-xs text-emerald-700">
                  Latitude: {latitude.toFixed(6)}
                </p>

                <p className="mt-1 text-xs text-emerald-700">
                  Longitude: {longitude.toFixed(6)}
                </p>
              </div>
            )}

            <div className="mt-5">
              <label
                htmlFor="address"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Complete Address / Nearby Landmark
              </label>

              <input
                id="address"
                type="text"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Example: Near Main Road, Rajajinagar, Bengaluru"
                maxLength={255}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              />
            </div>
          </section>

          {/* Photo Upload */}
          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                <ImagePlus size={21} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Add Photo Evidence
                </h3>

                <p className="text-sm text-gray-500">
                  A photograph helps authorities understand the issue.
                </p>
              </div>
            </div>

            {!photo ? (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-5 py-10 text-center transition hover:border-emerald-400 hover:bg-emerald-50/40">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <Upload size={25} />
                </div>

                <p className="mt-4 font-semibold text-gray-800">
                  Click to upload a photograph
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  JPG, PNG or WEBP · Maximum 5 MB
                </p>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-gray-200">
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Complaint evidence preview"
                    className="max-h-80 w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-600 shadow-lg transition hover:bg-red-50"
                    aria-label="Remove photo"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="bg-gray-50 p-4">
                  <p className="truncate text-sm font-semibold text-gray-800">
                    {photo.name}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {(photo.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Submit */}
          <div className="flex flex-col-reverse items-stretch justify-between gap-4 sm:flex-row sm:items-center">
            <Link
              href="/citizen/dashboard"
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              <ArrowLeft size={17} />
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-3.5 font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={19} className="animate-spin" />
                  Submitting Complaint...
                </>
              ) : (
                <>
                  Submit Complaint
                  <ArrowRight size={19} />
                </>
              )}
            </button>
          </div>

          <p className="text-center text-xs leading-5 text-gray-400">
            By submitting this report, you confirm that the information
            provided is accurate to the best of your knowledge.
          </p>
        </form>
      </div>
    </CitizenLayout>
  );
}