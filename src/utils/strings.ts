export const capitalize = <T extends string>(s: T) =>
  (s[0].toUpperCase() + s.slice(1)) as Capitalize<typeof s>;

export function formatKeyMessage(key: string) {
  return capitalize(
    key
      .replace(/(?!^)([A-Z])/g, " $1")
      .toLowerCase()
      .trim() + "?",
  );
}
