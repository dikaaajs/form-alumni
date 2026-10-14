export type Colleague = {
  name: string;
  birthDate: string;
  occupation: string;
  companyName: string;
  email: string;
  whatsapp: string;
  city: string;
  socialMedia: string;
};

export type Submission = {
  alumniName: string;
  program: "STC" | "HC" | "EC" | "";
  programYear: string;
  whatsapp: string;
  email: string;
  city: string;
  socialMedia: string;
  colleagues: Colleague[];
};

export function ageOnDate(birthDate: string, today = new Date()): number {
  // Input type=date menghasilkan format YYYY-MM-DD.
  // Gunakan tanggal lokal agar tidak bergeser karena konversi UTC.
  if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return -1;

  const [year, month, day] = birthDate.split("-").map(Number);
  const dob = new Date(year, month - 1, day);

  if (
    Number.isNaN(dob.getTime()) ||
    dob.getFullYear() !== year ||
    dob.getMonth() !== month - 1 ||
    dob.getDate() !== day
  ) return -1;

  let age = today.getFullYear() - year;
  const birthdayNotReached =
    today.getMonth() < month - 1 ||
    (today.getMonth() === month - 1 && today.getDate() < day);

  if (birthdayNotReached) age--;
  return age;
}

/** Validasi format nomor seluler Indonesia, bukan verifikasi OTP. */
export function isValidWhatsApp(value: string): boolean {
  const digits = (value || "").replace(/\D/g, "");
  let nationalNumber = digits;

  if (nationalNumber.startsWith("62")) nationalNumber = nationalNumber.slice(2);
  else if (nationalNumber.startsWith("0")) nationalNumber = nationalNumber.slice(1);

  return /^8\d{7,12}$/.test(nationalNumber);
}

export function validateSubmission(data: Submission): string | null {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.alumniName?.trim()) return "Nama alumni wajib diisi.";
  if (!data.program || !["STC", "HC", "EC"].includes(data.program)) return "Pilih program pelatihan alumni.";
  if (!/^\d{4}$/.test(data.programYear) || Number(data.programYear) < 1900 || Number(data.programYear) > new Date().getFullYear()) return "Tahun program harus berupa tahun yang valid (YYYY).";
  if (!data.whatsapp?.trim()) return "Nomor WhatsApp alumni wajib diisi.";
  if (!isValidWhatsApp(data.whatsapp)) return "Nomor WhatsApp alumni tidak valid. Gunakan format 08xxxxxxxxxx atau +628xxxxxxxxxx.";
  if (!emailPattern.test(data.email || "")) return "Email alumni tidak valid.";
  if (!data.city?.trim()) return "Kota domisili alumni wajib diisi.";
  if (!data.socialMedia?.trim()) return "Akun sosial media alumni wajib diisi.";
  if (!Array.isArray(data.colleagues) || data.colleagues.length !== 3) return "Data harus berisi tepat 3 rekan.";

  for (let i = 0; i < data.colleagues.length; i++) {
    const c = data.colleagues[i];
    const label = `Rekan ${i + 1}`;
    if (!c?.name?.trim()) return `${label}: nama wajib diisi.`;
    const age = ageOnDate(c.birthDate);
    if (age < 18) return age < 0 ? `${label}: tanggal lahir tidak valid.` : `${label}: wajib berusia minimal 18 tahun.`;
    if (!c.occupation?.trim()) return `${label}: pekerjaan wajib diisi.`;
    if (!c.companyName?.trim()) return `${label}: nama perusahaan wajib diisi.`;
    if (c.whatsapp?.trim() && !isValidWhatsApp(c.whatsapp)) return `${label}: nomor WhatsApp tidak valid. Gunakan format 08xxxxxxxxxx atau +628xxxxxxxxxx.`;
    if (!c.whatsapp?.trim()) return `${label}: nomor WhatsApp wajib diisi.`;
    if (!emailPattern.test(c.email || "")) return `${label}: alamat email tidak valid.`;
    if (!c.city?.trim()) return `${label}: kota domisili wajib diisi.`;
    if (!c.socialMedia?.trim()) return `${label}: akun sosial media wajib diisi.`;
  }
  return null;
}
