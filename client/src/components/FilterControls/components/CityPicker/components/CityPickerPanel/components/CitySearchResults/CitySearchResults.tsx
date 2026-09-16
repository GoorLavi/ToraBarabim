import classNames from 'classnames';
import type { ReactNode } from 'react';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';

import * as parentConsts from '../../consts';
import { CityPickerStateBlock } from '../CityPickerStateBlock/CityPickerStateBlock';
import { CitySearchResultsList } from './components/CitySearchResultsList/CitySearchResultsList';
import * as consts from './consts';
import type { CitySearchResultsProps } from './models';

// A plain dispatcher, not a styled component: every branch below already
// carries its own layout (`CityPickerStateBlock` or
// `CitySearchResultsList`), so there is no CSS of this component's own to
// apply.
//
// `idle` never actually renders here: the parent only mounts this component
// once the query field is non-empty, and the hook itself reports `idle`
// only for an empty (untrimmed) query.
export const CitySearchResults = ({ className, search, onSelect, onBackToList }: CitySearchResultsProps): ReactNode => {
  if (search.kind === 'idle') return null;

  if (search.kind === 'loading') {
    return <CityPickerStateBlock className={className} {...{ body: consts.SEARCH_LOADING_MESSAGE }} />;
  }

  if (search.kind === 'error') {
    return (
      <CityPickerStateBlock
        className={className}
        {...{
          danger: true,
          title: consts.SEARCH_ERROR_HEADING,
          body: consts.SEARCH_ERROR_BODY,
          actions: [
            {
              label: parentConsts.RETRY_LABEL,
              style: 'primary',
              onClick: () => {
                trackEvent(MIXPANEL_EVENTS.retryClick, { surface: 'cityPickerSearch' });
                search.retry();
              },
            },
            { label: consts.BACK_TO_LIST_LABEL, style: 'quiet', onClick: onBackToList },
          ],
        }}
      />
    );
  }

  if (search.kind === 'empty') {
    return (
      <CityPickerStateBlock
        className={className}
        {...{
          title: consts.SEARCH_NO_RESULTS_HEADING,
          body: consts.SEARCH_NO_RESULTS_BODY,
          actions: [{ label: consts.BACK_TO_LIST_LABEL, style: 'quiet', onClick: onBackToList }],
        }}
      />
    );
  }

  return (
    <CitySearchResultsList
      className={classNames(className, { fetching: search.isFetching })}
      {...{ items: search.items, onSelect }}
    />
  );
};
