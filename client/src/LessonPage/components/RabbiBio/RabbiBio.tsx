import styled from 'styled-components';

import * as consts from './consts';
import type { RabbiBioProps } from './models';
import * as styles from './styles';

// Below both rows: the bio is about the rabbi, not about this date. Renders
// nothing at all when there is no bio.
export const RabbiBio = styled(({ className, teachingRabbi }: RabbiBioProps) => {
  if (!teachingRabbi.bio) return null;

  return (
    <section className={className}>
      <h2 className="heading" dir="auto">
        {consts.ABOUT_RABBI_HEADING[teachingRabbi.honorific]}
      </h2>
      <p className="text" dir="auto">
        {teachingRabbi.bio}
      </p>
    </section>
  );
})`
  ${styles.RabbiBio}
`;
