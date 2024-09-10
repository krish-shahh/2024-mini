#!/usr/bin/env python3
"""
PWM Tone Generator - Twinkle Twinkle Little Star
Based on https://www.coderdojotc.org/micropython/sound/04-play-scale/
"""
import machine
import utime

# GP16 is the speaker pin
SPEAKER_PIN = 16
# Create a Pulse Width Modulation Object on this pin
speaker = machine.PWM(machine.Pin(SPEAKER_PIN))

def playtone(frequency: float, duration: float) -> None:
    speaker.duty_u16(1000)
    speaker.freq(int(frequency))
    utime.sleep(duration)

def rest(duration: float) -> None:
    speaker.duty_u16(0)
    utime.sleep(duration)

def quiet():
    speaker.duty_u16(0)

# Define the frequencies for the notes we'll use
NOTE_C4 = 261.63
NOTE_D4 = 293.66
NOTE_E4 = 329.63
NOTE_F4 = 349.23
NOTE_G4 = 392.00
NOTE_A4 = 440.00

# Define the melody (Twinkle Twinkle Little Star)
melody = [
    (NOTE_C4, 0.4), (NOTE_C4, 0.4), (NOTE_G4, 0.4), (NOTE_G4, 0.4),
    (NOTE_A4, 0.4), (NOTE_A4, 0.4), (NOTE_G4, 0.8),
    (NOTE_F4, 0.4), (NOTE_F4, 0.4), (NOTE_E4, 0.4), (NOTE_E4, 0.4),
    (NOTE_D4, 0.4), (NOTE_D4, 0.4), (NOTE_C4, 0.8),
    (NOTE_G4, 0.4), (NOTE_G4, 0.4), (NOTE_F4, 0.4), (NOTE_F4, 0.4),
    (NOTE_E4, 0.4), (NOTE_E4, 0.4), (NOTE_D4, 0.8),
    (NOTE_G4, 0.4), (NOTE_G4, 0.4), (NOTE_F4, 0.4), (NOTE_F4, 0.4),
    (NOTE_E4, 0.4), (NOTE_E4, 0.4), (NOTE_D4, 0.8),
    (NOTE_C4, 0.4), (NOTE_C4, 0.4), (NOTE_G4, 0.4), (NOTE_G4, 0.4),
    (NOTE_A4, 0.4), (NOTE_A4, 0.4), (NOTE_G4, 0.8),
    (NOTE_F4, 0.4), (NOTE_F4, 0.4), (NOTE_E4, 0.4), (NOTE_E4, 0.4),
    (NOTE_D4, 0.4), (NOTE_D4, 0.4), (NOTE_C4, 0.8)
]

print("Playing Twinkle Twinkle Little Star:")
for note, duration in melody:
    print(f"Playing {note:.2f} Hz")
    playtone(note, duration)
    rest(0.05)  # Short rest between notes

# Turn off the PWM
quiet()
print("Done playing.")