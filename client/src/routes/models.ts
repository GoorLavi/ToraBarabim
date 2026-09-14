// A JSON-LD value, matching the shape React Router's own `"script:ld+json"`
// meta descriptor accepts (its `LdJsonObject`/`LdJsonValue` are internal to
// the library and not exported), so every route building structured data
// shares this instead of retyping an equivalent shape per file.
// These objects reach the page through React Router's meta descriptor, which
// serializes them and escapes `<`, `>` and `&` into their \uXXXX JSON forms
// before writing the script tag. That is what stops a `</script>` typed into
// a lesson note or a rabbi's bio from closing the tag and running as markup.
// The protection is the library's, not ours, so rendering this JSON into a
// script tag by hand would silently remove it.
export type JsonLdValue = string | number | boolean | null | JsonLdValue[] | JsonLdObject;
export type JsonLdObject = { [key: string]: JsonLdValue };
