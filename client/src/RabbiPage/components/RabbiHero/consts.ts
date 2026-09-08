// Measured poster sizes, neither of which matches a shared token: the
// poster's own 3:4 ratio holds (180x240 = 260x347 = 3:4), but the box sizes
// themselves are specific to this hero (design spec, "Hero card").
export const POSTER_WIDTH_PHONE = '180px';
export const POSTER_HEIGHT_PHONE = '240px';
export const POSTER_WIDTH_DESKTOP = '260px';
export const POSTER_HEIGHT_DESKTOP = '347px';

// The gap inside the names block widens from 4 to 6 on desktop (design
// spec, "Name block gaps are 6, not 4"), neither of which is a spacing
// token (the scale steps 4, 8, 12...).
export const NAME_BLOCK_GAP_DESKTOP = '6px';
