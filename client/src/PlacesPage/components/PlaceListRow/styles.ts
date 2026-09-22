import { css } from 'styled-components';

// Off the 4px spacing scale, mirroring RabbiListRow/consts.ts's own
// ROW_PADDING_BLOCK (frame measurement).
const ROW_PADDING_BLOCK = '14px';

// A rounded rectangle at `radii.sm`, 64 by 36, not a pill avatar: a round
// crop of a building is a smudge (build brief). With no photo the box stays
// a plain `primarySoft` fill, no icon and no initials, deliberately unlike
// the page's own head band, which reserves no space at all when there is no
// photo: a list where some rows carry a leading box and some do not has a
// ragged text column (build brief).
export const PlaceListRow = css(
  ({ theme }) => `
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding-block: ${ROW_PADDING_BLOCK};
  padding-inline: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.surface};
  text-decoration: none;

  &:hover {
    border-color: ${theme.colors.primary};
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }

  > .thumbnail {
    flex-shrink: 0;
    inline-size: 64px;
    block-size: 36px;
    border-radius: ${theme.radii.sm};
    overflow: hidden;

    &.placeholder {
      background: ${theme.colors.primarySoft};
    }

    > .photo {
      inline-size: 100%;
      block-size: 100%;
      object-fit: cover;
    }
  }

  > .text {
    flex: 1;
    min-inline-size: 0;
    display: flex;
    flex-direction: column;

    > .name {
      color: ${theme.colors.text};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.cardTitle.phone.fontSize};
      line-height: ${theme.typography.cardTitle.phone.lineHeight};
      overflow-wrap: break-word;
    }

    /* Truncated to one line rather than wrapped (build brief). */
    > .meta {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  > .chevron {
    flex-shrink: 0;
    inline-size: 20px;
    block-size: 20px;
    color: ${theme.colors.textSecondary};
  }
`,
);
