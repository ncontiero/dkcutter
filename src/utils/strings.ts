export const capitalize = <T extends string>(s: T) =>
  (s[0].toUpperCase() + s.slice(1)) as Capitalize<typeof s>;

/**
 * Formats a key into a human-readable message with proper capitalization.
 *
 * This function transforms a key string into a formatted message by inserting spaces before capital letters,
 * converting to lowercase, trimming whitespace, and capitalizing the first letter.
 *
 * @param {string} key - The key string to be formatted into a message.
 * @returns {string} - The formatted key message.
 */
export function formatKeyMessage(key: string): string {
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
