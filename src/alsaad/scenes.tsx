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
import { arabicFont, brand, LOGO_HEIGHT, LOGO_WIDTH } from "./brand";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export type Tone = "white" | "blue";
const bgOf = (tone: Tone) => (tone === "blue" ? brand.blue : brand.white);
const inkOf = (tone: Tone) => (tone === "blue" ? brand.white : brand.blue);

export const Sfx: React.FC<{ file: string; at: number; volume: number }> = ({
  file,
  at,
  volume,
}) => {
  const { fps } = useVideoConfig();
  return <Audio src={staticFile(`sfx/${file}`)} from={at} volume={volume} premountFor={fps} />;
};

// Fades and lifts children in after `delay` frames.
const Rise: React.FC<{
  delay: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  return (
    <div style={{ opacity: p, translate: `0px ${(1 - p) * 50}px`, ...style }}>{children}</div>
  );
};

const Title: React.FC<{ tone: Tone; delay?: number; size?: number; children: React.ReactNode }> = ({
  tone,
  delay = 0,
  size = 104,
  children,
}) => (
  <Rise delay={delay}>
    <div
      style={{
        fontFamily: arabicFont,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.25,
        color: inkOf(tone),
        textAlign: "center",
        direction: "rtl",
      }}
    >
      {children}
    </div>
  </Rise>
);

const Sub: React.FC<{ tone: Tone; delay: number; children: React.ReactNode }> = ({
  tone,
  delay,
  children,
}) => (
  <Rise delay={delay}>
    <div
      style={{
        fontFamily: arabicFont,
        fontWeight: 700,
        fontSize: 54,
        lineHeight: 1.4,
        color: inkOf(tone),
        opacity: 0.9,
        textAlign: "center",
        direction: "rtl",
      }}
    >
      {children}
    </div>
  </Rise>
);

// The brand dot drops in, bounces, and stretches into a divider line.
const DotDivider: React.FC<{ tone: Tone; at: number }> = ({ tone, at }) => {
  const frame = useCurrentFrame();
  const fall = interpolate(frame, [at - 10, at], [-260, 0], {
    ...clamp,
    easing: Easing.in(Easing.quad),
  });
  const width = interpolate(frame, [at + 2, at + 14], [24, 180], {
    ...clamp,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const squash = interpolate(frame, [at - 1, at, at + 3], [1, 0.6, 1], clamp);
  return (
    <div style={{ height: 24, display: "flex", justifyContent: "center", margin: "36px 0" }}>
      <div
        style={{
          width,
          height: 24 * squash,
          borderRadius: 999,
          background: inkOf(tone),
          translate: `0px ${fall}px`,
          opacity: frame >= at - 10 ? 1 : 0,
        }}
      />
    </div>
  );
};

const SceneFrame: React.FC<{ tone: Tone; children: React.ReactNode }> = ({ tone, children }) => (
  <AbsoluteFill
    style={{
      background: bgOf(tone),
      justifyContent: "center",
      alignItems: "center",
      padding: "260px 110px",
    }}
  >
    {children}
  </AbsoluteFill>
);

// Line-art laptop in the logo's monoline style; the lid opens and the screen lights up.
const Laptop: React.FC<{ tone: Tone; at: number; size: number }> = ({ tone, at, size }) => {
  const frame = useCurrentFrame();
  const ink = inkOf(tone);
  const draw = interpolate(frame, [at, at + 16], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.45, 0, 0.2, 1),
  });
  const lid = interpolate(frame, [at + 10, at + 28], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const glow = interpolate(frame, [at + 26, at + 36], [0, 1], clamp);
  const float = Math.sin(((frame - at) / 30) * Math.PI * 0.8) * 6 * glow;
  return (
    <div style={{ width: size, height: size * 0.66, position: "relative", translate: `0px ${float}px` }}>
      <svg viewBox="0 0 300 200" style={{ position: "absolute", inset: 0 }}>
        {/* Base */}
        <path
          d="M18,184 L282,184 Q290,184 286,176 L268,150 L32,150 L14,176 Q10,184 18,184 Z"
          fill="none"
          stroke={ink}
          strokeWidth={9}
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - draw}
        />
        <path d="M124,168 L176,168" stroke={ink} strokeWidth={8} strokeLinecap="round" opacity={draw} />
        {/* Lid hinges on the base and swings open */}
        <g style={{ transformOrigin: "150px 150px", scale: `1 ${lid}` }}>
          <rect
            x={40}
            y={10}
            width={220}
            height={140}
            rx={14}
            fill="none"
            stroke={ink}
            strokeWidth={9}
          />
          <rect x={56} y={26} width={188} height={108} rx={6} fill={ink} opacity={0.12 * glow} />
        </g>
      </svg>
      {/* Brand logo on the screen */}
      <Img
        src={staticFile(`alsaad/logo-${tone === "blue" ? "white" : "blue"}.png`)}
        style={{
          position: "absolute",
          left: size * 0.32,
          top: size * 0.66 * 0.33,
          width: size * 0.36,
          opacity: glow,
          scale: `${0.8 + 0.2 * glow}`,
        }}
      />
    </div>
  );
};

