"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

function fmtDate(raw) {
  if (!raw) return "";
  const iso = raw.includes("T") ? raw : raw.replace(" ", "T");
  const d = new Date(iso.endsWith("Z") ? iso : iso + "Z");
  return d.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtDateTime(raw) {
  if (!raw) return "";
  const iso = raw.includes("T") ? raw : raw.replace(" ", "T");
  const d = new Date(iso.endsWith("Z") ? iso : iso + "Z");
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

const STATUS_LABEL = {
  waiting: { label: "Waiting", color: "bg-yellow-100 text-yellow-700" },
  doctor_done: { label: "Done", color: "bg-blue-100 text-blue-700" },
  dispensed: { label: "Dispensed", color: "bg-green-100 text-green-700" },
  lapsed: { label: "Lapsed", color: "bg-gray-100 text-gray-500" },
  psychologist: { label: "Psychology", color: "bg-purple-100 text-purple-700" },
};

export default function PatientSearchPage() {
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHx, setLoadingHx] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const q = query.trim();
    const isPhone = /^\d{10}$/.test(q);
    const isName = !isPhone && q.length >= 2;

    if (!isPhone && !isName) {
      setPatients([]);
      setSearchDone(false);
      return;
    }

    setSearching(true);
    setSearchDone(false);
    setSelected(null);
    setHistory([]);

    const param = isPhone ? `phone=${q}` : `name=${encodeURIComponent(q)}`;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/patients?${param}`);
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        const data = res.ok ? await res.json() : [];
        setPatients(Array.isArray(data) ? data : []);
      } catch {
        setPatients([]);
      } finally {
        setSearching(false);
        setSearchDone(true);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const loadHistory = useCallback(async (patient) => {
    setSelected(patient);
    setHistory([]);
    setLoadingHx(true);
    try {
      const res = await fetch(`/api/prescriptions?patient_id=${patient.id}`);
      if (!res.ok) return;
      const data = await res.json();
      const sorted = (Array.isArray(data) ? data : []).sort(
        (a, b) => new Date(b.visit_date) - new Date(a.visit_date),
      );
      setHistory(sorted);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHx(false);
    }
  }, []);

  function startEdit() {
    setEditName(selected.name);
    setEditPhone(selected.phone);
    setEditing(true);
  }

  async function saveEdit() {
    if (!editName.trim() || !/^\d{10}$/.test(editPhone)) {
      alert("Valid name and 10-digit phone required");
      return;
    }
    setSavingEdit(true);
    const res = await fetch(`/api/patients/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim(), phone: editPhone }),
    });
    setSavingEdit(false);
    if (!res.ok) {
      alert("Update failed");
      return;
    }
    const updated = await res.json();
    setSelected(updated);
    setEditing(false);
  }

  async function deletePatient() {
    if (
      !confirm(
        `Delete ${selected.name} and ALL their visit records? This cannot be undone.`,
      )
    )
      return;
    setDeleting(true);
    const res = await fetch(`/api/patients/${selected.id}`, {
      method: "DELETE",
    });
    setDeleting(false);
    if (!res.ok) {
      alert("Delete failed");
      return;
    }
    setSelected(null);
    setHistory([]);
    setPatients([]);
    setQuery("");
    setSearchDone(false);
  }
  function clear() {
    setQuery("");
    setPatients([]);
    setSelected(null);
    setHistory([]);
    setSearchDone(false);
  }

  return (
    <div className="pt-4 pb-6">
      {!selected && (
        <>
          <h1 className="text-xl font-bold text-violet-900 mb-4">
            Patient Search
          </h1>

          {/* Search box */}
          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
              🔍
            </span>
            <input
              type="text"
              inputMode="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name or 10-digit mobile number"
              className="w-full border border-gray-300 rounded-2xl pl-11 pr-10 py-3 text-base focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white shadow-sm"
              autoFocus
            />
            {query.length > 0 && (
              <button
                onClick={clear}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl leading-none"
              >
                ×
              </button>
            )}
          </div>

          {query.trim().length === 0 && (
            <p className="text-sm text-gray-400 text-center mt-8">
              Type at least 2 letters of name
              <br />
              or full 10-digit number
            </p>
          )}

          {searching && (
            <p className="text-sm text-gray-400 text-center mt-6">
              Searching...
            </p>
          )}

          {!searching && searchDone && patients.length === 0 && (
            <p className="text-sm text-gray-500 text-center mt-6">
              No patient found
            </p>
          )}

          {!selected && patients.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-gray-400 mb-1">
                {patients.length} patient{patients.length > 1 ? "s" : ""} found
                — tap to view history
              </p>
              {patients.map((p) => (
                <button
                  key={p.id}
                  onClick={() => loadHistory(p)}
                  className="bg-white rounded-2xl shadow px-4 py-3 flex items-center gap-3 text-left w-full hover:shadow-md active:scale-95 transition"
                >
                  <span className="bg-violet-100 text-violet-700 font-bold rounded-full w-10 h-10 flex items-center justify-center text-base shrink-0">
                    {p.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {p.name}
                    </p>
                    <p className="text-sm text-gray-500">{p.phone}</p>
                  </div>
                  <span className="ml-auto text-gray-300 text-xl">›</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Selected patient + history */}
      {selected && (
        <div>
          {/* Patient header */}
          <div className="bg-white rounded-2xl shadow p-4 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => {
                  setSelected(null);
                  setHistory([]);
                  setEditing(false);
                }}
                className="text-violet-700 text-sm font-semibold shrink-0"
              >
                ← Back
              </button>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="bg-violet-100 text-violet-700 font-bold rounded-full w-10 h-10 flex items-center justify-center text-base shrink-0">
                  {selected.name.charAt(0).toUpperCase()}
                </span>
                {!editing && (
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 truncate">
                      {selected.name}
                    </p>
                    <p className="text-sm text-gray-500">{selected.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {editing ? (
              <div className="flex flex-col gap-2 mt-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Patient name"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
                <input
                  type="tel"
                  inputMode="numeric"
                  value={editPhone}
                  onChange={(e) =>
                    setEditPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder="10-digit mobile"
                  maxLength={10}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={saveEdit}
                    disabled={savingEdit}
                    className="bg-violet-600 text-white py-2 rounded-xl font-semibold text-sm disabled:opacity-60"
                  >
                    {savingEdit ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="border border-gray-300 text-gray-600 py-2 rounded-xl font-semibold text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  onClick={startEdit}
                  className="text-xs font-semibold text-violet-700 border border-violet-300 rounded-lg px-3 py-1.5 hover:bg-violet-50"
                >
                  ✏️ Edit Patient
                </button>
                <button
                  onClick={deletePatient}
                  disabled={deleting}
                  className="text-xs font-semibold text-red-600 border border-red-300 rounded-lg px-3 py-1.5 hover:bg-red-50 disabled:opacity-60"
                >
                  {deleting ? "Deleting..." : "🗑️ Delete Patient"}
                </button>
              </div>
            )}
          </div>
          {loadingHx && (
            <p className="text-sm text-gray-400 text-center mt-6">
              Loading visit history...
            </p>
          )}

          {!loadingHx && history.length === 0 && (
            <p className="text-sm text-gray-500 text-center mt-6">
              No visits found
            </p>
          )}

          {!loadingHx && history.length > 0 && (
            <p className="text-xs text-gray-400 mb-3">
              {history.length} visit{history.length > 1 ? "s" : ""} total
            </p>
          )}

          {/* Timeline */}
          <div className="flex flex-col gap-0">
            {history.map((rx, idx) => {
              const st = STATUS_LABEL[rx.status] || {
                label: rx.status,
                color: "bg-gray-100 text-gray-500",
              };
              const isLast = idx === history.length - 1;

              return (
                <div key={rx.id} className="flex gap-3">
                  <div className="flex flex-col items-center shrink-0 w-6">
                    <span className="w-3 h-3 rounded-full bg-violet-500 mt-4 shrink-0 z-10" />
                    {!isLast && (
                      <span className="w-0.5 flex-1 bg-violet-200 mt-0.5" />
                    )}
                  </div>

                  <Link
                    href={`/doctor/${rx.id}`}
                    className="flex-1 bg-white rounded-2xl shadow p-4 mb-3 hover:shadow-md active:scale-95 transition block"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-bold text-gray-800">
                        {fmtDate(rx.visit_date)}
                      </p>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${st.color}`}
                      >
                        {st.label}
                      </span>
                    </div>

                    {rx.diagnosis && (
                      <p className="text-sm text-violet-700 font-semibold mb-1 truncate">
                        Dx: {rx.diagnosis}
                      </p>
                    )}

                    {rx.complaints && (
                      <p className="text-xs text-gray-500 truncate mb-1">
                        CC: {rx.complaints}
                      </p>
                    )}

                    {(() => {
                      try {
                        const meds = JSON.parse(rx.medicines || "[]");
                        if (Array.isArray(meds) && meds.length > 0) {
                          return (
                            <p className="text-xs text-gray-400 truncate">
                              💊{" "}
                              {meds
                                .map((m) => m.name)
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          );
                        }
                      } catch {
                        return null;
                      }
                      return null;
                    })()}

                    <p className="text-[11px] text-gray-300 mt-2">
                      Token #{rx.id} · {fmtDateTime(rx.visit_date)}
                    </p>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
