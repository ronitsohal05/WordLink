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

# Load word lists
word_bank = load_words(WORD_BANK_FILE)  # Used for daily words
valid_words = load_words(VALID_WORDS_FILE)  # Used for checking valid guesses
word_graph = Graph(word_bank)  # Graph built only on valid words

def generate_new_daily_pair():
    """Generate a new word pair with at least one path between them."""
    words = list(word_bank)
    while words:
        start, end = random.sample(words, 2)
        if word_graph.find_shortest_path(start, end):
            daily_pair = {"date": datetime.now().strftime("%Y-%m-%d"), "pair": [start, end]}
            with open(DAILY_PAIR_FILE, "w") as f:
                json.dump(daily_pair, f)
            return daily_pair["pair"]
    
    return None  # Should not happen if word bank is large enough

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
        return jsonify({"valid": False, "reason": "Word not allowed"}), 200

    if guess in word_graph.adjacency_list[current_word]:
        return jsonify({"valid": True}), 200
    else:
        return jsonify({"valid": False, "reason": "Guess must differ by one letter and be connected"}), 200

if __name__ == "__main__":
    app.run(debug=True)
