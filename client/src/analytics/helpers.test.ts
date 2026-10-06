import { describe, expect, it } from 'vitest';

import { isAutomatedBrowser, launchModeFrom, posterSourceFrom } from './helpers';

describe('posterSourceFrom', () => {
  it('maps the recruiting poster QR value to listers', () => {
    expect(posterSourceFrom('?utm_source=poster-listers')).toBe('listers');
  });

  it('maps the seekers poster QR value to seekers', () => {
    expect(posterSourceFrom('?utm_source=poster-seekers')).toBe('seekers');
  });

  it('resolves the source when other params sit around it', () => {
    expect(posterSourceFrom('?city=jerusalem&utm_source=poster-seekers&utm_medium=qr')).toBe('seekers');
  });

  it('returns undefined for an empty search string', () => {
    expect(posterSourceFrom('')).toBeUndefined();
  });

  it('returns undefined when only unrelated params are present', () => {
    expect(posterSourceFrom('?city=jerusalem&q=rabbi')).toBeUndefined();
  });

  it('returns undefined for a value that is not one of the two posters', () => {
    expect(posterSourceFrom('?utm_source=newsletter')).toBeUndefined();
  });

  it('returns undefined for a value that names an Object.prototype member', () => {
    expect(posterSourceFrom('?utm_source=constructor')).toBeUndefined();
  });
});

describe('isAutomatedBrowser', () => {
  it('catches the Claude desktop browser pane, which reports webdriver false', () => {
    const userAgent =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Claude/2.19675.0 Chrome/152.0.7977.130 Safari/537.36';
    expect(isAutomatedBrowser({ userAgent, webdriver: false })).toBe(true);
  });

  it('counts an ordinary Chrome', () => {
    const userAgent =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';
    expect(isAutomatedBrowser({ userAgent, webdriver: false })).toBe(false);
  });
});

describe('launchModeFrom', () => {
  it('reports standalone whenever the display mode is standalone', () => {
    expect(launchModeFrom('', true)).toBe('standalone');
  });

  it('reports standalone even when the landing URL is the start URL', () => {
    expect(launchModeFrom('?source=pwa', true)).toBe('standalone');
  });

  it('reports pwaStartUrl for the start URL opened outside a standalone window', () => {
    expect(launchModeFrom('?city=jerusalem&source=pwa', false)).toBe('pwaStartUrl');
  });

  it('reports browser for an ordinary visit', () => {
    expect(launchModeFrom('', false)).toBe('browser');
  });

  it('reports browser for a source value that is not the start URL marker', () => {
    expect(launchModeFrom('?source=newsletter', false)).toBe('browser');
  });
});
