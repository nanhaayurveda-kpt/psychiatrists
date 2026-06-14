"use client";
import { CONDITIONS, getMedicineDefaults } from "@/lib/medicines";

const MEDICINE_TIMINGS = [
  "Morning",
  "Afternoon",
  "Evening",
  "Night",
  "HS",
  "SOS",
];
const DURATIONS = [
  "3 days",
  "5 days",
  "7 days",
  "10 days",
  "14 days",
  "1 month",
  "2 months",
  "3 months",
];
const FOOD_OPTIONS = ["After food", "Empty stomach", "With or without food"];

function doseOptionsFor(medName, MEDICINES_BY_TIER) {
  const base = (medName || "").toLowerCase().trim();
  for (const cond of CONDITIONS) {
    const { latest, common } = MEDICINES_BY_TIER[cond];
    const hit = [...latest, ...common].find(
      (m) => m.name.toLowerCase() === base,
    );
    if (hit)
      return (hit.dose || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
  }
  return [];
}

function brandKey(med) {
  if (!med.dose || !med.dose.trim()) return med.name;
  return `${med.name} ${med.dose}`.trim();
}

export default function RxTab({
  diagnosis,
  setDiagnosis,
  medicines,
  setMedicines,
  notes,
  setNotes,
  detailedHistory,
  setDetailedHistory,
  followupDate,
  setFollowupDate,
  saving,
  saved,
  onSave,
  onSendToPsy,
  saveAsTemplate,
  templates,
  brandsMap,
  frequentMeds,
  addedNames,
  pickedSalts,
  pickedCount,
  showPicker,
  setShowPicker,
  search,
  setSearch,
  selectedCondition,
  setSelectedCondition,
  tierTab,
  setTierTab,
  pickerList,
  interactions,
  togglePick,
  addAllPicked,
  addCustomMed,
  newSalt,
  setNewSalt,
  newBrand,
  setNewBrand,
  newSaltCat,
  setNewSaltCat,
  MEDICINES_BY_TIER,
}) {
  function addMedicine() {
    setMedicines((prev) => [
      ...prev,
      {
        name: "",
        dose: "",
        timing: [],
        duration: "7 days",
        food: "After food",
        brand: "",
      },
    ]);
  }

  function updateMedicine(index, field, value) {
    setMedicines((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    );
  }

  function applyBrandIfKnown(index) {
    setMedicines((prev) =>
      prev.map((m, i) => {
        if (i !== index) return m;
        if (m.brand && m.brand.trim()) return m;
        const mapped = brandsMap[brandKey(m)] || brandsMap[m.name];
        if (mapped && mapped.brand) return { ...m, brand: mapped.brand };
        return m;
      }),
    );
  }

  function toggleTiming(index, timing) {
    setMedicines((prev) =>
      prev.map((m, i) => {
        if (i !== index) return m;
        const exists = m.timing.includes(timing);
        return {
          ...m,
          timing: exists
            ? m.timing.filter((t) => t !== timing)
            : [...m.timing, timing],
        };
      }),
    );
  }

  function removeMedicine(index) {
    setMedicines((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length === 0
        ? [
            {
              name: "",
              dose: "",
              timing: [],
              duration: "7 days",
              food: "After food",
              brand: "",
            },
          ]
        : next;
    });
  }

  function quickFollowup(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setFollowupDate(d.toISOString().slice(0, 10));
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

      {/* Templates */}
      {Object.keys(templates).length > 0 && (
        <div className="bg-white rounded-2xl shadow p-4">
          <p className="font-semibold text-gray-700 mb-2">📋 Templates</p>
          <div className="flex flex-col gap-2">
            {Object.entries(templates).map(([diag, meds]) => (
              <div
                key={diag}
                className="flex justify-between items-center px-3 py-2 rounded-xl border border-gray-200 bg-gray-50"
              >
                <span className="text-sm font-semibold text-gray-700 flex-1">
                  {diag}
                </span>
                <span className="text-xs text-gray-400 mr-3">
                  {meds.length} medicines
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setDiagnosis(diag);
                    setMedicines(meds.map((m) => ({ ...m })));
                  }}
                  className="text-xs text-indigo-600 border border-indigo-300 rounded-lg px-2 py-1 hover:bg-indigo-50 mr-1"
                >
                  Load
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm(`Delete template "${diag}"?`)) return;
                    const updated = { ...templates };
                    delete updated[diag];
                    await fetch("/api/settings", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        templates: JSON.stringify(updated),
                      }),
                    });
                  }}
                  className="text-xs text-red-500 border border-red-300 rounded-lg px-2 py-1 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Add */}
      {Object.keys(frequentMeds).length > 0 && (
        <div className="bg-white rounded-2xl shadow p-4">
          <p className="font-semibold text-gray-700 mb-2">⚡ Quick Add</p>
          <p className="text-xs text-gray-400 mb-3">
            Your most used medicines — tap to add
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(frequentMeds)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10)
              .map(([name]) => {
                const already = addedNames.has(name.toLowerCase());
                const mapped = brandsMap[name] || {};
                return (
                  <button
                    key={name}
                    type="button"
                    disabled={already}
                    onClick={() => {
                      if (already) return;
                      const def = getMedicineDefaults(name) || {
                        timing: [],
                        food: "After food",
                        duration: "7 days",
                      };
                      setMedicines((prev) => {
                        const isEmpty =
                          prev.length === 1 &&
                          !prev[0].name &&
                          !prev[0].dose &&
                          prev[0].timing.length === 0;
                        const base = isEmpty ? [] : prev;
                        return [
                          ...base,
                          {
                            name,
                            dose: "",
                            timing: def.timing,
                            duration: def.duration,
                            food: def.food,
                            brand: mapped.brand || "",
                          },
                        ];
                      });
                    }}
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium transition ${already ? "bg-green-50 border-green-300 text-green-600 opacity-60 cursor-not-allowed" : "bg-violet-50 border-violet-300 text-violet-700 hover:bg-violet-100 active:scale-95"}`}
                  >
                    {already ? "✓ " : ""}
                    {name}
                    {mapped.brand ? ` · ${mapped.brand}` : ""}
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Medicine Picker */}
      <div className="bg-white rounded-2xl shadow p-4">
        <div className="flex justify-between items-center mb-3">
          <label className="font-semibold text-gray-700">Add Medicines</label>
          <button
            type="button"
            onClick={() => setShowPicker((p) => !p)}
            className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg font-semibold"
          >
            {showPicker ? "Hide" : "Show"}
          </button>
        </div>
        {showPicker && (
          <>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search salt name or class..."
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <div className="flex gap-1 mb-2">
              {[
                ["all", "All", "bg-gray-800"],
                ["latest", "🆕 Latest", "bg-amber-500"],
                ["common", "🔹 Common", "bg-indigo-600"],
              ].map(([key, label, bg]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTierTab(key)}
                  className={`flex-1 text-xs py-1.5 rounded-lg font-semibold border ${tierTab === key ? `${bg} text-white border-transparent` : "border-gray-300 text-gray-600"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex gap-1 overflow-x-auto mb-2 pb-1">
              {["All", ...CONDITIONS].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCondition(c)}
                  className={`text-xs px-3 py-1 rounded-full whitespace-nowrap border ${selectedCondition === c ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-300 text-gray-600"}`}
                >
                  {c}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 mb-2">
              Tick multiple salts → tap &quot;Add Selected&quot; once
            </p>
            {(() => {
              const grouped = {};
              for (const med of pickerList) {
                const cls = med.class || "Other";
                if (!grouped[cls]) grouped[cls] = [];
                grouped[cls].push(med);
              }
              return (
                <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
                  {Object.keys(grouped).length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">
                      No match.
                    </p>
                  )}
                  {Object.keys(grouped).map((cls) => (
                    <div key={cls}>
                      <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide mb-1 sticky top-0 bg-white py-1">
                        {cls}
                      </p>
                      <div className="grid grid-cols-1 gap-1.5">
                        {grouped[cls].map((med, idx) => {
                          const key = med.name.toLowerCase();
                          const picked = !!pickedSalts[key];
                          const already = addedNames.has(
                            med.name.toLowerCase(),
                          );
                          return (
                            <button
                              key={`${cls}-${med.name}-${idx}`}
                              type="button"
                              onClick={() => togglePick(med)}
                              disabled={already}
                              className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-left transition ${already ? "bg-emerald-50 border-emerald-300 opacity-70 cursor-not-allowed" : picked ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-200 bg-white"}`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className={`w-4 h-4 flex items-center justify-center rounded border text-[10px] shrink-0 ${already ? "bg-emerald-500 border-emerald-500 text-white" : picked ? "bg-white border-white text-indigo-600" : "border-gray-300"}`}
                                >
                                  {(picked || already) && "✓"}
                                </span>
                                <span className="text-sm font-semibold truncate">
                                  {med.name}
                                </span>
                                {med.tier === "latest" && (
                                  <span className="text-[9px] px-1 rounded bg-amber-400 text-white shrink-0">
                                    NEW
                                  </span>
                                )}
                              </div>
                              <span
                                className={`text-[10px] shrink-0 ${picked ? "text-indigo-100" : "text-gray-400"}`}
                              >
                                {med.condition}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
            {pickedCount > 0 && (
              <div className="sticky bottom-0 mt-3 -mx-4 -mb-4 px-4 py-3 bg-white border-t border-gray-200 flex gap-2">
                <button
                  type="button"
                  onClick={() => {}}
                  className="px-3 py-2 text-xs border border-gray-300 rounded-lg text-gray-600"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={addAllPicked}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold text-sm"
                >
                  Add {pickedCount} Selected →
                </button>
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-[11px] font-semibold text-gray-600 mb-1">
                Medicine not in list? Add it here:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSalt}
                  onChange={(e) => setNewSalt(e.target.value)}
                  placeholder="Salt name"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
                <input
                  type="text"
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  placeholder="Brand"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
                <select
                  value={newSaltCat}
                  onChange={(e) => setNewSaltCat(e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-2 text-xs focus:outline-none max-w-[120px]"
                >
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={addCustomMed}
                className="w-full mt-2 bg-emerald-600 text-white py-2 rounded-lg font-semibold text-sm"
              >
                + Add to library
              </button>
            </div>
          </>
        )}
      </div>

      {/* Drug interactions */}
      {interactions.length > 0 && (
        <div className="flex flex-col gap-2">
          {interactions.map((w, i) => (
            <div
              key={i}
              className={`rounded-2xl p-4 border-2 ${w.severity === "danger" ? "bg-red-50 border-red-300" : "bg-amber-50 border-amber-300"}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">
                  {w.severity === "danger" ? "⛔" : "⚠️"}
                </span>
                <span
                  className={`text-xs font-bold uppercase ${w.severity === "danger" ? "text-red-700" : "text-amber-700"}`}
                >
                  {w.severity === "danger"
                    ? "Dangerous Interaction"
                    : "Caution"}
                </span>
              </div>
              <p className="text-sm text-gray-700">
                <strong>{w.drugs.join(" + ")}</strong>
              </p>
              <p className="text-xs text-gray-600 mt-1">{w.message}</p>
            </div>
          ))}
          <p className="text-[10px] text-gray-400 px-1">
            Automated safety check — final decision is the doctor&apos;s
            responsibility.
          </p>
        </div>
      )}

      {/* Prescription List */}
      <div className="bg-white rounded-2xl shadow p-4">
        <div className="flex justify-between items-center mb-3">
          <label className="font-semibold text-gray-700">
            Prescription ({medicines.filter((m) => m.name).length})
          </label>
          <button
            onClick={addMedicine}
            className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg font-semibold"
          >
            + Manual
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {medicines.map((med, i) => {
            const doseOpts = doseOptionsFor(med.name, MEDICINES_BY_TIER);
            const known = !!(brandsMap[brandKey(med)] || brandsMap[med.name]);
            return (
              <div
                key={i}
                className="border border-gray-200 rounded-xl p-3 flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-400">
                    #{i + 1}
                  </span>
                  <button
                    onClick={() => removeMedicine(i)}
                    className="text-red-400 text-xs"
                  >
                    Remove
                  </button>
                </div>
                <input
                  type="text"
                  value={med.name}
                  onChange={(e) => updateMedicine(i, "name", e.target.value)}
                  placeholder="Salt name"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
                <div className="flex gap-2">
                  {doseOpts.length > 0 && med.dose !== "__custom__" ? (
                    <select
                      value={doseOpts.includes(med.dose) ? med.dose : ""}
                      onChange={(e) => {
                        updateMedicine(i, "dose", e.target.value);
                        setTimeout(() => applyBrandIfKnown(i), 0);
                      }}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                    >
                      <option value="">Select dose</option>
                      {doseOpts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                      <option value="__custom__">Custom...</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={med.dose === "__custom__" ? "" : med.dose}
                      onChange={(e) =>
                        updateMedicine(i, "dose", e.target.value)
                      }
                      placeholder="Dose (e.g. 10mg)"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                  )}
                </div>
                <div>
                  <label className="text-[10px] text-gray-400">
                    Brand{" "}
                    {known && <span className="text-emerald-500">• saved</span>}
                  </label>
                  <input
                    type="text"
                    value={med.brand || ""}
                    onChange={(e) => updateMedicine(i, "brand", e.target.value)}
                    placeholder="Enter your brand (e.g. Nexito)"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 mt-0.5"
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {MEDICINE_TIMINGS.map((t) => (
                    <button
                      key={t}
                      onClick={() => toggleTiming(i, t)}
                      className={`text-xs px-2 py-1 rounded-full border transition ${med.timing.includes(t) ? "bg-emerald-500 text-white border-emerald-500" : "border-gray-300 text-gray-600"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={med.food}
                    onChange={(e) => updateMedicine(i, "food", e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none"
                  >
                    {FOOD_OPTIONS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  <select
                    value={med.duration}
                    onChange={(e) =>
                      updateMedicine(i, "duration", e.target.value)
                    }
                    className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none"
                  >
                    {DURATIONS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Follow-up */}
      <div className="bg-white rounded-2xl shadow p-4">
        <label className="block font-semibold text-gray-700 mb-2">
          Follow-up Date
        </label>
        <input
          type="date"
          value={followupDate}
          onChange={(e) => setFollowupDate(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <div className="flex flex-wrap gap-1 mt-2">
          {[7, 14, 30, 60].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => quickFollowup(d)}
              className="text-xs border border-gray-300 rounded-full px-3 py-1 text-gray-600"
            >
              +{d}d
            </button>
          ))}
          <button
            type="button"
            onClick={() => setFollowupDate("")}
            className="text-xs border border-gray-300 rounded-full px-3 py-1 text-gray-600"
          >
            Clear
          </button>
        </div>
        {followupDate && (
          <p className="text-xs text-emerald-700 mt-2">
            Reminder will be sent on {followupDate}
          </p>
        )}
      </div>

      {/* Notes */}
      <div className="bg-white rounded-2xl shadow p-4">
        <label className="block font-semibold text-gray-700 mb-2">
          Doctor Notes / Advice
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Follow-up instructions, diet advice..."
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>
      {/* Detailed History */}
      <div className="bg-white rounded-2xl shadow p-4">
        <label className="block font-semibold text-gray-700 mb-2">
          Detailed History (required before Psychologist referral)
        </label>
        <textarea
          value={detailedHistory}
          onChange={(e) => setDetailedHistory(e.target.value)}
          placeholder="Family history, personal history, past psychiatric/medical history, substance use..."
          rows={4}
          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl p-3 text-center">
          ✓ Prescription saved — visible in pharmacy queue
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onSave(false)}
          disabled={saving}
          className="bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 disabled:opacity-60 transition"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={() => onSave(true)}
          disabled={saving}
          className="bg-gray-800 text-white py-3 rounded-xl font-semibold text-sm hover:bg-gray-900 disabled:opacity-60 transition"
        >
          Save & Print
        </button>
      </div>

      <button
        type="button"
        onClick={onSendToPsy}
        disabled={saving || !detailedHistory.trim()}
        className="w-full mt-2 bg-purple-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-purple-700 disabled:opacity-60 transition"
      >
        🧠 Send to Psychologist{" "}
        {!detailedHistory.trim() && "(record history first)"}
      </button>

      <button
        type="button"
        onClick={saveAsTemplate}
        className="w-full mt-2 border-2 border-dashed border-indigo-300 text-indigo-600 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-50 transition"
      >
        📋 Save these medicines as template for &quot;{diagnosis || "..."}&quot;
      </button>
    </>
  );
}
