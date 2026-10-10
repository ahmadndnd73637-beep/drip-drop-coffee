import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  brand,
  LETTER_PATHS,
  LOGO_HEIGHT,
  LOGO_SRC,
  LOGO_STROKE,
  LOGO_WIDTH,
} from "./brand";

export type AlsaadRevealProps = {
  words: string[];
};

export const ALSAAD_DURATION = 270;

const W = 1080;
const H = 1920;
const CY = H / 2;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---- Timeline (frames at 30 fps) -------------------------------------------
const LANDINGS = [14, 27, 40, 53];
const CENTER_LAND = 68;
const GROW_START = 74;
const GROW_END = 92;
const WRITE_START = 96;
const LETTER_STAGGER = 9;
const LETTER_DURATION = 12;
const WRITE_END = WRITE_START + LETTER_STAGGER * 5 + LETTER_DURATION;
const DOT_POP = 164;
const SHRINK_START = 180;
const SHRINK_END = 200;
const EXIT_START = 238;
const EXIT_END = 262;

// ---- Layout ----------------------------------------------------------------
const TEXT_SIZE = 52;
const BALL_W = 34;
const BALL_H = 22;
const LAND_Y = CY - TEXT_SIZE / 2 - BALL_H / 2 - 6;
const HOP_HEIGHT = 220;
const DOT_R = 12;
const DOT_GAP = 18;
const LOGO_LEFT_ALONE = (W - LOGO_WIDTH) / 2;
const LOGO_LEFT_FINAL = (W - (LOGO_WIDTH + DOT_GAP + DOT_R * 2)) / 2;
const LOGO_TOP = CY - LOGO_HEIGHT / 2;
const DOT_X = LOGO_LEFT_FINAL + LOGO_WIDTH + DOT_GAP + DOT_R;
// Bottom stroke of the lettering, so the dot sits like a full stop.
const DOT_Y = LOGO_TOP + (1106 - LOGO_SRC.y) * (LOGO_WIDTH / LOGO_SRC.width) - 1;

// Approximate advance widths (em) of Open Sans ExtraBold capitals, used to place
// the ball over each word without measuring the DOM.
const CHAR_EM: Record<string, number> = {
  A: 0.7, B: 0.68, C: 0.64, D: 0.74, E: 0.56, F: 0.54, G: 0.73, H: 0.76, I: 0.33,
  J: 0.3, K: 0.68, L: 0.55, M: 0.93, N: 0.78, O: 0.78, P: 0.65, Q: 0.78, R: 0.67,
  S: 0.58, T: 0.6, U: 0.75, V: 0.67, W: 0.98, X: 0.67, Y: 0.63, Z: 0.58,
  ",": 0.29, ".": 0.29, "&": 0.78,
};
const wordWidth = (w: string) =>
  [...w].reduce((sum, c) => sum + (CHAR_EM[c.toUpperCase()] ?? 0.62) * TEXT_SIZE, 0);
const WORD_GAP = 18;

const wordCenters = (words: string[]) => {
  const total =
    words.reduce((sum, w) => sum + wordWidth(w), 0) + WORD_GAP * (words.length - 1);
  let x = (W - total) / 2;
  return words.map((w) => {
    const c = x + wordWidth(w) / 2;
    x += wordWidth(w) + WORD_GAP;
    return c;
  });
};

// Position and spin of the bouncing ball for a given frame.
const ballState = (frame: number, centers: number[]) => {
  const points = [
    { f: 0, x: 40, y: CY - 520 },
    ...LANDINGS.map((f, i) => ({ f, x: centers[i], y: LAND_Y })),
    { f: CENTER_LAND, x: W / 2, y: CY },
  ];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    if (frame <= b.f) {
      const t = interpolate(frame, [a.f, b.f], [0, 1], clamp);
      const x = a.x + (b.x - a.x) * t;
      const arc = i === 1 ? 0 : HOP_HEIGHT * 4 * t * (1 - t);
      const y = a.y + (b.y - a.y) * (i === 1 ? t * t : t) - arc;
      return { x, y, rotate: t * 360 };
    }
  }
  return { x: W / 2, y: CY, rotate: 0 };
};

// Background flips blue/white on landings 1 and 3, like the reference.
const isBlueBeat = (frame: number) =>
  (frame >= LANDINGS[0] && frame < LANDINGS[1]) ||
  (frame >= LANDINGS[2] && frame < LANDINGS[3]);

