# Interactive Sorts Visualization

## Project Overview
This project contains a collection of interactive, web-based visualizations demonstrating different algorithms for **K-Way Merge**. These tools are designed to help understand how different data structures manage the merging of multiple sorted streams.

The project consists of standalone HTML files, each visualizing a specific approach:
*   **Min-Heap Merge:** Uses a standard Min-Heap to select the smallest element among the streams.
*   **Tree of Winners:** Uses a tournament tree where the winner (smallest element) rises to the root.
*   **Tree of Losers:** A variation of the tournament tree where the loser is stored at each internal node, often providing slightly better efficiency by reducing comparisons.

## Usage
These are static, standalone HTML files. No build server, compiler, or package manager is required.

To run the visualizations:
1.  Locate the HTML files in the project directory.
2.  Open any of the files directly in your modern web browser (Chrome, Firefox, Safari, Edge).
    *   `open minheapmerge.html`
    *   `open treeoflosers.html`
    *   `open treeofwinners.html`

## Testing
To take screenshots and test the code you can use the playwright tool to open and manipulate each application.

Since these files use modern web features and local file access may be restricted by browser security policies, it is recommended to serve them using a local HTTP server.

You can use Python's built-in server:
1. Open a terminal in the project directory.
2. Run: `python3 -m http.server 8000`
3. Navigate to: `http://localhost:8000/minheapmerge.html` (or other files)

Note that you need to use pwd to get the actual path for direct file access if the browser allows it.
## Key Files
*   **`minheapmerge.html`**: Visualizes the K-Way merge using a binary Min-Heap. Shows the "Sift Down" process when the root is replaced.
*   **`treeofwinners.html`**: Visualizes the Tree of Winners (Tournament Tree). Shows how the winner at each level bubbles up to the root.
*   **`treeoflosers.html`**: Visualizes the Tree of Losers. Demonstrates how storing the "loser" of a match allows the winner to proceed, often simplifying the replay path.

## Development Conventions
*   **Stack:** Plain HTML5, CSS3, and Vanilla JavaScript (ES6+).
*   **Dependencies:** None. All styles and scripts are embedded directly within the HTML files for portability.
*   **Style:**
    *   CSS variables are used for theming (colors for nodes, highlights, etc.).
    *   JavaScript is contained in a `<script>` block at the bottom of the body.
    *   The `init()`, `step()`, and `render()` pattern is used to manage the simulation loop.
