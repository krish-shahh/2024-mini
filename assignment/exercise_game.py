import network
import urequests
import json
import time
from machine import Pin
import random

# Import credentials from a separate file
from config import WIFI_SSID, WIFI_PASSWORD, FIREBASE_PROJECT_ID, FIREBASE_API_KEY

N: int = 10  # Total number of flashes (response measurement rounds)
on_ms = 500  # LED on duration in milliseconds


def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        print('Connecting to WiFi...')
        wlan.connect(WIFI_SSID, WIFI_PASSWORD)
        while not wlan.isconnected():
            pass
    print('WiFi connected:', wlan.ifconfig())

def random_time_interval(tmin: float, tmax: float) -> float:
    return random.uniform(tmin, tmax)

def blinker(N: int, led: Pin) -> None:
    for _ in range(N):
        led.high()
        time.sleep(0.1)
        led.low()
        time.sleep(0.1)

def write_json(json_filename: str, data: dict) -> None:
    with open(json_filename, "w") as f:
        json.dump(data, f)


def upload_to_firebase(user_email: str, data: dict, filename) -> None:
    try:
        # URL to fetch the existing document
        get_url = f"https://firestore.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}/databases/(default)/documents/game_results/{user_email}?key={FIREBASE_API_KEY}"

        # Get the existing document
        get_response = urequests.get(get_url)
        existing_games = {}
        if get_response.status_code == 200:
            existing_doc = get_response.json()
            if 'fields' in existing_doc:
                existing_games = existing_doc['fields']
        get_response.close()

        # Prepare the new game data
        new_game_data = {
            "avg_response_time": {"doubleValue": data['avg_response_time']},
            "score": {"doubleValue": data['score']},
            "min_response_time": {"integerValue": str(data['min_response_time'])},
            "max_response_time": {"integerValue": str(data['max_response_time'])},
            "timestamp": {"stringValue": data['timestamp']}  # Change to stringValue
        }

        # Add the new game to the existing games
        existing_games[filename] = {
            "mapValue": {
                "fields": new_game_data
            }
        }

        firestore_data = {
            "fields": existing_games
        }

        # URL to update the document
        patch_url = f"https://firestore.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}/databases/(default)/documents/game_results/{user_email}?key={FIREBASE_API_KEY}"
        
        # Send a PATCH request to update the document
        patch_response = urequests.patch(patch_url, json=firestore_data)
        if patch_response.status_code == 200:
            print("Data successfully uploaded to Firebase Firestore.")
        else:
            print("Failed to upload data. Status code:", patch_response.status_code)
            print("Response:", patch_response.text)
        patch_response.close()
    except Exception as e:
        print("Error uploading to Firebase:", e)



def scorer(t: list[int | None], user_email: str) -> None:
    misses = t.count(None)
    print(f"You missed the light {misses} / {len(t)} times")

    t_good = [x for x in t if x is not None]
    print("Reaction times:", t_good)

    if t_good:
        min_time = min(t_good)
        max_time = max(t_good)
        avg_time = sum(t_good) / len(t_good)
    else:
        min_time = max_time = avg_time = 0

    print(f"Min response time: {min_time} ms")
    print(f"Max response time: {max_time} ms")
    print(f"Average response time: {avg_time} ms")

    now = time.localtime()
    now_str = "-".join(map(str, now[:3])) + "T" + "_".join(map(str, now[3:6]))

    data = {
        "timestamp": now_str,
        "min_response_time": min_time,
        "max_response_time": max_time,
        "avg_response_time": avg_time,
        "score": (len(t_good) / len(t)) if t else 0
    }

    filename = f"score-{now_str}.json"
    print("Writing results to", filename)
    write_json(filename, data)

    upload_to_firebase(user_email, data, filename)

if __name__ == "__main__":
    connect_wifi()
    
    user_email = input("Enter your email: ")

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