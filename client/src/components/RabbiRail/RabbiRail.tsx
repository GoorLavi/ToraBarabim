import styled from 'styled-components';

import { TextLink } from '~/HomePage/components/TextLink/TextLink';

import { RabbiCell } from './components/RabbiCell/RabbiCell';
import type { RabbiRailProps } from './models';
import * as styles from './styles';

// A row with nothing in it renders nothing, heading included
// (design-system.md, "Every data screen has three states": "the rows
// themselves have no empty state"). The caller decides when that is true
// (the city page only renders this once the city is known to have both
// rabbis and lessons; /women always has at least the rabbaniyot in its
// `empty`-branch rail).
export const RabbiRail = styled(({ className, heading, rabbis, allLink }: RabbiRailProps) => {
  if (rabbis.length === 0) return null;

  return (
    <section className={className}>
      <div className="heading">
        <h2 className="title" dir="auto">
          {heading}
        </h2>
        {allLink && (
          <TextLink className="allLink" to={allLink.to} withChevron>
            {allLink.label}
          </TextLink>
        )}
      </div>
      <ul className="rail">
        {rabbis.map((rabbi) => (
          <li key={rabbi.id}>
            <RabbiCell rabbi={rabbi} />
          </li>
        ))}
      </ul>
    </section>
  );
})`
  ${styles.RabbiRail}
`;
