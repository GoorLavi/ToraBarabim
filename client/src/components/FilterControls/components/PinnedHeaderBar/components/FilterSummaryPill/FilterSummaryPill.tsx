import classNames from 'classnames';
import styled from 'styled-components';

import * as consts from './consts';
import type { FilterSummaryPillProps } from './models';
import * as styles from './styles';

// Two states: no filter chosen (an outline pill inviting a tap, the same
// language as an unselected date chip) and a filter chosen (a filled pill
// naming it). `aria-expanded` is always false here: this button only
// exists while the panel it opens is closed, since opening replaces it
// with that same panel (PinnedHeaderBar).
export const FilterSummaryPill = styled(({ className, summary, onClick }: FilterSummaryPillProps) => (
  <button
    type="button"
    className={classNames(className, { active: Boolean(summary) })}
    aria-haspopup="dialog"
    aria-expanded={false}
    aria-label={summary ? consts.changePanelLabel(summary) : consts.OPEN_PANEL_LABEL}
    onClick={onClick}
  >
    {!summary && (
      <svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="9" cy="6" r="1.6" fill="currentColor" />
        <circle cx="15" cy="12" r="1.6" fill="currentColor" />
        <circle cx="9" cy="18" r="1.6" fill="currentColor" />
      </svg>
    )}
    <span className="label" dir="auto">
      {summary ?? consts.FILTER_LABEL}
    </span>
    {summary && (
      <svg className="chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )}
  </button>
))`
  ${styles.FilterSummaryPill}
`;
