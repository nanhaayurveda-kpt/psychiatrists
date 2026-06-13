"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function H1RegisterPage() {
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  async function fetchEntries() {
    setLoading(true);
    const q = new URLSearchParams();
    if (from) q.set("from", from);
    if (to) q.set("to", to);
    const res = await fetch(`/api/h1-register?${q.toString()}`);
    if (!res.ok) {
      if (res.status === 401) { window.location.href = "/login"; return; }
      setLoading(false);
      return;
    }
    const data = await res.json();
    setEntries(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { fetchEntries(); }, []);

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>

      <div className="no-print pt-4 pb-6">
        <button
          onClick={() => router.back()}
          className="text-violet-700 text-sm mb-3"
        >
          ← Back
        </button>

        <h1 className="text-xl font-bold text-violet-900 mb-1">
          Schedule H1 Register
        </h1>
        <p className="text-xs text-gray-500 mb-4">
          Controlled / habit-forming drugs — auto-generated from prescriptions.
        </p>

        {/* Filter card */}
        <div className="bg-white rounded-2xl shadow p-4 mb-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">From</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">To</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchEntries}
              className="flex-1 bg-violet-700 text-white py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition"
            >
              Apply Filter
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 bg-gray-800 text-white py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition"
            >
              🖨️ Print
            </button>
          </div>
        </div>

        {loading && (
          <p className="text-center text-gray-400 mt-10">Loading...</p>
        )}

        {!loading && entries.length === 0 && (
          <p className="text-center text-gray-400 mt-10">
            No H1 entries in this period.
          </p>
        )}

        {!loading && entries.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-4 overflow-x-auto">
            <p className="text-xs text-gray-500 mb-3">{entries.length} entries</p>
            <table className="w-full text-xs border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b-2 border-gray-200 text-left text-gray-500">
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Patient</th>
                  <th className="py-2 pr-3">Phone</th>
                  <th className="py-2 pr-3">Drug</th>
                  <th className="py-2 pr-3">Dose</th>
                  <th className="py-2 pr-3">Duration</th>
                  <th className="py-2">Rx#</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-violet-50">
                    <td className="py-2 pr-3">{e.date}</td>
                    <td className="py-2 pr-3 font-medium text-gray-800">{e.patient_name}</td>
                    <td className="py-2 pr-3 text-gray-500">{e.patient_phone}</td>
                    <td className="py-2 pr-3 text-violet-700 font-medium">{e.drug_name}</td>
                    <td className="py-2 pr-3">{e.dose}</td>
                    <td className="py-2 pr-3">{e.duration}</td>
                    <td className="py-2 text-gray-400">#{e.prescription_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Print view */}
      <div className="hidden print:block p-8">
        <h2 className="text-2xl font-bold mb-1">Schedule H1 Register</h2>
        <p className="text-sm text-gray-600 mb-4">
          Period: {from || "—"} to {to || "—"} · {entries.length} entries
        </p>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="text-left py-2">Date</th>
              <th className="text-left py-2">Patient</th>
              <th className="text-left py-2">Phone</th>
              <th className="text-left py-2">Drug</th>
              <th className="text-left py-2">Dose</th>
              <th className="text-left py-2">Duration</th>
              <th className="text-left py-2">Rx#</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={i} className="border-b border-gray-300">
                <td className="py-1">{e.date}</td>
                <td className="py-1">{e.patient_name}</td>
                <td className="py-1">{e.patient_phone}</td>
                <td className="py-1">{e.drug_name}</td>
                <td className="py-1">{e.dose}</td>
                <td className="py-1">{e.duration}</td>
                <td className="py-1">#{e.prescription_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}