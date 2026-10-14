import { NextResponse } from "next/server";
import { google } from "googleapis";
import { randomUUID } from "node:crypto";
import { validateSubmission, type Submission } from "@/lib/validation";

export const runtime = "nodejs";

const INVITER_SHEET = "inviter";
const CALON_STC_SHEET = "calonSTC";

function cell(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined) return { userEnteredValue: { stringValue: "" } };
  if (typeof value === "number") return { userEnteredValue: { numberValue: value } };
  if (typeof value === "boolean") return { userEnteredValue: { boolValue: value } };
  return { userEnteredValue: { stringValue: String(value) } };
}

function row(values: Array<string | number | boolean | null | undefined>) {
  return { values: values.map(cell) };
}

export async function POST(request: Request) {
  try {
    const data = await request.json() as Submission;
    const validationError = validateSubmission(data);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    if (!spreadsheetId || !serviceAccountEmail || !privateKey) {
      return NextResponse.json({ error: "Integrasi Google Sheets belum dikonfigurasi di server." }, { status: 500 });
    }

    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth });

    // Pastikan kedua tab tersedia; buat otomatis jika belum ada.
    let workbook = await sheets.spreadsheets.get({ spreadsheetId, fields: "sheets.properties(sheetId,title)" });
    const existingTitles = new Set((workbook.data.sheets || []).map(s => s.properties?.title));
    const missingSheets = [INVITER_SHEET, CALON_STC_SHEET].filter(title => !existingTitles.has(title));
    if (missingSheets.length) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: missingSheets.map(title => ({ addSheet: { properties: { title } } })),
        },
      });
      workbook = await sheets.spreadsheets.get({ spreadsheetId, fields: "sheets.properties(sheetId,title)" });
    }

    const sheetIds = new Map((workbook.data.sheets || []).map(s => [s.properties?.title, s.properties?.sheetId]));
    const inviterSheetId = sheetIds.get(INVITER_SHEET);
    const calonSheetId = sheetIds.get(CALON_STC_SHEET);
    if (inviterSheetId === undefined || calonSheetId === undefined) {
      throw new Error("Tab inviter atau calonSTC tidak ditemukan.");
    }

    // Satu ID dibuat untuk alumni pengundang dan direferensikan oleh ketiga calonSTC.
    const inviterId = randomUUID();
    const submittedAt = new Date().toISOString();
    const inviterRow = row([
      inviterId,
      submittedAt,
      data.alumniName.trim(),
      data.program,
      data.programYear,
      data.whatsapp.trim(),
      data.email.trim(),
      data.city.trim(),
      data.socialMedia.trim(),
    ]);
    const calonRows = data.colleagues.map(c => row([
      randomUUID(),
      inviterId,
      c.name.trim(),
      c.birthDate,
      c.occupation.trim(),
      c.companyName?.trim() || "",
      c.email.trim(),
      c.whatsapp.trim(),
      c.city.trim(),
      c.socialMedia.trim(),
    ]));

    // Satu batch menjaga penambahan data di kedua tab dalam satu operasi API.
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          { appendCells: { sheetId: inviterSheetId, rows: [inviterRow], fields: "userEnteredValue" } },
          { appendCells: { sheetId: calonSheetId, rows: calonRows, fields: "userEnteredValue" } },
        ],
      },
    });

    return NextResponse.json({ success: true, inviterId, calonSTCCount: calonRows.length });
  } catch (error) {
    console.error("Submit alumni form failed:", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat menyimpan data. Periksa izin Google Sheets atau coba lagi." }, { status: 500 });
  }
}
