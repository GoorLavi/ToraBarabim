import classNames from 'classnames';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { cityPath } from '~/helpers';
import { lessonCountLabel } from '~/consts';

import type { CityChipProps } from './models';
import * as styles from './styles';

export const CityChip = styled((props: CityChipProps) => {
  const { className, city, lessonCount } = props;
  const content = (
    <>
      <span className="name" dir="auto">
        {city.name}
      </span>
      {lessonCount !== undefined && (
        <span className="count" dir="auto">
          {lessonCountLabel(lessonCount)}
        </span>
      )}
    </>
  );

  if (props.onSelect) {
    return (
      <button
        type="button"
        className={classNames(className, { selected: props.selected })}
        aria-pressed={props.selected}
        onClick={props.onSelect}
      >
        {content}
      </button>
    );
  }

  return (
    <Link to={cityPath(city)} className={className}>
      {content}
    </Link>
  );
})`
  ${styles.CityChip}
`;
