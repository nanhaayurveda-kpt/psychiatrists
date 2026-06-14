// app/api/patients/[id]/route.js

import { db } from '@/lib/db.js';
import { patients, prescriptions } from '@/lib/schema.js';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session.js';

export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { id } = await params;
  const pid = parseInt(id);
  if (!pid) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const body = await request.json();
  const allowed = ['name', 'phone'];
  const update = {};
  for (const key of allowed) {
    if (body[key] !== undefined) update[key] = body[key];
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  await db.update(patients).set(update).where(eq(patients.id, pid));

  const [updated] = await db.select().from(patients).where(eq(patients.id, pid));
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { id } = await params;
  const pid = parseInt(id);
  if (!pid) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  await db.delete(prescriptions).where(eq(prescriptions.patient_id, pid));
  await db.delete(patients).where(eq(patients.id, pid));

  return NextResponse.json({ success: true });
}