"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = {
  doctor: [
    { href: "/doctor", label: "Queue", icon: "🩺" },
    { href: "/doctor/patients", label: "Patients", icon: "👥" },
    { href: "/doctor/reminders", label: "Reminders", icon: "🔔" },
    { href: "/doctor/settings", label: "Settings", icon: "⚙️" },
  ],
  receptionist: [{ href: "/receptionist", label: "Reception", icon: "🏥" }],
  pharmacy: [
    { href: "/pharmacy", label: "Queue", icon: "💊" },
    { href: "/pharmacy/walkin", label: "Walk-in", icon: "🚶" },
    { href: "/pharmacy/brands", label: "Brands", icon: "🏷️" },
  ],
  psychologist: [{ href: "/psychologist", label: "Patients", icon: "🧠" }],
};

const ROLE_BG = {
  doctor: "bg-violet-900",
  receptionist: "bg-emerald-800",
  pharmacy: "bg-blue-900",
  psychologist: "bg-purple-900",
};

const ROLE_ACTIVE_TEXT = {
  doctor: "text-violet-900",
  receptionist: "text-emerald-900",
  pharmacy: "text-blue-900",
  psychologist: "text-purple-900",
};

const ROLE_HOVER = {
  doctor: "hover:bg-violet-800",
  receptionist: "hover:bg-emerald-700",
  pharmacy: "hover:bg-blue-800",
  psychologist: "hover:bg-purple-800",
};

export default function TopBar({ role, name }) {
  const pathname = usePathname();
  const items = NAV[role] || [];
  const bg = ROLE_BG[role] || "bg-violet-900";
  const activeText = ROLE_ACTIVE_TEXT[role] || "text-violet-900";
  const hover = ROLE_HOVER[role] || "hover:bg-violet-800";

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${bg} shadow-md`}>
      <div className="max-w-2xl mx-auto flex items-center gap-1 px-3 py-2 overflow-x-auto scrollbar-none">

        {/* Home */}
        <Link
          href="/home"
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
            pathname === "/home"
              ? `bg-white ${activeText}`
              : `text-white/80 ${hover}`
          }`}
        >
          <span>🏠</span>
          <span>Home</span>
        </Link>

        {/* Help */}
        <Link
          href="/help"
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
            pathname === "/help"
              ? `bg-white ${activeText}`
              : `text-white/80 ${hover}`
          }`}
        >
          <span>❓</span>
          <span>Help</span>
        </Link>

        {/* Role links — PC only */}
        <div className="hidden md:flex items-center gap-1">
          {items.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" + role && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  active
                    ? `bg-white ${activeText}`
                    : `text-white/80 ${hover}`
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Name — PC only */}
        {name && (
          <span className="hidden md:block text-xs text-white/60 truncate max-w-[120px] mr-1">
            {name}
          </span>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`text-red-300 text-sm px-2 py-1.5 rounded-lg ${hover} whitespace-nowrap transition`}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}