import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const SKIP_DIRS = new Set(["node_modules", ".next", ".git"]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith(".js")) files.push(full);
  }
  return files;
}

const SPECIAL_FIXES = [
  // ---------- app/api/patients/route.js ----------
  {
    file: "app/api/patients/route.js",
    from: `import { eq, and } from 'drizzle-orm';`,
    to: `import { eq } from 'drizzle-orm';`,
  },
  {
    file: "app/api/patients/route.js",
    from: `  const clinic_id = session.clinic_id;\r\n  const { searchParams } = new URL(request.url);\r\n  const phone = searchParams.get('phone');\r\n\r\n  if (phone) {\r\n    const result = await db.select().from(patients)\r\n      .where(and(eq(patients.clinic_id, clinic_id), eq(patients.phone, phone)));\r\n    return NextResponse.json(result);\r\n  }\r\n\r\n  const result = await db.select().from(patients)\r\n    .where(eq(patients.clinic_id, clinic_id));\r\n  return NextResponse.json(result);\r\n}`,
    to: `  const { searchParams } = new URL(request.url);\r\n  const phone = searchParams.get('phone');\r\n\r\n  if (phone) {\r\n    const result = await db.select().from(patients)\r\n      .where(eq(patients.phone, phone));\r\n    return NextResponse.json(result);\r\n  }\r\n\r\n  const result = await db.select().from(patients);\r\n  return NextResponse.json(result);\r\n}`,
  },
  {
    file: "app/api/patients/route.js",
    from: `  const clinic_id = session.clinic_id;\r\n  const { name, phone } = await request.json();\r\n\r\n  if (!name || !phone) {\r\n    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });\r\n  }\r\n\r\n  const existing = await db.select().from(patients)\r\n    .where(and(eq(patients.clinic_id, clinic_id), eq(patients.phone, phone)));\r\n\r\n  let patient;\r\n  if (existing.length > 0) {\r\n    patient = existing[0];\r\n  } else {\r\n    const result = await db.insert(patients)\r\n      .values({ name, phone, clinic_id });\r\n    const [inserted] = await db.select().from(patients)\r\n      .where(and(eq(patients.clinic_id, clinic_id), eq(patients.phone, phone)));\r\n    patient = inserted;\r\n  }\r\n\r\n  return NextResponse.json(patient);\r\n}`,
    to: `  const { name, phone } = await request.json();\r\n\r\n  if (!name || !phone) {\r\n    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });\r\n  }\r\n\r\n  const existing = await db.select().from(patients)\r\n    .where(eq(patients.phone, phone));\r\n\r\n  let patient;\r\n  if (existing.length > 0) {\r\n    patient = existing[0];\r\n  } else {\r\n    const result = await db.insert(patients)\r\n      .values({ name, phone });\r\n    const [inserted] = await db.select().from(patients)\r\n      .where(eq(patients.phone, phone));\r\n    patient = inserted;\r\n  }\r\n\r\n  return NextResponse.json(patient);\r\n}`,
  },

  // ---------- app/api/prescriptions/route.js ----------
  {
    file: "app/api/prescriptions/route.js",
    from: `  const clinic_id = session.clinic_id;\r\n  const { searchParams } = new URL(request.url);\r\n  const status = searchParams.get('status');\r\n  const patient_id = searchParams.get('patient_id');\r\n\r\n  const rows = await db.select({\r\n    id: prescriptions.id,\r\n    clinic_id: prescriptions.clinic_id,\r\n    patient_id: prescriptions.patient_id,\r\n    visit_date: prescriptions.visit_date,\r\n    complaints: prescriptions.complaints,\r\n    tests: prescriptions.tests,\r\n    medicines: prescriptions.medicines,\r\n    notes: prescriptions.notes,\r\n    followup_date: prescriptions.followup_date,\r\n    status: prescriptions.status,\r\n    patient_name: patients.name,\r\n    patient_phone: patients.phone,\r\n  })\r\n    .from(prescriptions)\r\n    .innerJoin(patients, eq(prescriptions.patient_id, patients.id))\r\n    .where(eq(prescriptions.clinic_id, clinic_id));`,
    to: `  const { searchParams } = new URL(request.url);\r\n  const status = searchParams.get('status');\r\n  const patient_id = searchParams.get('patient_id');\r\n\r\n  const rows = await db.select({\r\n    id: prescriptions.id,\r\n    patient_id: prescriptions.patient_id,\r\n    visit_date: prescriptions.visit_date,\r\n    complaints: prescriptions.complaints,\r\n    tests: prescriptions.tests,\r\n    medicines: prescriptions.medicines,\r\n    notes: prescriptions.notes,\r\n    followup_date: prescriptions.followup_date,\r\n    status: prescriptions.status,\r\n    patient_name: patients.name,\r\n    patient_phone: patients.phone,\r\n  })\r\n    .from(prescriptions)\r\n    .innerJoin(patients, eq(prescriptions.patient_id, patients.id));`,
  },
  {
    file: "app/api/prescriptions/route.js",
    from: `  const clinic_id = session.clinic_id;\r\n  const { patient_id, complaints, status } = await request.json();\r\n\r\n  if (!patient_id)\r\n    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });\r\n\r\n  const initialStatus = status || 'waiting';\r\n\r\n  const result = await db.insert(prescriptions)\r\n    .values({ patient_id, complaints: complaints || '', clinic_id, status: initialStatus });\r\n\r\n  return NextResponse.json({\r\n    id: Number(result.lastInsertRowid),\r\n    patient_id,\r\n    complaints: complaints || '',\r\n    clinic_id,\r\n    status: initialStatus,\r\n  });\r\n}`,
    to: `  const { patient_id, complaints, status } = await request.json();\r\n\r\n  if (!patient_id)\r\n    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });\r\n\r\n  const initialStatus = status || 'waiting';\r\n\r\n  const result = await db.insert(prescriptions)\r\n    .values({ patient_id, complaints: complaints || '', status: initialStatus });\r\n\r\n  return NextResponse.json({\r\n    id: Number(result.lastInsertRowid),\r\n    patient_id,\r\n    complaints: complaints || '',\r\n    status: initialStatus,\r\n  });\r\n}`,
  },

  // ---------- app/api/prescriptions/[id]/route.js ----------
  {
    file: "app/api/prescriptions/[id]/route.js",
    from: `import { eq, and } from 'drizzle-orm';`,
    to: `import { eq } from 'drizzle-orm';`,
  },
  {
    file: "app/api/prescriptions/[id]/route.js",
    from: `  const result = await db.select().from(prescriptions)\r\n    .where(and(\r\n      eq(prescriptions.id, pid),\r\n      eq(prescriptions.clinic_id, session.clinic_id)\r\n    ));`,
    to: `  const result = await db.select().from(prescriptions)\r\n    .where(eq(prescriptions.id, pid));`,
  },
  {
    file: "app/api/prescriptions/[id]/route.js",
    from: `  await db.update(prescriptions)\r\n    .set(update)\r\n    .where(and(\r\n      eq(prescriptions.id, pid),\r\n      eq(prescriptions.clinic_id, session.clinic_id)\r\n    ));\r\n\r\n  const [updated] = await db.select().from(prescriptions)\r\n    .where(and(\r\n      eq(prescriptions.id, pid),\r\n      eq(prescriptions.clinic_id, session.clinic_id)\r\n    ));`,
    to: `  await db.update(prescriptions)\r\n    .set(update)\r\n    .where(eq(prescriptions.id, pid));\r\n\r\n  const [updated] = await db.select().from(prescriptions)\r\n    .where(eq(prescriptions.id, pid));`,
  },

  // ---------- app/api/psychologist/assessment/route.js ----------
  {
    file: "app/api/psychologist/assessment/route.js",
    from: `import { eq, and } from 'drizzle-orm';`,
    to: `import { eq } from 'drizzle-orm';`,
  },
  {
    file: "app/api/psychologist/assessment/route.js",
    from: `    .from(prescriptions)\r\n    .innerJoin(patients, eq(prescriptions.patient_id, patients.id))\r\n    .where(and(\r\n      eq(prescriptions.id, prescription_id),\r\n      eq(prescriptions.clinic_id, session.clinic_id)\r\n    ));\r\n\r\n  if (rows.length === 0)\r\n    return NextResponse.json({ error: 'Not found' }, { status: 404 });\r\n\r\n  // Fetch existing assessment if any\r\n  const existing = await db.select()\r\n    .from(assessments)\r\n    .where(and(\r\n      eq(assessments.prescription_id, prescription_id),\r\n      eq(assessments.clinic_id, session.clinic_id)\r\n    ));`,
    to: `    .from(prescriptions)\r\n    .innerJoin(patients, eq(prescriptions.patient_id, patients.id))\r\n    .where(eq(prescriptions.id, prescription_id));\r\n\r\n  if (rows.length === 0)\r\n    return NextResponse.json({ error: 'Not found' }, { status: 404 });\r\n\r\n  // Fetch existing assessment if any\r\n  const existing = await db.select()\r\n    .from(assessments)\r\n    .where(eq(assessments.prescription_id, prescription_id));`,
  },
  {
    file: "app/api/psychologist/assessment/route.js",
    from: `  // Upsert — पहले check करो exist करता है क्या\r\n  const existing = await db.select()\r\n    .from(assessments)\r\n    .where(and(\r\n      eq(assessments.prescription_id, prescription_id),\r\n      eq(assessments.clinic_id, session.clinic_id)\r\n    ));\r\n\r\n  if (existing.length > 0) {\r\n    await db.update(assessments)\r\n      .set({ mood, history, symptoms, notes, updated_at: new Date().toISOString() })\r\n      .where(eq(assessments.id, existing[0].id));\r\n  } else {\r\n    await db.insert(assessments)\r\n      .values({\r\n        prescription_id,\r\n        clinic_id: session.clinic_id,\r\n        mood,\r\n        history,\r\n        symptoms,\r\n        notes,\r\n      });\r\n  }`,
    to: `  // Upsert — पहले check करो exist करता है क्या\r\n  const existing = await db.select()\r\n    .from(assessments)\r\n    .where(eq(assessments.prescription_id, prescription_id));\r\n\r\n  if (existing.length > 0) {\r\n    await db.update(assessments)\r\n      .set({ mood, history, symptoms, notes, updated_at: new Date().toISOString() })\r\n      .where(eq(assessments.id, existing[0].id));\r\n  } else {\r\n    await db.insert(assessments)\r\n      .values({\r\n        prescription_id,\r\n        mood,\r\n        history,\r\n        symptoms,\r\n        notes,\r\n      });\r\n  }`,
  },

  // ---------- app/api/doctor/assessment/route.js ----------
  {
    file: "app/api/doctor/assessment/route.js",
    from: `import { eq, and } from 'drizzle-orm';`,
    to: `import { eq } from 'drizzle-orm';`,
  },
  {
    file: "app/api/doctor/assessment/route.js",
    from: `  const rows = await db.select()\r\n    .from(assessments)\r\n    .where(and(\r\n      eq(assessments.prescription_id, prescription_id),\r\n      eq(assessments.clinic_id, session.clinic_id)\r\n    ));`,
    to: `  const rows = await db.select()\r\n    .from(assessments)\r\n    .where(eq(assessments.prescription_id, prescription_id));`,
  },

  // ---------- app/api/h1-register/route.js ----------
  {
    file: "app/api/h1-register/route.js",
    from: `import { eq, and } from 'drizzle-orm';`,
    to: `import { eq } from 'drizzle-orm';`,
  },
  {
    file: "app/api/h1-register/route.js",
    from: `    .from(prescriptions)\r\n    .innerJoin(patients, eq(prescriptions.patient_id, patients.id))\r\n    .where(and(\r\n      eq(prescriptions.clinic_id, session.clinic_id),\r\n      eq(prescriptions.status, 'doctor_done')\r\n    ));`,
    to: `    .from(prescriptions)\r\n    .innerJoin(patients, eq(prescriptions.patient_id, patients.id))\r\n    .where(eq(prescriptions.status, 'doctor_done'));`,
  },

  // ---------- app/api/reminders/route.js ----------
  {
    file: "app/api/reminders/route.js",
    from: `  const rows = await db.select({\r\n    prescription_id: prescriptions.id,\r\n    followup_date: prescriptions.followup_date,\r\n    visit_date: prescriptions.visit_date,\r\n    patient_id: prescriptions.patient_id,\r\n    patient_name: patients.name,\r\n    patient_phone: patients.phone,\r\n    clinic_name: clinics.name,\r\n  })\r\n    .from(prescriptions)\r\n    .innerJoin(patients, eq(prescriptions.patient_id, patients.id))\r\n    .innerJoin(clinics, eq(prescriptions.clinic_id, clinics.id))\r\n    .where(eq(prescriptions.clinic_id, session.clinic_id));`,
    to: `  const [clinicRow] = await db.select().from(clinics).limit(1);\r\n\r\n  const baseRows = await db.select({\r\n    prescription_id: prescriptions.id,\r\n    followup_date: prescriptions.followup_date,\r\n    visit_date: prescriptions.visit_date,\r\n    patient_id: prescriptions.patient_id,\r\n    patient_name: patients.name,\r\n    patient_phone: patients.phone,\r\n  })\r\n    .from(prescriptions)\r\n    .innerJoin(patients, eq(prescriptions.patient_id, patients.id));\r\n\r\n  const rows = baseRows.map((r) => ({ ...r, clinic_name: clinicRow?.name || '' }));`,
  },

  // ---------- app/api/cron/reminder/route.js ----------
  {
    file: "app/api/cron/reminder/route.js",
    from: `  const due = await db.select({\r\n    prescription_id: prescriptions.id,\r\n    followup_date: prescriptions.followup_date,\r\n    patient_name: patients.name,\r\n    patient_phone: patients.phone,\r\n    clinic_name: clinics.name,\r\n  })\r\n    .from(prescriptions)\r\n    .innerJoin(patients, eq(prescriptions.patient_id, patients.id))\r\n    .innerJoin(clinics, eq(prescriptions.clinic_id, clinics.id))\r\n    .where(\r\n      and(\r\n        eq(prescriptions.followup_date, today),\r\n        eq(prescriptions.reminder_sent, 0)\r\n      )\r\n    );`,
    to: `  const [clinicRow] = await db.select().from(clinics).limit(1);\r\n\r\n  const dueBase = await db.select({\r\n    prescription_id: prescriptions.id,\r\n    followup_date: prescriptions.followup_date,\r\n    patient_name: patients.name,\r\n    patient_phone: patients.phone,\r\n  })\r\n    .from(prescriptions)\r\n    .innerJoin(patients, eq(prescriptions.patient_id, patients.id))\r\n    .where(\r\n      and(\r\n        eq(prescriptions.followup_date, today),\r\n        eq(prescriptions.reminder_sent, 0)\r\n      )\r\n    );\r\n\r\n  const due = dueBase.map((r) => ({ ...r, clinic_name: clinicRow?.name || '' }));`,
  },

  // ---------- app/api/rx/[token]/route.js ----------
  {
    file: "app/api/rx/[token]/route.js",
    from: `  const [row] = await db.select({\r\n    id: prescriptions.id,\r\n    visit_date: prescriptions.visit_date,\r\n    complaints: prescriptions.complaints,\r\n    mse: prescriptions.mse,\r\n    tests: prescriptions.tests,\r\n    medicines: prescriptions.medicines,\r\n    notes: prescriptions.notes,\r\n    followup_date: prescriptions.followup_date,\r\n    patient_name: patients.name,\r\n    patient_phone: patients.phone,\r\n    clinic_name: clinics.name,\r\n  })\r\n    .from(prescriptions)\r\n    .innerJoin(patients, eq(prescriptions.patient_id, patients.id))\r\n    .innerJoin(clinics, eq(prescriptions.clinic_id, clinics.id))\r\n    .where(eq(prescriptions.public_token, token));\r\n\r\n  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });\r\n\r\n  return NextResponse.json(row);`,
    to: `  const [rowBase] = await db.select({\r\n    id: prescriptions.id,\r\n    visit_date: prescriptions.visit_date,\r\n    complaints: prescriptions.complaints,\r\n    mse: prescriptions.mse,\r\n    tests: prescriptions.tests,\r\n    medicines: prescriptions.medicines,\r\n    notes: prescriptions.notes,\r\n    followup_date: prescriptions.followup_date,\r\n    patient_name: patients.name,\r\n    patient_phone: patients.phone,\r\n  })\r\n    .from(prescriptions)\r\n    .innerJoin(patients, eq(prescriptions.patient_id, patients.id))\r\n    .where(eq(prescriptions.public_token, token));\r\n\r\n  if (!rowBase) return NextResponse.json({ error: 'Not found' }, { status: 404 });\r\n\r\n  const [clinicRow] = await db.select().from(clinics).limit(1);\r\n  const row = { ...rowBase, clinic_name: clinicRow?.name || '' };\r\n\r\n  return NextResponse.json(row);`,
  },
];

