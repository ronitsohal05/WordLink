from collections import deque, defaultdict
import networkx as nx
import matplotlib.pyplot as plt
import csv

def load_word_list(filename):
    words = set()
    with open(filename, "r") as f:
        reader = csv.reader(f)
        for row in reader:
            words.add(row[0].strip())
    return words

def build_graph(words):
    adjacency_list = defaultdict(set)
    pattern_map = defaultdict(set)
    
    for word in words:
        for i in range(len(word)):
            pattern = word[:i] + '*' + word[i+1:]
            pattern_map[pattern].add(word)
    
    for pattern, word_set in pattern_map.items():
        for word in word_set:
            adjacency_list[word].update(word_set - {word})
    
    return adjacency_list

def remove_unconnected_nodes(graph):
    connected_words = {word for word in graph if graph[word]}
    return {word: neighbors & connected_words for word, neighbors in graph.items() if word in connected_words}

def save_filtered_word_list(graph, filename):
    with open(filename, "w", newline="") as f:
        writer = csv.writer(f)
        for word in graph:
            writer.writerow([word])

def find_shortest_path(start, end, graph):
    if start not in graph or end not in graph:
        return None
    
    queue = deque([(start, [start])])
    visited = set()
    
    while queue:
        word, path = queue.popleft()
        if word == end:
            return path
        
        for neighbor in graph[word]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor]))
    
    return None  # No path found

def visualize_graph(graph, path=None):
    G = nx.Graph()
    for word, neighbors in graph.items():
        for neighbor in neighbors:
            G.add_edge(word, neighbor)
    
    plt.figure(figsize=(12, 8))
    pos = nx.spring_layout(G, seed=42)
    
    nx.draw(G, pos, with_labels=True, node_size=500, node_color='lightblue', edge_color='gray')
    
    if path:
        path_edges = list(zip(path, path[1:]))
        nx.draw_networkx_edges(G, pos, edgelist=path_edges, edge_color='red', width=2)
    
    plt.show()


word_list = load_word_list("word-bank.csv")
word_graph = build_graph(word_list)
filtered_graph = remove_unconnected_nodes(word_graph)
save_filtered_word_list(filtered_graph, "filtered-word-bank.csv")

#start_word = "cigar"
#end_word = "rebut"
p#ath = find_shortest_path(start_word, end_word, filtered_graph)
#print(" -> ".join(path) if path else "No path found")

visualize_graph(filtered_graph, path)
