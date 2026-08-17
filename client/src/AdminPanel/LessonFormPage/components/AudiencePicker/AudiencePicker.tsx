import classNames from 'classnames';
import styled from 'styled-components';

import * as parentConsts from '~/AdminPanel/LessonFormPage/consts';

import type { AudiencePickerProps } from './models';
import * as styles from './styles';

const AUDIENCE_VALUES = ['mixed', 'women', 'men'] as const;

export const AudiencePicker = styled(({ className, audience, onSelectAudience, errorMessage }: AudiencePickerProps) => (
  <div className={classNames(className, { invalid: Boolean(errorMessage) })}>
    <div className="pills" role="radiogroup">
      {AUDIENCE_VALUES.map((value) => (
        <button
          key={value}
          type="button"
          className={classNames('pill', { selected: audience === value })}
          role="radio"
          aria-checked={audience === value}
          onClick={() => onSelectAudience(value)}
        >
          {parentConsts.AUDIENCE_LABELS[value]}
        </button>
      ))}
    </div>

    {errorMessage && <p className="error">{errorMessage}</p>}
  </div>
))`
  ${styles.AudiencePicker}
`;
