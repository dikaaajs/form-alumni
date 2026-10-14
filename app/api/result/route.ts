import { NextResponse } from "next/server";
import { google } from "googleapis";

export const runtime = "nodejs";

function getEnv() {
  return {
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    resultKey: process.env.RESULT_ACCESS_KEY,
  };
}

export async function GET(request: Request) {
  const env = getEnv();
  const accessKey = request.headers.get("x-result-access-key");
  if (!env.resultKey) {
    return NextResponse.json({ error: "Halaman hasil belum diaktifkan. Atur RESULT_ACCESS_KEY pada environment server." }, { status: 503 });
  }
  if (!accessKey || accessKey !== env.resultKey) {
    return NextResponse.json({ error: "Kunci akses tidak valid." }, { status: 401 });
  }
  if (!env.spreadsheetId || !env.email || !env.key) {
    return NextResponse.json({ error: "Integrasi Google Sheets belum dikonfigurasi di server." }, { status: 500 });
  }

  try {
    const auth = new google.auth.JWT({ email: env.email, key: env.key, scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"] });
    const sheets = google.sheets({ version: "v4", auth });
    const [inviterResponse, calonResponse] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId: env.spreadsheetId, range: "inviter!A:J" }),
      sheets.spreadsheets.values.get({ spreadsheetId: env.spreadsheetId, range: "calonSTC!A:K" }),
    ]);
    const inviterValues = inviterResponse.data.values || [];
    const calonValues = calonResponse.data.values || [];
    const inviterHeaders = inviterValues[0] || [];
    const calonHeaders = calonValues[0] || [];
    const objects = (headers: string[], rows: string[][]) => rows.map(values => Object.fromEntries(headers.map((header, i) => [String(header), values[i] ?? ""])));
    const inviters = objects(inviterHeaders, inviterValues.slice(1));
    const calon = objects(calonHeaders, calonValues.slice(1));
    return NextResponse.json({ inviters, calon }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    console.error("Load result data failed:", error);
    return NextResponse.json({ error: "Gagal mengambil data dari Google Sheets. Periksa nama tab dan izin Service Account." }, { status: 500 });
  }
}
