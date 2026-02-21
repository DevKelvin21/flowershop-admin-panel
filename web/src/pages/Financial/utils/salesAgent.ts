function capitalizeWord(word: string): string {
  if (word.length === 0) return '';
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function deriveSalesAgentFromEmail(email: string | null | undefined): string {
  if (!email) return '';

  const [localPart = ''] = email.split('@');
  const normalizedLocalPart = localPart.split('+')[0] ?? '';

  const nameParts = normalizedLocalPart
    .split(/[._-]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  if (nameParts.length === 0) return '';
  return nameParts.map(capitalizeWord).join(' ');
}
