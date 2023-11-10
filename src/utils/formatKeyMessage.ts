export function formatKeyMessage(key: string) {
  return key
    .split("")
    .map((char) => (char.toUpperCase() === char ? ` ${char}` : char))
    .map((char, i) => (i === 0 ? char.toUpperCase() : char.toLowerCase()))
    .join("")
    .concat("?");
}
