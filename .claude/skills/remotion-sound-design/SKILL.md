---
name: remotion-sound-design
description: Sound design for Remotion videos in this repo - picking sound effects, syncing them to animation frames, layering music and SFX, mixing levels, licensing, and checking the result. Use whenever adding sound effects, music, whooshes, pops or any audio to a composition.
---

# Remotion Sound Design

API details live in the official skills: `remotion-markup/audio.md` (trim, volume,
speed, pitch, loop) and `remotion-markup/sfx.md` (stock SFX list). This file is the
craft and the repo-specific setup on top of them.

## Setup in this repo
- `<Audio>` comes from `@remotion/media` (installed). Never `<Audio>` from `remotion` in new code.
- Put sound files in `public/sfx/` and load with `staticFile("sfx/<name>.ogg")`.
  `.ogg`, `.wav`, `.mp3` all work.
- Prefer local files over `https://remotion.media/*.wav`: cloud sandboxes can't reach
  remotion.media (DNS fails), and local files make renders reproducible.
- Keep a `public/sfx/CREDITS.md` line per file: source, author, license.

## Where sounds come from (license first)
| Source | License | Use for |
|---|---|---|
| Kenney packs via github.com/kapishdima/soundcn `assets/kenney_*` | CC0, safe for commercial | UI clicks, pops, drops, glass, whooshes-ish, impacts, jingles |
| `https://remotion.media/*.wav` (list in `sfx.md`) | Hosted by Remotion; meme sounds (vine-boom, bruh, ...) are not cleared for commercial use | Quick tests, personal/meme edits |
| soundcn `assets/wow/` | Blizzard property, not free | Never use |

Fetch a single soundcn file without cloning everything:
`git clone --depth 1 --filter=blob:none --no-checkout https://github.com/kapishdima/soundcn s && git -C s show HEAD:assets/kenney_interface-sounds/drop_002.ogg > public/sfx/drop.ogg`

Useful Kenney packs: `kenney_interface-sounds` (click, confirmation, drop, glass, maximize/minimize,
pluck, scroll, switch, toggle, tick), `kenney_impact-sounds` (impactBell, impactGlass, impactSoft,
footsteps), `kenney_digital-audio` (pepSound, powerUp, zap, laser), `kenney_music-jingles` (short
stings for intros/outros).

## Matching sound to motion
| On screen | Sound |
|---|---|
| Scene cut / slide / wipe transition | whoosh or whip, starting 2-4 frames before the cut |
| Emoji or badge spring pop | short pop / pluck / drop on the frame the scale crosses ~0.6 |
| Text slam, big title landing | impact or vine-boom-style hit on the landing frame |
| Hashtag pills / list items staggering in | soft ticks, one per item, same stagger as visuals; vary pitch |
| Button / CTA press | mouse-click or switch |
| Price / number reveal | ding or cash-register style chime |
| Mistake / ❌ | error buzz or record-scratch |
| Success / ✅ | confirmation chime |
| Logo end card | short music jingle sting |
| Liquid, coffee pour, drip | drop / glass / bubble sounds |

## Timing rules
- Sound must be frame-accurate: put `from={N}` directly on `<Audio>` using the same
  frame number that drives the animation. Derive both from one constant so they never drift.
  ```tsx
  const POP = Math.round(0.4 * fps);
  <EmojiPop from={POP} />
  <Audio src={staticFile("sfx/pop.ogg")} from={POP} volume={0.6} premountFor={fps} />
  ```
- Anticipation: whooshes start a few frames *before* the motion peaks; impacts land
  exactly on the contact frame. Never late.
- Give every `<Audio>` `premountFor={fps}`.
- Don't trigger the same sample twice within ~3 frames; it sounds like a glitch.
- Repeated hits (ticks for each list item): alternate 2-3 variants (`click_001/002/003`)
  or nudge `toneFrequency` (0.9-1.15, render-only) so it isn't machine-gun identical.
- Max ~1 prominent SFX per beat; 3-6 per 10 s Reel. Silence makes hits land.

## Mixing levels (`volume` 0-1)
| Layer | Volume |
|---|---|
| Voiceover | 1.0 |
| Key hits (title slam, CTA) | 0.7-0.9 |
| Transitions (whoosh) | 0.4-0.6 |
| Ticks / UI clicks | 0.25-0.4 |
| Background music under voice | 0.12-0.2 |
| Background music, no voice | 0.4-0.6 |

- Music fades: fade in over ~0.5 s, fade out over the last 1-1.5 s, with clamped `interpolate`
  inline on `volume`.
- Ducking: drop music to ~0.15 while voiceover talks, using an interpolated volume curve
  around the voice segments.
- Stay below clipping. Everything summed should peak around -3 to -1 dBFS.
- Sound-off viewers still need the story from visuals; sound adds punch, it doesn't carry info.

## Verify after render
Remotion has no audio meter in CLI output, so check with ffmpeg:
```bash
# Peak level (should be below 0 dB, ideally -3..-1)
ffmpeg -i out/video.mp4 -af astats -f null - 2>&1 | grep "Peak level"
# Where sounds start/stop (compare with the frames you intended; frame = seconds * fps)
ffmpeg -i out/video.mp4 -af silencedetect=n=-40dB:d=0.1 -f null - 2>&1 | grep silence_
```
Verified here: a drop SFX at `from={15}` (30 fps) starts at exactly 0.500 s, peak -3 dB at volume 0.8.

## Rendering in a cloud sandbox
Add `--browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`
when Remotion's Chrome download is blocked.
