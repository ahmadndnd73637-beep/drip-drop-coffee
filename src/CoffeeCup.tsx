import { interpolate, useCurrentFrame } from "remotion";
import { colors } from "./theme";

// Steaming cup drawn in SVG, since the site's images aren't in the repo.
export const CoffeeCup: React.FC<{ size: number; fill?: number }> = ({
  size,
  fill = 1,
}) => {
  const frame = useCurrentFrame();
  const coffeeTop = interpolate(fill, [0, 1], [170, 92]);

  const steam = (offset: number, x: number) => {
    const t = (frame + offset) % 60;
    const opacity = interpolate(t, [0, 20, 60], [0, 0.7, 0]) * fill;
    const y = interpolate(t, [0, 60], [0, -40]);
    return (
      <path
        d={`M${x} 70 q-12 -18 0 -36 q12 -18 0 -36`}
        stroke={colors.lightBrown}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
        opacity={opacity}
        transform={`translate(0 ${y})`}
      />
    );
  };

  return (
    <svg width={size} height={size} viewBox="0 0 260 260">
      <defs>
        <clipPath id="cup-body">
          <path d="M40 80 h150 v70 a75 75 0 0 1 -150 0 z" />
        </clipPath>
      </defs>
      {steam(0, 85)}
      {steam(20, 115)}
      {steam(40, 145)}
      <rect x={0} y={coffeeTop} width={260} height={200} fill="#5a3a22" clipPath="url(#cup-body)" />
      <path
        d="M40 80 h150 v70 a75 75 0 0 1 -150 0 z"
        fill="none"
        stroke={colors.black}
        strokeWidth={8}
      />
      <path
        d="M190 100 a30 30 0 0 1 0 60"
        fill="none"
        stroke={colors.black}
        strokeWidth={8}
      />
      <ellipse cx={115} cy={240} rx={100} ry={10} fill={colors.lightBrown} opacity={0.5} />
    </svg>
  );
};
