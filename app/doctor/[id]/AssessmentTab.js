"use client";
import { SCALES } from "@/lib/scales";

const COLOR = {
  emerald: "bg-emerald-500",
  lime: "bg-lime-500",
  amber: "bg-amber-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
  indigo: "bg-indigo-500",
  gray: "bg-gray-400",
};

export default function AssessmentTab({ assessment }) {
  if (!assessment) {
    return (
      <div className="bg-white rounded-2xl shadow p-4">
        <p className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
          🧠 Psychologist Assessment
        </p>
        <p className="text-gray-400 text-sm text-center py-6">
          No assessment yet. Send the patient to Psychologist from the Case
          History tab to get severity and test results here.
        </p>
      </div>
    );
  }

  let scales = {};
  try {
    scales = JSON.parse(assessment.scales || "{}");
  } catch {
    scales = {};
  }
  const scaleEntries = SCALES.filter((s) => scales[s.id]?.result);

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <p className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
        🧠 Psychologist Assessment
      </p>
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 w-24 flex-shrink-0">Mood</span>
          <div className="flex items-center gap-2 flex-1">
            <div className="flex-1 bg-purple-100 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${(assessment.mood / 10) * 100}%` }}
              />
            </div>
            <span className="font-bold text-purple-700">
              {assessment.mood}/10
            </span>
          </div>
        </div>

        {assessment.history && (
          <div>
            <span className="text-gray-500 text-xs">History</span>
            <p className="text-gray-800 mt-0.5 bg-gray-50 rounded-xl px-3 py-2 text-xs">
              {assessment.history}
            </p>
          </div>
        )}

        {assessment.symptoms && (
          <div>
            <span className="text-gray-500 text-xs">Symptoms</span>
            <p className="text-gray-800 mt-0.5 bg-gray-50 rounded-xl px-3 py-2 text-xs">
              {assessment.symptoms}
            </p>
          </div>
        )}

        {assessment.notes && (
          <div>
            <span className="text-gray-500 text-xs">Notes</span>
            <p className="text-gray-800 mt-0.5 bg-gray-50 rounded-xl px-3 py-2 text-xs">
              {assessment.notes}
            </p>
          </div>
        )}

        {scaleEntries.length > 0 && (
          <div className="mt-1">
            <span className="text-gray-500 text-xs">Rating Scales</span>
            <div className="flex flex-col gap-1.5 mt-1">
              {scaleEntries.map((s) => {
                const r = scales[s.id].result;
                return (
                  <div key={s.id} className="bg-gray-50 rounded-xl px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-700">
                        {s.name}
                      </span>
                      <span
                        className={`text-[11px] font-bold text-white px-2 py-0.5 rounded-full ${COLOR[r.color] || COLOR.gray}`}
                      >
                        {r.total}/{r.max} · {r.label}
                      </span>
                    </div>
                    {r.detail && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {r.detail.map((d, di) => (
                          <span key={di} className="text-[10px] text-gray-500">
                            {d.name}: <strong>{d.score}</strong> ({d.label})
                          </span>
                        ))}
                      </div>
                    )}
                    {r.alert && (
                      <p className="text-[10px] text-red-600 font-semibold mt-1">
                        ⚠ {r.alert}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}