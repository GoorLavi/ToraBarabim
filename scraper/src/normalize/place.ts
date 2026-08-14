// Splits a combined place string such as `ביה"כ אור ישראל, ביאליק 28` into
// a place name and a street address. Sources separate the two with a
// comma; without one, the whole string is the name and the address is a
// gap rather than a guess at where the split should be.
export const splitPlace = (text: string): { name?: string; address?: string } => {
  const trimmed = text.trim();
  if (!trimmed) return {};

  const commaIndex = trimmed.indexOf(',');
  if (commaIndex === -1) return { name: trimmed };

  const name = trimmed.slice(0, commaIndex).trim();
  const address = trimmed.slice(commaIndex + 1).trim();
  return {
    name: name || undefined,
    address: address || undefined,
  };
};
