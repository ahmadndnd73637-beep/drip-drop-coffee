import { Composition } from "remotion";
import { DripDropPromo, PROMO_DURATION } from "./DripDropPromo";
import { ALSAAD_DURATION, AlsaadReveal } from "./alsaad/AlsaadReveal";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DripDropPromo"
        component={DripDropPromo}
        durationInFrames={PROMO_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AlsaadReveal"
        component={AlsaadReveal}
        durationInFrames={ALSAAD_DURATION}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ words: ["ONE", "NAME,", "ENDLESS", "POSSIBILITIES"] }}
      />
    </>
  );
};
