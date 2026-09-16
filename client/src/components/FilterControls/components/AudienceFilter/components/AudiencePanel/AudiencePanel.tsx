import styled from 'styled-components';

import { PanelFrame } from '../../../PanelFrame/PanelFrame';
import * as consts from '../../consts';
import { isOptionSelected } from '../../helpers';
import type { AudiencePanelProps } from './models';
import * as styles from './styles';

// Identical content, order and copy whether this renders inside the drawer
// (below `sm`) or the popover (`sm` and up): title, close, the four
// options, the sub-line under נשים. The handle, heading row and the
// dialog's focus/Escape/Tab behaviour are `PanelFrame`'s job; this owns the
// options list.
export const AudiencePanel = styled(({ className, isDrawer, isWide, filter, isWomenPage, onSelectOption, onClose }: AudiencePanelProps) => (
  <PanelFrame
    className={className}
    {...{ isDrawer, isWide, heading: consts.POPOVER_TITLE, closeLabel: consts.CLOSE_LABEL, onClose }}
  >
    <ul className="options" role="listbox">
      {consts.AUDIENCE_OPTIONS.map((option) => (
        <li key={option} className="option" role="presentation">
          <button
            type="button"
            className="optionButton"
            role="option"
            aria-selected={isOptionSelected(option, filter, isWomenPage)}
            onClick={() => onSelectOption(option)}
          >
            <span className="label">{consts.OPTION_LABELS[option]}</span>
            {option === 'women' && <span className="subLabel">{consts.WOMEN_SUBLABEL}</span>}
          </button>
        </li>
      ))}
    </ul>
  </PanelFrame>
))`
  ${styles.AudiencePanel}
`;
