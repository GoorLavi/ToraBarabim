// 'onPlum' sits on a `primary` fill (the tile's plum area): strokes render in
// `textOnPrimary`, flames in `accentOnDark`. 'onSoft' sits on a light field
// (the band): strokes render in `primary`, flames in `accent`.
export type CandlesEmblemVariant = 'onPlum' | 'onSoft';

export interface CandlesEmblemProps {
  className?: string;
  variant: CandlesEmblemVariant;
  size: number;
}
