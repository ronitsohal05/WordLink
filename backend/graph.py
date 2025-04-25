from collections import defaultdict, deque
import csv
import random
import json
import os
from node import Node

class Graph:
    def __init__(self, words):
        self.nodes = {word: Node(word) for word in words}
        self.adjacency_list = defaultdict(set)
        self.build_graph()

    def build_graph(self):
        pattern_map = defaultdict(set)
        for word in self.nodes:
            for i in range(len(word)):
                pattern = word[:i] + '*' + word[i+1:]
                pattern_map[pattern].add(word)

        for pattern, word_set in pattern_map.items():
            for word in word_set:
                self.adjacency_list[word].update(word_set - {word})

    def find_shortest_path(self, start, end):
        if start not in self.adjacency_list or end not in self.adjacency_list:
            return None

        queue = deque([(start, [start])])
        visited = set()

        while queue:
            word, path = queue.popleft()
            if word == end:
                return path

            for neighbor in self.adjacency_list[word]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append((neighbor, path + [neighbor]))

        return None  # No path found

    def get_random_pair_with_path(self):
        words = list(self.adjacency_list.keys())
        while True:
            start, end = random.sample(words, 2)
            if self.find_shortest_path(start, end):
                return start, end

    def find_all_paths_limited(self, start, end, max_depth=10, max_paths=1000):
        if start not in self.adjacency_list or end not in self.adjacency_list:
            return []

        paths = []
        queue = deque([(start, [start])])

        while queue:
            current_word, path = queue.popleft()

            if len(path) > max_depth:
                continue

            if current_word == end:
                paths.append(path)
                if len(paths) >= max_paths:
                    break
                continue

            for neighbor in self.adjacency_list[current_word]:
                if neighbor not in path:  # avoid cycles
                    queue.append((neighbor, path + [neighbor]))

        return paths