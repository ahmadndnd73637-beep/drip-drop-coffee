import { Composition } from "remotion";
import { DripDropPromo, PROMO_DURATION } from "./DripDropPromo";
import { ALSAAD_PROMO_DURATION, AlsaadPromo } from "./alsaad/AlsaadPromo";
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
      <Composition
        id="AlsaadPromo"
        component={AlsaadPromo}
        durationInFrames={ALSAAD_PROMO_DURATION}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          words: ["IMPORTED", "LAPTOPS,", "ORIGINAL", "QUALITY"],
          copy: {
            heroTitle: "لابتوبات استيراد",
            heroSub: "جودة أصلية… تعيش معاك سنين",
            useTitle: "جهاز على مقاس شغلك",
            useTags: ["الشغل", "الدراسة", "الجيمنج", "التصميم", "البرمجة"],
            specsTitle: "مواصفات تفرق معاك",
            specs: ["معالجات قوية", "هارد SSD سريع", "رامات عالية", "شاشات واضحة"],
            checkTitle: "كل جهاز بيتفحص قبل ما يوصلك",
            checks: ["الشاشة", "الكيبورد", "البطارية", "الأداء"],
            priceTitle: "أسعار تنافسية",
            priceSub: "وجهاز يستاهل كل جنيه",
            helpQuestion: "محتار؟",
            helpAnswer: "قولنا هتستخدمه في إيه… وإحنا نرشحلك الأنسب",
            outroLine: "لابتوبات استيراد",
            cta: "اطلب دلوقتي",
            ctaSub: "ابعتلنا رسالة وهنرد عليك",
          },
        }}
      />
    </>
  );
};
