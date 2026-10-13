"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CircleUserRound,
  GraduationCap,
  UsersRound,
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  BriefcaseBusiness,
  Instagram,
  Linkedin,
  ShieldCheck,
  Sparkles,
  LoaderCircle,
  AlertCircle,
  Check,
} from "lucide-react";
import { ageOnDate, type Colleague, type Submission } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const emptyColleague: Colleague = {
  name: "",
  birthDate: "",
  occupation: "",
  email: "",
  whatsapp: "",
  city: "",
  socialMedia: "",
};
const initial: Submission = {
  alumniName: "",
  program: "",
  programYear: "",
  whatsapp: "",
  email: "",
  city: "",
  socialMedia: "",
  colleagues: [
    { ...emptyColleague },
    { ...emptyColleague },
    { ...emptyColleague },
  ],
};

function Field({
  label,
  required,
  icon,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-[13px] font-semibold text-foreground/90">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        {label}
        {required && <span className="text-primary">*</span>}
      </Label>
      {children}
      {hint && (
        <p className="text-xs leading-5 text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

function SectionHeading({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-primary ring-1 ring-primary/10">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[.18em] text-primary">
            Bagian {number}
          </span>
          {number !== "1" && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
              Wajib usia 18+
            </span>
          )}
        </div>
        <h2 className="text-xl font-bold tracking-tight sm:text-[22px]">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const [form, setForm] = useState<Submission>(initial);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);
  const completedFriends = form.colleagues.filter(
    (c) =>
      c.name.trim() &&
      ageOnDate(c.birthDate) >= 18 &&
      c.occupation.trim() &&
      c.email.trim() &&
      c.whatsapp.trim() &&
      c.city.trim(),
  ).length;

  function update<K extends keyof Submission>(key: K, value: Submission[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  function updateColleague(index: number, key: keyof Colleague, value: string) {
    setForm((prev) => ({
      ...prev,
      colleagues: prev.colleagues.map((c, i) =>
        i === index ? { ...c, [key]: value } : c,
      ),
    }));
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(false);
    const underageIndex = form.colleagues.findIndex(
      (c) => ageOnDate(c.birthDate) < 18,
    );
    if (underageIndex !== -1) {
      setError(
        `Rekan ${underageIndex + 1} harus berusia minimal 18 tahun. Periksa kembali tanggal lahir.`,
      );
      document.getElementById(`friend-${underageIndex + 1}-birthdate`)?.focus();
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Data gagal dikirim.");
      setSuccess(true);
      setForm({
        ...initial,
        colleagues: [
          { ...emptyColleague },
          { ...emptyColleague },
          { ...emptyColleague },
        ],
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Terjadi kesalahan. Silakan coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 pb-12 pt-5 sm:px-6 sm:pt-10">
      <div className="mx-auto max-w-4xl">
        <nav className="mb-7 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">
                Akademi Trainer
              </p>
              <p className="text-[11px] text-muted-foreground">
                Alumni Community
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-1.5 rounded-full border bg-white/80 px-3 py-1.5 text-xs font-medium text-muted-foreground sm:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Form resmi
            pendataan
          </div>
        </nav>

        <section className="relative mb-6 overflow-hidden rounded-[28px] bg-[#2b1113] px-6 py-8 text-white shadow-xl shadow-primary/10 sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-2 -top-10 h-44 w-44 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute bottom-0 right-24 h-24 w-24 rounded-full bg-primary/30 blur-2xl" />
          <div className="relative max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-white/90">
              <Sparkles className="h-3.5 w-3.5" /> ALUMNI REFERRAL PROGRAM
            </div>
            <h1 className="max-w-xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Ajak rekan, <span className="text-rose-200">perluas dampak.</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/70 sm:text-base sm:leading-7">
              Lengkapi data alumni dan tiga rekan atau kolega yang ingin Anda
              ajak. Pastikan seluruh informasi sudah benar sebelum dikirim.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs font-medium text-white/75">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-rose-200" /> 4 profil
                dalam satu formulir
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-rose-200" /> Data dijaga
                kerahasiaannya
              </span>
            </div>
          </div>
          <div className="relative mt-7 rounded-2xl border border-white/15 bg-white/[.07] p-4 sm:max-w-sm">
            <div className="mb-2 flex items-center justify-between text-xs text-white/65">
              <span>Data rekan terisi</span>
              <span>{completedFriends} dari 3</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-rose-200 transition-all duration-300"
                style={{ width: `${(completedFriends / 3) * 100}%` }}
              />
            </div>
          </div>
        </section>

        {success && (
          <div
            role="status"
            className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Data berhasil dikirim</p>
              <p className="mt-1">
                Terima kasih. Data alumni dan rekan telah tersimpan.
              </p>
            </div>
          </div>
        )}
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Periksa kembali data Anda</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={submit} className="space-y-5">
          <Card className="overflow-hidden border-border/80 shadow-sm shadow-black/[.02]">
            <CardHeader className="pb-2 sm:p-7">
              <SectionHeading
                number="1"
                title="Data alumni"
                description="Informasi alumni yang mengajak rekan atau kolega."
                icon={<CircleUserRound className="h-5 w-5" />}
              />
            </CardHeader>
            <CardContent className="grid gap-x-5 gap-y-5 sm:grid-cols-2 sm:px-7 sm:pb-7">
              <Field label="Nama lengkap" required>
                <Input
                  autoComplete="name"
                  required
                  value={form.alumniName}
                  onChange={(e) => update("alumniName", e.target.value)}
                  placeholder="Contoh: Amir Pratama"
                />
              </Field>
              <Field label="Program pelatihan" required>
                <Select
                  required
                  value={form.program}
                  onValueChange={(v) =>
                    update("program", v as Submission["program"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih program pelatihan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STC">STC — Speak to Change</SelectItem>
                    <SelectItem value="HC">HC — Happy Counselor</SelectItem>
                    <SelectItem value="EC">
                      EC — Engaging Communication
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field
                label="Tahun program"
                required
                hint="Gunakan format 4 digit, contoh 2026."
              >
                <Input
                  required
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  min="1900"
                  max={new Date().getFullYear()}
                  maxLength={4}
                  value={form.programYear}
                  onChange={(e) =>
                    update(
                      "programYear",
                      e.target.value.replace(/\D/g, "").slice(0, 4),
                    )
                  }
                  placeholder="2026"
                />
              </Field>
              <Field
                label="Nomor WhatsApp"
                required
                icon={<Phone className="h-3.5 w-3.5" />}
              >
                <Input
                  autoComplete="tel"
                  required
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => update("whatsapp", e.target.value)}
                  placeholder="08xxxxxxxxxx"
                />
              </Field>
              <Field
                label="Alamat email"
                required
                icon={<Mail className="h-3.5 w-3.5" />}
              >
                <Input
                  autoComplete="email"
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="nama@email.com"
                />
              </Field>
              <Field
                label="Kota domisili"
                required
                icon={<MapPin className="h-3.5 w-3.5" />}
              >
                <Input
                  required
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  placeholder="Contoh: Jakarta Selatan"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field
                  label="Akun sosial media"
                  icon={<Instagram className="h-3.5 w-3.5" />}
                  hint="Instagram atau LinkedIn; boleh berupa username atau tautan profil."
                >
                  <Input
                    value={form.socialMedia}
                    onChange={(e) => update("socialMedia", e.target.value)}
                    placeholder="@username atau https://linkedin.com/in/..."
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          {form.colleagues.map((c, i) => {
            const age = c.birthDate ? ageOnDate(c.birthDate) : null;
            const eligible = age !== null && age >= 18;
            return (
              <Card
                key={i}
                className="overflow-hidden border-border/80 shadow-sm shadow-black/[.02]"
              >
                <CardHeader className="pb-2 sm:p-7">
                  <SectionHeading
                    number={String(i + 2)}
                    title={`Rekan ${i + 1}`}
                    description="Isi data rekan atau kolega yang akan diajak."
                    icon={<UsersRound className="h-5 w-5" />}
                  />
                </CardHeader>
                <CardContent className="grid gap-x-5 gap-y-5 sm:grid-cols-2 sm:px-7 sm:pb-7">
                  <Field label="Nama lengkap" required>
                    <Input
                      required
                      autoComplete="name"
                      value={c.name}
                      onChange={(e) =>
                        updateColleague(i, "name", e.target.value)
                      }
                      placeholder="Nama lengkap rekan"
                    />
                  </Field>
                  <Field
                    label="Tanggal lahir"
                    required
                    hint="Rekan wajib berusia minimal 18 tahun."
                  >
                    <Input
                      id={`friend-${i + 1}-birthdate`}
                      required
                      type="date"
                      max={today}
                      value={c.birthDate}
                      onChange={(e) => {
                        const value = e.target.value;
                        const ageNow = ageOnDate(value);

                        updateColleague(i, "birthDate", value);

                        if (ageNow >= 18) {
                          setError((current) =>
                            /berusia minimal 18 tahun|belum memenuhi syarat/i.test(
                              current,
                            )
                              ? ""
                              : current,
                          );
                        }
                      }}
                    />

                    {age !== null && (
                      <div
                        className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${eligible ? "text-emerald-700" : "text-destructive"}`}
                      >
                        {eligible ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5" />
                        )}
                        {age < 0
                          ? "Tanggal lahir tidak valid."
                          : eligible
                            ? `Usia ${age} tahun — memenuhi syarat.`
                            : `Usia ${age} tahun — belum memenuhi syarat.`}
                      </div>
                    )}
                  </Field>
                  <Field
                    label="Pekerjaan"
                    required
                    icon={<BriefcaseBusiness className="h-3.5 w-3.5" />}
                  >
                    <Input
                      required
                      value={c.occupation}
                      onChange={(e) =>
                        updateColleague(i, "occupation", e.target.value)
                      }
                      placeholder="Contoh: HR Manager"
                    />
                  </Field>
                  <Field
                    label="Alamat email"
                    required
                    icon={<Mail className="h-3.5 w-3.5" />}
                  >
                    <Input
                      required
                      type="email"
                      autoComplete="email"
                      value={c.email}
                      onChange={(e) =>
                        updateColleague(i, "email", e.target.value)
                      }
                      placeholder="nama@email.com"
                    />
                  </Field>
                  <Field
                    label="Nomor WhatsApp"
                    required
                    icon={<Phone className="h-3.5 w-3.5" />}
                  >
                    <Input
                      required
                      type="tel"
                      autoComplete="tel"
                      value={c.whatsapp}
                      onChange={(e) =>
                        updateColleague(i, "whatsapp", e.target.value)
                      }
                      placeholder="08xxxxxxxxxx"
                    />
                  </Field>
                  <Field
                    label="Kota domisili"
                    required
                    icon={<MapPin className="h-3.5 w-3.5" />}
                  >
                    <Input
                      required
                      value={c.city}
                      onChange={(e) =>
                        updateColleague(i, "city", e.target.value)
                      }
                      placeholder="Contoh: Bandung"
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field
                      label="Akun sosial media"
                      icon={<Instagram className="h-3.5 w-3.5" />}
                    >
                      <Input
                        value={c.socialMedia}
                        onChange={(e) =>
                          updateColleague(i, "socialMedia", e.target.value)
                        }
                        placeholder="@username atau tautan profil"
                      />
                    </Field>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <div className="flex items-start gap-3 rounded-2xl border border-primary/10 bg-primary/[.035] p-4 text-sm leading-6 text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p>
              Kolom bertanda{" "}
              <span className="font-semibold text-primary">*</span> wajib diisi.
              Data tanggal lahir divalidasi otomatis dan diperiksa kembali di
              server. Form hanya dapat dikirim jika ketiga rekan berusia minimal
              18 tahun.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-center gap-3 px-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
                <Check className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  Sudah memeriksa semua data?
                </p>
                <p className="text-xs text-muted-foreground">
                  Pastikan email dan nomor WhatsApp benar.
                </p>
              </div>
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" /> Mengirim
                  data...
                </>
              ) : (
                <>
                  Kirim data <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>

        <footer className="mt-8 flex flex-col items-center justify-between gap-2 text-center text-xs text-muted-foreground sm:flex-row sm:text-left">
          <p>
            © {new Date().getFullYear()} Akademi Trainer. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> Pendataan alumni & komunitas
          </p>
        </footer>
      </div>
    </main>
  );
}
