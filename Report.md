# Answers

## Exercise 1

* **Min Value:** 11,500
* **Max Value:** 33,000

## Exercise 2

## Exercise 3

This exercise is a reaction time game written in MicroPython. The game flashes an LED light for a random amount of time and records how fast the user presses the button after the LED lights up.

- The game runs for `N` rounds (default 10).
- For each round, a random time delay is introduced before the LED lights up.
- The user has to press the button as fast as possible once the LED is on.
- If the button is pressed in time, the response time is recorded in milliseconds. If the button is not pressed, it records a miss (`None`).
- After all rounds, a summary of the results is printed, showing the number of misses and the recorded reaction times.
- The results are saved as a JSON file with a timestamped filename and sent to Firebase.
- Those results are able to be viewed through a NextJS powered dashboard (https://2024-mini.vercel.app/)

Key functions:
- `random_time_interval`: Returns a random time between `tmin` and `tmax`.
- `blinker`: Flashes the LED to signal the start and end of the game.
- `scorer`: Collects and prints the results, including missed flashes and valid reaction times. It also saves the results to a JSON file.

