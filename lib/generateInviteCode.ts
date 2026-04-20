const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function generateInviteCode(): string {
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return "NUD·" + suffix;
}
