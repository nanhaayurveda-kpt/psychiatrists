import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

const ROLE_TILES = {
  doctor: [
    { href: "/doctor", icon: "🩺", label: "Queue", desc: "Today's patients" },
    { href: "/doctor/patients", icon: "👥", label: "Patients", desc: "Search & history" },
    { href: "/doctor/reminders", icon: "🔔", label: "Reminders", desc: "Follow-up alerts" },
    { href: "/doctor/h1-register", icon: "📋", label: "H1 Register", desc: "Schedule H1 drugs" },
    { href: "/doctor/pharmacy", icon: "💊", label: "Pharmacy", desc: "Manage brands" },
    { href: "/doctor/settings", icon: "⚙️", label: "Settings", desc: "Clinic profile" },
    { href: "/receptionist", icon: "🏥", label: "Reception", desc: "Receptionist view" },
    { href: "/psychologist", icon: "🧠", label: "Psychologist", desc: "Assessment queue" },
    { href: "/pharmacy", icon: "🧴", label: "Pharmacy Queue", desc: "Dispense medicines" },
  ],
  receptionist: [
    { href: "/receptionist", icon: "🏥", label: "Reception", desc: "Register patients" },
  ],
  pharmacy: [
    { href: "/pharmacy", icon: "💊", label: "Queue", desc: "Dispense medicines" },
    { href: "/pharmacy/walkin", icon: "🚶", label: "Walk-in", desc: "Direct sale" },
    { href: "/pharmacy/brands", icon: "🏷️", label: "Brands", desc: "Manage brands" },
  ],
  psychologist: [
    { href: "/psychologist", icon: "🧠", label: "Patients", desc: "Assessment queue" },
  ],
};

const ROLE_COLORS = {
  doctor: "violet",
  receptionist: "emerald",
  pharmacy: "blue",
  psychologist: "purple",
};

const COLOR_CLASSES = {
  violet: {
    badge: "bg-violet-600",
    card: "hover:border-violet-300 hover:bg-violet-50 active:bg-violet-50",
    icon: "bg-violet-100 text-violet-700",
    label: "text-violet-900",
  },
  emerald: {
    badge: "bg-emerald-600",
    card: "hover:border-emerald-300 hover:bg-emerald-50 active:bg-emerald-50",
    icon: "bg-emerald-100 text-emerald-700",
    label: "text-emerald-900",
  },
  blue: {
    badge: "bg-blue-600",
    card: "hover:border-blue-300 hover:bg-blue-50 active:bg-blue-50",
    icon: "bg-blue-100 text-blue-700",
    label: "text-blue-900",
  },
  purple: {
    badge: "bg-purple-600",
    card: "hover:border-purple-300 hover:bg-purple-50 active:bg-purple-50",
    icon: "bg-purple-100 text-purple-700",
    label: "text-purple-900",
  },
};

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const role = session.role;
  const tiles = ROLE_TILES[role] || [];
  const color = ROLE_COLORS[role] || "violet";
  const c = COLOR_CLASSES[color];
  const displayName =
    session.name?.split(" ")[0] || role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="pt-4 pb-6">
      <div className="mb-6">
        <p className="text-gray-500 text-sm">Welcome back,</p>
        <h1 className="text-2xl font-bold text-gray-800">{displayName}</h1>
        <span className={`inline-block mt-1 text-xs font-semibold uppercase tracking-wide text-white ${c.badge} px-2.5 py-0.5 rounded-full`}>
          {role}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {tiles.map((tile) => (
          <a
            key={tile.href}
            href={tile.href}
            className={`bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-2 active:scale-95 transition ${c.card}`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl ${c.icon}`}>
              {tile.icon}
            </div>
            <div>
              <p className={`font-semibold text-sm ${c.label}`}>{tile.label}</p>
              <p className="text-xs text-gray-400">{tile.desc}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}