import styled from 'styled-components';

import * as helpers from './helpers';
import type { CitySearchResultsListProps } from './models';
import * as styles from './styles';

// One column: results are ranked, and a two-column grid in RTL would put
// the second-best result at the far (inline) start instead of right after
// the best one (build spec, "Typing state").
export const CitySearchResultsList = styled(({ className, items, onSelect }: CitySearchResultsListProps) => (
  <ul className={className}>
    {items.map((item) => (
      <li key={item.id}>
        <button type="button" className="row" onClick={() => onSelect({ id: item.id, name: item.name })}>
          <span className="name" dir="auto">
            {item.name}
          </span>
          <span className="meta" dir="auto">
            {helpers.resultMetaLine(item)}
          </span>
        </button>
      </li>
    ))}
  </ul>
))`
  ${styles.CitySearchResultsList}
`;
