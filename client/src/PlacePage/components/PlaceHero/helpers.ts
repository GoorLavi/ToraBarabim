import { lessonCountLabel } from '~/consts';

// `undefined` while the count is not yet known (renders nothing, same as
// the zero case below) or once it resolves to zero: the block below the
// head already says there are no lessons here, so the meta line does not
// repeat it a second time, ~60px away (design gate finding F5).
export const placeMetaLabel = (lessonCount: number | undefined): string | undefined => {
  if (!lessonCount) return undefined;
  return lessonCountLabel(lessonCount);
};

// A house number left at the end of a wrapped line can flip side
// (design-system.md, "A number at a line break flips"). A space is turned
// into a non-breaking space only before a trailing house number, so the
// street name itself still wraps freely while the number always stays
// glued to the word before it (design gate finding F1).
const TRAILING_HOUSE_NUMBER = /\s+(\d+[א-ת]?)$/;

export const unbreakableStreet = (street: string): string => street.replace(TRAILING_HOUSE_NUMBER, ' $1');
