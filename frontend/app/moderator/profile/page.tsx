"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  ShieldCheck,
  User,
  Mail,
  BriefcaseBusiness,
  CalendarDays,
  LockKeyhole,
  Bell,
  FileText,
  LogOut,
  ArrowRight,
  BadgeCheck,
  Building2,
  AlertCircle,
} from "lucide-react";

import { useRouter } from "next/navigation";

import ModeratorLayout from "@/components/moderator/ModeratorLayout";

interface ModeratorUser {
  id?: string;
  fullName?: string;
  email?: string;
  role?: string;
  employeeId?: string;
}

export default function ModeratorProfilePage() {
  const router = useRouter();

  const [moderator, setModerator] = useState<ModeratorUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("civicpulse_user");

      if (!storedUser) {
        router.replace("/auth");
        return;
      }

      const parsedUser = JSON.parse(storedUser) as ModeratorUser;

      if (parsedUser.role !== "MODERATOR") {
        router.replace("/auth");
        return;
      }

      setModerator(parsedUser);
    } catch (error) {
      console.error("Unable to load moderator profile:", error);
      router.replace("/auth");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("civicpulse_token");
    localStorage.removeItem("civicpulse_user");
    router.replace("/auth");
  };

  const initials = moderator?.fullName
    ? moderator.fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "M";

  if (loading) {
    return (
      <ModeratorLayout
        title="My Profile"
        description="View your moderator account information."
      >
        <div className="flex min-h-72 items-center justify-center">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-700" />
        </div>
      </ModeratorLayout>
    );
  }

  return (
    <ModeratorLayout
      title="My Profile"
      description="Manage and view your CivicPulse moderator account."
    >
      <div className="mx-auto max-w-5xl space-y-7">

        {/* Profile Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-700 p-7 text-white sm:p-10">
          <div className="relative z-10 flex flex-col items-center gap-6 sm:flex-row">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border-4 border-white/20 bg-white/15 text-3xl font-extrabold shadow-xl backdrop-blur-sm">
              {initials}
            </div>

            <div className="text-center sm:text-left">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-emerald-100">
                <ShieldCheck size={14} />
                BBMP MODERATOR
              </div>

              <h2 className="text-2xl font-extrabold sm:text-3xl">
                {moderator?.fullName || "Moderator"}
              </h2>

              <p className="mt-2 text-sm text-emerald-100">
                {moderator?.email || "Email not available"}
              </p>

              <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-emerald-100">
                <BadgeCheck size={15} />
                Authenticated moderator account
              </div>
            </div>
          </div>

          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-28 right-36 h-64 w-64 rounded-full bg-white/5" />
        </section>

        {/* Account Information */}
        <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <User size={21} />
              </div>

              <div>
                <h3 className="font-extrabold text-gray-900">
                  Account Information
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Your registered moderator account details.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-2">

            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-400">
                <User size={15} />
                FULL NAME
              </div>

              <p className="font-bold text-gray-900">
                {moderator?.fullName || "Not available"}
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-400">
                <Mail size={15} />
                EMAIL ADDRESS
              </div>

              <p className="break-all font-bold text-gray-900">
                {moderator?.email || "Not available"}
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-400">
                <BriefcaseBusiness size={15} />
                ACCOUNT ROLE
              </div>

              <p className="font-bold text-gray-900">
                {moderator?.role || "MODERATOR"}
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-400">
                <Building2 size={15} />
                ORGANIZATION
              </div>

              <p className="font-bold text-gray-900">
                Bruhat Bengaluru Mahanagara Palike
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-400">
                <LockKeyhole size={15} />
                AUTHENTICATION
              </div>

              <p className="font-bold text-emerald-700">
                JWT Session Active
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-400">
                <CalendarDays size={15} />
                ACCOUNT STATUS
              </div>

              <p className="font-bold text-emerald-700">
                Active Session
              </p>
            </div>

          </div>
        </section>

        {/* Account Security */}
        <section className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
              <ShieldCheck size={23} />
            </div>

            <div>
              <h3 className="font-extrabold text-gray-900">
                Account Security
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Your moderator account is protected through authenticated
                access. Keep your login credentials private and sign out
                when using a shared device.
              </p>

              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-800">
                <BadgeCheck size={15} />
                Secure session
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section>
          <h3 className="mb-4 text-lg font-extrabold text-gray-900">
            Quick Access
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">

            <Link
              href="/moderator/complaints"
              className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <FileText size={22} />
                </div>

                <div>
                  <p className="font-bold text-gray-900">
                    All Complaints
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Review citizen reports
                  </p>
                </div>
              </div>

              <ArrowRight
                size={19}
                className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-emerald-700"
              />
            </Link>

            <Link
              href="/moderator/notifications"
              className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <Bell size={22} />
                </div>

                <div>
                  <p className="font-bold text-gray-900">
                    Notifications
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    View important updates
                  </p>
                </div>
              </div>

              <ArrowRight
                size={19}
                className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-emerald-700"
              />
            </Link>

          </div>
        </section>

        {/* Logout */}
        <section className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-extrabold text-gray-900">
                Sign Out
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                End your current moderator session on this device.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100"
            >
              <LogOut size={17} />
              Sign Out
            </button>
          </div>
        </section>

        {/* Profile Limitation Notice */}
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0 text-amber-700"
          />

          <p className="text-xs leading-5 text-amber-800">
            This page currently displays the information returned during
            moderator login. Profile editing and additional employee
            information can be connected when the corresponding backend
            functionality is implemented.
          </p>
        </div>

      </div>
    </ModeratorLayout>
  );
}