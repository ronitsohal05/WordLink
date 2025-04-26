from flask import Flask, jsonify, request
import json
import os
from datetime import datetime, UTC
import random
import csv
from graph import Graph
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DAILY_PAIR_FILE = "daily_pair.json"
WORD_BANK_FILE = "word-bank.csv"
VALID_WORDS_FILE = "valid-words.csv"

# Load words from a CSV file
def load_words(filename):
    words = set()
    with open(filename, "r") as f:
        reader = csv.reader(f)
        for row in reader:
            words.add(row[0].strip())
    return words

def differ_by_one(s1, s2):
    if len(s1) != len(s2):  
        return False  # Strings must be of equal length

    count = sum(1 for a, b in zip(s1, s2) if a != b)
    return count == 1

# Load word lists
word_bank = load_words(WORD_BANK_FILE)  # Used for daily words
valid_words = load_words(VALID_WORDS_FILE)  # Used for checking valid guesses
word_graph = Graph(word_bank)  # Graph built only on valid words

def generate_new_daily_pair():
    """Generate a new word pair with a shortest path length between 7 and 10 words.
    If not found, pick any valid path and trim it to that range.
    """
    words = list(word_bank)
    random.shuffle(words)  # Avoid bias
    attempts = 0

    # First try to find a naturally sized path
    while attempts < 5000:
        start, end = random.sample(words, 2)
        path = word_graph.find_shortest_path(start, end)
        if path and 7 <= len(path) <= 10:
            daily_pair = {
                "date": datetime.now().strftime("%Y-%m-%d"),
                "pair": [start, end]
            }
            with open(DAILY_PAIR_FILE, "w") as f:
                json.dump(daily_pair, f)
            return [start, end]
        attempts += 1

    # Fallback: generate any path and trim it to 7–10
    for _ in range(5000):
        start = random.choice(words)
        for end in words:
            if start == end:
                continue
            path = word_graph.find_shortest_path(start, end)
            if path and len(path) >= 7:
                trimmed_path = path[:random.randint(7, min(10, len(path)))]
                daily_pair = {
                    "date": datetime.now().strftime("%Y-%m-%d"),
                    "pair": [trimmed_path[0], trimmed_path[-1]]
                }
                with open(DAILY_PAIR_FILE, "w") as f:
                    json.dump(daily_pair, f)
                return [trimmed_path[0], trimmed_path[-1]]

    return None  # Extremely unlikely fallback


@app.route("/api/daily-pair", methods=["GET"])
def get_daily_pair():
    """Fetch the daily word pair. Generate a new one if needed."""
    if os.path.exists(DAILY_PAIR_FILE):
        with open(DAILY_PAIR_FILE, "r") as f:
            try:
                daily_pair_data = json.load(f)
            except json.JSONDecodeError:
                return jsonify({"error": "Invalid JSON format in daily_pair.json"}), 500

        if daily_pair_data.get("date") == datetime.now(UTC).strftime("%Y-%m-%d"):
            return jsonify(daily_pair_data["pair"])

    # Generate a new daily pair
    new_pair = generate_new_daily_pair()
    
    if new_pair:
        with open(DAILY_PAIR_FILE, "w") as f:
            json.dump({"date": datetime.now(UTC).strftime("%Y-%m-%d"), "pair": new_pair}, f)

        return jsonify(new_pair)
    
    return jsonify({"error": "No valid word pair found"}), 500

@app.route("/api/daily-solution", methods=["GET"])
def get_daily_solution():
    """Fetch the daily solution"""
    with open(DAILY_PAIR_FILE, "r") as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            return jsonify({"error": "Corrupted daily pair data"}), 500
    
    pair = data.get("pair")
    if not pair or len(pair) != 2:
        return jsonify({"error": "Invalid word pair format"}), 500
    
    start, end = pair
    path = word_graph.find_shortest_path(start,end)

    if path:
        return jsonify({"solution": path}), 200
    else:
        return jsonify({"error": "No path found between today's pair"}), 404

@app.route("/api/validate-guess", methods=["POST"])
def validate_guess():
    """Check if the user's guess is valid."""
    data = request.json
    guess = data.get("guess")
    current_word = data.get("current_word")

    if not guess or not current_word:
        return jsonify({"error": "Invalid input"}), 400

    if guess not in valid_words:
        return jsonify({"error": "Guess must be a valid 5 letter word"}), 200

    if differ_by_one(guess, current_word):
        return jsonify({"valid": True}), 200
    else:
        return jsonify({"error": "Guess must differ by one letter"}), 400
    
@app.route("/api/check-final-guess", methods=["POST"])
def check_final_guess():
    """Check if the user's final guess matches the last word"""
    data = request.json
    guess = data.get("guess")
    final_word = data.get("final_word")

    if guess == final_word:
        return jsonify({"end": True})
    else:
        return jsonify({"end": False})
    
@app.route("/api/shortest-distance", methods=["POST"])
def shortest_distance():
    data = request.json
    word = data.get("word")
    final_word = data.get("final_word")

    if not word or not final_word:
        return jsonify({"error": "Invalid input"}), 400

    path = word_graph.find_shortest_path(word, final_word)
    if path:
        return jsonify({"distance": len(path) - 1})
    else:
        return jsonify({"distance": None}) # unreachable
    
@app.route("/api/hint", methods=["POST"])
def hint():
    data = request.json
    word = data.get("word")
    final_word = data.get("final_word")

    if not word or not final_word:
        return jsonify({"hint": "Invalid request."}), 400

    path = word_graph.find_shortest_path(word, final_word)
    if not path:
        return jsonify({"hint": "You're far from the goal. Try a different direction!"})

    distance = len(path) - 1

    if distance <= 3:
        return jsonify({"hint": "You're very close!"})
    elif distance <= 6:
        return jsonify({"hint": "You're on the right track."})
    else:
        return jsonify({"hint": "You're drifting away. Try another path."})



if __name__ == "__main__":
    app.run()