let filesChanged = 0;
let fixesApplied = 0;
const touchedFiles = new Set();

for (const file of walk(ROOT)) {
  const original = fs.readFileSync(file, "utf8");
  let content = original;
  const relPath = path.relative(ROOT, file).split(path.sep).join("/");

  const matchingFixes = SPECIAL_FIXES.filter((s) => s.file === relPath);
  for (const fix of matchingFixes) {
    if (content.includes(fix.from)) {
      content = content.replace(fix.from, fix.to);
      fixesApplied++;
      touchedFiles.add(relPath);
    } else if (fs.existsSync(file) && matchingFixes.length) {
      console.log(`⚠ मेल नहीं खाया (manually check करो): ${relPath}`);
    }
  }

  if (content !== original) {
    fs.writeFileSync(file + ".bak", original, "utf8");
    fs.writeFileSync(file, content, "utf8");
    filesChanged++;
    console.log("बदली:", relPath);
  }
}

console.log(`\nकुल ${filesChanged} फाइलें बदलीं, ${fixesApplied} fix लगे।`);
console.log("हर बदली फाइल के बगल में .bak बैकअप बना है।");

console.log("\n--- बचे हुए clinic_id references (ये उम्मीद के मुताबिक हैं, मैन्युअल चेक करो) ---");
for (const file of walk(ROOT)) {
  const content = fs.readFileSync(file, "utf8");
  if (content.includes("clinic_id")) {
    const relPath = path.relative(ROOT, file).split(path.sep).join("/");
    const lines = content.split("\n");
    lines.forEach((line, i) => {
      if (line.includes("clinic_id")) {
        console.log(`${relPath}:${i + 1}: ${line.trim()}`);
      }
    });
  }
}
