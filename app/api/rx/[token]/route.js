import { db } from '@/lib/db.js';
import { prescriptions, patients, clinics } from '@/lib/schema.js';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { token } = await params;
  if (!token || token.length < 10) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  const [rowBase] = await db.select({
    id: prescriptions.id,
    visit_date: prescriptions.visit_date,
    complaints: prescriptions.complaints,
    mse: prescriptions.mse,
    tests: prescriptions.tests,
    medicines: prescriptions.medicines,
    notes: prescriptions.notes,
    followup_date: prescriptions.followup_date,
    patient_name: patients.name,
    patient_phone: patients.phone,
  })
    .from(prescriptions)
    .innerJoin(patients, eq(prescriptions.patient_id, patients.id))
    .where(eq(prescriptions.public_token, token));

  if (!rowBase) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [clinicRow] = await db.select().from(clinics).limit(1);
  const row = { ...rowBase, clinic_name: clinicRow?.name || '' };

  return NextResponse.json(row);
}