import firebase_admin
from firebase_admin import credentials, firestore
import datetime
import random

# Initialize Firebase Admin SDK
cred = credentials.Certificate("ec463-mini-project-6d206-firebase-adminsdk-1tqtd-627866bde2.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

def generate_game_result(email, timestamp):
    min_time = random.randint(100, 200)
    max_time = random.randint(min_time, min_time + 300)
    avg_time = random.randint(min_time, max_time)
    score = round(random.uniform(0.6, 1.0), 2)

    return {
        "userEmail": email,
        "timestamp": timestamp,
        "min_response_time": min_time,
        "max_response_time": max_time,
        "avg_response_time": avg_time,
        "score": score
    }

def upload_data_for_user(email, num_games):
    doc_ref = db.collection("game_results").document(email)
    game_data = {}

    base_time = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=30)
    
    for i in range(num_games):
        game_time = base_time + datetime.timedelta(hours=random.randint(1, 24*30))
        game_id = f"game_{i+1}"
        game_data[game_id] = generate_game_result(email, game_time)

    doc_ref.set(game_data)
    print(f"Uploaded {num_games} games for {email}")

# List of users to generate data for
users = [
    "2003kshah@gmail.com",
    "kshah26@bu.edu",
]

# Generate and upload data for each user
for user in users:
    upload_data_for_user(user, random.randint(5, 10))

print("Data upload complete!")