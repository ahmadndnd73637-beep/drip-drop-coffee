"""Synthesizes the AlSaad promo music bed, timed to the AlsaadPromo composition.

144 BPM, so one bar (4 beats) is exactly 50 frames at 30 fps and every scene
cut (every 100 frames) lands on a 2-bar boundary.

Usage: python3 scripts/make-alsaad-music.py public/music/alsaad-beat.wav
"""
import sys
import wave

import numpy as np
from scipy.signal import butter, sosfilt

SR = 44100
FPS = 30
BPM = 144
BEAT = 60 / BPM
DURATION = 1092 / FPS  # matches ALSAAD_PROMO_DURATION
N = int(SR * DURATION) + SR

# Timeline in seconds, from AlsaadPromo / AlsaadReveal frame constants.
DROP_1 = 262 / FPS  # first scene starts
BREAK = 762 / FPS  # "محتار؟" scene: breakdown
DROP_2 = 862 / FPS  # outro
END_HIT = DROP_2 + 8 * 4 * BEAT / 2  # 4 bars into the outro
CUTS = [(262 + 100 * i) / FPS for i in range(1, 7)]

rng = np.random.default_rng(7)
L = np.zeros(N)
R = np.zeros(N)


def t_of(n):
    return np.arange(n) / SR


def lp(x, hz, order=2):
    return sosfilt(butter(order, hz, "low", fs=SR, output="sos"), x)


