import type { InfiniteData } from '@tanstack/react-query';
import type { AdminVisitorMessage, VisitorMessageListResponse } from '@torabarabim/common';

// Swaps one message for its updated copy wherever it sits in the loaded
// pages, so a card changes in place instead of the list refetching and the
// card leaving the filter it was just handled under.
export const replaceMessage = (
  data: InfiniteData<VisitorMessageListResponse>,
  updated: AdminVisitorMessage,
): InfiniteData<VisitorMessageListResponse> => ({
  ...data,
  pages: data.pages.map((page) => ({
    ...page,
    items: page.items.map((item) => (item.id === updated.id ? updated : item)),
  })),
});
