// A city as this admin panel needs it: enough to filter or to submit a
// `cityId`, never the full `City` (its `area` field goes unused here, and
// the URL only ever carries an id and a name, same shape as the public
// site's `SelectedCity`).
export interface SelectedCity {
  id: string;
  name: string;
}

export interface CitySelectProps {
  className?: string;
  city: SelectedCity | undefined;
  onSelectCity: (city: SelectedCity | undefined) => void;
  placeholderLabel: string;
  allowClear?: boolean;
  // A stacked form field wants the control to span its row like every
  // sibling input. A filter bar wants it to stay a compact pill among
  // other controls. Off by default so an existing caller's layout never
  // changes underneath it.
  fullWidth?: boolean;
  // Draws the danger ring `PlacePicker`'s own name and street fields get on
  // their `<input>` (design gate finding B3): this control has no bare
  // input of its own for that rule to reach, so a caller marks it directly.
  // Off by default, the same opt-in-modifier shape as `ReadOnlyField`'s
  // `quiet` and `InactiveTag`, so no existing caller looks different.
  invalid?: boolean;
}
