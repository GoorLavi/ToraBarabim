import styled from 'styled-components';

import * as consts from './consts';
import type { InactiveTagProps } from './models';
import * as styles from './styles';

// The one place the "לא פעיל" pill is drawn: shared by
// `PlacesListPage/components/PlaceCard` and `PlaceViewPage` so an inactive
// place reads the same weight wherever the admin panel shows it, rather
// than a pill in the list and quiet grey text in the detail view (design
// gate finding F12).
export const InactiveTag = styled(({ className }: InactiveTagProps) => <span className={className}>{consts.INACTIVE_TAG_LABEL}</span>)`
  ${styles.InactiveTag}
`;
