import { readFileSync, writeFileSync } from 'fs';

const expiredFiles = [
  'app/doctor/patients/page.js',
  'app/doctor/reminders/page.js',
  'app/doctor/page.js',
  'app/doctor/h1-register/page.js',
];

for (const file of expiredFiles) {
  const original = readFileSync(file, 'utf8');
  const fixed = original
    .replaceAll('"/expired"', '"/login"')
    .replaceAll("'/expired'", "'/login'");
  writeFileSync(file, fixed, 'utf8');
  console.log(`${file}: ${original !== fixed ? '✅ fixed' : '⚠️ no change'}`);
}

const routeFile = 'app/api/h1-register/route.js';
let route = readFileSync(routeFile, 'utf8');
route = route.replace(/import \{ checkExpiry \} from "@\/lib\/access\.js";\r?\n/, '');
route = route.replace(/const DEVELOPER_EMAIL = "prasad\.kamta@gmail\.com";\r?\n/, '');
route = route.replace(/  if \(!\(await checkExpiry\(session\)\)\)\r?\n    return NextResponse\.json\(\{ error: "expired" \}, \{ status: 403 \}\);\r?\n/, '');
route = route.replace(
  /\.where\(\s*and\(\s*eq\(prescriptions\.clinic_id, session\.clinic_id\),\s*inArray\(prescriptions\.status, \["doctor_done", "dispensed"\]\),\s*\),\s*\)/,
  '.where(inArray(prescriptions.status, ["doctor_done", "dispensed"]))'
);
writeFileSync(routeFile, route, 'utf8');
console.log(`${routeFile}: ✅ fixed`);