import type { Dedication, DedicationGroup, DedicationText } from '@torabarabim/common';

// Non-breaking spaces are load bearing in a composed dedication string, not
// defensive (design-system.md, "The composed string"): at 280 the name line
// wraps as a matter of course, and NBSP is what keeps "לעילוי נשמת" and a
// name-plus-suffix from breaking apart mid-phrase. These fixtures mimic the
// server's composed output, so they carry the same NBSPs a real response
// would.
const NBSP = ' ';

let nextDedicationId = 1;

// A dedication fixture shared by DedicationUnit's stories and by any later
// consumer that needs a `Dedication` (the crawling band, eventually the
// admin panel), following `rabbiFixture`'s shape. Unlike a rabbi's `slug`,
// nothing on `DedicationText` is derived, so `id` is the only field this
// fills in when the caller does not care to name one.
export const dedicationFixture = (dedication: Partial<Pick<Dedication, 'id'>> & Pick<Dedication, 'text'>): Dedication => ({
  id: dedication.id ?? `dedication-${nextDedicationId++}`,
  text: dedication.text,
});

// A composed memorial line whose name wraps at the unit's 280 width: the
// plan's own example measures 290px there, so this is never a one-line
// fixture by accident.
export const DEDICATION_TEXT_MEMORIAL_WRAPPING: DedicationText = {
  formulaLine: `לעילוי${NBSP}נשמת`,
  nameLine: `חנה${NBSP}דבורה${NBSP}ע״ה`,
  parentLine: `בת${NBSP}אברהם`,
  closingLine: 'תנצב״ה',
  donorCreditLine: `תרומת${NBSP}משפחת${NBSP}לוי`,
};

// No parent line: absent, not empty (design-system.md, States).
export const DEDICATION_TEXT_MEMORIAL_NO_PARENT: DedicationText = {
  formulaLine: `לעילוי${NBSP}נשמת`,
  nameLine: `רבקה${NBSP}גולדשטיין${NBSP}ע״ה`,
  closingLine: 'תנצב״ה',
};

// No donor credit line.
export const DEDICATION_TEXT_MEMORIAL_NO_DONOR_CREDIT: DedicationText = {
  formulaLine: `לעילוי${NBSP}נשמת`,
  nameLine: `שלמה${NBSP}אדלר${NBSP}ז״ל`,
  parentLine: `בן${NBSP}יעקב`,
  closingLine: 'תנצב״ה',
};

// הי״ד, the third honorific: a victim of violence, never derived from the
// other two.
export const DEDICATION_TEXT_MEMORIAL_HYD: DedicationText = {
  formulaLine: `לעילוי${NBSP}נשמת`,
  nameLine: `אורי${NBSP}מזרחי${NBSP}הי״ד`,
  parentLine: `בן${NBSP}נעם`,
  closingLine: 'תנצב״ה',
  donorCreditLine: `תרומת${NBSP}משפחת${NBSP}מזרחי`,
};

// The longest realistic name this fixture set carries, for the wrapping
// instrument: several given names plus a family name plus the honorific,
// which wraps to more than two lines at 280.
export const DEDICATION_TEXT_MEMORIAL_LONGEST_NAME: DedicationText = {
  formulaLine: `לעילוי${NBSP}נשמת`,
  nameLine: `יהודה${NBSP}אריה${NBSP}לייב${NBSP}הכהן${NBSP}ז״ל`,
  parentLine: `בן${NBSP}משה${NBSP}יצחק`,
  closingLine: 'תנצב״ה',
  donorCreditLine: `תרומת${NBSP}משפחת${NBSP}אשכנזי`,
};

// Healing carries no closing line: planned memorial-only
// (design-system.md, "Still open, not blocking").
export const DEDICATION_TEXT_HEALING: DedicationText = {
  formulaLine: `לרפואה${NBSP}שלמה${NBSP}של`,
  nameLine: `משה${NBSP}כהן`,
  parentLine: `בן${NBSP}אברהם`,
};

export const DEDICATION_TEXT_SUCCESS: DedicationText = {
  formulaLine: 'להצלחת',
  nameLine: `יוסף${NBSP}לוי`,
  parentLine: `בן${NBSP}דוד`,
  donorCreditLine: `תרומת${NBSP}משפחת${NBSP}לוי`,
};

// One group per dedication type, each with more than one item so a
// consumer can see the group's own internal rhythm.
export const DEDICATION_GROUP_MEMORIAL: DedicationGroup = {
  type: 'memorial',
  items: [
    dedicationFixture({ id: 'dedication-memorial-1', text: DEDICATION_TEXT_MEMORIAL_WRAPPING }),
    dedicationFixture({ id: 'dedication-memorial-2', text: DEDICATION_TEXT_MEMORIAL_NO_PARENT }),
    dedicationFixture({ id: 'dedication-memorial-3', text: DEDICATION_TEXT_MEMORIAL_HYD }),
  ],
};

export const DEDICATION_GROUP_HEALING: DedicationGroup = {
  type: 'healing',
  items: [
    dedicationFixture({ id: 'dedication-healing-1', text: DEDICATION_TEXT_HEALING }),
    dedicationFixture({
      id: 'dedication-healing-2',
      text: { formulaLine: `לרפואה${NBSP}שלמה${NBSP}של`, nameLine: `רחל${NBSP}אברמוביץ`, parentLine: `בת${NBSP}שמואל` },
    }),
  ],
};

export const DEDICATION_GROUP_SUCCESS: DedicationGroup = {
  type: 'success',
  items: [
    dedicationFixture({ id: 'dedication-success-1', text: DEDICATION_TEXT_SUCCESS }),
    dedicationFixture({
      id: 'dedication-success-2',
      text: { formulaLine: 'להצלחת', nameLine: `נחמה${NBSP}שפירא`, parentLine: `בת${NBSP}חיים` },
    }),
  ],
};

// A single unit: the crawling band's static, no-self-advance case
// (design-system.md, States: "One unit: static, no self-advance").
export const DEDICATION_GROUP_SINGLE: DedicationGroup = {
  type: 'success',
  items: [dedicationFixture({ id: 'dedication-single', text: DEDICATION_TEXT_SUCCESS })],
};

// Large enough that the drawn group's track overflows a 1280 viewport at
// the unit's fixed 280 width and 64 gap: nine units alone already clear
// 9 * (280 + 64) = 3096px, well past 1280.
export const DEDICATION_GROUP_OVERFLOWING: DedicationGroup = {
  type: 'memorial',
  items: Array.from({ length: 9 }, (_, index) =>
    dedicationFixture({
      id: `dedication-overflow-${index + 1}`,
      text: {
        formulaLine: `לעילוי${NBSP}נשמת`,
        nameLine: `דוגמה${NBSP}${index + 1}${NBSP}ז״ל`,
        parentLine: `בן${NBSP}פלוני`,
        closingLine: 'תנצב״ה',
      },
    }),
  ),
};

// The draw pool itself is empty: a normal 200 with `dedications: []`, never
// a 404 (design-system.md, States: "Zero dedications renders nothing at
// all").
export const DEDICATION_GROUPS_EMPTY: DedicationGroup[] = [];
