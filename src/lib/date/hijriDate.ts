const HIJRI_DAY_OFFSET = -1;

const HIJRI_MONTHS: Record<string, string> = {
  "1": "Muharram",
  "2": "Safar",
  "3": "Rabi al-Awwal",
  "4": "Rabi al-Thani",
  "5": "Jumada al-Awwal",
  "6": "Jumada al-Thani",
  "7": "Rajab",
  "8": "Sha'ban",
  "9": "Ramadan",
  "10": "Shawwal",
  "11": "Dhul-Qi'dah",
  "12": "Dhul-Hijjah",
};

const HIJRI_MONTH_ALIASES: Record<string, string> = {
  muharram: "Muharram",
  safar: "Safar",
  "rabi al-awwal": "Rabi al-Awwal",
  "rabi i": "Rabi al-Awwal",
  "rabi al-thani": "Rabi al-Thani",
  "rabi ii": "Rabi al-Thani",
  "jumada al-awwal": "Jumada al-Awwal",
  "jumada i": "Jumada al-Awwal",
  "jumada al-thani": "Jumada al-Thani",
  "jumada ii": "Jumada al-Thani",
  rajab: "Rajab",
  shaban: "Sha'ban",
  "sha'ban": "Sha'ban",
  ramadan: "Ramadan",
  shawwal: "Shawwal",
  "dhu al-qidah": "Dhul-Qi'dah",
  "dhu al-qiʻdah": "Dhul-Qi'dah",
  "dhul-qidah": "Dhul-Qi'dah",
  "dhul-qi'dah": "Dhul-Qi'dah",
  "dhu al-hijjah": "Dhul-Hijjah",
  "dhul-hijjah": "Dhul-Hijjah",
};

function withHijriOffset(date: Date) {
  const adjustedDate = new Date(date);
  adjustedDate.setDate(adjustedDate.getDate() + HIJRI_DAY_OFFSET);
  return adjustedDate;
}

function normalizeDigits(value: string) {
  return value
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0));
}

function parsePartNumber(value?: string) {
  if (!value) {
    return null;
  }

  const number = Number.parseInt(normalizeDigits(value).replace(/[^\d]/g, ""), 10);
  return Number.isFinite(number) ? number : null;
}

function normalizeMonthName(value?: string) {
  if (!value) {
    return null;
  }

  const key = normalizeDigits(value)
    .toLowerCase()
    .replace(/ah|a\.h\.|bc|bce/g, "")
    .replace(/[’ʻ`]/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  return HIJRI_MONTH_ALIASES[key] ?? null;
}

function getHijriParts(date: Date, monthFormat: "numeric" | "long") {
  return new Intl.DateTimeFormat("en-US-u-ca-islamic", {
    day: "numeric",
    month: monthFormat,
    year: "numeric",
  }).formatToParts(withHijriOffset(date));
}

export function formatHijriDate(date: Date): string {
  try {
    const numericParts = getHijriParts(date, "numeric");
    const day = parsePartNumber(numericParts.find((part) => part.type === "day")?.value);
    const monthNumber = parsePartNumber(numericParts.find((part) => part.type === "month")?.value);
    const year = parsePartNumber(numericParts.find((part) => part.type === "year")?.value);
    const monthName = monthNumber ? HIJRI_MONTHS[String(monthNumber)] : null;

    if (day && monthName && year) {
      return `${day} ${monthName} ${year} AH`;
    }

    const longParts = getHijriParts(date, "long");
    const fallbackDay = parsePartNumber(longParts.find((part) => part.type === "day")?.value);
    const fallbackMonth = normalizeMonthName(longParts.find((part) => part.type === "month")?.value);
    const fallbackYear = parsePartNumber(longParts.find((part) => part.type === "year")?.value);

    if (fallbackDay && fallbackMonth && fallbackYear) {
      return `${fallbackDay} ${fallbackMonth} ${fallbackYear} AH`;
    }

    return "";
  } catch {
    return "";
  }
}

export function formatHijriMonthYear(date: Date): string {
  const hijriDate = formatHijriDate(date);
  const match = hijriDate.match(/^\d+\s+(.+)\s+(\d+)\s+AH$/);

  return match ? `${match[1]} ${match[2]} AH` : "";
}
