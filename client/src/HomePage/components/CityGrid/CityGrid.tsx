import { useMutation } from '@tanstack/react-query';
import classNames from 'classnames';
import styled from 'styled-components';

import { fetchCities } from '~/HomePage/api';
import { TextLink } from '~/HomePage/components/TextLink/TextLink';

import * as consts from './consts';
import { uniqueCityNames } from './helpers';
import type { CityGridProps } from './models';
import * as styles from './styles';

// A city button carries only a display name, derived from the lessons
// already fetched (helpers.ts); the numeric id `GET /v1/lessons` needs for
// its `city` filter is resolved through the real city search on click,
// rather than inventing one.
//
// A row with nothing in it renders nothing at all, heading included: this
// site never puts a heading over an empty rail (design-system.md, "Every
// data screen has three states").
export const CityGrid = styled(({ className, items, isLoading, isError, onSelectCity }: CityGridProps) => {
  const resolveCity = useMutation({ mutationFn: (name: string) => fetchCities(name) });

  const selectByName = (name: string): void => {
    resolveCity.mutate(name, {
      onSuccess: (result) => {
        const match = result.items.find((city) => city.name === name) ?? result.items[0];
        if (match) onSelectCity({ id: match.id, name: match.name });
      },
    });
  };

  const cityNames = items ? uniqueCityNames(items) : [];

  if (!isLoading && !isError && cityNames.length === 0) return null;

  return (
    <section className={className}>
      <div className="heading">
        <h2>{consts.HEADING}</h2>
        <TextLink className="seeAll" to="/cities" withChevron>
          {consts.SEE_ALL_LABEL}
        </TextLink>
      </div>

      {isError && (
        <p className={classNames('state', 'error')} role="alert">
          {consts.ERROR_MESSAGE}
        </p>
      )}

      {!isError && isLoading && (
        <p className={classNames('state', 'loading')} aria-live="polite">
          {consts.LOADING_MESSAGE}
        </p>
      )}

      {!isError && !isLoading && (
        <ul className="grid">
          {cityNames.map((name) => (
            <li key={name}>
              <button type="button" disabled={resolveCity.isPending} onClick={() => selectByName(name)} dir="auto">
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
})`
  ${styles.CityGrid}
`;
