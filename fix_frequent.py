import re

# === 1. api/settings/route.js ===
with open('app/api/settings/route.js', 'r', encoding='utf-8') as f:
    s = f.read()
s = s.replace('"custom_meds",', '"custom_meds",\n    "frequent_meds",')
with open('app/api/settings/route.js', 'w', encoding='utf-8') as f:
    f.write(s)
print('app/api/settings/route.js: ✅ done')

# === 2. lib/schema.js ===
with open('lib/schema.js', 'r', encoding='utf-8') as f:
    sc = f.read()
sc = sc.replace(
    '  clinic_logo: text("clinic_logo").default(""),',
    '  frequent_meds: text("frequent_meds").default("{}"),\n  clinic_logo: text("clinic_logo").default(""),'
)
with open('lib/schema.js', 'w', encoding='utf-8') as f:
    f.write(sc)
print('lib/schema.js: ✅ done')

# === 3. PrescriptionForm.js ===
with open('app/doctor/[id]/PrescriptionForm.js', 'r', encoding='utf-8') as f:
    pf = f.read()

pf = pf.replace(
    '  const [customMeds, setCustomMeds] = useState({});',
    '  const [customMeds, setCustomMeds] = useState({});\n  const [frequentMeds, setFrequentMeds] = useState({});'
)

pf = pf.replace(
    '        } catch {\n          setCustomMeds({});\n        }',
    '''        } catch {
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
        }'''
)

pf = pf.replace(
    '  async function handleSave(andPrint) {\n    await saveBrandMappings();\n    onSave(andPrint);\n  }',
    '''  async function updateFrequentMeds() {
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
    } catch: pass

  async function handleSave(andPrint) {
    await saveBrandMappings();
    await updateFrequentMeds();
    onSave(andPrint);
  }'''
)

pf = pf.replace(
    '          {/* Medicine Picker */}\n          <div className="bg-white rounded-2xl shadow p-4">\n            <div className="flex justify-between items-center mb-3">\n              <label className="font-semibold text-gray-700">\n                Add Medicines\n              </label>',
    '''          {/* Frequent Medicines */}
          {Object.keys(frequentMeds).length > 0 && (
            <div className="bg-white rounded-2xl shadow p-4">
              <p className="font-semibold text-gray-700 mb-2">⚡ Quick Add</p>
              <p className="text-xs text-gray-400 mb-3">Your most used medicines — tap to add</p>
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
                          const def = getMedicineDefaults(name) || { timing: [], food: "After food", duration: "7 days" };
                          setMedicines((prev) => {
                            const isEmpty = prev.length === 1 && !prev[0].name && !prev[0].dose && prev[0].timing.length === 0;
                            const base = isEmpty ? [] : prev;
                            return [...base, { name, dose: "", timing: def.timing, duration: def.duration, food: def.food, brand: mapped.brand || "" }];
                          });
                        }}
                        className={`text-xs px-3 py-1.5 rounded-full border font-medium transition ${
                          already
                            ? "bg-green-50 border-green-300 text-green-600 opacity-60 cursor-not-allowed"
                            : "bg-violet-50 border-violet-300 text-violet-700 hover:bg-violet-100 active:scale-95"
                        }`}
                      >
                        {already ? "✓ " : ""}{name}{mapped.brand ? ` · ${mapped.brand}` : ""}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Medicine Picker */}
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="flex justify-between items-center mb-3">
              <label className="font-semibold text-gray-700">
                Add Medicines
              </label>'''
)

with open('app/doctor/[id]/PrescriptionForm.js', 'w', encoding='utf-8') as f:
    f.write(pf)

print('app/doctor/[id]/PrescriptionForm.js: ✅ done')