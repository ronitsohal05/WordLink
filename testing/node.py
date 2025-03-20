class Node:
    def __init__(self, word):
        self.word = word
        self.neighbors = set()

    def add_neighbor(self, neighbor):
        self.neighbors.add(neighbor)

    def __repr__(self):
        return f"Node({self.word})"
