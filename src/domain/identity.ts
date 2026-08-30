export const AVATAR_PALETTE = [
  "#c9b8f0",
  "#f0c3ad",
  "#a9cbb7",
  "#e7b1c4",
  "#b4c7e8",
  "#d8c69a",
];

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function hashIndex(name: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % mod;
}

export function avatarColor(name: string): string {
  return AVATAR_PALETTE[hashIndex(name, AVATAR_PALETTE.length)];
}
