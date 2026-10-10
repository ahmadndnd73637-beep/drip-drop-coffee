---
name: remotion-reel-editor
description: Rules for editing short-form vertical videos (Instagram Reels, TikTok, YouTube Shorts) with Remotion in this repo. Use whenever making or changing a Reel/TikTok/Shorts-style composition, or when the user asks for a social video with emojis, hashtag pills, captions or animated shapes.
---

# Remotion Reel Editor

This is the Reels/TikTok style layer. For Remotion API rules follow the official
`remotion-best-practices` / `remotion-markup` skills (transitions, effects, light leaks,
text highlights, captions). For audio follow `remotion-sound-design`.

Act as a professional short-form video editor. Output must feel human-crafted and
dynamic, not template-like. Source: "Remotion Video Editor Guide".

## Mindset
- Motion first: nothing sits static for more than 0.5 s without a reason.
- Every element enters and exits with an animation; nothing just appears or disappears.
- Emojis are visual anchors that replace or complement words, not decoration.
- Captions and shapes breathe: generous padding, no clutter.
- 2-3 colors per scene, high contrast, dark or vibrant backgrounds.
- Time cuts, text pops and shape reveals to the beat.

## Composition
- Vertical: 1080x1920, 30 fps. Square posts only: 1080x1080.
- ~10 s default (300 frames); adjust per video.
- Register in `src/Root.tsx` next to the existing `DripDropPromo` (16:9 site promo).
- This repo bundles fonts via `@fontsource/*` (see `src/theme.ts`); keep renders offline-safe,
  don't add `@remotion/google-fonts`.

## Animation patterns
Destructure at the top of every component:
`const frame = useCurrentFrame(); const { fps, durationInFrames } = useVideoConfig();`

- Fade in: `interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' })`
- Slide up: `interpolate(frame, [0, 20], [60, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })`
- Spring pop: `spring({ fps, frame, config: { damping: 10, stiffness: 200 } })`
- Typewriter: `text.slice(0, Math.floor(interpolate(frame, [0, 30], [0, text.length], { extrapolateRight: 'clamp' })))`
- Pulse loop: `1 + 0.06 * Math.sin((frame / fps) * Math.PI * 2)`
- Exit fade: `interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' })`
- Opacity interpolations always clamp. Never `'extend'` on opacity.

## Emojis
- Own `div`, font-size 80-200 px, never inline inside caption text.
- Every emoji enters with a spring pop: scale 0 to 1, slight overshoot
  (stiffness 150-200, damping 8-10).
- Above or beside the main text, never below. 1-3 per scene.
- Match meaning: 🔥 energy, ✅ facts, 💡 ideas, ❌ mistakes, 🎯 goals, 💰 sales, 🚀 growth.
- Drop shadow for depth: `filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))'`.

```tsx
const EmojiPop: React.FC<{ emoji: string; from: number }> = ({ emoji, from }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ fps, frame: frame - from, config: { damping: 9, stiffness: 180 } });
  return (
    <div style={{ fontSize: 120, transform: `scale(${scale})`, display: 'inline-block',
      filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}>
      {emoji}
    </div>
  );
};
```

## Shapes (always animated)
| Shape | Use | Animation |
|---|---|---|
| Rounded rectangle | Caption background, highlight box | scaleX 0→1 wipe |
| Circle / pill | Badge, step number, tag | Spring pop from center |
| Line / underline | Emphasis, separator | Wipe left→right |
| Triangle / arrow | Direction, CTA pointer | Bounce slide-in |
| Gradient overlay | Legibility over image/video | Fade in with content |
| Progress bar | Timer, list completion | Width 0→100% |

Wipe reveal: `scaleX` from `interpolate(frame - start, [0, 20], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })`
with `transformOrigin: 'left center'`, `borderRadius: 16`, `overflow: 'hidden'`.

