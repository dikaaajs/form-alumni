import { NextResponse } from "next/server";
import { google } from "googleapis";
import { validateSubmission, type Submission } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as Submission;
    const validationError = validateSubmission(data);
    if (validationError)
      return NextResponse.json({ error: validationError }, { status: 400 });

    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || "Responses";
    if (!spreadsheetId || !serviceAccountEmail || !privateKey) {
      return NextResponse.json(
        { error: "Integrasi Google Sheets belum dikonfigurasi di server." },
        { status: 500 },
      );
    }

    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth });
    const values = [
      [
        new Date().toISOString(),
        data.alumniName.trim(),
        data.program,
        data.programYear,
        data.whatsapp.trim(),
        data.email.trim(),
        data.city.trim(),
        data.socialMedia.trim(),
        ...data.colleagues.flatMap((c) => [
          c.name.trim(),
          c.birthDate,
          c.occupation.trim(),
          c.email.trim(),
          c.whatsapp.trim(),
          c.city.trim(),
          c.socialMedia.trim(),
        ]),
      ],
    ];
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `'${sheetName.replace(/'/g, "''")}'!A:AC`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Google Sheets error:", {
      message: error.message,
      status: error.code,
      details: error.response?.data?.error,
    });

    return NextResponse.json(
      {
        error:
          error.response?.data?.error?.message ||
          "Gagal menyimpan data ke Google Sheets.",
      },
      { status: 500 },
    );
  }
}
