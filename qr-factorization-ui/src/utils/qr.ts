export type Matrix = number[][];

export function sanitizeNumeric(value: string): string {
  if (value === "") return "";

  let hasSign = false;
  if (value.startsWith("-") || value.startsWith("+")) {
    hasSign = true;
    value = value.slice(1);
  }
  value = value.replace(/[^0-9.]/g, "");
  const firstDot = value.indexOf(".");
  if (firstDot !== -1) {
    value =
      value.slice(0, firstDot + 1) + value.slice(firstDot + 1).replace(/\./g, "");
  }
  return (hasSign ? "-" : "") + value;
}

export function parseNumber(raw: string): number {
  const s = raw.trim();
  if (s === "") return 0;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

export function fmt(x: number, digits = 4): string {
  if (!Number.isFinite(x)) return "–";
  if (x === 0) return "0";
  const ax = Math.abs(x);
  if (ax < 10 ** -6 || ax >= 10 ** 9) return x.toExponential(digits);
  return String(Number(x.toFixed(digits)));
}
