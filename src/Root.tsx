import { Composition } from "remotion";
import { DripDropPromo, PROMO_DURATION } from "./DripDropPromo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="DripDropPromo"
      component={DripDropPromo}
      durationInFrames={PROMO_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
