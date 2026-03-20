export function normalizeLowercaseText(value?: string | null): string {
  return value?.trim().toLowerCase() ?? "";
}

