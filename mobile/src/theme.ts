/**
 * AgriConnect Mobile Design Tokens
 * Mirrors the web design system (index.css) so both platforms share
 * the same visual language: warm earth tones + forest green accent.
 */

// ─── Color Palette ──────────────────────────────────────────────────────────

export const green = {
  50:  '#eef6f0',
  100: '#d4ead9',
  200: '#a9d4b3',
  300: '#7dbe8d',
  400: '#52a867',
  500: '#2d8a4e', // main accent
  600: '#246e3e',
  700: '#1b522f',
  800: '#123720',
  900: '#091b10',
} as const;

export const earth = {
  50:  '#faf8f4',
  100: '#f2ede3',
  200: '#e3d9c7',
  500: '#9c8566',
  700: '#6b5b45',
} as const;

export const gray = {
  50:  '#f9f7f4', // warm-tinted page background
  100: '#f1ede8',
  200: '#e4ddd5',
  300: '#d0c7bc',
  400: '#b0a595',
  500: '#8c7f72',
  600: '#6b5f55',
  700: '#4a4038',
  800: '#2e2720',
  900: '#1a1410',
} as const;

// ─── Semantic Tokens ────────────────────────────────────────────────────────

export const colors = {
  bg:             gray[50],
  surface:        '#ffffff',
  surfaceAlt:     earth[50],
  border:         gray[200],
  borderFocus:    green[500],

  text:           '#1c1917',
  textMuted:      gray[500],
  textLight:      gray[400],
  textInverse:    '#ffffff',

  accent:         green[500],
  accentDark:     green[600],
  accentDeep:     green[700],
  accentLight:    green[50],
  accentMid:      green[100],

  error:          '#b91c1c',
  errorBg:        '#fef2f2',
  errorBorder:    '#fecaca',

  success:        green[600],
  successBg:      green[50],
} as const;

// ─── Shadows ────────────────────────────────────────────────────────────────
// React Native shadows require separate ios/android handling

export const shadows = {
  xs: {
    shadowColor: green[500],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  sm: {
    shadowColor: green[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: green[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: green[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 8,
  },
} as const;

// ─── Radii ──────────────────────────────────────────────────────────────────

export const radius = {
  xs:  6,
  sm:  10,
  md:  14,
  lg:  20,
  xl:  28,
  full: 9999,
} as const;

// ─── Spacing ────────────────────────────────────────────────────────────────

export const spacing = {
  1:  4,
  2:  8,
  3:  12,
  4:  16,
  5:  20,
  6:  24,
  7:  28,
  8:  32,
  10: 40,
  12: 48,
} as const;

// ─── Typography ─────────────────────────────────────────────────────────────

export const fontSize = {
  xs:  11,
  sm:  13,
  base: 15,
  md:  16,
  lg:  18,
  xl:  20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 34,
} as const;

export const fontWeight = {
  regular:   '400' as const,
  medium:    '500' as const,
  semibold:  '600' as const,
  bold:      '700' as const,
  extrabold: '800' as const,
};
