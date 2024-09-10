#!/usr/bin/env python3
"""
PWM Tone Generator

based on https://www.coderdojotc.org/micropython/sound/04-play-scale/
"""

import machine
import utime

# GP16 is the speaker pin
SPEAKER_PIN = 16
C = 262
D = 294
E = 330
F = 349
G = 392
A = 440
B = 494

BPM = 156
BPS = BPM/60 # duration = #beats/BPS

# create a Pulse Width Modulation Object on this pin
speaker = machine.PWM(machine.Pin(SPEAKER_PIN))


def playtone(frequency: float, duration: float) -> None:
    speaker.duty_u16(1000)
    speaker.freq(frequency)
    utime.sleep(duration)

def rest(duration: float):
    speaker.duty_u16(0)
    utime.sleep(duration)
    
def quiet():
    speaker.duty_u16(0)


# freq: float = 30
# duration: float = 0.1  # seconds

def twinkle_twinkle():
    print("Playing frequency (Hz):")
    playtone(C, .75)
    rest(.25)
    playtone(C, .75)
    rest(.25)
    playtone(G, .75)
    rest(.25)
    playtone(G, .75)
    rest(.25)
    playtone(A, .75)
    rest(.25)
    playtone(A, .75)
    rest(.25)
    playtone(G, .75)


# for i in range(64):
#     print(freq)
#     playtone(freq, duration)
#     freq = int(freq * 1.1)

# Turn off the PWM
twinkle_twinkle()
quiet()
