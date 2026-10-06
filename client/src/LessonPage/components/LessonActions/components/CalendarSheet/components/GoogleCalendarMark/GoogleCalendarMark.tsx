import { useId } from 'react';

import * as consts from './consts';
import type { GoogleCalendarMarkProps } from './models';

// Sized by whoever places it. Decorative: the row or line beside it names
// "יומן Google", so it is hidden from a screen reader. Every mask, gradient,
// filter and clip id carries a prefix of its own, so two marks on one page
// never resolve to each other's definitions.
export const GoogleCalendarMark = ({ className }: GoogleCalendarMarkProps) => {
  const prefix = useId().replace(/\W/g, '');
  const id = (name: string): string => `${prefix}-${name}`;
  const url = (name: string): string => `url(#${id(name)})`;

  return (
    // The colors below are literals on purpose, the same exception as the
    // navigation links' Waze and Google Maps marks (0027, 0060): a brand mark
    // never reads the theme.
    <svg className={className} viewBox={consts.GOOGLE_CALENDAR_MARK_VIEW_BOX} fill="none" aria-hidden="true">
      <g clipPath={url('clip')}>
        <path d={consts.GOOGLE_CALENDAR_MARK_BACK_PAGE_PATH} fill="#BBE2FF" />
        <path d={consts.GOOGLE_CALENDAR_MARK_FRAME_PATH} fill="#3C90FF" />
        <mask id={id('m0')} style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="2" y="2" width="19" height="19">
          <path d={consts.GOOGLE_CALENDAR_MARK_FOLD_PATH} fill="#3C90FF" />
        </mask>
        <g mask={url('m0')}>
          <path d={consts.GOOGLE_CALENDAR_MARK_LOWER_SHADE_PATH} fill={url('g0')} />
        </g>
        <mask id={id('m1')} style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="2" y="2" width="19" height="19">
          <path d={consts.GOOGLE_CALENDAR_MARK_FOLD_PATH} fill="#3186FF" />
        </mask>
        <g mask={url('m1')}>
          <g filter={url('f0')}>
            <path d={consts.GOOGLE_CALENDAR_MARK_UPPER_SHADE_PATH} fill={url('g1')} />
          </g>
        </g>
        <path d={consts.GOOGLE_CALENDAR_MARK_DIGITS_PATH} fill="white" />
      </g>
      <defs>
        <filter id={id('f0')} x="-17.6592" y="-20.118" width="65.3229" height="57.3502" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="10.0497" result="blur" />
        </filter>
        <linearGradient id={id('g0')} x1="15.0023" y1="17.1328" x2="15.0023" y2="31.9454" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4FA0FF" />
          <stop offset="1" stopColor="#3186FF" />
        </linearGradient>
        <linearGradient id={id('g1')} x1="13.6401" y1="2.6613" x2="13.6401" y2="17.2089" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A9A8FF" />
          <stop offset="0.8" stopColor="#3C90FF" />
        </linearGradient>
        <clipPath id={id('clip')}>
          <rect width="30" height="32" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
