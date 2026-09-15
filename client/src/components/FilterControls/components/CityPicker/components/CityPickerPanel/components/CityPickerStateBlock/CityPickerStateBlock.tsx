import classNames from 'classnames';
import styled from 'styled-components';

import { PrimaryButton } from '~/components/PrimaryButton/PrimaryButton';
import { QuietButton } from '~/components/QuietButton/QuietButton';

import type { CityPickerStateBlockProps } from './models';
import * as styles from './styles';

// One shared shape for every non-happy-path state in the picker: the
// grouped list's empty and error states, and the search list's loading,
// no-match and error states. A bare loading line omits `title`.
export const CityPickerStateBlock = styled(({ className, title, danger, body, actions }: CityPickerStateBlockProps) => (
  <div className={classNames(className, { danger })}>
    {title && (
      <p className="title" dir="auto">
        {title}
      </p>
    )}
    <p className="body" dir="auto">
      {body}
    </p>
    {actions && actions.length > 0 && (
      <div className="actions">
        {actions.map((action) => {
          const ActionButton = action.style === 'primary' ? PrimaryButton : QuietButton;
          return <ActionButton key={action.label} {...{ label: action.label, onClick: action.onClick }} />;
        })}
      </div>
    )}
  </div>
))`
  ${styles.CityPickerStateBlock}
`;
