"use client";
import { useState, useMemo, useEffect } from "react";
import { checkInteractions } from "@/lib/interactions";
import {
  MEDICINES_BY_TIER,
  CONDITIONS,
  getMedicineDefaults,
} from "@/lib/medicines";
import CaseHistoryTab from "./CaseHistoryTab";
import RxTab from "./RxTab";
import AssessmentTab from "./AssessmentTab";
import VisitHistoryTab from "./VisitHistoryTab";

function splitDoses(doseStr) {
  return (doseStr || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function brandKey(med) {
  if (!med.dose || !med.dose.trim()) return med.name;
  return `${med.name} ${med.dose}`.trim();
}

export default function PrescriptionForm({
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
  history,
  assessment,
  saving,
  saved,
  onSave,
  onSendToPsy,
}) {
  const [activeTab, setActiveTab] = useState("case");
  const [showPicker, setShowPicker] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [tierTab, setTierTab] = useState("all");
  const [pickedSalts, setPickedSalts] = useState({});
  const [brandsMap, setBrandsMap] = useState({});
  const [templates, setTemplates] = useState({});
  const [customMeds, setCustomMeds] = useState({});
  const [frequentMeds, setFrequentMeds] = useState({});
  const [newSalt, setNewSalt] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newSaltCat, setNewSaltCat] = useState(CONDITIONS[0]);

  useEffect(() => {
    fetch("/api/brands")
      .then((r) => (r.ok ? r.json() : { brands: {} }))
      .then((data) => setBrandsMap(data.brands || {}))
      .catch(() => setBrandsMap({}));
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        try {
          setTemplates(
            typeof data.templates === "string"
              ? JSON.parse(data.templates || "{}")
              : data.templates || {},
          );
        } catch {
          setTemplates({});
        }
        try {
          setCustomMeds(
            typeof data.custom_meds === "string"
              ? JSON.parse(data.custom_meds || "{}")
              : data.custom_meds || {},
          );
        } catch {
          setCustomMeds({});
        }
        try {
          setFrequentMeds(
            typeof data.frequent_meds === "string"
              ? JSON.parse(data.frequent_meds || "{}")
              : data.frequent_meds || {},
          );
        } catch {
          setFrequentMeds({});
        }
      })
      .catch(() => {
        setTemplates({});
        setCustomMeds({});
      });
  }, []);

  useEffect(() => {
    const d = (diagnosis || "").toLowerCase();
    const MAP = [
      ["bipolar", "Bipolar Disorder"],
      ["depression", "Depression"],
      ["schizophrenia", "Antipsychotics"],
      ["insomnia", "Insomnia"],
      ["migraine", "Migraine"],
      ["epilepsy", "Epilepsy"],
      ["ocd", "OCD"],
      ["adhd", "ADHD"],
      ["ptsd", "PTSD"],
      ["sexual", "Loss of Libido (Herbal)"],
      ["libido", "Loss of Libido (Herbal)"],
    ];
    const hit = MAP.find(([key]) => d.includes(key));
    if (hit) {
      setSelectedCondition(hit[1]);
      setShowPicker(true);
    }
    if (diagnosis && templates[diagnosis]) {
      const tpl = templates[diagnosis];
      if (Array.isArray(tpl) && tpl.length > 0) {
        setMedicines((prev) => {
          const isEmpty =
            prev.length === 0 ||
            (prev.length === 1 && !prev[0].name && !prev[0].dose);
          if (!isEmpty) return prev;
          return tpl.map((m) => ({ ...m }));
        });
      }
    }
  }, [diagnosis, templates]);

  function togglePick(med) {
    const key = med.name.toLowerCase();
    setPickedSalts((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = med;
      return next;
    });
  }

  function addAllPicked() {
    const toAdd = Object.values(pickedSalts);
    if (toAdd.length === 0) return;
    const newEntries = toAdd.map((m) => {
      const firstDose = splitDoses(m.dose)[0] || "";
      const def = getMedicineDefaults(m.name) || {
        timing: [],
        food: "After food",
        duration: "7 days",
      };
      const key = `${m.name} ${firstDose}`.trim();
      const mapped = brandsMap[key] || brandsMap[m.name] || {};
      return {
        name: m.name,
        dose: firstDose,
        timing: def.timing,
        duration: def.duration,
        food: def.food,
        brand: mapped.brand || "",
      };
    });
    setMedicines((prev) => {
      const isEmptyFirst =
        prev.length === 1 &&
        !prev[0].name &&
        !prev[0].dose &&
        prev[0].timing.length === 0;
      const base = isEmptyFirst ? [] : prev;
      const existing = new Set(base.map((m) => m.name.toLowerCase()));
      return [
        ...base,
        ...newEntries.filter((m) => !existing.has(m.name.toLowerCase())),
      ];
    });
    setPickedSalts({});
  }

  async function saveBrandMappings() {
    for (const m of medicines) {
      if (!m.name || !m.brand || !m.brand.trim()) continue;
      const key = brandKey(m);
      const existing = brandsMap[key] || brandsMap[m.name];
      if (!existing || existing.brand !== m.brand.trim()) {
        try {
          await fetch("/api/brands", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ salt: key, brand: m.brand.trim() }),
          });
        } catch {
          /* ignore */
        }
      }
    }
  }

  async function updateFrequentMeds() {
    const updated = { ...frequentMeds };
    for (const m of medicines) {
      if (!m.name) continue;
      updated[m.name] = (updated[m.name] || 0) + 1;
    }
    setFrequentMeds(updated);
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frequent_meds: JSON.stringify(updated) }),
      });
    } catch (e) {
      /* ignore */
    }
  }

  async function handleSave(andPrint) {
    await saveBrandMappings();
    await updateFrequentMeds();
    onSave(andPrint);
  }

  async function saveAsTemplate() {
    if (!diagnosis || !diagnosis.trim()) {
      alert("First select the diagnosis.");
      return;
    }
    const meds = medicines.filter((m) => m.name && m.name.trim());
    if (meds.length === 0) {
      alert("No medicines added yet.");
      return;
    }
    const updated = { ...templates, [diagnosis]: meds.map((m) => ({ ...m })) };
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templates: JSON.stringify(updated) }),
      });
      if (!res.ok) {
        alert("Template save failed");
        return;
      }
      setTemplates(updated);
      alert(`Template saved for "${diagnosis}"`);
    } catch {
      alert("Template save failed");
    }
  }

  async function addCustomMed() {
    const salt = newSalt.trim();
    if (!salt) {
      alert("Please enter medicine name.");
      return;
    }
    const updated = { ...customMeds };
    const list = Array.isArray(updated[newSaltCat])
      ? [...updated[newSaltCat]]
      : [];
    if (list.some((m) => m.name.toLowerCase() === salt.toLowerCase())) {
      alert("Already exists.");
      return;
    }
    list.push({ name: salt, dose: "", class: "Custom" });
    updated[newSaltCat] = list;
    if (newBrand.trim()) {
      try {
        await fetch("/api/brands", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ salt, brand: newBrand.trim() }),
        });
      } catch {
        /* ignore */
      }
    }
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ custom_meds: JSON.stringify(updated) }),
      });
      if (!res.ok) {
        alert("Save failed");
        return;
      }
      setCustomMeds(updated);
      setNewSalt("");
      setNewBrand("");
      setSelectedCondition(newSaltCat);
      setTierTab("all");
      setSearch("");
      alert(`"${salt}" added.`);
    } catch {
      alert("Save failed");
    }
  }

  const pickerList = useMemo(() => {
    const q = search.trim().toLowerCase();
    const conds =
      selectedCondition === "All" ? CONDITIONS : [selectedCondition];
    const arr = [];
    for (const cond of conds) {
      const { latest, common } = MEDICINES_BY_TIER[cond];
      if (tierTab === "all" || tierTab === "latest")
        for (const m of latest)
          arr.push({ ...m, condition: cond, tier: "latest" });
      if (tierTab === "all" || tierTab === "common")
        for (const m of common)
          arr.push({ ...m, condition: cond, tier: "common" });
      for (const m of customMeds[cond] || [])
        arr.push({
          ...m,
          condition: cond,
          tier: "common",
          brand: (brandsMap[m.name] || {}).brand || "",
        });
    }
    const dedup = {};
    for (const m of arr) {
      const k = `${m.name.toLowerCase()}|${m.condition}`;
      if (!dedup[k]) dedup[k] = m;
    }
    let list = Object.values(dedup);
    if (q)
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.class || "").toLowerCase().includes(q) ||
          (m.brand || "").toLowerCase().includes(q),
      );
    return list;
  }, [selectedCondition, search, tierTab, customMeds]);

  const addedNames = useMemo(() => {
    const s = new Set();
    for (const m of medicines) {
      if (m.name) s.add(m.name.toLowerCase());
    }
    return s;
  }, [medicines]);
  const pickedCount = Object.keys(pickedSalts).length;
  const interactions = useMemo(() => checkInteractions(medicines), [medicines]);

  const TABS = [
    ["case", "📝 Case History"],
    ["rx", "💊 Prescription"],
    ["assessment", "🧠 Assessment"],
    [
      "history",
      `📋 Visit History${history.length > 0 ? ` (${history.length})` : ""}`,
    ],
  ];

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 sticky top-0 z-10 overflow-x-auto">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`flex-1 py-2.5 px-1 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition ${activeTab === key ? "bg-white text-emerald-700 shadow" : "text-gray-500"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "case" && (
        <CaseHistoryTab
          diagnosis={diagnosis}
          setDiagnosis={setDiagnosis}
          detailedHistory={detailedHistory}
          setDetailedHistory={setDetailedHistory}
          saving={saving}
          onSendToPsy={onSendToPsy}
        />
      )}

      {activeTab === "rx" && (
        <RxTab
          diagnosis={diagnosis}
          medicines={medicines}
          setMedicines={setMedicines}
          notes={notes}
          setNotes={setNotes}
          followupDate={followupDate}
          setFollowupDate={setFollowupDate}
          saving={saving}
          saved={saved}
          onSave={handleSave}
          saveAsTemplate={saveAsTemplate}
          templates={templates}
          setTemplates={setTemplates}
          brandsMap={brandsMap}
          frequentMeds={frequentMeds}
          addedNames={addedNames}
          pickedSalts={pickedSalts}
          pickedCount={pickedCount}
          showPicker={showPicker}
          setShowPicker={setShowPicker}
          search={search}
          setSearch={setSearch}
          selectedCondition={selectedCondition}
          setSelectedCondition={setSelectedCondition}
          tierTab={tierTab}
          setTierTab={setTierTab}
          pickerList={pickerList}
          interactions={interactions}
          togglePick={togglePick}
          addAllPicked={addAllPicked}
          addCustomMed={addCustomMed}
          newSalt={newSalt}
          setNewSalt={setNewSalt}
          newBrand={newBrand}
          setNewBrand={setNewBrand}
          newSaltCat={newSaltCat}
          setNewSaltCat={setNewSaltCat}
          MEDICINES_BY_TIER={MEDICINES_BY_TIER}
        />
      )}

      {activeTab === "assessment" && <AssessmentTab assessment={assessment} />}

      {activeTab === "history" && (
        <VisitHistoryTab
          history={history}
          setMedicines={setMedicines}
          setActiveTab={setActiveTab}
        />
      )}
    </div>
  );
}