const Pill: React.FC<{ tone: Tone; delay: number; children: React.ReactNode }> = ({
  tone,
  delay,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - delay, fps, config: { damping: 10, stiffness: 180 } });
  return (
    <div
      style={{
        scale: `${pop}`,
        fontFamily: arabicFont,
        fontWeight: 700,
        fontSize: 50,
        padding: "10px 40px",
        borderRadius: 999,
        border: `5px solid ${inkOf(tone)}`,
        color: inkOf(tone),
        direction: "rtl",
      }}
    >
      {children}
    </div>
  );
};

// A check mark drawn inside a circle, followed by a label (right-to-left).
const CheckRow: React.FC<{ tone: Tone; at: number; children: React.ReactNode }> = ({
  tone,
  at,
  children,
}) => {
  const frame = useCurrentFrame();
  const ink = inkOf(tone);
  const circle = interpolate(frame, [at, at + 10], [0, 1], clamp);
  const tick = interpolate(frame, [at + 6, at + 14], [0, 1], clamp);
  return (
    <Rise delay={at - 4}>
      <div style={{ display: "flex", direction: "rtl", alignItems: "center", gap: 30 }}>
        <svg width={84} height={84} viewBox="0 0 84 84">
          <circle
            cx={42}
            cy={42}
            r={36}
            fill="none"
            stroke={ink}
            strokeWidth={7}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - circle}
          />
          <path
            d="M26,43 L38,55 L59,31"
            fill="none"
            stroke={ink}
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - tick}
          />
        </svg>
        <div style={{ fontFamily: arabicFont, fontWeight: 700, fontSize: 60, color: ink }}>
          {children}
        </div>
      </div>
    </Rise>
  );
};

// ---- Scenes ----------------------------------------------------------------

export type SceneCopy = {
  heroTitle: string;
  heroSub: string;
  useTitle: string;
  useTags: string[];
  specsTitle: string;
  specs: string[];
  checkTitle: string;
  checks: string[];
  priceTitle: string;
  priceSub: string;
  helpQuestion: string;
  helpAnswer: string;
  outroLine: string;
  cta: string;
  ctaSub: string;
};

export const HeroScene: React.FC<{ copy: SceneCopy }> = ({ copy }) => (
  <SceneFrame tone="white">
    <Laptop tone="white" at={6} size={620} />
    <div style={{ height: 70 }} />
    <Title tone="white" delay={30}>
      {copy.heroTitle}
    </Title>
    <DotDivider tone="white" at={46} />
    <Sub tone="white" delay={50}>
      {copy.heroSub}
    </Sub>
    <Sfx file="tick-1.ogg" at={6} volume={0.35} />
    <Sfx file="expand.ogg" at={18} volume={0.35} />
    <Sfx file="bounce-3.ogg" at={46} volume={0.55} />
  </SceneFrame>
);

export const UseScene: React.FC<{ copy: SceneCopy }> = ({ copy }) => (
  <SceneFrame tone="blue">
    <Title tone="blue" delay={8}>
      {copy.useTitle}
    </Title>
    <DotDivider tone="blue" at={24} />
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 28,
        direction: "rtl",
        marginTop: 20,
      }}
    >
      {copy.useTags.map((tag, i) => (
        <Pill key={tag} tone="blue" delay={34 + i * 8}>
          {tag}
        </Pill>
      ))}
    </div>
    <Sfx file="bounce-2.ogg" at={24} volume={0.5} />
    {copy.useTags.map((tag, i) => (
      <Sfx key={tag} file={i % 2 ? "pluck-2.ogg" : "pluck-1.ogg"} at={34 + i * 8} volume={0.45} />
    ))}
  </SceneFrame>
);

const ListScene: React.FC<{ tone: Tone; title: string; items: string[] }> = ({
  tone,
  title,
  items,
}) => (
  <SceneFrame tone={tone}>
    <Title tone={tone} delay={8} size={96}>
      {title}
    </Title>
    <DotDivider tone={tone} at={24} />
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        direction: "rtl",
        gap: 34,
        marginTop: 10,
      }}
    >
      {items.map((item, i) => (
        <CheckRow key={item} tone={tone} at={34 + i * 12}>
          {item}
        </CheckRow>
      ))}
    </div>
    <Sfx file="bounce-4.ogg" at={24} volume={0.5} />
    {items.map((item, i) => (
      <Sfx key={item} file="check.ogg" at={40 + i * 12} volume={0.5} />
    ))}
  </SceneFrame>
);

