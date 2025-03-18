from collections import defaultdict, deque
import csv
import sys
from node import Node
from tqdm import tqdm

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
    
    def count_all_paths(self, start, end):
        if start not in self.adjacency_list or end not in self.adjacency_list:
            return 0
        
        queue = deque([(start, [start])])
        path_count = 0
        
        while queue:
            word, path = queue.popleft()
            if word == end:
                path_count += 1
            else:
                for neighbor in self.adjacency_list[word]:
                    if neighbor not in path:
                        queue.append((neighbor, path + [neighbor]))
        
        return path_count
    
    def generate_path_csv(self, filename, valid_words_file):
        valid_words = set()
        with open(valid_words_file, "r") as f:
            reader = csv.reader(f)
            for row in reader:
                valid_words.add(row[0].strip())
        
        valid_pairs = [(w1, w2) for i, w1 in enumerate(valid_words) for w2 in list(valid_words)[i+1:] if w1 in self.adjacency_list and w2 in self.adjacency_list]
        
        with open(filename, "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["Start Word", "End Word", "Path Count"])
            
            with tqdm(total=len(valid_pairs), desc="Generating all paths", unit="pair") as pbar:
                for start, end in valid_pairs:
                    path_count = self.count_all_paths(start, end)
                    writer.writerow([start, end, path_count])
                    pbar.update(1)