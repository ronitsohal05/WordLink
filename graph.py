from collections import defaultdict, deque
import csv
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

    def remove_unconnected_nodes(self):
        connected_words = {word for word in self.adjacency_list if self.adjacency_list[word]}
        self.adjacency_list = {word: neighbors & connected_words for word, neighbors in self.adjacency_list.items() if word in connected_words}
        self.nodes = {word: self.nodes[word] for word in connected_words}
    
    def save_filtered_word_list(self, filename):
        with open(filename, "w", newline="") as f:
            writer = csv.writer(f)
            for word in self.adjacency_list:
                writer.writerow([word])
    
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
