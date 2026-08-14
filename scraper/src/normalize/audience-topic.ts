import type { LessonAudience, LessonTopic } from '@torabarabim/common';

import { AUDIENCE_KEYWORDS, TOPIC_KEYWORDS } from './consts';

export const parseAudience = (text: string): LessonAudience | undefined =>
  AUDIENCE_KEYWORDS.find(({ pattern }) => pattern.test(text))?.audience;

// A topic string the source published but that matches no known keyword
// still becomes 'other': the site did categorize the lesson, we just could
// not bucket it more precisely. Only an absent topicRaw is a gap.
export const parseTopic = (text: string): LessonTopic =>
  TOPIC_KEYWORDS.find(({ pattern }) => pattern.test(text))?.topic ?? 'other';
