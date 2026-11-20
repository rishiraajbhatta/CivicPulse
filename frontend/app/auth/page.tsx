"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  Leaf,
  Sparkles,
  Fingerprint,
  Users,
  Loader2,
  AlertCircle,
  Building2,
} from "lucide-react";

import api from "@/lib/api";

type AuthMode = "login" | "register" | "moderator";

interface AuthResponse {
  token: string;
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";
  const isModerator = mode === "moderator";

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setNotice("");
    setError("");
    setShowPassword(false);
  }

  function getErrorMessage(err: unknown): string {
    const error = err as {
      response?: {
        data?: {
          message?: string;
          error?: string;
        };
      };
      message?: string;
    };

    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong. Please try again."
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setNotice("");
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      // CITIZEN REGISTRATION
      if (isRegister) {
        const registrationData = {
          fullName: String(formData.get("fullName") || "").trim(),
          email: String(formData.get("email") || "").trim(),
          password: String(formData.get("password") || ""),
          phone: String(formData.get("phone") || "").trim(),
          address: String(formData.get("address") || "").trim(),
        };

        await api.post("/api/citizens/register", registrationData);

        setMode("login");
        setShowPassword(false);
        setNotice(
          "Your CivicPulse account has been created successfully! Please sign in using your email and password."
        );

        return;
      }

      // MODERATOR LOGIN
      if (isModerator) {
        const loginData = {
          employeeId: String(formData.get("employeeId") || "").trim(),
          password: String(formData.get("password") || ""),
        };

        const response = await api.post<AuthResponse>(
          "/api/moderators/login",
          loginData
        );

        const user = response.data;

        if (user.role !== "MODERATOR") {
          throw new Error("Invalid moderator account.");
        }

        localStorage.setItem("civicpulse_token", user.token);

        localStorage.setItem(
          "civicpulse_user",
          JSON.stringify({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
          })
        );

        window.location.href = "/moderator/dashboard";

        return;
      }

      // CITIZEN LOGIN
      const loginData = {
        email: String(formData.get("email") || "").trim(),
        password: String(formData.get("password") || ""),
      };

      const response = await api.post<AuthResponse>(
        "/api/citizens/login",
        loginData
      );

      const user = response.data;

      if (user.role !== "CITIZEN") {
        throw new Error("Invalid citizen account.");
      }

      localStorage.setItem("civicpulse_token", user.token);

      localStorage.setItem(
        "civicpulse_user",
        JSON.stringify({
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        })
      );

      window.location.href = "/citizen/complaints/dashboard";
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#F5F7F0]">
      {/* LEFT VISUAL PANEL */}
      <section className="relative hidden w-[46%] overflow-hidden bg-[#103D2D] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -top-32 h-[500px] w-[500px] rounded-full bg-[#9BD85F]/20 blur-[100px]" />
          <div className="absolute -bottom-40 -right-20 h-[500px] w-[500px] rounded-full bg-[#27A878]/25 blur-[110px]" />
          <div className="absolute right-10 top-1/3 h-72 w-72 rounded-full bg-[#E8B66B]/10 blur-[100px]" />

          <div
            className="absolute inset-0 opacity-[0.09]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
              backgroundSize: "55px 55px",
            }}
          />

          <div className="absolute -right-40 top-20 h-[550px] w-[550px] rounded-full border border-white/10" />
          <div className="absolute -right-20 top-40 h-[400px] w-[400px] rounded-full border border-white/10" />
          <div className="absolute right-10 top-60 h-[250px] w-[250px] rounded-full border border-white/10" />
        </div>

        <Link href="/" className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#B9E77C] text-[#103D2D]">
            <Leaf size={25} strokeWidth={2.5} />
          </div>

          <div>
            <p className="text-2xl font-bold tracking-tight">
              Civic<span className="text-[#B9E77C]">Pulse</span>
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[3px] text-white/50">
              Better cities, together
            </p>
          </div>
        </Link>

        <div className="relative z-10 max-w-xl py-12">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-[#D6F2B4] backdrop-blur-md">
              <Sparkles size={14} />
              YOUR CITY. YOUR VOICE. YOUR IMPACT.
            </div>

            <h1 className="text-5xl font-semibold leading-[1.15] tracking-tight xl:text-6xl">
              Change begins
              <br />
              when citizens
              <br />
              <span className="text-[#B9E77C]">speak up.</span>
            </h1>

            <p className="mt-7 max-w-md text-base leading-8 text-white/65">
              A smarter way to report civic issues, follow their progress and
              help build cleaner, safer and better-connected communities.
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-2 gap-4">
            <motion.div
              whileHover={{ y: -5 }}
              className="rounded-2xl border border-white/10 bg-white/[0.08] p-5 backdrop-blur-xl"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#B9E77C]/15 text-[#B9E77C]">
                <MapPin size={21} />
              </div>

              <h3 className="font-semibold">Report locally</h3>
              <p className="mt-2 text-xs leading-6 text-white/50">
                Pinpoint problems in your neighbourhood.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="rounded-2xl border border-white/10 bg-white/[0.08] p-5 backdrop-blur-xl"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#F1B96C]/15 text-[#F1B96C]">
                <ShieldCheck size={21} />
              </div>

              <h3 className="font-semibold">Track progress</h3>
              <p className="mt-2 text-xs leading-6 text-white/50">
                Follow every update until resolution.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-white/40">
          <span>Building better communities.</span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#B9E77C]" />
            Civic engagement platform
          </span>
        </div>
      </section>

      {/* RIGHT AUTHENTICATION PANEL */}
      <section className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden px-5 py-12 sm:px-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#B9E77C]/20 blur-[100px]" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#63B98D]/15 blur-[100px]" />
          <div className="absolute right-20 top-1/2 h-32 w-32 rounded-full border border-[#16734B]/10" />
        </div>

        <div className="relative z-10 w-full max-w-[480px]">
          {/* MOBILE BRAND */}
          <div className="mb-10 flex items-center justify-between lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#103D2D] text-[#B9E77C]">
                <Leaf size={22} />
              </div>
              <span className="text-xl font-bold text-[#103D2D]">
                Civic<span className="text-[#438B50]">Pulse</span>
              </span>
            </Link>
          </div>

          <Link
            href="/"
            className="mb-9 inline-flex items-center gap-2 text-sm font-medium text-[#658071] transition hover:text-[#103D2D]"
          >
            <ArrowLeft size={16} />
            Back to homepage
          </Link>

          {/* HEADING */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E4F0D9] text-[#276A40]">
                {isModerator ? (
                  <ShieldCheck size={27} />
                ) : isRegister ? (
                  <Users size={27} />
                ) : (
                  <Fingerprint size={27} />
                )}
              </div>

              <p className="mb-2 text-xs font-bold uppercase tracking-[2.5px] text-[#6E9C64]">
                {isModerator
                  ? "Official administration"
                  : isRegister
                    ? "Join the community"
                    : "Welcome back"}
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-[#153F2D] sm:text-4xl">
                {isModerator
                  ? "Moderator portal"
                  : isRegister
                    ? "Create your account."
                    : "Good to see you again."}
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#75877C]">
                {isModerator
                  ? "Sign in to manage, verify and resolve civic complaints."
                  : isRegister
                    ? "Join CivicPulse and make a difference in your neighbourhood."
                    : "Sign in to report issues and stay updated on your city."}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* ROLE SELECTOR */}
          <div className="mt-8 grid grid-cols-3 rounded-2xl border border-[#E1E9DE] bg-white/80 p-1.5 shadow-sm">
            {(["login", "register", "moderator"] as AuthMode[]).map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => changeMode(item)}
                  className={`rounded-xl px-2 py-3 text-xs font-semibold transition-all sm:text-sm ${
                    mode === item
                      ? "bg-[#103D2D] text-white shadow-md"
                      : "text-[#718276] hover:bg-[#F0F5EB]"
                  }`}
                >
                  {item === "login"
                    ? "Citizen Login"
                    : item === "register"
                      ? "Register"
                      : "Moderator"}
                </button>
              )
            )}
          </div>

          {/* AUTHENTICATION FORM */}
          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="mt-8 space-y-5"
            >
              {/* FULL NAME */}
              {isRegister && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#294C38]">
                    Full name
                  </label>

                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#91A395]"
                    />

                    <input
                      required
                      type="text"
                      name="fullName"
                      maxLength={100}
                      placeholder="Enter your full name"
                      className="w-full rounded-xl border border-[#DDE7DB] bg-white/80 py-3.5 pl-12 pr-4 text-sm text-[#173D2D] outline-none transition placeholder:text-[#A5B3A7] focus:border-[#438B50] focus:ring-4 focus:ring-[#B9E77C]/20"
                    />
                  </div>
                </div>
              )}

              {/* PHONE */}
              {isRegister && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#294C38]">
                    Mobile number
                  </label>

                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#91A395]"
                    />

                    <input
                      required
                      type="tel"
                      name="phone"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      className="w-full rounded-xl border border-[#DDE7DB] bg-white/80 py-3.5 pl-12 pr-4 text-sm text-[#173D2D] outline-none transition placeholder:text-[#A5B3A7] focus:border-[#438B50] focus:ring-4 focus:ring-[#B9E77C]/20"
                    />
                  </div>
                </div>
              )}

              {/* CITIZEN EMAIL */}
              {!isModerator && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#294C38]">
                    Email address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#91A395]"
                    />

                    <input
                      required
                      type="email"
                      name="email"
                      maxLength={150}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-[#DDE7DB] bg-white/80 py-3.5 pl-12 pr-4 text-sm text-[#173D2D] outline-none transition placeholder:text-[#A5B3A7] focus:border-[#438B50] focus:ring-4 focus:ring-[#B9E77C]/20"
                    />
                  </div>
                </div>
              )}

              {/* MODERATOR EMPLOYEE ID */}
              {isModerator && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#294C38]">
                    Employee ID
                  </label>

                  <div className="relative">
                    <Building2
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#91A395]"
                    />

                    <input
                      required
                      type="text"
                      name="employeeId"
                      maxLength={50}
                      placeholder="Enter your employee ID"
                      className="w-full rounded-xl border border-[#DDE7DB] bg-white/80 py-3.5 pl-12 pr-4 text-sm text-[#173D2D] outline-none transition placeholder:text-[#A5B3A7] focus:border-[#438B50] focus:ring-4 focus:ring-[#B9E77C]/20"
                    />
                  </div>
                </div>
              )}

              {/* ADDRESS */}
              {isRegister && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#294C38]">
                    Area / Locality
                  </label>

                  <div className="relative">
                    <MapPin
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#91A395]"
                    />

                    <input
                      required
                      type="text"
                      name="address"
                      maxLength={255}
                      placeholder="Enter your neighbourhood"
                      className="w-full rounded-xl border border-[#DDE7DB] bg-white/80 py-3.5 pl-12 pr-4 text-sm text-[#173D2D] outline-none transition placeholder:text-[#A5B3A7] focus:border-[#438B50] focus:ring-4 focus:ring-[#B9E77C]/20"
                    />
                  </div>
                </div>
              )}

              {/* PASSWORD */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-semibold text-[#294C38]">
                    Password
                  </label>

                  {!isRegister && !isModerator && (
                    <span className="text-xs font-medium text-[#91A395]">
                      Forgot password? Coming soon
                    </span>
                  )}
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#91A395]"
                  />

                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    name="password"
                    minLength={isRegister ? 8 : undefined}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-[#DDE7DB] bg-white/80 py-3.5 pl-12 pr-12 text-sm text-[#173D2D] outline-none transition placeholder:text-[#A5B3A7] focus:border-[#438B50] focus:ring-4 focus:ring-[#B9E77C]/20"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#91A395] transition hover:text-[#276A40]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {isRegister && (
                  <p className="mt-2 text-xs text-[#91A395]">
                    Use at least 8 characters.
                  </p>
                )}
              </div>

              {/* TERMS */}
              {isRegister && (
                <label className="flex cursor-pointer items-start gap-3 text-xs leading-6 text-[#718276]">
                  <input
                    required
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-[#276A40]"
                  />
                  <span>
                    I agree to the platform&apos;s terms of service and privacy
                    policy.
                  </span>
                </label>
              )}

              {/* SUCCESS MESSAGE */}
              {notice && (
                <div className="flex gap-3 rounded-xl border border-[#D8E9CB] bg-[#EDF6E5] p-4 text-xs leading-6 text-[#315F38]">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                  <p>{notice}</p>
                </div>
              )}

              {/* ERROR MESSAGE */}
              {error && (
                <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs leading-6 text-red-700">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-[#103D2D] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-[#103D2D]/15 transition duration-300 hover:-translate-y-0.5 hover:bg-[#18563D] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Please wait...
                  </>
                ) : (
                  <>
                    {isModerator
                      ? "Access Moderator Portal"
                      : isRegister
                        ? "Create My Account"
                        : "Sign In to CivicPulse"}

                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </motion.form>
          </AnimatePresence>

          {/* BOTTOM SWITCH */}
          {!isModerator && (
            <p className="mt-7 text-center text-sm text-[#829087]">
              {isRegister
                ? "Already have an account?"
                : "New to CivicPulse?"}{" "}
              <button
                type="button"
                onClick={() => changeMode(isRegister ? "login" : "register")}
                className="font-bold text-[#347448] hover:text-[#103D2D]"
              >
                {isRegister ? "Sign in" : "Create an account"}
              </button>
            </p>
          )}

          {/* SECURITY NOTE */}
          <div className="mt-10 flex items-center justify-center gap-2 border-t border-[#E3EADF] pt-6 text-xs text-[#91A095]">
            <ShieldCheck size={15} className="text-[#61946A]" />
            Secure access to the CivicPulse platform
          </div>
        </div>
      </section>
    </main>
  );
}