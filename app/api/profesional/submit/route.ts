import { NextResponse } from "next/server";
import { google } from "googleapis";
import { randomUUID } from "node:crypto";
import { ageOnDate, isValidWhatsApp, type Colleague } from "@/lib/validation";

export const runtime = "nodejs";
const INVITER_SHEET = "invitorPro";
const CALON_SHEET = "calonSTCPro";
type ProfessionalSubmission = {
  alumniName: string; companyName: string; position: string; whatsapp: string; email: string; city: string; socialMedia: string; colleagues: Colleague[];
};
function cell(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined) return { userEnteredValue: { stringValue: "" } };
  if (typeof value === "number") return { userEnteredValue: { numberValue: value } };
  if (typeof value === "boolean") return { userEnteredValue: { boolValue: value } };
  return { userEnteredValue: { stringValue: String(value) } };
}
function row(values: Array<string | number | boolean | null | undefined>) { return { values: values.map(cell) }; }
function validate(data: ProfessionalSubmission): string | null {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.alumniName?.trim()) return "Nama lengkap wajib diisi.";
  if (!data.companyName?.trim()) return "Nama perusahaan wajib diisi.";
  if (!data.position?.trim()) return "Jabatan wajib diisi.";
  if (!data.whatsapp?.trim() || !isValidWhatsApp(data.whatsapp)) return "Nomor WhatsApp profesional tidak valid.";
  if (!emailPattern.test(data.email || "")) return "Email profesional tidak valid.";
  if (!data.city?.trim()) return "Kota domisili wajib diisi.";
  if (!data.socialMedia?.trim()) return "Akun sosial media wajib diisi.";
  if (!Array.isArray(data.colleagues) || data.colleagues.length !== 3) return "Anda wajib mengisi tepat 3 calon STC.";
  for (let i = 0; i < 3; i++) {
    const c = data.colleagues[i]; const label = `Calon STC ${i + 1}`;
    if (!c?.name?.trim()) return `${label}: nama wajib diisi.`;
    const age = ageOnDate(c.birthDate);
    if (age < 18) return age < 0 ? `${label}: tanggal lahir tidak valid.` : `${label}: harus berusia minimal 18 tahun.`;
    if (!c.occupation?.trim()) return `${label}: pekerjaan wajib diisi.`;
    if (!c.companyName?.trim()) return `${label}: nama perusahaan wajib diisi.`;
    if (!c.email?.trim() || !emailPattern.test(c.email)) return `${label}: email tidak valid.`;
    if (!c.whatsapp?.trim() || !isValidWhatsApp(c.whatsapp)) return `${label}: nomor WhatsApp tidak valid.`;
    if (!c.city?.trim()) return `${label}: kota domisili wajib diisi.`;
    if (!c.socialMedia?.trim()) return `${label}: akun sosial media wajib diisi.`;
  }
  return null;
}
export async function POST(request: Request) {
  try {
    const data = await request.json() as ProfessionalSubmission;
    const validationError = validate(data);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    if (!spreadsheetId || !serviceAccountEmail || !privateKey) return NextResponse.json({ error: "Integrasi Google Sheets belum dikonfigurasi di server." }, { status: 500 });
    const auth = new google.auth.JWT({ email: serviceAccountEmail, key: privateKey, scopes: ["https://www.googleapis.com/auth/spreadsheets"] });
    const sheets = google.sheets({ version: "v4", auth });
    let workbook = await sheets.spreadsheets.get({ spreadsheetId, fields: "sheets.properties(sheetId,title)" });
    const titles = new Set((workbook.data.sheets || []).map(s => s.properties?.title));
    const missing = [INVITER_SHEET, CALON_SHEET].filter(title => !titles.has(title));
    if (missing.length) {
      await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests: missing.map(title => ({ addSheet: { properties: { title } } })) } });
      workbook = await sheets.spreadsheets.get({ spreadsheetId, fields: "sheets.properties(sheetId,title)" });
    }
    const ids = new Map((workbook.data.sheets || []).map(s => [s.properties?.title, s.properties?.sheetId]));
    const inviterSheetId = ids.get(INVITER_SHEET); const calonSheetId = ids.get(CALON_SHEET);
    if (inviterSheetId === undefined || calonSheetId === undefined) throw new Error("Tab invitorPro atau calonSTCPro tidak ditemukan.");
    // Isi header otomatis pada tab baru atau tab profesional yang masih kosong.
    const inviterHeaders = ["id_invitorPro", "submitted_at", "nama_profesional", "nama_perusahaan", "jabatan", "whatsapp", "email", "kota", "sosial_media"];
    const calonHeaders = ["id_calonSTCPro", "invitorPro_id", "nama_calonSTC", "tanggal_lahir", "pekerjaan", "nama_perusahaan", "email", "whatsapp", "kota", "sosial_media"];
    const [inviterExisting, calonExisting] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: `${INVITER_SHEET}!A1:I1` }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: `${CALON_SHEET}!A1:J1` }),
    ]);
    const headerWrites: Array<{ range: string; values: string[][] }> = [];
    if (!inviterExisting.data.values?.length) headerWrites.push({ range: `${INVITER_SHEET}!A1:I1`, values: [inviterHeaders] });
    if (!calonExisting.data.values?.length) headerWrites.push({ range: `${CALON_SHEET}!A1:J1`, values: [calonHeaders] });
    if (headerWrites.length) await sheets.spreadsheets.values.batchUpdate({ spreadsheetId, requestBody: { valueInputOption: "RAW", data: headerWrites } });
    const inviterId = randomUUID(); const submittedAt = new Date().toISOString();
    const inviterRow = row([inviterId, submittedAt, data.alumniName.trim(), data.companyName.trim(), data.position.trim(), data.whatsapp.trim(), data.email.trim(), data.city.trim(), data.socialMedia.trim()]);
    const calonRows = data.colleagues.map(c => row([randomUUID(), inviterId, c.name.trim(), c.birthDate, c.occupation.trim(), c.companyName.trim(), c.email.trim(), c.whatsapp.trim(), c.city.trim(), c.socialMedia.trim()]));
    await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests: [
      { appendCells: { sheetId: inviterSheetId, rows: [inviterRow], fields: "userEnteredValue" } },
      { appendCells: { sheetId: calonSheetId, rows: calonRows, fields: "userEnteredValue" } },
    ] } });
    return NextResponse.json({ success: true, inviterId, calonSTCCount: calonRows.length });
  } catch (error) {
    console.error("Submit professional form failed:", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat menyimpan data profesional. Periksa izin Google Sheets atau coba lagi." }, { status: 500 });
  }
}
