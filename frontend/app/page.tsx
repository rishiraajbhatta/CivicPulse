"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Construction,
  Droplets,
  Globe2,
  Leaf,
  Lightbulb,
  MapPin,
  Menu,
  Navigation,
  Recycle,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react";

/* =========================================================
   REUSABLE ANIMATED BACKGROUND
========================================================= */

function FloatingBackdrop({ dark = false }: { dark?: boolean }) {
  const icons = [
    { Icon: MapPin, x: "9%", y: "22%", delay: 0, size: 27 },
    { Icon: Activity, x: "84%", y: "17%", delay: 1.5, size: 25 },
    { Icon: CheckCircle2, x: "73%", y: "76%", delay: 2.5, size: 24 },
    { Icon: Navigation, x: "20%", y: "79%", delay: 1, size: 23 },
    { Icon: ShieldCheck, x: "93%", y: "49%", delay: 3, size: 26 },
    { Icon: Zap, x: "48%", y: "13%", delay: 2, size: 22 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <motion.div
        animate={{
          x: [0, 100, -50, 0],
          y: [0, 70, 120, 0],
          scale: [1, 1.25, 0.9, 1],
        }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute -left-40 -top-40 h-[550px] w-[550px] rounded-full blur-[100px] ${
          dark ? "bg-[#B9E77C]/20" : "bg-[#B9E77C]/35"
        }`}
      />

      <motion.div
        animate={{
          x: [0, -110, 40, 0],
          y: [0, 100, -50, 0],
          scale: [1, 0.85, 1.2, 1],
        }}
        transition={{ duration: 29, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute -right-48 top-[20%] h-[600px] w-[600px] rounded-full blur-[110px] ${
          dark ? "bg-[#20B98A]/25" : "bg-[#78C99A]/25"
        }`}
      />

      <motion.div
        animate={{
          x: [0, 90, -30, 0],
          y: [0, -90, 40, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute bottom-[-250px] left-[35%] h-[500px] w-[500px] rounded-full blur-[100px] ${
          dark ? "bg-[#559ED8]/20" : "bg-[#E8C47D]/20"
        }`}
      />

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        className={`absolute -right-40 top-[-180px] h-[650px] w-[650px] rounded-full border ${
          dark ? "border-white/15" : "border-[#43845D]/15"
        }`}
      >
        <div
          className={`absolute left-[12%] top-[17%] h-4 w-4 rounded-full ${
            dark ? "bg-[#B9E77C]" : "bg-[#43845D]"
          } shadow-[0_0_25px_rgba(185,231,124,0.8)]`}
        />
      </motion.div>

      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
        className={`absolute -right-20 top-[-80px] h-[420px] w-[420px] rounded-full border ${
          dark ? "border-white/10" : "border-[#43845D]/10"
        }`}
      >
        <div
          className={`absolute bottom-[10%] left-[20%] h-3 w-3 rounded-full ${
            dark ? "bg-[#82D8B2]" : "bg-[#75B98A]"
          }`}
        />
      </motion.div>

      {icons.map(({ Icon, x, y, delay, size }, index) => (
        <motion.div
          key={index}
          className={`absolute hidden rounded-2xl border p-3 backdrop-blur-sm md:flex ${
            dark
              ? "border-white/10 bg-white/[0.06] text-white/35"
              : "border-[#43845D]/10 bg-white/40 text-[#43845D]/35"
          }`}
          style={{ left: x, top: y }}
          animate={{
            y: [0, -28, 0, 18, 0],
            x: [0, 12, -10, 0],
            rotate: [0, 8, -8, 0],
          }}
          transition={{
            duration: 8 + index * 1.3,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Icon size={size} strokeWidth={1.6} />
        </motion.div>
      ))}

      {Array.from({ length: 18 }).map((_, index) => (
        <motion.span
          key={`particle-${index}`}
          className={`absolute h-1.5 w-1.5 rounded-full ${
            dark ? "bg-[#C6EE9A]/60" : "bg-[#43845D]/35"
          }`}
          style={{
            left: `${(index * 37 + 11) % 100}%`,
            top: `${(index * 53 + 7) % 100}%`,
          }}
          animate={{
            y: [0, -65, 0],
            opacity: [0.15, 0.85, 0.15],
            scale: [0.7, 1.5, 0.7],
          }}
          transition={{
            duration: 5 + (index % 5) * 2,
            delay: index * 0.35,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        animate={{ x: ["-120%", "220%"] }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 7,
        }}
        className={`absolute left-0 top-[42%] h-px w-[45%] ${
          dark
            ? "bg-gradient-to-r from-transparent via-[#B9E77C]/50 to-transparent"
            : "bg-gradient-to-r from-transparent via-[#43845D]/25 to-transparent"
        }`}
      />
    </div>
  );
}

/* =========================================================
   DATA
========================================================= */

const issues = [
  {
    name: "Road damage",
    description: "Potholes, damaged roads and unsafe streets.",
    icon: Construction,
    color: "#F2A65A",
    bg: "bg-orange-50",
  },
  {
    name: "Garbage",
    description: "Overflowing bins and illegal dumping.",
    icon: Recycle,
    color: "#399B70",
    bg: "bg-emerald-50",
  },
  {
    name: "Water leakage",
    description: "Leaking pipelines and water wastage.",
    icon: Droplets,
    color: "#559ED8",
    bg: "bg-sky-50",
  },
  {
    name: "Streetlights",
    description: "Broken lights and dark public spaces.",
    icon: Lightbulb,
    color: "#D5A63D",
    bg: "bg-amber-50",
  },
];

const stats = [
  { value: "2,450+", label: "Issues reported", icon: MapPin },
  { value: "1,820+", label: "Problems resolved", icon: CheckCircle2 },
  { value: "74%", label: "Resolution rate", icon: Activity },
  { value: "24/7", label: "Community access", icon: Globe2 },
];

const steps = [
  {
    number: "01",
    title: "Spot an issue",
    description: "Notice something that needs attention in your neighbourhood.",
    icon: MapPin,
    color: "#B9E77C",
  },
  {
    number: "02",
    title: "Report it",
    description: "Upload a photograph, describe the issue and pin its location.",
    icon: Zap,
    color: "#82D8B2",
  },
  {
    number: "03",
    title: "Track progress",
    description: "Follow every update through your unique complaint ID.",
    icon: Activity,
    color: "#F0C36A",
  },
  {
    number: "04",
    title: "See the change",
    description: "Get notified when the issue is resolved by the authorities.",
    icon: CheckCircle2,
    color: "#85C9E9",
  },
];

/* =========================================================
   MAIN PAGE
========================================================= */

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<
    "citizen" | "moderator" | null
  >(null);

  return (
    <main className="overflow-hidden bg-[#F7F8F1] text-[#173D2D]">
      {/* ==================================================
          HERO
      ================================================== */}

      <div className="relative isolate overflow-hidden bg-[#103D2D] text-white">
        <FloatingBackdrop dark />

        <div className="hero-light pointer-events-none absolute inset-0 z-0" />
        <div className="hero-grid pointer-events-none absolute inset-0 z-0 opacity-[0.13]" />

        <motion.div
          animate={{
            x: [0, 80, -30, 0],
            y: [0, 45, -20, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute left-[42%] top-[12%] z-0 h-80 w-80 rounded-full bg-[#B9E77C]/10 blur-[90px]"
        />

        {/* NAVBAR */}
        <nav className="relative z-50 mx-auto flex max-w-[1450px] items-center justify-between px-6 py-6 md:px-12 lg:px-16">
          <a href="#" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#B9E77C] text-[#103D2D] shadow-lg">
              <Leaf size={25} strokeWidth={2.5} />
            </div>

            <div>
              <p className="text-xl font-extrabold tracking-tight">
                Civic<span className="text-[#B9E77C]">Pulse</span>
              </p>
              <p className="text-[9px] uppercase tracking-[3px] text-[#A9C5B1]">
                Better cities, together
              </p>
            </div>
          </a>

          <div className="hidden items-center gap-10 text-sm font-medium text-[#D0E1D4] md:flex">
            <a href="#about" className="transition hover:text-[#B9E77C]">
              About
            </a>
            <a href="#how" className="transition hover:text-[#B9E77C]">
              How it works
            </a>
            <a href="#impact" className="transition hover:text-[#B9E77C]">
              Our impact
            </a>
          </div>

          <div className="hidden md:block">
            <a
              href="#get-started"
              className="flex items-center gap-3 rounded-full bg-[#B9E77C] px-6 py-3 text-sm font-bold text-[#173D2D] shadow-lg transition hover:-translate-y-1 hover:bg-[#D0F29D]"
            >
              Get started <ArrowUpRight size={17} />
            </a>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-xl border border-white/20 bg-white/10 p-2 text-white md:hidden"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </nav>

        {menuOpen && (
          <div className="relative z-50 mx-6 rounded-2xl border border-white/10 bg-[#194A36] p-6 shadow-2xl md:hidden">
            <div className="flex flex-col gap-5 text-sm font-medium text-white">
              <a href="#about" onClick={() => setMenuOpen(false)}>
                About
              </a>
              <a href="#how" onClick={() => setMenuOpen(false)}>
                How it works
              </a>
              <a href="#impact" onClick={() => setMenuOpen(false)}>
                Our impact
              </a>
              <a href="#get-started" onClick={() => setMenuOpen(false)}>
                Get started
              </a>
            </div>
          </div>
        )}

        {/* HERO CONTENT */}
        <section className="relative z-10 mx-auto grid max-w-[1450px] items-center gap-16 px-6 pb-28 pt-16 md:px-12 lg:grid-cols-[1fr_0.95fr] lg:px-16 lg:pb-36 lg:pt-24">
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mb-9 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2.5 text-xs font-semibold text-[#D6E9D9] backdrop-blur-md"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#B9E77C] opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#B9E77C]" />
              </span>
              A smarter way to improve our cities
              <Sparkles size={14} className="text-[#B9E77C]" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="max-w-[750px] text-[55px] font-semibold leading-[1.03] tracking-[-3px] sm:text-7xl lg:text-[88px]"
            >
              Your city.
              <br />
              Your voice.
              <br />
              <span className="text-[#B9E77C]">Real change.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-9 max-w-[510px] text-base leading-8 text-[#C2D6C8] md:text-lg"
            >
              From broken roads to overflowing garbage. Report civic issues,
              track real progress and hold your city accountable. Together, we
              make every corner better.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="mt-10 flex flex-wrap items-center gap-5"
            >
              <a
                href="#get-started"
                className="group flex items-center gap-4 rounded-full bg-[#B9E77C] px-7 py-4 font-bold text-[#173D2D] shadow-xl transition duration-300 hover:-translate-y-1 hover:bg-[#D1F29F]"
              >
                Make a difference
                <ArrowRight
                  size={18}
                  className="transition group-hover:translate-x-1"
                />
              </a>
              <a
                href="#how"
                className="flex items-center gap-2 text-sm font-semibold text-[#D1E1D4] transition hover:text-[#B9E77C]"
              >
                Discover how <ArrowDown size={16} />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-14 flex items-center gap-4"
            >
              <div className="flex -space-x-3">
                {[
                  { letter: "C", color: "#B9E77C" },
                  { letter: "P", color: "#80D0AE" },
                  { letter: "R", color: "#F1C36D" },
                  { letter: "A", color: "#8BC6E9" },
                ].map((person, index) => (
                  <div
                    key={person.letter}
                    className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-[#174331] text-xs font-extrabold text-[#173D2D]"
                    style={{
                      backgroundColor: person.color,
                      zIndex: 4 - index,
                    }}
                  >
                    {person.letter}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Powered by people
                </p>
                <p className="text-xs text-[#A9C5B1]">
                  Every report makes an impact.
                </p>
              </div>
            </motion.div>
          </div>

          {/* HERO MAP */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, x: 25 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative mx-auto w-full max-w-[610px]"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute -inset-8 rounded-[50px] bg-gradient-to-br from-[#B9E77C]/30 via-[#3D9970]/20 to-[#559ED8]/20 blur-2xl"
            />

            <div className="relative aspect-[0.92] overflow-hidden rounded-[35px] border border-white/15 bg-gradient-to-br from-[#D5E7CE] to-[#9FBFA5] p-4 shadow-2xl shadow-black/30 sm:p-7">
              <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#B9E77C] opacity-40 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[#5CA77C] opacity-40 blur-3xl" />

              <div className="relative h-full w-full overflow-hidden rounded-[25px] border border-white/60 bg-[#E7EFE3]">
                <svg
                  viewBox="0 0 500 540"
                  className="absolute inset-0 h-full w-full"
                  preserveAspectRatio="xMidYMid slice"
                >
                  <defs>
                    <pattern
                      id="grid"
                      width="35"
                      height="35"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M35 0H0V35"
                        fill="none"
                        stroke="#A8C4AA"
                        strokeWidth="1"
                      />
                    </pattern>
                  </defs>
                  <rect width="500" height="540" fill="#E5EFE0" />
                  <rect width="500" height="540" fill="url(#grid)" />
                  <path
                    d="M-20 150L120 200L210 110L310 175L520 80"
                    stroke="#FFFFFF"
                    strokeWidth="25"
                    fill="none"
                  />
                  <path
                    d="M-20 150L120 200L210 110L310 175L520 80"
                    stroke="#C3D4C2"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M50 -20L120 130L180 260L140 560"
                    stroke="#FFFFFF"
                    strokeWidth="19"
                    fill="none"
                  />
                  <path
                    d="M50 -20L120 130L180 260L140 560"
                    stroke="#C3D4C2"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M350 -20L280 120L330 240L270 380L400 560"
                    stroke="#FFFFFF"
                    strokeWidth="25"
                    fill="none"
                  />
                  <path
                    d="M350 -20L280 120L330 240L270 380L400 560"
                    stroke="#C3D4C2"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M-20 350L120 300L230 340L350 290L520 370"
                    stroke="#FFFFFF"
                    strokeWidth="20"
                    fill="none"
                  />
                  <path
                    d="M-20 350L120 300L230 340L350 290L520 370"
                    stroke="#C3D4C2"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M10 470L120 400L240 430L360 390L500 470"
                    stroke="#FFFFFF"
                    strokeWidth="12"
                    fill="none"
                  />
                  <path
                    d="M240 60C310 40 370 110 360 180C350 250 280 280 240 240C190 190 180 100 240 60Z"
                    fill="#C4DCC0"
                    opacity=".9"
                  />
                  <path
                    d="M30 250C80 200 110 230 130 280C140 320 100 370 50 350Z"
                    fill="#B8D5B6"
                  />
                  <circle
                    cx="320"
                    cy="315"
                    r="50"
                    fill="#B9D4B7"
                    opacity=".55"
                  />
                  <circle cx="320" cy="315" r="29" fill="#C9DEC6" />
                  <text
                    x="320"
                    y="321"
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill="#58795E"
                  >
                    CITY
                  </text>
                </svg>

                <div className="absolute left-4 top-4 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-lg backdrop-blur-md sm:left-5 sm:top-5">
                  <div className="flex items-center gap-2">
                    <Globe2 size={15} className="text-[#39835B]" />
                    <span className="text-xs font-extrabold tracking-wide text-[#173D2D]">
                      CIVIC ACTIVITY
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-[#849187]">
                    Explore issues around you
                  </p>
                </div>

                {/* Map markers */}
                {[
                  { x: "29%", y: "35%", color: "#E69A52" },
                  { x: "65%", y: "25%", color: "#399B70" },
                  { x: "70%", y: "66%", color: "#DCA84C" },
                  { x: "39%", y: "76%", color: "#E17D6C" },
                  { x: "49%", y: "48%", color: "#399B70" },
                ].map((marker, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.15 }}
                    className="absolute"
                    style={{ left: marker.x, top: marker.y }}
                  >
                    <motion.div
                      animate={{ y: [0, -12, 0], scale: [1, 1.12, 1] }}
                      transition={{
                        duration: 2.5 + index * 0.3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="relative flex h-9 w-9 items-center justify-center rounded-full border-[4px] border-white shadow-lg"
                      style={{ backgroundColor: marker.color }}
                    >
                      <MapPin size={15} color="white" />
                    </motion.div>
                  </motion.div>
                ))}

                <motion.div
                  animate={{ y: ["-20%", "120%"] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear",
                    repeatDelay: 2,
                  }}
                  className="absolute left-0 right-0 z-10 h-1 bg-gradient-to-r from-transparent via-[#399B70]/60 to-transparent shadow-[0_0_18px_rgba(57,155,112,0.6)]"
                />

                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute bottom-5 left-4 right-4 rounded-[20px] border border-white/80 bg-white/95 p-5 shadow-2xl backdrop-blur-xl sm:bottom-8 sm:left-8 sm:right-8"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-[#E5A34C]" />
                        <span className="text-[10px] font-bold uppercase tracking-[2px] text-[#A18A61]">
                          Live issue preview
                        </span>
                      </div>
                      <h3 className="mt-3 text-lg font-bold text-[#173D2D]">
                        Road damage reported
                      </h3>
                      <p className="mt-1 text-xs text-[#89958B]">
                        Location-based civic reporting
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#E7F2E7] p-3 text-[#39835B]">
                      <Navigation size={19} />
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-[#EDF0EA] pt-4">
                    <span className="text-xs text-[#8B978D]">
                      Transparent. Trackable. Accountable.
                    </span>
                    <ArrowUpRight size={17} className="text-[#39835B]" />
                  </div>
                </motion.div>
              </div>

              <motion.div
                animate={{ rotate: [0, 8, 0, -8, 0], y: [0, -8, 0] }}
                transition={{ duration: 7, repeat: Infinity }}
                className="absolute -right-2 top-[35%] hidden rounded-2xl border border-white/70 bg-white p-4 shadow-xl sm:block"
              >
                <ShieldCheck className="text-[#39835B]" size={25} />
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute -left-2 top-[62%] hidden items-center gap-2 rounded-xl border border-white/70 bg-white px-4 py-3 shadow-xl sm:flex"
              >
                <Users size={17} className="text-[#39835B]" />
                <span className="text-xs font-bold text-[#173D2D]">
                  Community first
                </span>
              </motion.div>
            </div>

            <p className="mt-5 text-center text-[10px] font-semibold tracking-[2px] text-[#A9C5B1]">
              ILLUSTRATIVE CITY MAP · LIVE MAP COMING SOON
            </p>
          </motion.div>
        </section>

        {/* TRUST STRIP */}
        <div className="relative z-10 border-t border-white/10 bg-[#0C3224]/70">
          <div className="mx-auto flex max-w-[1450px] flex-wrap items-center justify-center gap-x-12 gap-y-4 px-6 py-6 text-xs font-semibold text-[#B8D1BF] md:px-12 lg:justify-between lg:px-16">
            <span className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#B9E77C]" />
              Transparent reporting
            </span>
            <span className="flex items-center gap-2">
              <MapPin size={16} className="text-[#B9E77C]" />
              Location-based complaints
            </span>
            <span className="flex items-center gap-2">
              <Activity size={16} className="text-[#B9E77C]" />
              Trackable progress
            </span>
            <span className="flex items-center gap-2">
              <Users size={16} className="text-[#B9E77C]" />
              Citizen-powered change
            </span>
          </div>
        </div>
      </div>

      {/* ==================================================
          IMPACT STATISTICS
      ================================================== */}

      <section
        id="impact"
        className="relative isolate overflow-hidden bg-[#F7F8F1] px-6 py-24 md:px-12 lg:px-16"
      >
        <FloatingBackdrop />

        <div className="relative z-10 mx-auto max-w-[1450px]">
          <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[3px] text-[#48815D]">
                The bigger picture
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#173D2D] md:text-5xl">
                Change starts with action.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-[#829084]">
              Every report is an opportunity to make a neighbourhood safer,
              cleaner and better for everyone.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -9, scale: 1.02 }}
                  className="group relative overflow-hidden rounded-[25px] border border-[#E1E9DD] bg-white/90 p-7 shadow-sm backdrop-blur-sm transition hover:shadow-xl"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.25, 0.5, 0.25],
                    }}
                    transition={{ duration: 6 + index, repeat: Infinity }}
                    className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#B9E77C]"
                  />
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF3E7] text-[#43845D]">
                      <Icon size={22} />
                    </div>
                    <h2 className="mt-8 text-4xl font-bold tracking-tight text-[#173D2D] md:text-5xl">
                      {stat.value}
                    </h2>
                    <p className="mt-3 text-sm font-medium text-[#829084]">
                      {stat.label}
                    </p>
                    <div className="mt-6 h-1 w-12 rounded-full bg-[#B9E77C] transition-all group-hover:w-20" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          <p className="mt-5 text-right text-[10px] text-[#9AA69B]">
            Illustrative demo figures — replace with verified platform data.
          </p>
        </div>
      </section>

      {/* ==================================================
          ABOUT
      ================================================== */}

      <section
        id="about"
        className="relative isolate overflow-hidden bg-white px-6 py-28 md:px-12 lg:px-16"
      >
        <FloatingBackdrop />

        <div className="relative z-10 mx-auto max-w-[1450px]">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-end">
            <div>
              <p className="mb-5 text-xs font-bold uppercase tracking-[3px] text-[#48815D]">
                A better way forward
              </p>
              <h2 className="max-w-[650px] text-4xl font-semibold leading-tight tracking-[-1.5px] text-[#173D2D] md:text-6xl">
                Small reports.
                <br />
                <span className="text-[#64A77B]">
                  Big transformations.
                </span>
              </h2>
            </div>
            <p className="max-w-[490px] text-base leading-8 text-[#7D897F]">
              A city belongs to everyone. CivicPulse gives people a simple way
              to report everyday problems and gives authorities a transparent
              way to resolve them. No more complaints disappearing into the
              void.
            </p>
          </div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {issues.map((issue, index) => {
              const Icon = issue.icon;
              return (
                <motion.div
                  key={issue.name}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -9, scale: 1.02 }}
                  className="group relative overflow-hidden rounded-[26px] border border-[#E8EDE5] bg-[#FBFCF8]/95 p-7 backdrop-blur-sm transition hover:border-[#B8D4B6] hover:bg-white hover:shadow-2xl"
                >
                  <motion.div
                    animate={{ scale: [1, 1.35, 1], x: [0, -10, 0] }}
                    transition={{ duration: 7 + index, repeat: Infinity }}
                    className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-30 blur-2xl"
                    style={{ backgroundColor: issue.color }}
                  />
                  <div className="relative">
                    <div
                      className={`mb-12 flex h-14 w-14 items-center justify-center rounded-2xl ${issue.bg}`}
                    >
                      <Icon size={25} style={{ color: issue.color }} />
                    </div>
                    <h3 className="text-lg font-bold text-[#173D2D]">
                      {issue.name}
                    </h3>
                    <p className="mt-3 min-h-[48px] text-xs leading-6 text-[#879389]">
                      {issue.description}
                    </p>
                    <div className="mt-6 flex items-center justify-between border-t border-[#EAEFE7] pt-5">
                      <span className="text-xs font-semibold text-[#829084]">
                        Report an issue
                      </span>
                      <ArrowUpRight
                        size={18}
                        className="text-[#48815D] transition group-hover:-translate-y-1 group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================================================
          HOW IT WORKS
      ================================================== */}

      <section
        id="how"
        className="relative isolate overflow-hidden bg-[#103D2D] px-6 py-28 text-white md:px-12 lg:px-16"
      >
        <FloatingBackdrop dark />

        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_10%_15%,rgba(166,215,95,0.25),transparent_38%),radial-gradient(ellipse_at_85%_20%,rgba(40,168,121,0.3),transparent_40%),radial-gradient(ellipse_at_55%_100%,rgba(67,139,190,0.2),transparent_42%)]" />
        <div className="hero-grid pointer-events-none absolute inset-0 z-0 opacity-[0.15]" />

        <div className="relative z-10 mx-auto max-w-[1450px]">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[3px] text-[#B9E77C]">
              Simple by design
            </p>
            <h2 className="mt-5 text-4xl font-semibold tracking-tight md:text-6xl">
              From report to resolution.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#BDD3C3]">
              Four simple steps to create meaningful change in your
              neighbourhood.
            </p>
          </div>

          <div className="relative mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  whileHover={{ y: -10, scale: 1.025 }}
                  className="relative rounded-[25px] border border-white/10 bg-white/[0.09] p-7 shadow-xl backdrop-blur-md transition hover:border-white/30 hover:bg-white/[0.15]"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold tracking-widest text-[#B9E77C]">
                      / {step.number}
                    </p>
                    <motion.span
                      animate={{ y: [0, -7, 0], rotate: [0, 8, 0] }}
                      transition={{ duration: 4 + index, repeat: Infinity }}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{
                        backgroundColor: `${step.color}25`,
                        color: step.color,
                      }}
                    >
                      <Icon size={23} />
                    </motion.span>
                  </div>
                  <h3 className="mt-12 text-xl font-bold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-[#BDD3C3]">
                    {step.description}
                  </p>
                  <div
                    className="mt-8 h-1 w-12 rounded-full"
                    style={{ backgroundColor: step.color }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================================================
          GET STARTED
      ================================================== */}

      <section
        id="get-started"
        className="relative isolate overflow-hidden bg-[#F3F6EC] px-6 py-28 md:px-12 lg:px-16"
      >
        <FloatingBackdrop />

        <div className="relative z-10 mx-auto max-w-[1450px]">
          <div className="relative isolate overflow-hidden rounded-[35px] bg-gradient-to-br from-[#164C35] via-[#12603F] to-[#24784E] px-7 py-16 text-white shadow-2xl shadow-[#164C35]/20 md:px-16 md:py-20">
            <FloatingBackdrop dark />

            <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full border border-white/15" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/15" />

            <div className="relative z-10">
              <div className="mx-auto max-w-3xl text-center">
                <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[2px] text-[#D6EEB7]">
                  <Sparkles size={14} /> Be part of the change
                </div>
                <h2 className="mt-7 text-4xl font-semibold tracking-tight md:text-6xl">
                  Better cities start
                  <br />
                  with <span className="text-[#B9E77C]">all of us.</span>
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-[#C8DED0]">
                  Whether you're a citizen reporting an issue or an authority
                  working to solve one, there's a place for you here.
                </p>
              </div>

              <div className="mx-auto mt-14 grid max-w-3xl gap-5 md:grid-cols-2">
                <button
                  onClick={() => setSelectedRole("citizen")}
                  className="group rounded-[25px] border border-white/50 bg-[#F8FAF3] p-7 text-left text-[#173D2D] shadow-xl transition duration-300 hover:-translate-y-2 hover:bg-white"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-[2px] text-[#5C986D]">
                      01 / Citizen
                    </span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E5F1DF] text-[#43845D]">
                      <Users size={19} />
                    </span>
                  </div>
                  <h3 className="mt-8 text-2xl font-bold">
                    Report a problem
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#87938A]">
                    Make your voice heard. Help improve your city.
                  </p>
                  <div className="mt-8 flex items-center gap-2 text-sm font-bold text-[#347A4F]">
                    Continue as citizen
                    <ArrowRight
                      size={17}
                      className="transition group-hover:translate-x-1"
                    />
                  </div>
                </button>

                <button
                  onClick={() => setSelectedRole("moderator")}
                  className="group rounded-[25px] border border-white/20 bg-[#0C3929]/60 p-7 text-left text-white shadow-xl transition duration-300 hover:-translate-y-2 hover:bg-[#0A3225]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-[2px] text-[#B9E77C]">
                      02 / Authority
                    </span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#B9E77C]">
                      <ShieldCheck size={20} />
                    </span>
                  </div>
                  <h3 className="mt-8 text-2xl font-bold">BBMP portal</h3>
                  <p className="mt-3 text-sm leading-6 text-[#C3D3C6]">
                    Manage complaints. Drive meaningful action.
                  </p>
                  <div className="mt-8 flex items-center gap-2 text-sm font-bold text-[#B9E77C]">
                    Continue as moderator
                    <ArrowRight
                      size={17}
                      className="transition group-hover:translate-x-1"
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          ROLE MODAL
      ================================================== */}

      {selectedRole && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071E15]/75 p-5 backdrop-blur-md"
          onClick={() => setSelectedRole(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md rounded-[28px] border border-[#E5EDE2] bg-white p-8 text-[#173D2D] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={() => setSelectedRole(null)}
              className="absolute right-5 top-5 rounded-full bg-[#F0F4EF] p-2 transition hover:bg-[#E2EDE0]"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E9F3E6] text-[#43845D]">
              {selectedRole === "citizen" ? (
                <Globe2 size={26} />
              ) : (
                <ShieldCheck size={26} />
              )}
            </div>

            <h3 className="mt-6 text-2xl font-bold">
              {selectedRole === "citizen"
                ? "Citizen portal"
                : "BBMP moderator portal"}
            </h3>
            <p className="mt-3 text-sm leading-7 text-[#7B897E]">
              {selectedRole === "citizen"
                ? "Register or log in to report civic issues, track complaints and receive updates."
                : "Log in to manage complaints, assign departments and track resolutions."}
            </p>
            <button
              onClick={() => {
                window.location.href =
                  selectedRole === "citizen"
                    ? "/auth"
                    : "/auth?role=moderator";
              }}
              className="mt-7 w-full rounded-full bg-[#164C35] py-4 text-sm font-bold text-white transition hover:bg-[#24784E]"
            >
              Continue to portal
              <ArrowRight size={17} className="ml-2 inline" />
            </button>
          </motion.div>
        </div>
      )}

      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="relative isolate overflow-hidden bg-[#0B3022] px-6 py-12 text-white md:px-12 lg:px-16">
        <FloatingBackdrop dark />

        <div className="relative z-10 mx-auto flex max-w-[1450px] flex-col justify-between gap-8 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B9E77C] text-[#103D2D]">
                <Leaf size={23} strokeWidth={2.5} />
              </div>
              <p className="text-xl font-extrabold tracking-tight">
                Civic<span className="text-[#B9E77C]">Pulse</span>
              </p>
            </div>
            <p className="mt-4 text-xs text-[#A7C2AE]">
              Building better communities, one report at a time.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-xs font-medium text-[#B8D1BF]">
            <a href="#about" className="transition hover:text-[#B9E77C]">
              About
            </a>
            <a href="#how" className="transition hover:text-[#B9E77C]">
              How it works
            </a>
            <a href="#impact" className="transition hover:text-[#B9E77C]">
              Our impact
            </a>
          </div>

          <p className="text-xs text-[#8FA997]">
            © 2026 CivicPulse. A citizen-powered initiative.
          </p>
        </div>
      </footer>
    </main>
  );
}