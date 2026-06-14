"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFirst = searchParams.get("first") === "1";

  const [clinic, setClinic] = useState(null);
  const [clinicName, setClinicName] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [qualification, setQualification] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [clinicPhone, setClinicPhone] = useState("");

  const [phoneR, setPhoneR] = useState("");
  const [phoneP, setPhoneP] = useState("");
  const [phonePsy, setPhonePsy] = useState("");
  const [pinR, setPinR] = useState("");
  const [pinP, setPinP] = useState("");
  const [pinPsy, setPinPsy] = useState("");
  const [emailR, setEmailR] = useState("");
  const [emailP, setEmailP] = useState("");
  const [emailPsy, setEmailPsy] = useState("");
  const [showPinR, setShowPinR] = useState(false);
  const [showPinP, setShowPinP] = useState(false);
  const [showPinPsy, setShowPinPsy] = useState(false);

  const [hasPsychologist, setHasPsychologist] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logo, setLogo] = useState("");
  const [regNo, setRegNo] = useState("");
  const [signature, setSignature] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/login";
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setClinic(data);
        setClinicName(data.name || "");
        setDoctorName(data.doctor_name || "");
        setQualification(data.qualification || "");
        setClinicAddress(data.clinic_address || "");
        setClinicPhone(data.clinic_phone || "");
        setPhoneR(data.phone_receptionist || "");
        setPhoneP(data.phone_pharmacy || "");
        setPhonePsy(data.phone_psychologist || "");
        setPinR(data.pin_receptionist || "");
        setPinP(data.pin_pharmacy || "");
        setPinPsy(data.pin_psychologist || "");
        setEmailR(data.email_receptionist || "");
        setEmailP(data.email_pharmacy || "");
        setEmailPsy(data.email_psychologist || "");
        setHasPsychologist(!!data.has_psychologist);
        setLogo(data.clinic_logo || "");
        setRegNo(data.reg_no || "");
        setSignature(data.signature || "");
      });
  }, []);

  function handlePhoneChange(value, setPhone, pin, setPin) {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    setPhone(digits);
    if ((!pin || pin.length === 0) && digits.length >= 6) {
      setPin(digits.slice(-6));
    }
  }

  function handleLogoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 200 * 1024) {
      alert("Logo must be under 200KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setLogo(ev.target.result);
    reader.readAsDataURL(file);
  }

  function handleSignatureChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 200 * 1024) {
      alert("Signature must be under 200KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setSignature(ev.target.result);
    reader.readAsDataURL(file);
  }

  function removeStaff(role) {
    if (!confirm("Remove this staff? Mobile and PIN will both be cleared."))
      return;
    if (role === "receptionist") {
      setPhoneR("");
      setPinR("");
      setEmailR("");
    }
    if (role === "pharmacy") {
      setPhoneP("");
      setPinP("");
      setEmailP("");
    }
    if (role === "psychologist") {
      setPhonePsy("");
      setPinPsy("");
      setEmailPsy("");
    }
  }

  async function handleSave() {
    if (phoneR && phoneR.length !== 10) {
      alert("Receptionist mobile must be 10 digits");
      return;
    }
    if (phoneP && phoneP.length !== 10) {
      alert("Pharmacy mobile must be 10 digits");
      return;
    }
    if (phoneR && pinR.length !== 6) {
      alert("Receptionist PIN must be 6 digits");
      return;
    }
    if (phoneP && pinP.length !== 6) {
      alert("Pharmacy PIN must be 6 digits");
      return;
    }
    if (hasPsychologist) {
      if (phonePsy && phonePsy.length !== 10) {
        alert("Psychologist mobile must be 10 digits");
        return;
      }
      if (phonePsy && pinPsy.length !== 6) {
        alert("Psychologist PIN must be 6 digits");
        return;
      }
    }

    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: clinicName,
        doctor_name: doctorName,
        qualification,
        clinic_address: clinicAddress,
        clinic_phone: clinicPhone,
        phone_receptionist: phoneR,
        phone_pharmacy: phoneP,
        phone_psychologist: phonePsy,
        pin_receptionist: phoneR ? pinR : "",
        pin_pharmacy: phoneP ? pinP : "",
        pin_psychologist: phonePsy ? pinPsy : "",
        email_receptionist: emailR,
        email_pharmacy: emailP,
        email_psychologist: emailPsy,
        has_psychologist: hasPsychologist,
        clinic_logo: logo,
        reg_no: regNo,
        signature,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      alert("Save failed. Try again.");
      return;
    }
    if (isFirst) {
      window.location.href = "/doctor";
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!clinic)
    return <p className="text-center mt-20 text-gray-400">Loading...</p>;

  const inputCls =
    "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 mt-1";

  return (
    <div className="pt-4 pb-8">
      <h1 className="text-xl font-bold text-violet-900 mb-5">
        {isFirst ? "Setup Your Clinic" : "Settings"}
      </h1>

      {/* Clinic Logo */}
      <div className="bg-white rounded-2xl shadow p-4 mb-4">
        <p className="font-semibold text-gray-700 mb-3">Clinic Logo</p>
        {logo ? (
          <div className="flex flex-col items-center gap-3">
            <img
              src={logo}
              alt="Clinic logo"
              className="h-20 object-contain rounded-lg border border-gray-200"
            />
            <button
              type="button"
              onClick={() => setLogo("")}
              className="text-xs text-red-400"
            >
              Remove logo
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl py-6 cursor-pointer hover:border-violet-400 transition">
            <span className="text-2xl mb-1">🖼️</span>
            <span className="text-sm text-gray-500">Tap to upload logo</span>
            <span className="text-xs text-gray-400 mt-1">
              Max 200KB · PNG/JPG
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </label>
        )}
      </div>

      {/* Doctor Signature */}
      <div className="bg-white rounded-2xl shadow p-4 mb-4">
        <p className="font-semibold text-gray-700 mb-3">Doctor Signature</p>
        {signature ? (
          <div className="flex flex-col items-center gap-3">
            <img
              src={signature}
              alt="Signature"
              className="h-20 object-contain rounded-lg border border-gray-200"
            />
            <button
              type="button"
              onClick={() => setSignature("")}
              className="text-xs text-red-400"
            >
              Remove signature
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl py-6 cursor-pointer hover:border-violet-400 transition">
            <span className="text-2xl mb-1">✍️</span>
            <span className="text-sm text-gray-500">
              Tap to upload signature
            </span>
            <span className="text-xs text-gray-400 mt-1">
              Max 200KB · PNG/JPG
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSignatureChange}
            />
          </label>
        )}
      </div>

      {/* Doctor / Clinic Info */}
      <div className="bg-white rounded-2xl shadow p-4 mb-4 flex flex-col gap-3">
        <p className="font-semibold text-gray-700">Doctor / Clinic Info</p>
        {[
          {
            label: "Clinic Name",
            value: clinicName,
            set: setClinicName,
            placeholder: "",
          },
          {
            label: "Doctor Name",
            value: doctorName,
            set: setDoctorName,
            placeholder: "Dr. Firstname Lastname",
          },
          {
            label: "Qualification",
            value: qualification,
            set: setQualification,
            placeholder: "MBBS, MD (Psychiatry)",
          },
          {
            label: "Registration Number",
            value: regNo,
            set: setRegNo,
            placeholder: "Medical Council Reg. No.",
          },
          {
            label: "Clinic Phone",
            value: clinicPhone,
            set: setClinicPhone,
            placeholder: "Clinic contact number",
            type: "tel",
          },
        ].map(({ label, value, set, placeholder, type }) => (
          <div key={label}>
            <label className="text-xs text-gray-500">{label}</label>
            <input
              type={type || "text"}
              value={value}
              onChange={(e) => set(e.target.value)}
              placeholder={placeholder}
              className={inputCls}
            />
          </div>
        ))}
        <div>
          <label className="text-xs text-gray-500">Clinic Address</label>
          <textarea
            value={clinicAddress}
            onChange={(e) => setClinicAddress(e.target.value)}
            rows={2}
            placeholder="Full address"
            className={`${inputCls} resize-none`}
          />
        </div>
      </div>

      {/* Staff Login */}
      <div className="bg-white rounded-2xl shadow p-4 mb-4 flex flex-col gap-4">
        <p className="font-semibold text-gray-700">Staff Login</p>
        <p className="text-xs text-gray-400 -mt-2">
          Enter mobile number — PIN auto-fills as last 6 digits.
        </p>
        {/* Receptionist + Pharmacy */}
        {[
          {
            role: "receptionist",
            label: "Receptionist",
            phone: phoneR,
            setPhone: setPhoneR,
            pin: pinR,
            setPin: setPinR,
            email: emailR,
            setEmail: setEmailR,
            showPin: showPinR,
            setShowPin: setShowPinR,
          },
          {
            role: "pharmacy",
            label: "Pharmacy",
            phone: phoneP,
            setPhone: setPhoneP,
            pin: pinP,
            setPin: setPinP,
            email: emailP,
            setEmail: setEmailP,
            showPin: showPinP,
            setShowPin: setShowPinP,
          },
        ].map(
          ({
            role,
            label,
            phone,
            setPhone,
            pin,
            setPin,
            email,
            setEmail,
            showPin,
            setShowPin,
          }) => (
            <div key={role} className="border border-gray-100 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">{label}</p>
                {phone && (
                  <button
                    type="button"
                    onClick={() => removeStaff(role)}
                    className="text-xs font-semibold text-white bg-red-500 px-3 py-1 rounded-lg"
                  >
                    Remove
                  </button>
                )}
              </div>
              <label className="text-xs text-gray-500">Mobile Number</label>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                maxLength={10}
                placeholder="10-digit mobile"
                onChange={(e) =>
                  handlePhoneChange(e.target.value, setPhone, pin, setPin)
                }
                className={`${inputCls} mb-2`}
              />
              <label className="text-xs text-gray-500">PIN (6 digits)</label>
              <div className="flex gap-2 mt-1 mb-2">
                <input
                  type={showPin ? "text" : "password"}
                  value={pin}
                  maxLength={6}
                  inputMode="numeric"
                  onChange={(e) =>
                    setPin(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPin((p) => !p)}
                  className="text-lg px-3 border border-gray-200 rounded-xl text-gray-500"
                >
                  {showPin ? "🙈" : "👁️"}
                </button>
              </div>
              <label className="text-xs text-gray-500">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={`${role}@email.com`}
                className={inputCls}
              />
            </div>
          ),
        )}

        {/* Psychologist toggle */}
        <div className="border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Psychologist</p>
              <p className="text-xs text-gray-400">
                Enable if clinic has a psychologist
              </p>
            </div>
            <button
              type="button"
              onClick={() => setHasPsychologist((p) => !p)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hasPsychologist ? "bg-violet-600" : "bg-gray-200"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${hasPsychologist ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>

          {hasPsychologist && (
            <div className="border border-gray-100 rounded-xl p-3 mt-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">
                  Psychologist Login
                </p>
                {phonePsy && (
                  <button
                    type="button"
                    onClick={() => removeStaff("psychologist")}
                    className="text-xs font-semibold text-white bg-red-500 px-3 py-1 rounded-lg"
                  >
                    Remove
                  </button>
                )}
              </div>
              <label className="text-xs text-gray-500">Mobile Number</label>
              <input
                type="tel"
                inputMode="numeric"
                value={phonePsy}
                maxLength={10}
                autoComplete="off"
                placeholder="10-digit mobile"
                onChange={(e) =>
                  handlePhoneChange(
                    e.target.value,
                    setPhonePsy,
                    pinPsy,
                    setPinPsy,
                  )
                }
                className={`${inputCls} mb-2`}
              />
              <label className="text-xs text-gray-500">PIN (6 digits)</label>
              <div className="flex gap-2 mt-1">
                <input
                  type={showPinPsy ? "text" : "password"}
                  value={pinPsy}
                  maxLength={6}
                  inputMode="numeric"
                  onChange={(e) =>
                    setPinPsy(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPinPsy((p) => !p)}
                  className="text-lg px-3 border border-gray-200 rounded-xl text-gray-500"
                >
                  {showPinPsy ? "🙈" : "👁️"}
                </button>
              </div>
              <label className="text-xs text-gray-500">Email</label>
              <input
                type="email"
                value={emailPsy}
                onChange={(e) => setEmailPsy(e.target.value)}
                placeholder="psychologist@email.com"
                className={inputCls}
              />
            </div>
          )}
        </div>
      </div>

      {saved && (
        <div className="bg-violet-50 border border-violet-200 text-violet-800 text-sm rounded-xl p-3 mb-3 text-center">
          ✓ Settings saved
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-violet-700 text-white py-3 rounded-2xl font-semibold text-base hover:bg-violet-800 disabled:opacity-60 transition active:scale-95 mb-6"
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={<p className="text-center mt-20 text-gray-400">Loading...</p>}
    >
      <SettingsContent />
    </Suspense>
  );
}
