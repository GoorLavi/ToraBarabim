import styled from 'styled-components';

import { PrimaryButton } from '~/components/PrimaryButton/PrimaryButton';
import { CandlesEmblem } from '~/HomePage/components/CandlesEmblem/CandlesEmblem';
import { WOMEN_PAGE_PATH } from '~/hooks/consts';

import { InsetItem } from './components/InsetItem/InsetItem';
import * as consts from './consts';
import type { WomensAreaBandProps } from './models';
import * as styles from './styles';

// Never a photo, never a rabbanit's name: this band is a doorway to the
// women's area, not a preview of who teaches there. Renders only when the
// caller has a positive count (HomePage.tsx reads it straight off `GET
// /v1/home`'s own `womensAreaLessonCount`, the same number in both page
// modes, never a second fetch to `GET /v1/women` for it).
export const WomensAreaBand = styled(({ className, lessonCount }: WomensAreaBandProps) => (
  <section className={className}>
    <CandlesEmblem {...{ variant: 'onSoft', size: consts.BAND_EMBLEM_SIZE }} className="emblem" />

    <div className="text">
      <h2 className="title">{consts.BAND_TITLE}</h2>
      <p className="count" dir="auto">
        {consts.bandCountLine(lessonCount)}
      </p>
    </div>

    <div className="inset">
      {consts.INSET_ITEMS.map((item) => (
        <InsetItem key={item.key} {...{ icon: item.key, label: item.label }} />
      ))}
    </div>

    <PrimaryButton className="action" {...{ label: consts.BAND_LINK_LABEL, to: WOMEN_PAGE_PATH }} />
  </section>
))`
  ${styles.WomensAreaBand}
`;
