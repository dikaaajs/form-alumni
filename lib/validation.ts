export type Colleague = {
  name: string;
  birthDate: string;
  occupation: string;
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
  if (!birthDate || birthDate.length !== 10) {
    return -1;
  }

  const parts = birthDate.split("-");

  if (parts.length !== 3) {
    return -1;
  }

  const [year, month, day] = parts.map(Number);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    year < 1 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return -1;
  }

  // Validasi tanggal menggunakan waktu lokal.
  const dob = new Date(year, month - 1, day);

  if (
    dob.getFullYear() !== year ||
    dob.getMonth() !== month - 1 ||
    dob.getDate() !== day
  ) {
    return -1;
  }

  let age = today.getFullYear() - year;

  const birthdayNotReached =
    today.getMonth() < month - 1 ||
    (today.getMonth() === month - 1 && today.getDate() < day);

  if (birthdayNotReached) {
    age--;
  }

  return age;
}

export function validateSubmission(data: Submission): string | null {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.alumniName?.trim()) return "Nama alumni wajib diisi.";
  if (!["STC", "HC", "EC"].includes(data.program))
    return "Pilih program pelatihan alumni.";
  if (
    !/^\d{4}$/.test(data.programYear) ||
    Number(data.programYear) < 1900 ||
    Number(data.programYear) > new Date().getFullYear()
  )
    return "Tahun program harus berupa tahun yang valid (YYYY).";
  if (!data.whatsapp?.trim()) return "Nomor WhatsApp alumni wajib diisi.";
  if (!emailPattern.test(data.email || "")) return "Email alumni tidak valid.";
  if (!data.city?.trim()) return "Kota domisili alumni wajib diisi.";
  if (!Array.isArray(data.colleagues) || data.colleagues.length !== 3)
    return "Data harus berisi tepat 3 rekan.";
  for (let i = 0; i < data.colleagues.length; i++) {
    const c = data.colleagues[i];
    const label = `Rekan ${i + 1}`;
    if (!c?.name?.trim()) return `${label}: nama wajib diisi.`;
    const age = ageOnDate(c.birthDate);
    if (age < 18)
      return age < 0
        ? `${label}: tanggal lahir tidak valid.`
        : `${label}: wajib berusia minimal 18 tahun.`;
    if (!c.occupation?.trim()) return `${label}: pekerjaan wajib diisi.`;
    if (!emailPattern.test(c.email || ""))
      return `${label}: alamat email tidak valid.`;
    if (!c.whatsapp?.trim()) return `${label}: nomor WhatsApp wajib diisi.`;
    if (!c.city?.trim()) return `${label}: kota domisili wajib diisi.`;
  }
  return null;
}