export const SpecsScene: React.FC<{ copy: SceneCopy }> = ({ copy }) => (
  <ListScene tone="white" title={copy.specsTitle} items={copy.specs} />
);

export const CheckScene: React.FC<{ copy: SceneCopy }> = ({ copy }) => (
  <ListScene tone="blue" title={copy.checkTitle} items={copy.checks} />
);

export const PriceScene: React.FC<{ copy: SceneCopy }> = ({ copy }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slam = spring({ frame: frame - 8, fps, config: { damping: 9, stiffness: 160 } });
  const underline = interpolate(frame, [26, 42], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  return (
    <SceneFrame tone="white">
      <div
        style={{
          scale: `${interpolate(slam, [0, 1], [1.6, 1])}`,
          opacity: interpolate(frame, [8, 12], [0, 1], clamp),
          fontFamily: arabicFont,
          fontWeight: 900,
          fontSize: 124,
          whiteSpace: "nowrap",
          color: brand.blue,
          direction: "rtl",
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {copy.priceTitle}
      </div>
      <div
        style={{
          height: 16,
          width: 520,
          borderRadius: 999,
          background: brand.blue,
          scale: `${underline} 1`,
          transformOrigin: "right center",
          margin: "30px 0 50px",
        }}
      />
      <Sub tone="white" delay={40}>
        {copy.priceSub}
      </Sub>
      <Sfx file="bounce-4.ogg" at={8} volume={0.8} />
      <Sfx file="transition.ogg" at={26} volume={0.4} />
    </SceneFrame>
  );
};

export const HelpScene: React.FC<{ copy: SceneCopy }> = ({ copy }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = spring({ frame: frame - 6, fps, config: { damping: 10, stiffness: 180 } });
  const wiggle = Math.sin((frame / fps) * Math.PI * 3) * 4 * interpolate(frame, [6, 50], [1, 0], clamp);
  return (
    <SceneFrame tone="blue">
      <div
        style={{
          scale: `${q}`,
          rotate: `${wiggle}deg`,
          fontFamily: arabicFont,
          fontWeight: 900,
          fontSize: 130,
          color: brand.white,
          direction: "rtl",
        }}
      >
        {copy.helpQuestion}
      </div>
      <DotDivider tone="blue" at={40} />
      <Sub tone="blue" delay={46}>
        {copy.helpAnswer}
      </Sub>
      <Sfx file="pluck-2.ogg" at={6} volume={0.5} />
      <Sfx file="bounce-1.ogg" at={40} volume={0.5} />
    </SceneFrame>
  );
};

export const OutroScene: React.FC<{ copy: SceneCopy }> = ({ copy }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // The dot sweeps left to right, uncovering the logo, then rests as its full stop.
  const sweep = interpolate(frame, [10, 34], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.65, 0, 0.35, 1),
  });
  const dotX = -40 + (LOGO_WIDTH + 18 + 12 + 40) * sweep;
  const cta = spring({ frame: frame - 70, fps, config: { damping: 10, stiffness: 160 } });
  const pulse = 1 + 0.04 * Math.sin(((frame - 70) / fps) * Math.PI * 2) * (frame > 90 ? 1 : 0);
  return (
    <SceneFrame tone="white">
      <div style={{ position: "relative", width: LOGO_WIDTH + 42, height: LOGO_HEIGHT }}>
        <Img
          src={staticFile("alsaad/logo-blue.png")}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: LOGO_WIDTH,
            height: LOGO_HEIGHT,
            clipPath: `inset(0 ${Math.max(0, LOGO_WIDTH - dotX)}px 0 0)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: dotX - 12,
            top: LOGO_HEIGHT * 0.92 - 12,
            width: 24,
            height: 24,
            borderRadius: 999,
            background: brand.blue,
            scale: `${interpolate(sweep, [0, 0.5, 1], [1, 1.6, 1])} 1`,
          }}
        />
      </div>
      <div style={{ height: 60 }} />
      <Title tone="white" delay={40} size={84}>
        {copy.outroLine}
      </Title>
      <div style={{ height: 70 }} />
      <div
        style={{
          scale: `${cta * pulse}`,
          background: brand.blue,
          color: brand.white,
          fontFamily: arabicFont,
          fontWeight: 900,
          fontSize: 72,
          padding: "14px 80px 22px",
          borderRadius: 999,
          direction: "rtl",
        }}
      >
        {copy.cta}
      </div>
      <div style={{ height: 34 }} />
      <Sub tone="white" delay={84}>
        {copy.ctaSub}
      </Sub>
      <Sfx file="expand.ogg" at={10} volume={0.4} />
      <Sfx file="sting.ogg" at={34} volume={0.6} />
      <Sfx file="cta.ogg" at={70} volume={0.5} />
    </SceneFrame>
  );
};
