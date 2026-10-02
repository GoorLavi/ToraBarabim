import type { InfiniteData } from '@tanstack/react-query';
import type { AdminVisitorMessage, UpdateVisitorMessageRequest, VisitorMessageListResponse } from '@torabarabim/common';

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
  const base = {
    id: current.id,
    type: current.type,
    name: current.name,
    phone: current.phone,
    message: current.message,
    createdAt: current.createdAt,
    handlingNote: noteSource.handlingNote,
  };

  return handledSource.status === 'handled'
    ? { ...base, status: 'handled', handledAt: handledSource.handledAt }
    : { ...base, status: 'unhandled' };
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
