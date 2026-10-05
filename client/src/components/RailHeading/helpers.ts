// The title split so its last word can travel with the chevron: a wrapped
// title then never leaves the chevron alone on a line, nor far from the last
// word. `lead` keeps its trailing space; a one-word title has an empty lead.
export const splitLastWord = (title: string): { lead: string; last: string } => {
  const lastSpace = title.lastIndexOf(' ');
  if (lastSpace === -1) return { lead: '', last: title };

  return { lead: title.slice(0, lastSpace + 1), last: title.slice(lastSpace + 1) };
};