Hashtags are always pills (`borderRadius: 999`, padding `8px 20px`, weight 700, ~32-36 px),
staggered about 5-6 frames apart with fade + small slide up. Never plain text.

## Captions
- Max 7 words per line; split long sentences over 2 lines.
- Main 60-90 px, secondary 40-55 px. Bold/ExtraBold only.
- White on dark or dark on light; never grey on grey.
- Every caption has a background: translucent pill, full-width bar, or outline stroke.
- Word-by-word highlight: color the active word (e.g. `#FFE500`), others white, weight 800.
- Emoji + text on one line: flex, `alignItems: 'center'`, `gap: 16`.
- Center-align; left-align only lists.

## Scene structure
Split into `<Sequence>` per scene, never one flat component. Default 10 s timing:

| Scene | Time | Content |
|---|---|---|
| Hook | 0-2 s | Bold claim, emoji pop, question. No intro. |
| Point 1 | 2-4 s | Key message + supporting visual |
| Point 2 | 4-6 s | Second message, keep energy high |
| Point 3 | 6-8 s | Third point or expansion, hashtag pills |
| CTA | 8-10 s | Follow / save / comment, animated button |

## Instagram rules
- First 1.5 s must hook: start mid-action, never a logo or intro.
- Safe zone: text within middle 80% (108 px from side edges at 1080 wide).
- Bottom 300 px covered by IG UI; top 200 px may hold the status bar. Keep both clear.
- High contrast ("readable on a phone in a bright room?").
- Dark (near-black, deep purple, navy) or bold gradient background. Never plain white.
- Cut every 2-3 s.
- Sound-off: captions + visuals tell the whole story.
- Hold a static end frame for 0.5 s after animations finish.

## Palettes
Keep palettes as constants (e.g. in `src/theme.ts`); never hardcode hex inside components.

| Palette | Background | Primary | Accent | Text |
|---|---|---|---|---|
| Dark Purple | #0d0b1e | #6c63ff | #ff6584 | #ffffff |
| Deep Navy | #0a0e2b | #4a90e2 | #00d4aa | #ffffff |
| Midnight Gold | #1a1200 | #f5a623 | #e03c31 | #ffffff |
| Soft Dark | #1a1a2e | #e94560 | #0f3460 | #f5f5f5 |

For Drip Drop brand videos, the brand palette in `src/theme.ts` on a dark base
(`black` #1f2226 + `lightBrown` #c7a17a + white) fits these rules.

## Scene template
Base every scene on this shape: gradient background (`linear-gradient(160deg, #0d0b1e 0%, #1e1040 100%)`),
column flex centered with `gap: 32`; a 160 px emoji spring-popped (damping 9, stiffness 200)
with colored drop shadow; caption sliding up over frames 8-24 (80→0 px, fade 0→1) inside a pill
(radius 20, padding `20px 40px`, 72 px weight 800) whose `scaleX` wipes 0→1 over frames 6-22;
then hashtag pills staggered from frame 20, 6 frames apart.

## Pre-render checklist
- [ ] Every element has an entrance animation.
- [ ] All opacity interpolations clamp.
- [ ] Emojis 80 px+ with spring animations.
- [ ] Text bold, high contrast, inside safe zones.
- [ ] Hashtags are pills.
- [ ] Scenes split into Sequences.
- [ ] CTA scene at the end.
- [ ] 0.5 s static end frame.
- [ ] Nothing important in bottom 300 px or top 200 px.
- [ ] Dark or high-contrast gradient background.
- [ ] ≤ 3 colors per scene.
- [ ] Checked at 1080x1920 (extract frames with ffmpeg and look at them).

## Common mistakes
Static text · plain-text hashtags · `'extend'` on opacity · one flat component ·
white background · small emojis · no CTA · ignoring safe zones (108 px padding minimum).

## Rendering here
`npx remotion render src/index.ts <CompId> out/<name>.mp4 --codec h264 --crf 17`.
In cloud sandboxes without internet for Chrome, add
`--browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`.
