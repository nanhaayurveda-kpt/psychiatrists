"use client";

const MOOD_OPTIONS = ["Euthymic", "Depressed", "Elated", "Anxious", "Irritable", "Labile"];
const AFFECT_OPTIONS = ["Normal", "Blunted", "Flat", "Restricted", "Labile", "Inappropriate"];
const INSIGHT_OPTIONS = ["Grade I", "Grade II", "Grade III", "Grade IV", "Grade V", "Grade VI"];
const JUDGEMENT_OPTIONS = ["Intact", "Impaired", "Poor"];

function parseMeds(raw) {
  if (!raw) return [];
  try { const arr = JSON.parse(raw); return Array.isArray(arr) ? arr.filter((m) => m.name) : []; }
  catch { return []; }
}

export default function ExamHistoryTab({
  activeTab,
  complaints, setComplaints,
  mse, setMse,
  tests, setTests,
  history, setMedicines, setActiveTab,
}) {
  function updateMSE(field, value) {
    setMse((prev) => ({ ...prev, [field]: value }));
  }

  function repeatMedicines(pastMeds) {
    if (!pastMeds || pastMeds.length === 0) return;
    setMedicines(pastMeds.map((m) => ({ name: m.name || "", dose: m.dose || "", timing: Array.isArray(m.timing) ? m.timing : [], duration: m.duration || "1 month", food: m.food || "After food", brand: m.brand || "" })));
    setActiveTab("rx");
  }

  if (activeTab === "exam") return (
    <>
      <div className="bg-white rounded-2xl shadow p-4">
        <label className="block font-semibold text-gray-700 mb-2">Chief Complaints</label>
        <textarea value={complaints} onChange={(e) => setComplaints(e.target.value)}
          placeholder="Patient complaints..." rows={2}
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400" />
      </div>

      <div className="bg-white rounded-2xl shadow p-4">
        <label className="font-semibold text-gray-700">Mental Status Examination</label>
        <div className="flex flex-col gap-3 mt-2">
          <div>
            <label className="text-xs text-gray-500">Appearance &amp; Behaviour</label>
            <input type="text" value={mse.appearance} onChange={(e) => updateMSE("appearance", e.target.value)}
              placeholder="Well-kempt, cooperative..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400 mt-1" />
          </div>
          {[["Mood", "mood", MOOD_OPTIONS], ["Affect", "affect", AFFECT_OPTIONS]].map(([label, field, opts]) => (
            <div key={field}>
              <label className="text-xs text-gray-500">{label}</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {opts.map((o) => (
                  <button key={o} type="button" onClick={() => updateMSE(field, mse[field] === o ? "" : o)}
                    className={`text-xs px-2 py-1 rounded-full border ${mse[field] === o ? "bg-emerald-500 text-white border-emerald-500" : "border-gray-300 text-gray-600"}`}>{o}</button>
                ))}
              </div>
            </div>
          ))}
          {[["Thought", "thought", "Goal-directed, no delusions..."], ["Perception", "perception", "No hallucinations..."], ["Cognition", "cognition", "Oriented x3..."]].map(([label, field, ph]) => (
            <div key={field}>
              <label className="text-xs text-gray-500">{label}</label>
              <input type="text" value={mse[field]} onChange={(e) => updateMSE(field, e.target.value)}
                placeholder={ph} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400 mt-1" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2">
            {[["Insight", "insight", INSIGHT_OPTIONS], ["Judgement", "judgement", JUDGEMENT_OPTIONS]].map(([label, field, opts]) => (
              <div key={field}>
                <label className="text-xs text-gray-500">{label}</label>
                <select value={mse[field]} onChange={(e) => updateMSE(field, e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none mt-1">
                  <option value="">—</option>
                  {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-4">
        <label className="block font-semibold text-gray-700 mb-2">Tests / Investigations</label>
        <textarea value={tests} onChange={(e) => setTests(e.target.value)}
          placeholder="e.g. CBC, LFT, TSH..." rows={2}
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400" />
      </div>
    </>
  );

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <p className="font-semibold text-gray-700 mb-3">Previous Visits ({history.length})</p>
      {history.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-6">No previous visits</p>
      ) : (
        <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto">
          {history.map((v) => {
            const pastMeds = parseMeds(v.medicines);
            return (
              <div key={v.id} className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{v.visit_date?.slice(0, 10)}</p>
                    {v.diagnosis && <p className="text-xs text-gray-500">{v.diagnosis}</p>}
                  </div>
                </div>
                {v.complaints && <p className="text-xs text-gray-600 mb-1"><span className="font-semibold">Complaints:</span> {v.complaints}</p>}
                {pastMeds.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase mb-1">Medicines</p>
                    <ul className="text-xs text-gray-700 space-y-0.5">
                      {pastMeds.map((m, i) => (
                        <li key={i}>• {m.brand ? `${m.brand} (${m.name})` : m.name} {m.dose} — {(m.timing || []).join(", ")} ({m.duration})</li>
                      ))}
                    </ul>
                    <button type="button" onClick={() => repeatMedicines(pastMeds)}
                      className="mt-2 text-xs font-semibold text-indigo-600 border border-indigo-300 rounded-lg px-3 py-1 hover:bg-indigo-50">
                      🔄 Repeat these medicines
                    </button>
                  </div>
                )}
                {v.notes && <p className="text-xs text-gray-600 mt-2"><span className="font-semibold">Notes:</span> {v.notes}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}