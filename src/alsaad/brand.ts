import "@fontsource/open-sans/800.css";

// AlSaad identity, sampled from the supplied logo.
export const brand = {
  blue: "#1454E9",
  white: "#FFFFFF",
  font: '"Open Sans", sans-serif',
};

// Logo PNGs are cropped from the source logo at source pixels (51, 875), 1899x251.
export const LOGO_SRC = { x: 51, y: 875, width: 1899, height: 251 };
export const LOGO_WIDTH = 760;
export const LOGO_SCALE = LOGO_WIDTH / LOGO_SRC.width;
export const LOGO_HEIGHT = LOGO_SRC.height * LOGO_SCALE;
// Stroke width of the logo lettering, in source pixels.
export const LOGO_STROKE = 26;

// Centerlines of each letter in source pixels, in the order they are written.
export const LETTER_PATHS = [
  "M76,1106 L265,917 Q284,894 311,894 L338,894 Q348,894 348,904 L348,1106",
  "M415,894 L415,1060 Q415,1106 461,1106 L630,1106",
  "M900,894 L746,894 A52.5,52.5 0 0 0 746,999 L868,999 A53.5,53.5 0 0 1 868,1106 L694,1106",
  "M988,1106 L1177,917 Q1196,894 1223,894 L1250,894 Q1260,894 1260,904 L1260,1106",
  "M1355,1106 L1544,917 Q1563,894 1590,894 L1617,894 Q1627,894 1627,904 L1627,1106",
  "M1696,1000 L1696,1106 L1820,1106 A106,106 0 0 0 1820,894 L1684,894",
];
