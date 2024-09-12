import urequests
import json
import time
from machine import Pin
import random

N: int = 10  # Total number of flashes (response measurement rounds)
on_ms = 500  # LED on duration in milliseconds
FIREBASE_PROJECT_ID = "ec463-mini-project-6d206"
FIREBASE_API_KEY = "AIzaSyAgqDhZbdVJmnxFw1c1oLQOt5xKPLg2cCM"

def random_time_interval(tmin: float, tmax: float) -> float:
    """Return a random time interval between max and min."""
    return random.uniform(tmin, tmax)

def blinker(N: int, led: Pin) -> None:
    """Blink the LED N times to signal the start or end of the game."""
    for _ in range(N):
        led.high()
        time.sleep(0.1)
        led.low()
        time.sleep(0.1)

def write_json(json_filename: str, data: dict) -> None:
    """Writes data to a JSON file locally as a backup."""
    with open(json_filename, "w") as f:
        json.dump(data, f)

def upload_to_firebase(user_email: str, data: dict) -> None:
    """Upload the game data to Firebase Firestore using the user's email as the document ID."""
    try:
        url = f"https://firestore.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}/databases/(default)/documents/game_results/{user_email}"
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'key={FIREBASE_API_KEY}'
        }
        
        # Format data for Firestore
        firestore_data = {
            "fields": {
                f"game_{int(time.time())}": {
                    "mapValue": {
                        "fields": {
                            "timestamp": {"timestampValue": time.strftime("%Y-%m-%dT%H:%M:%SZ")},
                            "min_response_time": {"integerValue": data['min_time']},
                            "max_response_time": {"integerValue": data['max_time']},
                            "avg_response_time": {"doubleValue": data['average_time']},
                            "score": {"doubleValue": data['score']}
                        }
                    }
                }
            }
        }
        
        response = urequests.patch(url, json=firestore_data, headers=headers)
        if response.status_code == 200:
            print("Data successfully uploaded to Firebase Firestore.")
        else:
            print("Failed to upload data. Status code:", response.status_code)
            print("Response:", response.text)
        response.close()
    except Exception as e:
        print("Error uploading to Firebase:", e)

def scorer(t: list[int | None], user_email: str) -> None:
    """Collate and print results, then save to Firebase."""
    misses = t.count(None)
    print(f"You missed the light {misses} / {len(t)} times")

    t_good = [x for x in t if x is not None]

    print("Reaction times:", t_good)

    # Compute the min, max, and average response times
    if t_good:
        min_time = min(t_good)
        max_time = max(t_good)
        avg_time = sum(t_good) / len(t_good)
    else:
        min_time = max_time = avg_time = None

    print(f"Min response time: {min_time} ms")
    print(f"Max response time: {max_time} ms")
    print(f"Average response time: {avg_time} ms")

    # Create a data dictionary to store results
    data = {
        'misses': misses,
        'total_flashes': len(t),
        'good_reactions': t_good,
        'min_time': min_time,
        'max_time': max_time,
        'average_time': avg_time,
        'score': (len(t_good) / len(t)) if t else 0,
    }

    # Create a dynamic local filename for backup
    now = time.localtime()
    now_str = "-".join(map(str, now[:3])) + "T" + "_".join(map(str, now[3:6]))

    data = {
        "timestamp": now_str,
        "max_response_time": max_miss,
        "min_response_time": min_miss,
        "avg_response_time": avg_miss
    }
    

    filename = f"score-{now_str}.json"
    print("Writing results to", filename)
    write_json(filename, data)

    # Upload the data to Firebase
    upload_to_firebase(user_email, data)

if __name__ == "__main__":
    # Prompt user for email to use as the Firebase document ID
    user_email = input("Enter your email: ")

    # Initialize hardware
    led = Pin("LED", Pin.OUT)
    button = Pin(16, Pin.IN, Pin.PULL_UP)

    t: list[int | None] = []

    blinker(3, led)

    for i in range(N):
        time.sleep(random_time_interval(0.5, 5.0))

        led.high()

        tic = time.ticks_ms()
        t0 = None
        while time.ticks_diff(time.ticks_ms(), tic) < on_ms:
            if button.value() == 0:
                t0 = time.ticks_diff(time.ticks_ms(), tic)
                led.low()
                break
        t.append(t0)

        led.low()

    blinker(5, led)

    scorer(t, user_email)