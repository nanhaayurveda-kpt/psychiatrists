"use client";

const TEMPLATE = `Onset: 
Duration: 
Past Treatment: 
Family History: 
Current Episode: 
`;

export default function CaseHistoryTab({
  diagnosis,
  setDiagnosis,
  detailedHistory,
  setDetailedHistory,
  saving,
  saved,
  onSave,
  onSendToPsy,
}) {
  function insertTemplate() {
    setDetailedHistory(TEMPLATE);
  }

  return (
    <>
      {/* Diagnosis */}
      <div className="bg-white rounded-2xl shadow p-4">
        <label className="block font-semibold text-gray-700 mb-2">
          Diagnosis
        </label>
        <input
          type="text"
          list="diagnosis-list"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          placeholder="Type or pick — e.g. Depression, Anxiety..."
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <datalist id="diagnosis-list">
          {[
            "Insomnia",
            "Migraine",
            "Epilepsy",
            "Depression",
            "Anxiety",
            "Bipolar Disorder",
            "Schizophrenia",
            "OCD",
            "ADHD",
            "PTSD",
            "Substance Use Disorder",
            "Sexual Health",
          ].map((v) => (
            <option key={v} value={v} />
          ))}
        </datalist>
      </div>

      {/* Case History */}
      <div className="bg-white rounded-2xl shadow p-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block font-semibold text-gray-700">
            Case History
          </label>
          {!detailedHistory.trim() && (
            <button
              type="button"
              onClick={insertTemplate}
              className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg font-semibold"
            >
              📋 Use template structure
            </button>
          )}
        </div>
        <textarea
          value={detailedHistory}
          onChange={(e) => setDetailedHistory(e.target.value)}
          placeholder="Onset, duration, past treatment, family history, current episode..."
          rows={12}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <p className="text-[11px] text-gray-400 mt-2">
          Write freely — onset, duration of illness, past treatment history,
          family history, current episode details, etc.
        </p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl p-3 text-center">
          ✓ Saved
        </div>
      )}

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 disabled:opacity-60 transition"
      >
        {saving ? "Saving..." : "💾 Save"}
      </button>

      <button
        type="button"
        onClick={onSendToPsy}
        disabled={saving || !detailedHistory.trim()}
        className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-purple-700 disabled:opacity-60 transition"
      >
        🧠 Send to Psychologist{" "}
        {!detailedHistory.trim() && "(record history first)"}
      </button>
    </>
  );
}
