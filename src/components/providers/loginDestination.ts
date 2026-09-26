const TRUSTED_ORIGIN = "https://tcmudah.invalid";

function containsControlCharacter(value: string): boolean {
  return Array.from(value).some((character) => {
    const code = character.charCodeAt(0);
    return code < 32 || code === 127;
  });
}

export function getSafeLoginDestination(value: string | null): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    containsControlCharacter(value)
  ) {
    return "/";
  }

  try {
    const destination = new URL(value, TRUSTED_ORIGIN);
    if (
      destination.origin !== TRUSTED_ORIGIN ||
      destination.pathname.startsWith("//")
    ) {
      return "/";
    }
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return "/";
  }
}
