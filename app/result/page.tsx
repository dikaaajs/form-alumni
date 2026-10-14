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
  BriefcaseBusiness,
} from "lucide-react";

type RowData = Record<string, string>;
type ResultData = {
  inviters: RowData[];
  calon: RowData[];
  invitersPro: RowData[];
  calonPro: RowData[];
};
type TabKey = "calon" | "inviter" | "calonPro" | "inviterPro";
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
const tabLabels: Record<TabKey, string> = {
  calon: "Calon STC Alumni",
  inviter: "Inviter Alumni",
  calonPro: "Calon STC Profesional",
  inviterPro: "Invitor Profesional",
};

export default function ResultPage() {
  const [accessKey, setAccessKey] = useState("");
  const [data, setData] = useState<ResultData | any>(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<TabKey>("calon");
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
        setData({
          inviters: body.inviters || [],
          calon: body.calon || [],
          invitersPro: body.invitersPro || [],
          calonPro: body.calonPro || [],
        });
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
  const inviterProMap = useMemo(
    () =>
      new Map(
        (data?.invitersPro || []).map((row: any) => [
          field(row, "id_invitorPro"),
          row,
        ]),
      ),
    [data],
  );
  const matches = (row: RowData, keys: string[]) =>
    keys
      .map((key) => field(row, key))
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase());
  const filteredCalon = useMemo(
    () =>
      (data?.calon || []).filter((row: any) => {
        const inviter: any = inviterMap.get(field(row, "inviter_id")) || {};
        return [
          field(row, "nama_calonSTC", "nama_calonstc"),
          field(row, "email"),
          field(row, "whatsapp"),
          field(row, "kota"),
          field(row, "nama_perusahaan"),
          field(inviter, "nama_alumni"),
          field(row, "inviter_id"),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());
      }),
    [data, inviterMap, query],
  );
  const filteredInviters = useMemo(
    () =>
      (data?.inviters || []).filter((row: any) =>
        matches(row, [
          "nama_alumni",
          "whatsapp_alumni",
          "email_alumni",
          "kota_alumni",
          "id_inviter",
          "program",
        ]),
      ),
    [data, query],
  );
  const filteredCalonPro = useMemo(
    () =>
      (data?.calonPro || []).filter((row: any) => {
        const inviter: any =
          inviterProMap.get(field(row, "invitorPro_id")) || {};
        return [
          field(row, "nama_calonSTC", "nama_calonstc"),
          field(row, "email"),
          field(row, "whatsapp"),
          field(row, "kota"),
          field(row, "nama_perusahaan"),
          field(inviter, "nama_profesional"),
          field(inviter, "nama_perusahaan"),
          field(inviter, "jabatan"),
          field(row, "invitorPro_id"),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());
      }),
    [data, inviterProMap, query],
  );
  const filteredInvitersPro = useMemo(
    () =>
      (data?.invitersPro || []).filter((row: any) =>
        matches(row, [
          "nama_profesional",
          "nama_perusahaan",
          "jabatan",
          "whatsapp",
          "email",
          "kota",
          "id_invitorPro",
        ]),
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
            Masukkan kunci akses admin untuk melihat data alumni, profesional,
            dan calon STC.
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

  const totalInviters = data.inviters.length + data.invitersPro.length;
  const totalCalon = data.calon.length + data.calonPro.length;
  return (
    <main className="min-h-screen bg-stone-50/60 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[#760909]">
              Akademi Trainer · STC
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
              Data pendaftaran
            </h1>
            <p className="mt-2 text-sm text-stone-500">
              Pantau pendaftar dari jalur alumni dan profesional dalam satu
              dashboard.
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
        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            label="Total pengundang"
            value={totalInviters}
            note={`${data.inviters.length} alumni · ${data.invitersPro.length} profesional`}
            icon={<UserRound size={20} />}
            tone="maroon"
          />
          <Stat
            label="Total calon STC"
            value={totalCalon}
            note={`${data.calon.length} dari alumni · ${data.calonPro.length} dari profesional`}
            icon={<Users size={20} />}
            tone="green"
          />
          <Stat
            label="Pengundang profesional"
            value={data.invitersPro.length}
            note="Sheet invitorPro"
            icon={<BriefcaseBusiness size={20} />}
            tone="teal"
          />
          <Stat
            label="Calon STC profesional"
            value={data.calonPro.length}
            note="Sheet calonSTCPro"
            icon={<ClipboardList size={20} />}
            tone="teal"
          />
        </section>
        <section className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-stone-100 p-4 md:p-5">
            <div className="flex flex-wrap gap-1.5 rounded-xl bg-stone-100 p-1">
              {(["calon", "inviter", "calonPro", "inviterPro"] as TabKey[]).map(
                (key) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${tab === key ? (key.endsWith("Pro") ? "bg-white text-teal-800 shadow-sm" : "bg-white text-[#760909] shadow-sm") : "text-stone-500 hover:text-stone-800"}`}
                  >
                    {tabLabels[key]}{" "}
                    <span className="ml-1 text-xs">
                      {key === "calon"
                        ? data.calon.length
                        : key === "inviter"
                          ? data.inviters.length
                          : key === "calonPro"
                            ? data.calonPro.length
                            : data.invitersPro.length}
                    </span>
                  </button>
                ),
              )}
            </div>
            <div className="relative w-full md:max-w-md">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama, WhatsApp, email, perusahaan…"
                className="h-10 w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 text-sm outline-none focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
              />
            </div>
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <p className="text-xs text-stone-500">
              {tab === "calon"
                ? `${filteredCalon.length} calon STC ditampilkan`
                : tab === "inviter"
                  ? `${filteredInviters.length} inviter ditampilkan`
                  : tab === "calonPro"
                    ? `${filteredCalonPro.length} calon STC profesional ditampilkan`
                    : `${filteredInvitersPro.length} profesional ditampilkan`}
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs text-stone-400">
              <ClipboardList size={14} /> Data Google Sheets
            </span>
          </div>
          <div className="overflow-x-auto">
            {tab === "calon" && (
              <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
                <thead>
                  <tr>
                    {[
                      "Calon STC",
                      "Pekerjaan / Perusahaan",
                      "Kontak",
                      "Kota",
                      "Alumni pengundang",
                      "ID Inviter",
                    ].map((h) => (
                      <Th key={h}>{h}</Th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCalon.map((row: any, i: any) => {
                    const inviter: any =
                      inviterMap.get(field(row, "inviter_id")) || {};
                    return (
                      <tr
                        key={field(row, "id_calonSTC") || i}
                        className="hover:bg-stone-50"
                      >
                        <Td>
                          <MainText>
                            {field(row, "nama_calonSTC", "nama_calonstc") ||
                              "—"}
                          </MainText>
                          <SubText>
                            {field(row, "email") || "Email belum tersedia"}
                          </SubText>
                        </Td>
                        <Td>
                          <MainText>{field(row, "pekerjaan") || "—"}</MainText>
                          <SubText>
                            {field(row, "nama_perusahaan") || "—"}
                          </SubText>
                        </Td>
                        <Td>
                          <MainText>{field(row, "whatsapp") || "—"}</MainText>
                          <WhatsAppLink value={field(row, "whatsapp")} />
                        </Td>
                        <Td>{field(row, "kota") || "—"}</Td>
                        <Td>
                          <MainText>
                            {field(inviter, "nama_alumni") || "Tidak ditemukan"}
                          </MainText>
                          <SubText>{field(inviter, "whatsapp_alumni")}</SubText>
                        </Td>
                        <Td>
                          <Id value={field(row, "inviter_id")} />
                        </Td>
                      </tr>
                    );
                  })}
                  {filteredCalon.length === 0 && <Empty cols={6} />}
                </tbody>
              </table>
            )}
            {tab === "inviter" && (
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead>
                  <tr>
                    {[
                      "Alumni",
                      "Program",
                      "Kontak",
                      "Kota",
                      "ID Inviter",
                      "Jumlah rekan",
                    ].map((h) => (
                      <Th key={h}>{h}</Th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredInviters.map((row: any, i: any) => {
                    const id = field(row, "id_inviter");
                    return (
                      <tr key={id || i} className="hover:bg-stone-50">
                        <Td>
                          <MainText>
                            {field(row, "nama_alumni") || "—"}
                          </MainText>
                          <SubText>{field(row, "email_alumni")}</SubText>
                        </Td>
                        <Td>
                          <MainText>{field(row, "program") || "—"}</MainText>
                          <SubText>{field(row, "tahun_program")}</SubText>
                        </Td>
                        <Td>
                          <MainText>
                            {field(row, "whatsapp_alumni") || "—"}
                          </MainText>
                          <WhatsAppLink value={field(row, "whatsapp_alumni")} />
                        </Td>
                        <Td>{field(row, "kota_alumni") || "—"}</Td>
                        <Td>
                          <Id value={id} />
                        </Td>
                        <Td>
                          <Pill>
                            {
                              data.calon.filter(
                                (c: any) => field(c, "inviter_id") === id,
                              ).length
                            }{" "}
                            calon
                          </Pill>
                        </Td>
                      </tr>
                    );
                  })}
                  {filteredInviters.length === 0 && <Empty cols={6} />}
                </tbody>
              </table>
            )}
            {tab === "calonPro" && (
              <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
                <thead>
                  <tr>
                    {[
                      "Calon STC",
                      "Pekerjaan / Perusahaan",
                      "Kontak",
                      "Kota",
                      "Profesional pengundang",
                      "Perusahaan / Jabatan",
                      "ID InvitorPro",
                    ].map((h) => (
                      <Th key={h} tone="teal">
                        {h}
                      </Th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCalonPro.map((row: any, i: any) => {
                    const inviter: any =
                      inviterProMap.get(field(row, "invitorPro_id")) || {};
                    return (
                      <tr
                        key={field(row, "id_calonSTCPro") || i}
                        className="hover:bg-teal-50/40"
                      >
                        <Td>
                          <MainText>
                            {field(row, "nama_calonSTC", "nama_calonstc") ||
                              "—"}
                          </MainText>
                          <SubText>
                            {field(row, "email") || "Email belum tersedia"}
                          </SubText>
                        </Td>
                        <Td>
                          <MainText>{field(row, "pekerjaan") || "—"}</MainText>
                          <SubText>
                            {field(row, "nama_perusahaan") || "—"}
                          </SubText>
                        </Td>
                        <Td>
                          <MainText>{field(row, "whatsapp") || "—"}</MainText>
                          <WhatsAppLink value={field(row, "whatsapp")} />
                        </Td>
                        <Td>{field(row, "kota") || "—"}</Td>
                        <Td>
                          <MainText>
                            {field(inviter, "nama_profesional") ||
                              "Tidak ditemukan"}
                          </MainText>
                          <SubText>{field(inviter, "whatsapp")}</SubText>
                        </Td>
                        <Td>
                          <MainText>
                            {field(inviter, "nama_perusahaan") || "—"}
                          </MainText>
                          <SubText>{field(inviter, "jabatan")}</SubText>
                        </Td>
                        <Td>
                          <Id value={field(row, "invitorPro_id")} />
                        </Td>
                      </tr>
                    );
                  })}
                  {filteredCalonPro.length === 0 && <Empty cols={7} />}
                </tbody>
              </table>
            )}
            {tab === "inviterPro" && (
              <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
                <thead>
                  <tr>
                    {[
                      "Profesional",
                      "Perusahaan",
                      "Jabatan",
                      "Kontak",
                      "Kota",
                      "ID InvitorPro",
                      "Jumlah rekan",
                    ].map((h) => (
                      <Th key={h} tone="teal">
                        {h}
                      </Th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredInvitersPro.map((row: any, i: any) => {
                    const id = field(row, "id_invitorPro");
                    return (
                      <tr key={id || i} className="hover:bg-teal-50/40">
                        <Td>
                          <MainText>
                            {field(row, "nama_profesional") || "—"}
                          </MainText>
                          <SubText>{field(row, "email")}</SubText>
                        </Td>
                        <Td>{field(row, "nama_perusahaan") || "—"}</Td>
                        <Td>{field(row, "jabatan") || "—"}</Td>
                        <Td>
                          <MainText>{field(row, "whatsapp") || "—"}</MainText>
                          <WhatsAppLink value={field(row, "whatsapp")} />
                        </Td>
                        <Td>{field(row, "kota") || "—"}</Td>
                        <Td>
                          <Id value={id} />
                        </Td>
                        <Td>
                          <Pill tone="teal">
                            {
                              data.calonPro.filter(
                                (c: any) => field(c, "invitorPro_id") === id,
                              ).length
                            }{" "}
                            calon
                          </Pill>
                        </Td>
                      </tr>
                    );
                  })}
                  {filteredInvitersPro.length === 0 && <Empty cols={7} />}
                </tbody>
              </table>
            )}
          </div>
          <footer className="flex flex-col gap-1 border-t border-stone-100 bg-stone-50/60 px-5 py-3 text-xs text-stone-400 sm:flex-row sm:items-center sm:justify-between">
            <span>Nomor WhatsApp menyediakan tombol chat langsung.</span>
            <span className="inline-flex items-center gap-1">
              Formulir:{" "}
              <a
                href="/"
                className="font-semibold text-[#760909] hover:underline"
              >
                Alumni <ArrowUpRight size={12} />
              </a>
              <span className="mx-1">·</span>
              <a
                href="/profesional"
                className="font-semibold text-teal-700 hover:underline"
              >
                Profesional <ArrowUpRight size={12} />
              </a>
            </span>
          </footer>
        </section>
      </div>
    </main>
  );
}
function Stat({
  label,
  value,
  note,
  icon,
  tone,
}: {
  label: string;
  value: number;
  note: string;
  icon: React.ReactNode;
  tone: "maroon" | "green" | "teal";
}) {
  const color =
    tone === "maroon"
      ? "bg-[#760909]/10 text-[#760909]"
      : tone === "teal"
        ? "bg-teal-50 text-teal-700"
        : "bg-emerald-50 text-emerald-700";
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-stone-500">{label}</span>
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-stone-900">
        {value}
      </p>
      <p className="mt-1 text-xs text-stone-400">{note}</p>
    </div>
  );
}
function Th({
  children,
  tone = "maroon",
}: {
  children: React.ReactNode;
  tone?: "maroon" | "teal";
}) {
  return (
    <th
      className={`border-b border-stone-100 px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide ${tone === "teal" ? "bg-teal-50/70 text-teal-800" : "bg-stone-50 text-stone-500"}`}
    >
      {children}
    </th>
  );
}
function Td({ children }: { children: React.ReactNode }) {
  return (
    <td className="border-b border-stone-100 px-5 py-4 align-top text-stone-600">
      {children}
    </td>
  );
}
function MainText({ children }: { children: React.ReactNode }) {
  return <p className="mb-1 font-semibold text-stone-900">{children}</p>;
}
function SubText({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-xs text-stone-400">{children}</p>;
}
function Id({ value }: { value: string }) {
  return (
    <code className="rounded-md bg-stone-100 px-2 py-1 text-[11px] text-stone-600">
      {value || "—"}
    </code>
  );
}
function Pill({
  children,
  tone = "green",
}: {
  children: React.ReactNode;
  tone?: "green" | "teal";
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone === "teal" ? "bg-teal-50 text-teal-700" : "bg-emerald-50 text-emerald-700"}`}
    >
      {children}
    </span>
  );
}
function Empty({ cols }: { cols: number }) {
  return (
    <tr>
      <td
        colSpan={cols}
        className="px-5 py-14 text-center text-sm text-stone-400"
      >
        Tidak ada data yang cocok dengan pencarian.
      </td>
    </tr>
  );
}