const BounceIntro: React.FC<{ words: string[] }> = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const centers = wordCenters(words);
  const blue = isBlueBeat(frame);
  const ink = blue ? brand.white : brand.blue;
  const ball = ballState(frame, centers);

  // Squash on every landing.
  const squash = [...LANDINGS, CENTER_LAND].reduce(
    (s, f) => s * interpolate(frame, [f - 1, f, f + 3], [1, 0.65, 1], clamp),
    1,
  );

  // Ball turns into a circle, then grows to fill the frame.
  const round = interpolate(frame, [CENTER_LAND + 2, GROW_START], [0, 1], clamp);
  const radius = interpolate(frame, [GROW_START, GROW_END], [20, 1200], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  const growBlur = interpolate(
    frame,
    [GROW_START, GROW_START + 6, GROW_END - 2, GROW_END],
    [0, 4, 8, 0],
    clamp,
  );
  const textOut = interpolate(frame, [LANDINGS[3] + 4, LANDINGS[3] + 14], [1, 0], clamp);

  const ballW = interpolate(round, [0, 1], [BALL_W, 40]);
  const ballH = interpolate(round, [0, 1], [BALL_H, 40]);
  const growing = frame >= GROW_START;

  return (
    <AbsoluteFill style={{ background: blue ? brand.blue : brand.white }}>
      <AbsoluteFill style={{ opacity: textOut }}>
        {words.map((word, i) => {
          const enter = spring({
            frame: frame - LANDINGS[i],
            fps,
            config: { damping: 14, stiffness: 220 },
          });
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: centers[i] - wordWidth(word) / 2 - 20,
                width: wordWidth(word) + 40,
                top: CY - TEXT_SIZE * 0.7,
                textAlign: "center",
                fontFamily: brand.font,
                fontWeight: 800,
                fontSize: TEXT_SIZE,
                                color: ink,
                opacity: frame >= LANDINGS[i] ? enter : 0,
                translate: `0px ${(1 - enter) * 28}px`,
              }}
            >
              {word}
            </div>
          );
        })}
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: (growing ? W / 2 : ball.x) - (growing ? radius : ballW / 2),
          top: (growing ? CY : ball.y) - (growing ? radius : ballH / 2),
          width: growing ? radius * 2 : ballW,
          height: growing ? radius * 2 : ballH * squash,
          borderRadius: 9999,
          background: ink,
          rotate: growing ? "0deg" : `${ball.rotate}deg`,
          filter: `blur(${growBlur}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

// White strokes that write each letter of the logo.
const WrittenLogo: React.FC<{ left: number }> = ({ left }) => {
  const frame = useCurrentFrame();
  return (
    <svg
      viewBox={`${LOGO_SRC.x} ${LOGO_SRC.y} ${LOGO_SRC.width} ${LOGO_SRC.height}`}
      style={{ position: "absolute", left, top: LOGO_TOP, width: LOGO_WIDTH, height: LOGO_HEIGHT }}
    >
      {LETTER_PATHS.map((d, i) => {
        const start = WRITE_START + i * LETTER_STAGGER;
        const progress = interpolate(frame, [start, start + LETTER_DURATION], [0, 1], {
          ...clamp,
          easing: Easing.bezier(0.45, 0, 0.2, 1),
        });
        return (
          <path
            key={i}
            d={d}
            pathLength={1}
            fill="none"
            stroke={brand.white}
            strokeWidth={LOGO_STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1 1"
            strokeDashoffset={1 - progress}
            opacity={progress > 0 ? 1 : 0}
          />
        );
      })}
    </svg>
  );
};

const LogoImage: React.FC<{ color: "white" | "blue"; left: number; clipRight?: number }> = ({
  color,
  left,
  clipRight,
}) => (
  <Img
    src={staticFile(`alsaad/logo-${color}.png`)}
    style={{
      position: "absolute",
      left,
      top: LOGO_TOP,
      width: LOGO_WIDTH,
      height: LOGO_HEIGHT,
      clipPath: clipRight === undefined ? undefined : `inset(0 ${clipRight}px 0 0)`,
    }}
  />
);

const LogoScenes: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const swapToLogo = interpolate(frame, [WRITE_END, WRITE_END + 6], [0, 1], clamp);
  const logoLeft = interpolate(
    frame,
    [DOT_POP - 2, DOT_POP + 8],
    [LOGO_LEFT_ALONE, LOGO_LEFT_FINAL],
    { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) },
  );
  const dotScale = spring({
    frame: frame - DOT_POP,
    fps,
    config: { damping: 9, stiffness: 200 },
  });

  // Blue field shrinks into the dot, revealing the white layer underneath.
  const shrinkRadius = interpolate(frame, [SHRINK_START, SHRINK_END], [2300, DOT_R], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

  // Exit: the dot rolls left through the wordmark and leaves a speed trail.
  const exitT = interpolate(frame, [EXIT_START, EXIT_END], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  const dotX = DOT_X + (-80 - DOT_X) * exitT;
  const dotY = DOT_Y - 260 * exitT * exitT;
  const stretch = 1 + Math.min(1.2, (frame >= EXIT_START ? exitT : 0) * 3);
  const clipRight = Math.max(0, LOGO_LEFT_FINAL + LOGO_WIDTH - (dotX - DOT_R));
  const exiting = frame >= EXIT_START;
  const hold = interpolate(frame, [SHRINK_END, EXIT_START], [1, 1.03], clamp);

  const dot = (color: string) => (
    <div
      style={{
        position: "absolute",
        left: dotX - DOT_R,
        top: dotY - DOT_R,
        width: DOT_R * 2,
        height: DOT_R * 2,
        borderRadius: 9999,
        background: color,
        scale: `${dotScale * stretch} ${dotScale}`,
        rotate: exiting ? `${-15 * exitT}deg` : "0deg",
      }}
    />
  );

  return (
    <AbsoluteFill style={{ scale: exiting ? 1.03 : hold }}>
      {/* White layer, revealed as the blue field shrinks */}
      <AbsoluteFill style={{ background: brand.white }}>
        <LogoImage color="blue" left={logoLeft} clipRight={exiting ? clipRight : undefined} />
        {exiting &&
          [-10, 0, 10].map((dy, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: dotX + DOT_R + 10 + i * 18,
                top: dotY + dy - 2,
                height: 4,
                width: interpolate(exitT, [0, 0.4, 1], [0, 160 - i * 40, 60], clamp),
                borderRadius: 4,
                background: brand.blue,
                opacity: interpolate(exitT, [0, 0.2, 0.9, 1], [0, 0.6, 0.6, 0], clamp),
              }}
            />
          ))}
        {dot(brand.blue)}
      </AbsoluteFill>
      {/* Blue layer */}
      <AbsoluteFill
        style={{
          background: brand.blue,
          clipPath: `circle(${shrinkRadius}px at ${DOT_X}px ${DOT_Y}px)`,
          display: frame >= SHRINK_END ? "none" : "flex",
        }}
      >
        <div style={{ opacity: 1 - swapToLogo }}>
          <WrittenLogo left={logoLeft} />
        </div>
        <div style={{ opacity: swapToLogo }}>
          <LogoImage color="white" left={logoLeft} />
        </div>
        {frame >= DOT_POP && dot(brand.white)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Sfx: React.FC<{ file: string; at: number; volume: number }> = ({ file, at, volume }) => {
  const { fps } = useVideoConfig();
  return <Audio src={staticFile(`sfx/${file}`)} from={at} volume={volume} premountFor={fps} />;
};

export const AlsaadReveal: React.FC<AlsaadRevealProps> = ({ words }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: brand.white }}>
      {frame < GROW_END ? <BounceIntro words={words} /> : <LogoScenes />}

      <Sfx file="bounce-1.ogg" at={LANDINGS[0]} volume={0.6} />
      <Sfx file="bounce-2.ogg" at={LANDINGS[1]} volume={0.6} />
      <Sfx file="bounce-3.ogg" at={LANDINGS[2]} volume={0.6} />
      <Sfx file="bounce-4.ogg" at={LANDINGS[3]} volume={0.6} />
      <Sfx file="bounce-2.ogg" at={CENTER_LAND} volume={0.5} />
      <Sfx file="expand.ogg" at={GROW_START} volume={0.5} />
      {LETTER_PATHS.map((_, i) => (
        <Sfx
          key={i}
          file={i % 2 === 0 ? "tick-1.ogg" : "tick-2.ogg"}
          at={WRITE_START + i * LETTER_STAGGER}
          volume={0.35}
        />
      ))}
      <Sfx file="logo-done.ogg" at={WRITE_END} volume={0.55} />
      <Sfx file="bounce-1.ogg" at={DOT_POP} volume={0.5} />
      <Sfx file="shrink.ogg" at={SHRINK_START} volume={0.5} />
      <Sfx file="sting.ogg" at={SHRINK_END} volume={0.6} />
      <Sfx file="exit.ogg" at={EXIT_START} volume={0.55} />
    </AbsoluteFill>
  );
};
