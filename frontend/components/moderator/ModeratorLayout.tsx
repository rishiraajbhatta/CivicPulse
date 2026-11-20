"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

import {
  LayoutDashboard,
  FileText,
  CopyCheck,
  Bell,
  UserCircle,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  MapPin,
  Loader2,
} from "lucide-react";

interface ModeratorUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface ModeratorLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

const navigation = [
  {
    name: "Overview",
    href: "/moderator/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "All Complaints",
    href: "/moderator/complaints",
    icon: FileText,
  },
  {
    name: "Duplicate Review",
    href: "/moderator/duplicates",
    icon: CopyCheck,
  },
  {
    name: "Notifications",
    href: "/moderator/notifications",
    icon: Bell,
  },
  {
    name: "My Profile",
    href: "/moderator/profile",
    icon: UserCircle,
  },
];

export default function ModeratorLayout({
  children,
  title,
  description,
}: ModeratorLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [moderator, setModerator] = useState<ModeratorUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("civicpulse_user");
    const token = localStorage.getItem("civicpulse_token");

    if (!storedUser || !token) {
      router.replace("/auth");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser) as ModeratorUser;

      if (parsedUser.role !== "MODERATOR") {
        router.replace("/auth");
        return;
      }

      setModerator(parsedUser);
    } catch {
      localStorage.removeItem("civicpulse_user");
      localStorage.removeItem("civicpulse_token");
      router.replace("/auth");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("civicpulse_token");
    localStorage.removeItem("civicpulse_user");

    router.replace("/auth");
  };

  const isActive = (href: string) => {
    if (href === "/moderator/dashboard") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
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
      <div className="flex min-h-screen items-center justify-center bg-[#f7f9f7]">
        <Loader2 className="animate-spin text-emerald-600" size={34} />
      </div>
    );
  }

  if (!moderator) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f7f9f7] text-gray-900">

      {/* Mobile Header */}
      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-5 lg:hidden">
        <Link
          href="/moderator/dashboard"
          className="flex items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white">
            <MapPin size={19} />
          </div>

          <span className="text-lg font-extrabold tracking-tight">
            Civic<span className="text-emerald-600">Pulse</span>
          </span>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-700"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <button
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close navigation"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 flex w-[270px] flex-col border-r border-gray-100 bg-white transition-transform duration-300 lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >

        {/* Brand */}
        <div className="flex h-20 items-center gap-3 border-b border-gray-100 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-700/20">
            <MapPin size={23} />
          </div>

          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900">
              Civic<span className="text-emerald-600">Pulse</span>
            </h1>

            <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400">
              Moderator Portal
            </p>
          </div>
        </div>

        {/* Moderator Information */}
        <div className="mx-4 mt-6 rounded-2xl bg-gradient-to-br from-emerald-800 to-teal-700 p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/15 text-sm font-bold">
              {getInitials(moderator.fullName || "Moderator")}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold">
                {moderator.fullName}
              </p>

              <p className="mt-1 text-xs text-emerald-100">
                BBMP Moderator
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 border-t border-white/15 pt-3 text-xs text-emerald-100">
            <ShieldCheck size={14} />
            Authorized Moderator
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-7">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[1.8px] text-gray-400">
            Workspace
          </p>

          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center justify-between rounded-xl px-3 py-3 transition-all ${
                    active
                      ? "bg-emerald-50 text-emerald-800"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={19}
                      className={
                        active
                          ? "text-emerald-700"
                          : "text-gray-400 group-hover:text-emerald-600"
                      }
                    />

                    <span className="text-sm font-semibold">
                      {item.name}
                    </span>
                  </div>

                  {active && (
                    <ChevronRight
                      size={16}
                      className="text-emerald-600"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-100 p-4">
          <div className="mb-4 rounded-xl bg-emerald-50 p-3">
            <div className="flex items-center gap-2 text-emerald-800">
              <ShieldCheck size={16} />
              <span className="text-xs font-bold">
                CivicPulse Administration
              </span>
            </div>

            <p className="mt-1 text-[11px] leading-5 text-emerald-700">
              Helping build cleaner and better communities.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={19} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen pt-16 lg:ml-[270px] lg:pt-0">

        {/* Desktop Topbar */}
        <header className="hidden h-20 items-center justify-between border-b border-gray-100 bg-white px-8 lg:flex xl:px-10">
          <div>
            <p className="text-xs font-medium text-gray-400">
              CivicPulse / Moderator Portal
            </p>

            <h2 className="mt-1 text-lg font-bold text-gray-900">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">
                {moderator.fullName}
              </p>

              <p className="text-xs text-gray-400">
                BBMP Moderator
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-800">
              {getInitials(moderator.fullName || "Moderator")}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="px-5 py-7 sm:px-7 lg:px-8 lg:py-9 xl:px-10">
          <div className="mb-7 lg:hidden">
            <h2 className="text-2xl font-extrabold text-gray-900">
              {title}
            </h2>

            {description && (
              <p className="mt-2 text-sm leading-6 text-gray-500">
                {description}
              </p>
            )}
          </div>

          <div className="hidden lg:block">
            {description && (
              <p className="mb-7 text-sm text-gray-500">
                {description}
              </p>
            )}
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}