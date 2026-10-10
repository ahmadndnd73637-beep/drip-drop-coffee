import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CoffeeCup } from "./CoffeeCup";
import { bodyFont, colors, headingFont } from "./theme";

const SCENE = {
  intro: { from: 0, duration: 120 },
  hero: { from: 120, duration: 150 },
  about: { from: 270, duration: 150 },
  menu: { from: 420, duration: 120 },
  outro: { from: 540, duration: 120 },
};

export const PROMO_DURATION = SCENE.outro.from + SCENE.outro.duration;

const FADE = 12;

// Fades a scene in and out over its own duration.
const Scene: React.FC<{
  duration: number;
  background: string;
  children: React.ReactNode;
}> = ({ duration, background, children }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, FADE, duration - FADE, duration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <AbsoluteFill
      style={{
        background,
        opacity,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: bodyFont,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// Slides and fades an element up into place after `delay` frames.
const Rise: React.FC<{
  delay?: number;
  distance?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, distance = 40, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
  });
  return (
    <div
      style={{
        opacity: progress,
        transform: `translateY(${(1 - progress) * distance}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontFamily: headingFont,
      color: colors.lightBrown,
      fontSize: 40,
      letterSpacing: 6,
      textTransform: "uppercase",
    }}
  >
    {children}
  </div>
);

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const dropY = interpolate(frame, [0, 28], [-300, 0], {
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });
  const dropOpacity = interpolate(frame, [24, 30], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fill = interpolate(frame, [28, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const titleScale = spring({ frame: frame - 45, fps, config: { damping: 14 } });

  return (
    <Scene duration={SCENE.intro.duration} background={colors.bg}>
      <div style={{ position: "relative", marginBottom: 20 }}>
        <svg
          width={40}
          height={60}
          viewBox="0 0 40 60"
          style={{
            position: "absolute",
            left: 160,
            top: 60,
            opacity: dropOpacity,
            transform: `translateY(${dropY}px)`,
          }}
        >
          <path d="M20 0 C20 0 0 30 0 40 a20 20 0 0 0 40 0 C40 30 20 0 20 0z" fill="#5a3a22" />
        </svg>
        <CoffeeCup size={380} fill={fill} />
      </div>
      <div
        style={{
          fontFamily: headingFont,
          fontWeight: 700,
          fontSize: 150,
          color: colors.darkGray,
          letterSpacing: 8,
          lineHeight: 1,
          transform: `scale(${titleScale})`,
        }}
      >
        DRIP <span style={{ color: colors.lightBrown }}>DROP</span>
      </div>
      <Rise delay={65}>
        <Eyebrow>Coffee House</Eyebrow>
      </Rise>
    </Scene>
  );
};

const Hero: React.FC = () => (
  <Scene duration={SCENE.hero.duration} background={colors.bgSecondary}>
    <div style={{ width: 1500, display: "flex", alignItems: "center", gap: 80 }}>
      <div style={{ flex: 1 }}>
        <Rise>
          <Eyebrow>Black coffee is awesome</Eyebrow>
        </Rise>
        <Rise delay={8}>
          <div
            style={{
              fontFamily: headingFont,
              fontWeight: 700,
              fontSize: 130,
              color: colors.darkGray,
              lineHeight: 1.05,
              margin: "20px 0 30px",
            }}
          >
            TIME DISCOVER
            <br />
            COFFEE HOUSE
          </div>
        </Rise>
        <Rise delay={20}>
          <div style={{ fontSize: 34, color: colors.darkGray, lineHeight: 1.5, maxWidth: 900 }}>
            Our café is your cozy escape from the rush of the day.
          </div>
        </Rise>
      </div>
      <Rise delay={14} distance={80}>
        <CoffeeCup size={460} />
      </Rise>
    </div>
  </Scene>
);

const AboutItem: React.FC<{ delay: number; title: string; text: string }> = ({
  delay,
  title,
  text,
}) => (
  <Rise delay={delay} style={{ flex: 1 }}>
    <div
      style={{
        background: colors.white,
        borderLeft: `10px solid ${colors.lightBrown}`,
        padding: "50px 56px",
        height: 300,
        boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ fontFamily: headingFont, fontSize: 60, color: colors.darkGray }}>{title}</div>
      <div style={{ fontSize: 34, color: colors.darkGray, lineHeight: 1.5, marginTop: 20 }}>
        {text}
      </div>
    </div>
  </Rise>
);

const About: React.FC = () => (
  <Scene duration={SCENE.about.duration} background={colors.bg}>
    <div style={{ width: 1500 }}>
      <Rise>
        <div style={{ fontFamily: headingFont, fontSize: 96, color: colors.darkGray }}>
          About <span style={{ color: colors.lightBrown }}>Drip Drop</span>
        </div>
      </Rise>
      <div style={{ display: "flex", gap: 60, marginTop: 60 }}>
        <AboutItem
          delay={15}
          title="A Cozy Escape"
          text="A calm, comfortable spot to work, study, or relax with friends."
        />
        <AboutItem
          delay={30}
          title="Quality & Sustainability"
          text="Carefully selected coffee with rich flavors in every cup."
        />
      </div>
    </div>
  </Scene>
);

const Menu: React.FC = () => {
  const frame = useCurrentFrame();
  const priceScale = interpolate(frame, [40, 50, 58], [0, 1.2, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <Scene duration={SCENE.menu.duration} background={colors.bgSecondary}>
      <Rise style={{ textAlign: "center" }}>
        <Eyebrow>Set Menu</Eyebrow>
        <div style={{ fontFamily: headingFont, fontSize: 110, color: colors.darkGray }}>
          Our Popular Menu
        </div>
      </Rise>
      <Rise delay={18} distance={60}>
        <div
          style={{
            marginTop: 60,
            display: "flex",
            alignItems: "center",
            gap: 50,
            background: colors.white,
            border: "2px solid #ddd",
            padding: "30px 70px 30px 40px",
            width: 1000,
          }}
        >
          <CoffeeCup size={200} />
          <div style={{ flex: 1, fontFamily: headingFont, fontSize: 80, color: colors.darkGray }}>
            Espresso
          </div>
          <div
            style={{
              fontFamily: headingFont,
              fontSize: 90,
              fontWeight: 700,
              color: colors.lightBrown,
              transform: `scale(${priceScale})`,
            }}
          >
            55
          </div>
        </div>
      </Rise>
    </Scene>
  );
};

const Outro: React.FC = () => (
  <Scene duration={SCENE.outro.duration} background={colors.black}>
    <Rise style={{ textAlign: "center" }}>
      <Eyebrow>What happens here</Eyebrow>
      <div
        style={{
          fontFamily: headingFont,
          fontWeight: 700,
          fontSize: 150,
          color: colors.white,
          letterSpacing: 4,
        }}
      >
        BOOK A TABLE
      </div>
    </Rise>
    <Rise delay={20}>
      <div
        style={{
          marginTop: 40,
          background: colors.lightBrown,
          color: colors.white,
          fontFamily: headingFont,
          fontSize: 48,
          letterSpacing: 4,
          padding: "18px 60px",
        }}
      >
        FAYOUM, EGYPT · 01022776309
      </div>
    </Rise>
    <Rise delay={35}>
      <div
        style={{
          marginTop: 60,
          fontFamily: headingFont,
          fontSize: 56,
          letterSpacing: 6,
          color: colors.white,
        }}
      >
        DRIP <span style={{ color: colors.lightBrown }}>DROP</span>
      </div>
    </Rise>
  </Scene>
);

export const DripDropPromo: React.FC = () => (
  <AbsoluteFill style={{ background: colors.black }}>
    <Sequence from={SCENE.intro.from} durationInFrames={SCENE.intro.duration}>
      <Intro />
    </Sequence>
    <Sequence from={SCENE.hero.from} durationInFrames={SCENE.hero.duration}>
      <Hero />
    </Sequence>
    <Sequence from={SCENE.about.from} durationInFrames={SCENE.about.duration}>
      <About />
    </Sequence>
    <Sequence from={SCENE.menu.from} durationInFrames={SCENE.menu.duration}>
      <Menu />
    </Sequence>
    <Sequence from={SCENE.outro.from} durationInFrames={SCENE.outro.duration}>
      <Outro />
    </Sequence>
  </AbsoluteFill>
);
