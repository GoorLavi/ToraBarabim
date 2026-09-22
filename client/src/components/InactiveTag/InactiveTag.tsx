import styled from 'styled-components';

import * as consts from './consts';
import type { InactiveTagProps } from './models';
import * as styles from './styles';

// The one place the "לא פעיל" pill is drawn: shared by
// `AdminPanel/PlacesListPage/components/PlaceCard`, `AdminPanel/PlaceViewPage`
// and `PlacePicker/components/PickerControl` so an inactive place reads the
// same weight everywhere it appears, rather than a pill in the admin list and
// a differently tinted one in the picker (design gate findings F12, F2).
// Lives here rather than under AdminPanel because PickerControl is shared by
// both AdminPanel and RabbiPanel's lesson forms.
export const InactiveTag = styled(({ className }: InactiveTagProps) => <span className={className}>{consts.INACTIVE_TAG_LABEL}</span>)`
  ${styles.InactiveTag}
`;
