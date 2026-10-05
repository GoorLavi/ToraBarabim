import { LEADING_HONORIFIC_QUERY_PATTERNS } from './consts';
import type { RabbiNameQuery, RabbiNameFields } from './models';

const parseRabbiNameQuery = (query: string): RabbiNameQuery => {
  const needle = query.trim();
  for (const [pattern, honorific] of LEADING_HONORIFIC_QUERY_PATTERNS) {
    const match = needle.match(pattern);
    if (!match) continue;

    const rest = needle.slice(match[0].length).trim();
    return rest ? { kind: 'name', needle: rest } : { kind: 'honorific', honorific };
  }
  return { kind: 'name', needle };
};

// Returns the predicate for one search query, parsed once rather than per
// rabbi. A leading honorific is stripped because the stored name is bare;
// it is not required to agree with the rabbi's own, and a query that is only
// the honorific matches every rabbi carrying it. How the remaining text is
// compared with the name stays the caller's (`nameIncludes`), since the
// lesson search and the rabbi directory normalise differently.
export const rabbiNameMatcher = (
  query: string,
  nameIncludes: (name: string, needle: string) => boolean,
): ((rabbi: RabbiNameFields) => boolean) => {
  const parsed = parseRabbiNameQuery(query);
  if (parsed.kind === 'honorific') {
    const { honorific } = parsed;
    return (rabbi) => rabbi.honorific === honorific;
  }
  return (rabbi) => nameIncludes(rabbi.name, parsed.needle);
};
