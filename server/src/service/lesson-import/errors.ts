// Fires when `apply`'s re-plan produces a digest different from the one the
// caller supplied: the file or the server's state (a decision, a rabbi, a
// hand edit) changed between plan and apply. Maps to 409 `plan_changed`.
export class PlanChangedError extends Error {
  constructor() {
    super('The plan changed since this digest was computed; re-plan and try again');
    this.name = 'PlanChangedError';
  }
}

// Fires when `apply` cannot acquire the advisory lock because another
// import run is already applying. Maps to 409 `import_busy`.
export class ImportBusyError extends Error {
  constructor() {
    super('Another import run is already being applied');
    this.name = 'ImportBusyError';
  }
}

// Fires when a decision names a rabbiId that does not exist. Maps to 400.
export class UnknownRabbiError extends Error {
  constructor(public readonly rabbiId: string) {
    super(`Expected an existing rabbi, found none with id '${rabbiId}'`);
    this.name = 'UnknownRabbiError';
  }
}

// Fires when a `link` decision names a rabbanit as its target: the import
// only ever deals with rabbis, so a name is never linked to a rabbanit,
// not even by hand. Maps to 400.
export class LinkTargetIsRabbanitError extends Error {
  constructor(public readonly rabbiId: string) {
    super(`Rabbi '${rabbiId}' is a rabbanit; the import never links a name to one`);
    this.name = 'LinkTargetIsRabbanitError';
  }
}

// Fires when a `city_alias` rule's value names a city code that does not
// exist in `cities`. Checked at decision time, not just at read time, so a
// typo'd code fails loudly the moment it is taught rather than silently
// never matching later. Maps to 400.
export class UnknownCityCodeError extends Error {
  constructor(public readonly cityCode: number) {
    super(`Expected an existing city code, got '${cityCode}'`);
    this.name = 'UnknownCityCodeError';
  }
}

// Fires when a `rule` decision's matchText already resolves through a
// built-in map: the built-in map always wins, so a rule that merely repeats
// it would never fire and is rejected instead of silently accepted. Maps to
// 400.
export class RuleCoversBuiltInError extends Error {
  constructor(
    public readonly kind: string,
    public readonly matchText: string,
  ) {
    super(`'${matchText}' is already a built-in ${kind} mapping; a learned rule cannot cover it`);
    this.name = 'RuleCoversBuiltInError';
  }
}

// Fires when a decision for a (nameKey, source) pair, or a rule for a
// (kind, matchText) pair, that is already recorded is submitted again,
// including the race where two calls insert the same pair at once (the
// unique constraint catches it, this error names it). Maps to 409.
export class AlreadyDecidedError extends Error {
  constructor(public readonly label: string) {
    super(`'${label}' already has a recorded decision`);
    this.name = 'AlreadyDecidedError';
  }
}
