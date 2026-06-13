"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopBar({ role, name }) {
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-indigo-900 shadow-md">
      <div className="max-w-2xl mx-auto flex items-center gap-1 px-3 py-2">

        <Link
          href="/home"
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
            pathname === "/home" ? "bg-white text-indigo-900" : "text-indigo-200 hover:bg-indigo-800"
          }`}
        >
          <span>🏠</span>
          <span>Home</span>
        </Link>

        <Link
          href="/help"
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
            pathname === "/help" ? "bg-white text-indigo-900" : "text-indigo-200 hover:bg-indigo-800"
          }`}
        >
          <span>❓</span>
          <span>Help</span>
        </Link>

        <div className="flex-1" />

        <button
          onClick={handleLogout}
          className="text-red-300 text-sm px-2 py-1.5 rounded-lg hover:bg-indigo-800 whitespace-nowrap transition"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}