import type { InfiniteData } from '@tanstack/react-query';
import type { AdminVisitorMessage, UpdateVisitorMessageRequest, VisitorMessageListResponse } from '@torabarabim/common';

// A card's content with its handled state taken off, so the merged copy
// carries `handledAt` only when it is handled. Every content field, a
// report's subject included, travels through the spread.
const withoutHandling = (message: AdminVisitorMessage) => {
  if (message.status === 'handled') {
    const { status: _status, handledAt: _handledAt, ...content } = message;
    return content;
  }
  const { status: _status, ...content } = message;
  return content;
};

// Folds a PATCH response into the card already in the cache, taking only the
// fields the request wrote: the handled state when it sent `handled`, the
// note when it sent `handlingNote`. A response is a snapshot from when the
// server answered, so when a toggle and a note save are in flight together
// the later response may predate the other write, and replacing the whole
// card with it would silently undo that write.
export const mergeUpdatedFields = (
  current: AdminVisitorMessage,
  updated: AdminVisitorMessage,
  sent: UpdateVisitorMessageRequest,
): AdminVisitorMessage => {
  const handledSource = sent.handled !== undefined ? updated : current;
  const noteSource = sent.handlingNote !== undefined ? updated : current;
  const merged = { ...withoutHandling(current), handlingNote: noteSource.handlingNote };

  return handledSource.status === 'handled'
    ? { ...merged, status: 'handled', handledAt: handledSource.handledAt }
    : { ...merged, status: 'unhandled' };
};

// Swaps one message for its merged copy wherever it sits in the loaded pages,
// so a card changes in place instead of the list refetching and the card
// leaving the filter it was just handled under.
export const replaceMessage = (
  data: InfiniteData<VisitorMessageListResponse>,
  updated: AdminVisitorMessage,
  sent: UpdateVisitorMessageRequest,
): InfiniteData<VisitorMessageListResponse> => ({
  ...data,
  pages: data.pages.map((page) => ({
    ...page,
    items: page.items.map((item) => (item.id === updated.id ? mergeUpdatedFields(item, updated, sent) : item)),
  })),
});
