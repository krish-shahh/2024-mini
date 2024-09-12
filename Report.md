# Answers

## Exercise 1

* **Min Value:** 11,500
* **Max Value:** 33,000

## Exercise 2

This script implements a PWM (Pulse Width Modulation) Tone Generator for MicroPython, specifically designed to play the melody of "Twinkle Twinkle Little Star" on a Raspberry Pi Pico. It defines functions to play tones at specific frequencies and durations, creating musical notes, and combines them to form the familiar tune. The script demonstrates basic sound generation and timing control using MicroPython on embedded hardware.

## Exercise 3

This exercise implements a reaction time game using MicroPython on a Raspberry Pi Pico WH, with results stored in Firebase and displayed on a Next.js web dashboard.

### MicroPython Game (Raspberry Pi Pico WH)
- The game runs for `N` rounds (default 10).
- For each round, a random time delay is introduced before the LED lights up.
- The user presses a button as fast as possible once the LED is on.
- Response times are recorded in milliseconds, with misses recorded as `None`.
- After all rounds, a summary of results is printed and saved.

Key functions:
- `connect_wifi()`: Establishes Wi-Fi connection for data upload.
- `random_time_interval(tmin, tmax)`: Generates random time delays.
- `blinker(N, led)`: Signals game start/end by flashing the LED.
- `write_json(json_filename, data)`: Saves results locally as JSON.
- `upload_to_firebase(user_email, data)`: Uploads results to Firebase Firestore.
- `scorer(t, user_email)`: Processes game results and initiates upload.

### Cloud Integration (Firebase)
- Game results are uploaded to Firebase Firestore.
- Each user's results are stored in a document with their email as the ID.
- Data includes timestamp, min/max/avg response times, and score.

### Web Dashboard (Next.js)
The web dashboard (https://2024-mini.vercel.app/) provides a user interface to view game results.

Features:
- Google Sign-In authentication.
- Displays recent game results in a table format.
- Shows performance trends over time using charts.
- Automatic logout after 1 hour of inactivity.

Key Components:
- `Home`: Main component for layout and navigation.
- `GameResults`: Fetches and displays user's game results.
- `SignIn`: Handles Google Sign-In authentication.

### How to Play
1. Connect the Raspberry Pi Pico WH and run the MicroPython script.
2. Enter your email when prompted.
3. Play the game by pressing the button when the LED lights up.
4. Visit the web dashboard and sign in with your Google account.
5. View your game results and performance trends.

This project demonstrates the integration of embedded systems (Raspberry Pi Pico WH), cloud services (Firebase), and web technologies (Next.js) to create a full-stack IoT application.