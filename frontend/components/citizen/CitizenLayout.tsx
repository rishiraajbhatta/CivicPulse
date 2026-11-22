"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Bell,
  UserRound,
  LogOut,
  Leaf,
  Menu,
  X,
  ChevronRight,
  MapPin,
  ThumbsUp,
} from "lucide-react";

interface CitizenUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface CitizenLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

const navigation = [
  {
    label: "Overview",
    href: "/citizen/complaints/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Complaints",
    href: "/citizen/complaints",
    icon: FileText,
  },
  {
    label: "Supported Issues",
    href: "/citizen/complaints/upvoted",
    icon: ThumbsUp,
  },
  {
    label: "Report an Issue",
    href: "/citizen/complaints/report",
    icon: PlusCircle,
  },
  {
    label: "Notifications",
    href: "/citizen/notifications",
    icon: Bell,
  },
  {
    label: "My Profile",
    href: "/citizen/profile",
    icon: UserRound,
  },
];

export default function CitizenLayout({
  children,
  title,
  description,
}: CitizenLayoutProps) {
  const pathname = usePathname();

  const [user, setUser] = useState<CitizenUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("civicpulse_token");
    const storedUser = localStorage.getItem("civicpulse_user");

    if (!token || !storedUser) {
      window.location.href = "/auth";
      return;
    }

    try {
      const parsedUser: CitizenUser = JSON.parse(storedUser);

      if (parsedUser.role !== "CITIZEN") {
        window.location.href = "/auth";
        return;
      }

      setUser(parsedUser);
    } catch {
      localStorage.removeItem("civicpulse_token");
      localStorage.removeItem("civicpulse_user");
      window.location.href = "/auth";
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("civicpulse_token");
    localStorage.removeItem("civicpulse_user");
    window.location.href = "/auth";
  }

  const firstName = user?.fullName?.split(" ")[0] || "Citizen";

  return (
    <div className="min-h-screen bg-[#F5F7F0] text-[#173D2D]">
      {/* MOBILE HEADER */}
      <header className="sticky top-0 z-40 flex h-[76px] items-center justify-between border-b border-[#E5EBDD] bg-white/95 px-5 backdrop-blur-xl lg:hidden">
        <Link href="/citizen/complaints/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#103D2D] text-[#B9E77C]">
            <Leaf size={22} />
          </div>

          <span className="text-xl font-bold">
            Civic<span className="text-[#438B50]">Pulse</span>
          </span>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0F5EB] text-[#24583A]"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>

      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-[#E4EBDD] bg-white transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* BRAND */}
          <div className="flex h-[88px] items-center border-b border-[#EEF1E9] px-7">
            <Link
              href="/citizen/complaints/dashboard"
              className="flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#103D2D] text-[#B9E77C]">
                <Leaf size={24} />
              </div>

              <div>
                <p className="text-xl font-bold tracking-tight">
                  Civic<span className="text-[#438B50]">Pulse</span>
                </p>
                <p className="text-[9px] font-bold uppercase tracking-[2px] text-[#91A395]">
                  Citizen Portal
                </p>
              </div>
            </Link>
          </div>

          {/* CITIZEN PROFILE */}
          <div className="mx-5 mt-7 rounded-2xl bg-[#F1F6EA] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D7E9C9] text-lg font-bold text-[#276A40]">
                {firstName.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#214832]">
                  {user?.fullName || "Loading..."}
                </p>
                <p className="truncate text-xs text-[#829087]">
                  Citizen Account
                </p>
              </div>
            </div>
          </div>

          {/* NAVIGATION */}
          <div className="mt-8 flex-1 px-5">
            <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[2px] text-[#A1ADA0]">
              Workspace
            </p>

            <nav className="space-y-1.5">
              {navigation.map((item) => {
                const Icon = item.icon;

                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`group flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold transition-all ${
                      active
                        ? "bg-[#103D2D] text-white shadow-lg shadow-[#103D2D]/15"
                        : "text-[#718276] hover:bg-[#F0F5EB] hover:text-[#24583A]"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon
                        size={19}
                        className={
                          active
                            ? "text-[#B9E77C]"
                            : "text-[#91A395] group-hover:text-[#438B50]"
                        }
                      />

                      {item.label}
                    </span>

                    {active && <ChevronRight size={16} />}
                  </Link>
                );
              })}
            </nav>

            {/* QUICK ACTION */}
            <div className="mt-9 rounded-2xl bg-gradient-to-br from-[#174D35] to-[#103D2D] p-5 text-white">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#B9E77C]">
                <MapPin size={20} />
              </div>

              <h3 className="text-sm font-bold">Make a difference</h3>

              <p className="mt-2 text-xs leading-5 text-white/60">
                Spotted a civic issue? Report it and help improve your city.
              </p>

              <Link
                href="/citizen/complaints/report"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-[#B9E77C] py-2.5 text-xs font-bold text-[#103D2D] transition hover:bg-[#D0F19E]"
              >
                Report an issue
                <ChevronRight size={15} />
              </Link>
            </div>
          </div>

          {/* LOGOUT */}
          <div className="border-t border-[#EEF1E9] p-5">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#A16B63] transition hover:bg-[#FFF1EE]"
            >
              <LogOut size={19} />
              Sign out
            </button>

            <p className="mt-4 text-center text-[10px] text-[#A4AEA3]">
              CivicPulse · Better cities, together
            </p>
          </div>
        </aside>

        {/* MOBILE OVERLAY */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-[#103D2D]/35 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* MAIN CONTENT */}
        <main className="min-w-0 flex-1">
          {/* DESKTOP TOPBAR */}
          <header className="sticky top-0 z-30 hidden h-[88px] items-center justify-between border-b border-[#E5EBDD] bg-white/90 px-10 backdrop-blur-xl lg:flex">
            <div>
              <p className="text-xs font-semibold text-[#91A395]">
                Citizen Portal /{" "}
                <span className="text-[#438B50]">{title}</span>
              </p>

              <h1 className="mt-1 text-xl font-bold text-[#173D2D]">
                {title}
              </h1>
            </div>

            <div className="flex items-center gap-5">
              <div className="text-right">
                <p className="text-sm font-bold text-[#294C38]">
                  {user?.fullName || "Citizen"}
                </p>
                <p className="text-xs text-[#91A395]">
                  {user?.email || ""}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#D7E9C9] font-bold text-[#276A40]">
                {firstName.charAt(0).toUpperCase()}
              </div>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10"
          >
            {/* MOBILE PAGE TITLE */}
            <div className="mb-8 lg:hidden">
              <p className="text-xs font-semibold text-[#91A395]">
                Citizen Portal
              </p>

              <h1 className="mt-1 text-2xl font-bold">{title}</h1>

              {description && (
                <p className="mt-2 text-sm leading-6 text-[#829087]">
                  {description}
                </p>
              )}
            </div>

            {/* DESKTOP PAGE DESCRIPTION */}
            {description && (
              <p className="mb-8 hidden text-sm text-[#829087] lg:block">
                {description}
              </p>
            )}

            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}