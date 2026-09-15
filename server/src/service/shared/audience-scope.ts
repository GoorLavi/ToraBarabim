import type { AudienceFilter, AudienceScope, LessonAudience, RabbiHonorific } from '@torabarabim/common';

import type { AudienceScopeContext, AudienceScopedLesson } from './models';

// `men` also matches a mixed lesson; `mixed` matches only a mixed lesson.
export const matchesAudienceFilter = (filter: AudienceFilter, audience: LessonAudience): boolean =>
  filter === 'men' ? audience === 'men' || audience === 'mixed' : audience === 'mixed';

// Owner decision 2: `general` excludes a rabbanit-taught lesson, except
// when her name matched the search text and no audience filter narrowed
// the request, in which case her lessons still show, with her photo (owner
// decision 5). `women` includes every teacher, audience women or mixed
// only.
export const isLessonInScope = (
  scope: AudienceScope,
  lesson: AudienceScopedLesson,
  context: AudienceScopeContext = {},
): boolean => {
  if (scope === 'women') {
    return lesson.audience === 'women' || lesson.audience === 'mixed';
  }

  if (lesson.teacherHonorific !== 'rabbanit') return true;

  return context.teacherNameMatched === true;
};

// The public rabbi directory's scope: `general` lists ravs only, `women`
// lists rabbaniyot only (owner decision A3).
export const isRabbiInDirectoryScope = (scope: AudienceScope, honorific: RabbiHonorific): boolean =>
  scope === 'women' ? honorific === 'rabbanit' : honorific === 'rav';
