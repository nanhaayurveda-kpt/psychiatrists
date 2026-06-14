"use client";
import { useState } from "react";

function parseMeds(raw) {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((m) => m.name) : [];
  } catch {
    return [];
  }
}

export default function VisitHistoryTab({ history, setMedicines, setActiveTab }) {
  const [openId, setOpenId] = useState(null);

  function repeatMedicines(pastMeds) {
    if (!pastMeds || pastMeds.length === 0) return;
    setMedicines(
      pastMeds.map((m) => ({
        name: m.name || "",
        dose: m.dose || "",
        timing: Array.isArray(m.timing) ? m.timing : [],
        duration: m.duration || "1 month",
        food: m.food || "After food",
        brand: m.brand || "",
      })),
    );
    setActiveTab("rx");
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <p className="font-semibold text-gray-700 mb-3">
        Previous Visits ({history.length})
      </p>
      {history.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-6">
          No previous visits
        </p>
      ) : (
        <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto">
          {history.map((v) => {
            const isOpen = openId === v.id;
            const pastMeds = parseMeds(v.medicines);
            return (
              <div
                key={v.id}
                className="border border-gray-200 rounded-xl bg-gray-50 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : v.id)}
                  className="w-full flex justify-between items-center px-3 py-2.5 text-left"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {v.visit_date?.slice(0, 10)}
                    </p>
                    {v.diagnosis && (
                      <p className="text-xs text-gray-500">{v.diagnosis}</p>
                    )}
                  </div>
                  <span className="text-gray-400 text-lg">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-3 pb-3 border-t border-gray-200 pt-2">
                    {v.complaints && (
                      <p className="text-xs text-gray-600 mb-1">
                        <span className="font-semibold">Complaints:</span>{" "}
                        {v.complaints}
                      </p>
                    )}
                    {v.detailed_history && (
                      <div className="mt-2">
                        <p className="text-[11px] font-semibold text-gray-500 uppercase mb-1">
                          Case History
                        </p>
                        <p className="text-xs text-gray-700 bg-white rounded-lg px-2 py-1.5 whitespace-pre-wrap">
                          {v.detailed_history}
                        </p>
                      </div>
                    )}
                    {pastMeds.length > 0 && (
                      <div className="mt-2">
                        <p className="text-[11px] font-semibold text-gray-500 uppercase mb-1">
                          Medicines
                        </p>
                        <ul className="text-xs text-gray-700 space-y-0.5">
                          {pastMeds.map((m, i) => (
                            <li key={i}>
                              • {m.brand ? `${m.brand} (${m.name})` : m.name}{" "}
                              {m.dose} — {(m.timing || []).join(", ")} (
                              {m.duration})
                            </li>
                          ))}
                        </ul>
                        <button
                          type="button"
                          onClick={() => repeatMedicines(pastMeds)}
                          className="mt-2 text-xs font-semibold text-indigo-600 border border-indigo-300 rounded-lg px-3 py-1 hover:bg-indigo-50"
                        >
                          🔄 Repeat these medicines
                        </button>
                      </div>
                    )}
                    {v.notes && (
                      <p className="text-xs text-gray-600 mt-2">
                        <span className="font-semibold">Notes:</span>{" "}
                        {v.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}