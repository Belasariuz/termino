export const PASSWORD_MIN_LENGTH = 8;

export function validatePassword(wachtwoord: string): string | null {
  if (wachtwoord.length < PASSWORD_MIN_LENGTH) {
    return `Het wachtwoord moet minimaal ${PASSWORD_MIN_LENGTH} tekens lang zijn.`;
  }
  if (!/[a-z]/.test(wachtwoord) || !/[A-Z]/.test(wachtwoord)) {
    return "Het wachtwoord moet zowel kleine als hoofdletters bevatten.";
  }
  if (!/[0-9]/.test(wachtwoord)) {
    return "Het wachtwoord moet minimaal één cijfer bevatten.";
  }
  return null;
}
