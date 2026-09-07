// `dir="auto"` resolves direction from the value's first strong directional
// character. An empty value has none, so Chrome falls back to `ltr`, which
// puts a Hebrew placeholder and the caret on the wrong side of an empty
// field. Forcing `rtl` while empty and handing back to `auto` once there is
// a value keeps a genuinely Latin value (a Latin place name) rendering LTR.
export const directionForValue = (value: string): 'rtl' | 'auto' => (value ? 'auto' : 'rtl');
