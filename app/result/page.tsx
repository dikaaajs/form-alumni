"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Users,
  UserRound,
  MessageCircle,
  ExternalLink,
  LockKeyhole,
  ArrowUpRight,
  ClipboardList,
} from "lucide-react";

type RowData = Record<string, string>;
type ResultData = { inviters: RowData[]; calon: RowData[] };
const field = (row: RowData, ...keys: string[]) => {
  for (const key of keys) if (row[key]) return row[key];
  return "";
};
function whatsappUrl(value: string) {
  let number = value.replace(/\D/g, "");
  if (number.startsWith("0")) number = `62${number.slice(1)}`;
  else if (number.startsWith("8")) number = `62${number}`;
  return number ? `https://wa.me/${number}` : "";
}
function WhatsAppLink({ value }: { value: string }) {
  const url = whatsappUrl(value);
  if (!value || !url)
    return <span className="text-sm text-stone-400">Belum ada</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
    >
      <MessageCircle size={14} /> Chat <ExternalLink size={12} />
    </a>
  );
}
export default function ResultPage() {
  const [accessKey, setAccessKey] = useState("");
  const [data, setData] = useState<ResultData | any>(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"calon" | "inviter">("calon");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authorized, setAuthorized] = useState(false);

  const load = useCallback(
    async (key = accessKey) => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/result", {
          headers: { "x-result-access-key": key },
          cache: "no-store",
        });
        const body = await response.json();
        if (!response.ok)
          throw new Error(body.error || "Tidak dapat memuat data.");
        setData(body);
        setAuthorized(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    },
    [accessKey],
  );

  const inviterMap = useMemo(
    () =>
      new Map(
        (data?.inviters || []).map((row: any) => [
          field(row, "id_inviter"),
          row,
        ]),
      ),
    [data],
  );
  const filteredCalon = useMemo(
    () =>
      (data?.calon || []).filter((row: any) => {
        const inviter: any = inviterMap.get(field(row, "inviter_id")) || {};
        const haystack = [
          field(row, "nama_calonSTC", "nama_calonstc"),
          field(row, "email"),
          field(row, "whatsapp"),
          field(row, "kota"),
          field(row, "nama_perusahaan"),
          field(inviter, "nama_alumni"),
          field(row, "inviter_id"),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query.toLowerCase());
      }),
    [data, inviterMap, query],
  );
  const filteredInviters = useMemo(
    () =>
      (data?.inviters || []).filter((row: any) =>
        [
          field(row, "nama_alumni"),
          field(row, "whatsapp_alumni"),
          field(row, "email_alumni"),
          field(row, "kota_alumni"),
          field(row, "id_inviter"),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [data, query],
  );

  if (!authorized)
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <section className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-xl shadow-stone-200/50">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#760909]/10 text-[#760909]">
            <LockKeyhole size={26} />
          </div>
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#760909]">
            Akademi Trainer
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-stone-900">
            Data pendaftaran
          </h1>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            Masukkan kunci akses admin untuk melihat data alumni dan calon STC.
          </p>
          <form
            className="mt-6 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              void load();
            }}
          >
            <input
              type="password"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              placeholder="Kunci akses admin"
              className="h-12 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm outline-none transition focus:border-[#760909] focus:ring-4 focus:ring-[#760909]/10"
              required
            />
            <button
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#760909] px-4 text-sm font-semibold text-white transition hover:bg-[#5f0707] disabled:opacity-60"
            >
              {loading ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <LockKeyhole size={16} />
              )}{" "}
              {loading ? "Memeriksa akses…" : "Buka data"}
            </button>
          </form>
          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}
          <p className="mt-6 text-xs leading-5 text-stone-400">
            Kunci akses diatur melalui environment server{" "}
            <code>RESULT_ACCESS_KEY</code>.
          </p>
        </section>
      </main>
    );

  return (
    <main className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[#760909]">
              Akademi Trainer · STC
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
              Data pendaftaran
            </h1>
            <p className="mt-2 text-sm text-stone-500">
              Kelola data alumni pengundang dan calon peserta dalam satu
              tampilan.
            </p>
          </div>
          <button
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50 disabled:opacity-60 md:self-auto"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />{" "}
            Perbarui data
          </button>
        </header>
        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-stone-500">
                Total alumni pengundang
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#760909]/10 text-[#760909]">
                <UserRound size={20} />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight text-stone-900">
              {data.inviters.length}
            </p>
            <p className="mt-1 text-xs text-stone-400">
              Data pada sheet inviter
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-stone-500">
                Total calon STC
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Users size={20} />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight text-stone-900">
              {data.calon.length}
            </p>
            <p className="mt-1 text-xs text-stone-400">
              Data pada sheet calonSTC
            </p>
          </div>
        </section>
        <section className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-stone-100 p-4 md:flex-row md:items-center md:justify-between md:p-5">
            <div className="inline-flex w-fit rounded-xl bg-stone-100 p-1">
              <button
                onClick={() => setTab("calon")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === "calon" ? "bg-white text-[#760909] shadow-sm" : "text-stone-500 hover:text-stone-800"}`}
              >
                Calon STC{" "}
                <span className="ml-1 text-xs">{data.calon.length}</span>
              </button>
              <button
                onClick={() => setTab("inviter")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === "inviter" ? "bg-white text-[#760909] shadow-sm" : "text-stone-500 hover:text-stone-800"}`}
              >
                Inviter{" "}
                <span className="ml-1 text-xs">{data.inviters.length}</span>
              </button>
            </div>
            <div className="relative w-full md:max-w-sm">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama, WhatsApp, email…"
                className="h-10 w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 text-sm outline-none focus:border-[#760909] focus:ring-4 focus:ring-[#760909]/10"
              />
            </div>
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <p className="text-xs text-stone-500">
              {tab === "calon"
                ? `${filteredCalon.length} calon STC ditampilkan`
                : `${filteredInviters.length} inviter ditampilkan`}
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs text-stone-400">
              <ClipboardList size={14} /> Data Google Sheets
            </span>
          </div>
          <div className="overflow-x-auto">
            {tab === "calon" ? (
              <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
                <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                  <tr>
                    {[
                      "Calon STC",
                      "Pekerjaan / Perusahaan",
                      "Kontak",
                      "Kota",
                      "Alumni pengundang",
                      "ID Inviter",
                    ].map((h) => (
                      <th key={h} className="px-5 py-3.5 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredCalon.map((row: any, i: any) => {
                    const inviter: any =
                      inviterMap.get(field(row, "inviter_id")) || {};
                    return (
                      <tr
                        key={field(row, "id_calonSTC") || i}
                        className="transition hover:bg-stone-50/80"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-stone-900">
                            {field(row, "nama_calonSTC", "nama_calonstc") ||
                              "—"}
                          </p>
                          <p className="mt-1 text-xs text-stone-400">
                            {field(row, "email") || "Email belum tersedia"}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-stone-700">
                            {field(row, "pekerjaan") || "—"}
                          </p>
                          <p className="mt-1 text-xs text-stone-400">
                            {field(row, "nama_perusahaan") || "—"}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="mb-2 text-stone-700">
                            {field(row, "whatsapp") || "—"}
                          </p>
                          <WhatsAppLink value={field(row, "whatsapp")} />
                        </td>
                        <td className="px-5 py-4 text-stone-600">
                          {field(row, "kota") || "—"}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-stone-800">
                            {field(inviter, "nama_alumni") || "Tidak ditemukan"}
                          </p>
                          <p className="mt-1 text-xs text-stone-400">
                            {field(inviter, "whatsapp_alumni")}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <code className="rounded-md bg-stone-100 px-2 py-1 text-[11px] text-stone-600">
                            {field(row, "inviter_id") || "—"}
                          </code>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredCalon.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-14 text-center text-sm text-stone-400"
                      >
                        Tidak ada data yang cocok dengan pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                  <tr>
                    {[
                      "Alumni",
                      "Program",
                      "Kontak",
                      "Kota",
                      "ID Inviter",
                      "Jumlah rekan",
                    ].map((h) => (
                      <th key={h} className="px-5 py-3.5 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredInviters.map((row: any, i: any) => {
                    const id = field(row, "id_inviter");
                    return (
                      <tr
                        key={id || i}
                        className="transition hover:bg-stone-50/80"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-stone-900">
                            {field(row, "nama_alumni") || "—"}
                          </p>
                          <p className="mt-1 text-xs text-stone-400">
                            {field(row, "email_alumni")}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-stone-700">
                            {field(row, "program") || "—"}
                          </p>
                          <p className="mt-1 text-xs text-stone-400">
                            {field(row, "tahun_program")}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="mb-2 text-stone-700">
                            {field(row, "whatsapp_alumni") || "—"}
                          </p>
                          <WhatsAppLink value={field(row, "whatsapp_alumni")} />
                        </td>
                        <td className="px-5 py-4 text-stone-600">
                          {field(row, "kota_alumni") || "—"}
                        </td>
                        <td className="px-5 py-4">
                          <code className="rounded-md bg-stone-100 px-2 py-1 text-[11px] text-stone-600">
                            {id || "—"}
                          </code>
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            {
                              data.calon.filter(
                                (c: any) => field(c, "inviter_id") === id,
                              ).length
                            }{" "}
                            calon
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredInviters.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-14 text-center text-sm text-stone-400"
                      >
                        Tidak ada data yang cocok dengan pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          <footer className="flex flex-col gap-1 border-t border-stone-100 bg-stone-50/60 px-5 py-3 text-xs text-stone-400 sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex items-center gap-1">
              Kembali ke formulir{" "}
              <a
                href="/"
                className="font-semibold text-[#760909] hover:underline flex"
              >
                Buka formulir <ArrowUpRight size={12} />
              </a>
            </span>
          </footer>
        </section>
      </div>
    </main>
  );
}
