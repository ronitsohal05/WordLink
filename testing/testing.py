from graph import Graph
import networkx as nx
import matplotlib.pyplot as plt
import csv

# Load words from file
def load_word_list(filename):
    words = set()
    with open(filename, "r") as f:
        reader = csv.reader(f)
        for row in reader:
            words.add(row[0].strip())  # Assuming words are in the first column
    return words

# Visualize the graph
def visualize_graph(graph, path=None):
    G = nx.Graph()
    for word, neighbors in graph.adjacency_list.items():
        for neighbor in neighbors:
            G.add_edge(word, neighbor)
    
    plt.figure(figsize=(12, 8))
    pos = nx.spring_layout(G, seed=42)  # Layout for positioning
    
    nx.draw(G, pos, with_labels=True, node_size=500, node_color='lightblue', edge_color='gray')
    
    if path:
        path_edges = list(zip(path, path[1:]))
        nx.draw_networkx_edges(G, pos, edgelist=path_edges, edge_color='red', width=2)
    
    plt.show()

# Example usage
word_list = load_word_list("testing/word-bank.csv")  # Ensure you have a word list file
word_graph = Graph(word_list)
word_graph.remove_unconnected_nodes()
word_graph.save_filtered_word_list("testing/filtered-word-bank.csv")

start_word = "cigar"
end_word = "rebut"
path = word_graph.find_shortest_path(start_word, end_word)
print(" -> ".join(path) if path else "No path found")

visualize_graph(word_graph, path)
