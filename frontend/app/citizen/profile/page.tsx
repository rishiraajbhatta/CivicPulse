"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  User,
  Mail,
  ShieldCheck,
  Phone,
  MapPin,
  CalendarDays,
  FileText,
  Bell,
  LogOut,
  LockKeyhole,
  ArrowRight,
  Loader2,
  CircleUserRound,
  Settings,
} from "lucide-react";

import CitizenLayout from "@/components/citizen/CitizenLayout";

interface CitizenUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export default function CitizenProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<CitizenUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("civicpulse_user");

    if (!storedUser) {
      router.replace("/auth");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser) as CitizenUser;

      if (parsedUser.role !== "CITIZEN") {
        router.replace("/auth");
        return;
      }

      setUser(parsedUser);
    } catch {
      localStorage.removeItem("civicpulse_user");
      localStorage.removeItem("civicpulse_token");
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <CitizenLayout
        title="My Profile"
        description="Manage your CivicPulse account."
      >
        <div className="flex min-h-96 items-center justify-center">
          <Loader2 className="animate-spin text-emerald-600" size={32} />
        </div>
      </CitizenLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <CitizenLayout
      title="My Profile"
      description="View your account information and manage your CivicPulse account."
    >
      <div className="mx-auto max-w-5xl space-y-7 pb-10">

        {/* Profile Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 p-7 text-white shadow-lg sm:p-9">
          <div className="relative z-10 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border-4 border-white/30 bg-white/20 text-3xl font-extrabold shadow-xl backdrop-blur-sm">
              {getInitials(user.fullName || "Citizen")}
            </div>

            <div className="text-center sm:text-left">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">
                <ShieldCheck size={14} />
                VERIFIED ACCOUNT SESSION
              </div>

              <h2 className="text-2xl font-bold sm:text-3xl">
                {user.fullName}
              </h2>

              <p className="mt-2 text-sm text-emerald-50">
                {user.email}
              </p>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">
                <CircleUserRound size={14} />
                Citizen Account
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full border-[35px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 right-32 h-52 w-52 rounded-full bg-lime-300/10 blur-2xl" />
        </section>

        {/* Account Information */}
        <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <User size={21} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Account Information
                </h3>

                <p className="text-sm text-gray-500">
                  Your registered CivicPulse account details.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-7">

            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <User size={20} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Full Name
                </p>

                <p className="mt-1 break-words font-semibold text-gray-900">
                  {user.fullName}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                <Mail size={20} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Email Address
                </p>

                <p className="mt-1 break-all font-semibold text-gray-900">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <ShieldCheck size={20} />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Account Role
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  Citizen
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <LockKeyhole size={20} />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Account Security
                </p>

                <p className="mt-1 font-semibold text-emerald-700">
                  Authenticated
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 bg-gray-50/70 px-6 py-4 sm:px-7">
            <p className="text-xs leading-5 text-gray-500">
              Your account information is currently displayed from your
              authenticated login session. Profile editing will be
              connected to the backend profile API.
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Phone size={21} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Contact Information
              </h3>

              <p className="text-sm text-gray-500">
                Additional contact details associated with your account.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <div className="flex items-center gap-2 text-gray-500">
                <Phone size={17} />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Phone Number
                </span>
              </div>

              <p className="mt-3 text-sm text-gray-400">
                Not available in the current login session.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <div className="flex items-center gap-2 text-gray-500">
                <MapPin size={17} />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Registered Address
                </span>
              </div>

              <p className="mt-3 text-sm text-gray-400">
                Not available in the current login session.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Quick Access
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Quickly navigate to your CivicPulse activities.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            <Link
              href="/citizen/complaints"
              className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <FileText size={22} />
                </div>

                <div>
                  <p className="font-bold text-gray-900">
                    My Complaints
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    View and track your reports.
                  </p>
                </div>
              </div>

              <ArrowRight
                size={19}
                className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-emerald-600"
              />
            </Link>

            <Link
              href="/citizen/notifications"
              className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Bell size={22} />
                </div>

                <div>
                  <p className="font-bold text-gray-900">
                    Notifications
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Stay updated on complaint progress.
                  </p>
                </div>
              </div>

              <ArrowRight
                size={19}
                className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-emerald-600"
              />
            </Link>
          </div>
        </section>

        {/* Account Settings */}
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
              <Settings size={21} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Account Settings
              </h3>

              <p className="text-sm text-gray-500">
                Manage your account access.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50/60 p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2 text-red-700">
                  <LogOut size={19} />
                  <p className="font-bold">Sign Out</p>
                </div>

                <p className="mt-2 text-sm text-gray-600">
                  Sign out of your CivicPulse citizen account on this device.
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                <LogOut size={17} />
                Sign Out
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={21}
              className="mt-0.5 shrink-0 text-emerald-700"
            />

            <div>
              <p className="text-sm font-bold text-emerald-900">
                Your voice matters.
              </p>

              <p className="mt-1 text-xs leading-5 text-emerald-700">
                Thank you for being an active citizen and helping
                make your community cleaner, safer, and better.
              </p>
            </div>
          </div>
        </div>

      </div>
    </CitizenLayout>
  );
}