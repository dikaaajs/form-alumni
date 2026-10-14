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
  if (!env.resultKey) return NextResponse.json({ error: "Halaman hasil belum diaktifkan. Atur RESULT_ACCESS_KEY pada environment server." }, { status: 503 });
  if (!accessKey || accessKey !== env.resultKey) return NextResponse.json({ error: "Kunci akses tidak valid." }, { status: 401 });
  if (!env.spreadsheetId || !env.email || !env.key) return NextResponse.json({ error: "Integrasi Google Sheets belum dikonfigurasi di server." }, { status: 500 });

  try {
    const auth = new google.auth.JWT({ email: env.email, key: env.key, scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"] });
    const sheets = google.sheets({ version: "v4", auth });
    // Sheet profesional boleh belum memiliki data. Tab yang belum ada diperlakukan sebagai kosong.
    const readTab = async (range: string) => {
      try {
        const response = await sheets.spreadsheets.values.get({ spreadsheetId: env.spreadsheetId!, range });
        const values = response.data.values || [];
        const headers = (values[0] || []).map(String);
        return values.slice(1).map(values => Object.fromEntries(headers.map((header, i) => [header, String(values[i] ?? "")])));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (/Unable to parse range|not found|does not exist/i.test(message)) return [];
        throw error;
      }
    };
    const [inviters, calon, invitersPro, calonPro] = await Promise.all([
      readTab("inviter!A:Z"),
      readTab("calonSTC!A:Z"),
      readTab("invitorPro!A:Z"),
      readTab("calonSTCPro!A:Z"),
    ]);
    return NextResponse.json({ inviters, calon, invitersPro, calonPro }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    console.error("Load result data failed:", error);
    return NextResponse.json({ error: "Gagal mengambil data dari Google Sheets. Periksa nama tab, header, dan izin Service Account." }, { status: 500 });
  }
}
