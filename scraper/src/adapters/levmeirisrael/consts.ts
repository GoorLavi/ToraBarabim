export const SOURCE_URL = 'https://levmeirisrael.com/upcoming-lessons/';

// The whole site publishes lessons for one rabbi; it is never scraped per
// lesson.
export const RABBI_NAME = 'הרב מאיר אליהו';

// Matches the embedded JS array literal the page injects its one-off
// lessons into. It is not JSON: values mix double and single quotes because
// some place names contain a literal double quote (e.g. ביה"כ).
export const RAW_LECTURES_ARRAY_PATTERN = /rawLecturesData\s*=\s*\[([\s\S]*?)\];/;