def hp(x, hz, order=2):
    return sosfilt(butter(order, hz, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def add(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR)
    if i >= N or i + len(sig) <= 0:
        return
    sig = sig[: N - i]
    L[i : i + len(sig)] += sig * gain * (1 - max(0, pan))
    R[i : i + len(sig)] += sig * gain * (1 + min(0, pan))


def note_hz(midi):
    return 440 * 2 ** ((midi - 69) / 12)


def saw(freq, n, detune=0.0):
    t = t_of(n)
    return 2 * ((t * freq * (1 + detune)) % 1) - 1


# ---- Instruments -------------------------------------------------------------
def kick():
    n = int(0.42 * SR)
    t = t_of(n)
    f = 45 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 7)
    click = hp(rng.standard_normal(n), 2000) * np.exp(-t * 300) * 0.3
    return np.tanh((body + click) * 1.6)


def clap():
    n = int(0.25 * SR)
    t = t_of(n)
    noise = bp(rng.standard_normal(n), 900, 5000)
    env = np.exp(-t * 18)
    for d in (0.0, 0.011, 0.022):  # three quick hits read as a clap
        env += (t >= d) * np.exp(-(t - d).clip(0) * 120) * 0.6
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.3
    return (noise * env + tone) * 0.5


def hat(open_=False):
    n = int((0.16 if open_ else 0.045) * SR)
    t = t_of(n)
    return hp(rng.standard_normal(n), 7500) * np.exp(-t * (22 if open_ else 90)) * 0.35


def snare_roll_hit():
    n = int(0.1 * SR)
    t = t_of(n)
    return bp(rng.standard_normal(n), 1200, 6000) * np.exp(-t * 35) * 0.5


def bass_note(midi, length):
    n = int(length * SR)
    t = t_of(n)
    f = note_hz(midi)
    x = 0.6 * saw(f, n) + 0.4 * np.sign(np.sin(2 * np.pi * f / 2 * t))
    x = lp(x, 420)
    env = np.minimum(1, t / 0.005) * np.exp(-t * 4)
    return np.tanh(x * env * 1.4) * 0.55


def pad_chord(midis, length, cutoff):
    n = int(length * SR)
    t = t_of(n)
    x = np.zeros(n)
    for m in midis:
        for d in (-0.008, -0.003, 0.0, 0.004, 0.009):
            x += saw(note_hz(m), n, d)
    x = lp(x / (len(midis) * 5), cutoff, order=2)
    env = np.minimum(1, t / 0.08) * np.minimum(1, (length - t) / 0.08)
    return x * env * 0.5


def pluck(midi, length=0.22):
    n = int(length * SR)
    t = t_of(n)
    f = note_hz(midi)
    x = saw(f, n) * 0.5 + np.sin(2 * np.pi * f * 2 * t) * 0.3
    return lp(x, 3200) * np.exp(-t * 14) * 0.35


def riser(length):
    n = int(length * SR)
    t = t_of(n)
    p = t / length
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    # Sweep a band upwards in chunks.
    chunk = int(0.05 * SR)
    for s in range(0, n, chunk):
        e = min(n, s + chunk)
        c = 400 + 7000 * p[s] ** 2
        out[s:e] = bp(noise[max(0, s - 2000) : e], c, c * 1.6)[-(e - s) :]
    sweep = np.sin(2 * np.pi * np.cumsum(200 + 1200 * p**2) / SR) * 0.15
    return (out * 0.5 + sweep) * p**2


def impact():
    n = int(1.6 * SR)
    t = t_of(n)
    boom = np.sin(2 * np.pi * np.cumsum(30 + 60 * np.exp(-t * 6)) / SR) * np.exp(-t * 2.2)
    noise = lp(rng.standard_normal(n), 1800) * np.exp(-t * 4) * 0.4
    return np.tanh((boom + noise) * 1.3) * 0.9


# ---- Arrangement --------------------------------------------------------------
# A minor pop progression: Am - F - C - G, one bar each.
CHORDS = [[57, 60, 64], [53, 57, 60], [55, 60, 64], [55, 59, 62]]
BASS = [45, 41, 48, 43]
BAR = 4 * BEAT

sidechain = np.ones(N)


def duck_at(time):
    i = int(time * SR)
    n = int(0.3 * SR)
    t = t_of(n)
    curve = 1 - 0.65 * np.exp(-t * 14)
    seg = sidechain[i : i + n]
    seg *= curve[: len(seg)]


def groove(start, end, arp=True, hats_on=True, claps=True):
    b = 0
    while start + b * BEAT < end - 1e-6:
        tb = start + b * BEAT
        bar = int(b // 4) % 4
        add(kick(), tb, 0.95)
        duck_at(tb)
        if claps and b % 4 in (1, 3):
            add(clap(), tb, 0.6)
        if hats_on:
            add(hat(open_=True), tb + BEAT / 2, 0.5, pan=0.2)
            add(hat(), tb + BEAT / 4, 0.25, pan=-0.3)
            add(hat(), tb + 3 * BEAT / 4, 0.25, pan=-0.3)
        add(bass_note(BASS[bar], BEAT / 2), tb + BEAT / 2, 0.8)
        if arp:
            chord = CHORDS[bar]
            for k in range(4):
                add(pluck(chord[k % 3] + 12 + (12 if k == 3 else 0)), tb + k * BEAT / 4, 0.55,
                    pan=-0.4 if k % 2 else 0.4)
        b += 1


def pads(start, end, cutoff, gain):
    b = 0
    while start + b * BAR < end - 1e-6:
        tb = start + b * BAR
        length = min(BAR, end - tb)
        add(pad_chord(CHORDS[b % 4], length + 0.05, cutoff), tb, gain, pan=0.0)
        b += 1


# Intro: filtered pads, a gentle arp and a riser into the first drop.
pads(0, DROP_1, 1100, 1.1)
b = 0
while b * BEAT < DROP_1 - 2 * BAR:
    chord = CHORDS[int(b // 4) % 4]
    add(pluck(chord[b % 3] + 12), b * BEAT, 0.6, pan=0.3 if b % 2 else -0.3)
    b += 1
add(riser(2 * BAR), DROP_1 - 2 * BAR, 0.55)

# Soft thumps on the ball's landings, then a building pulse while the logo is written.
for f in (14, 27, 40, 53, 68):
    add(lp(kick(), 300), f / FPS, 0.7)
WRITE = 96 / FPS
b = 0
while WRITE + b * BEAT < DROP_1 - BEAT:
    tb = WRITE + b * BEAT
    build = (tb - WRITE) / (DROP_1 - WRITE)
    add(lp(kick(), 250 + 2000 * build), tb, 0.45 + 0.4 * build)
    add(hat(), tb + BEAT / 2, 0.12 + 0.25 * build, pan=0.3)
    b += 1

# Drop 1: full groove under the scenes.
add(impact(), DROP_1, 0.75)
pads(DROP_1, BREAK, 2600, 0.55)
groove(DROP_1, BREAK)

# Snare-roll fills in the last beat before each scene cut keep the energy rising.
for cut in CUTS[:4]:
    for k in range(4):
        add(snare_roll_hit(), cut - BEAT + k * BEAT / 4, 0.25 + 0.15 * k)

# Breakdown on the question scene, then riser into the outro drop.
pads(BREAK, DROP_2, 1400, 0.7)
b = 0
while BREAK + b * BEAT < DROP_2 - BAR:
    add(kick(), BREAK + b * 2 * BEAT, 0.5)
    b += 1
add(riser(BAR * 1.5), DROP_2 - BAR * 1.5, 0.6)
for k in range(8):
    add(snare_roll_hit(), DROP_2 - BEAT * 2 + k * BEAT / 4, 0.2 + 0.08 * k)

# Drop 2: the CTA outro, ending on a final hit with a pad tail.
add(impact(), DROP_2, 0.85)
pads(DROP_2, END_HIT, 3200, 0.55)
groove(DROP_2, END_HIT)
add(impact(), END_HIT, 0.8)
tail = pad_chord(CHORDS[0], DURATION - END_HIT, 1800)
tail *= np.linspace(1, 0, len(tail)) ** 1.5
add(tail, END_HIT, 0.8)

# ---- Mix ----------------------------------------------------------------------
# Pump everything except kicks with the sidechain (kicks were added before, so
# apply the curve to the full mix gently; it reads as the classic pumping feel).
L *= 0.55 + 0.45 * sidechain
R *= 0.55 + 0.45 * sidechain

mix = np.stack([L, R], axis=1)[: int(DURATION * SR)]
mix = np.tanh(mix * 0.9)
fade = int(0.02 * SR)
mix[:fade] *= np.linspace(0, 1, fade)[:, None]
mix /= np.max(np.abs(mix)) / 10 ** (-1 / 20)  # peak at -1 dBFS

out = sys.argv[1]
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print("wrote", out, f"{len(mix) / SR:.2f}s")
