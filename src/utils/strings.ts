export const capitalize = <T extends string>(s: T) =>
  (s[0].toUpperCase() + s.slice(1)) as Capitalize<typeof s>;

export function formatKeyMessage(key: string) {
  return capitalize(
    `${key
      .replaceAll(/(?!^)([A-Z])/g, " $1")
      .toLowerCase()
      .trim()}?`,
  );
}

/**
 * Generates a random string of specified length using alphanumeric characters.
 *
 * @param {number} n - The length of the random string to generate.
 * @returns {string} A randomly generated string of length n.
 */
export function generateRandomString(n: number): string {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < n; i++) {
    const index = Math.floor(Math.random() * characters.length);
    result += characters.charAt(index);
  }
  return result;
}
