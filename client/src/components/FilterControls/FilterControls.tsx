import classNames from 'classnames';
import { useRef } from 'react';
import styled from 'styled-components';

import { FilterFieldsGrid } from './components/FilterFieldsGrid/FilterFieldsGrid';
import { PinnedHeaderBar } from './components/PinnedHeaderBar/PinnedHeaderBar';
import type { FilterControlsProps } from './models';
import * as styles from './styles';
import { usePinnedHeaderVisibility } from './usePinnedHeaderVisibility';
import { useScrollY } from './useScrollY';

// The one header every public page shares (the layout route, App/App.tsx):
// logo, date chips, search field and city picker in the same plum band.
// Below `lg` it scrolls away in normal flow and `PinnedHeaderBar` takes
// over once it has fully left the viewport; from `lg` up it is sticky
// instead and never collapses.
export const FilterControls = styled(({ className, ...fieldsProps }: FilterControlsProps) => {
  const headerRef = useRef<HTMLElement>(null);
  const scrollY = useScrollY();
  const isPinnedVisible = usePinnedHeaderVisibility(headerRef, scrollY);

  return (
    <header ref={headerRef} className={classNames(className, { scrolled: scrollY > 0 })}>
      <FilterFieldsGrid className="bar" {...fieldsProps} />
      <PinnedHeaderBar isVisible={isPinnedVisible} {...fieldsProps} />
    </header>
  );
})`
  ${styles.FilterControls}
`;
