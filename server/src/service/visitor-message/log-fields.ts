const readString = (source: unknown, key: string): string | undefined => {
  if (typeof source !== 'object' || source === null || !(key in source)) return undefined;
  const value: unknown = Reflect.get(source, key);
  return typeof value === 'string' ? value : undefined;
};

// What may be logged about an unexpected failure on a route that carries a
// visitor's name, phone or message, or a handling note. Never the error
// itself: Drizzle's query error holds the SQL and its `params`, which are
// exactly that payload, and a Postgres `detail` can quote a value. Only the
// error names and the Postgres code and constraint, which cannot.
export const toPayloadFreeLogFields = (error: unknown): Record<string, string | undefined> => {
  const cause = error instanceof Error ? error.cause : undefined;
  return {
    errorName: error instanceof Error ? error.name : typeof error,
    causeName: cause instanceof Error ? cause.name : undefined,
    pgCode: readString(cause, 'code'),
    pgConstraint: readString(cause, 'constraint_name'),
  };
};
