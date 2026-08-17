import { useSearchParams } from 'react-router-dom';

import { SEARCH_PARAM } from './consts';

export interface RabbiSearchTermState {
  search: string;
  setSearch: (search: string) => void;
}

export const useRabbiSearchTerm = (): RabbiSearchTermState => {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get(SEARCH_PARAM) ?? '';

  const setSearch = (nextSearch: string): void => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nextSearch) next.set(SEARCH_PARAM, nextSearch);
      else next.delete(SEARCH_PARAM);
      return next;
    });
  };

  return { search, setSearch };
};
