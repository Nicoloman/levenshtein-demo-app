# 🧮 Levenshtein Distance Visualizer

An interactive educational web application that demonstrates the Levenshtein Distance algorithm using dynamic matrix visualization. Perfect for teaching string similarity algorithms in algebra, computer science, or mathematics classes.

## Features

### 🎯 **Interactive Matrix Visualization**
- Real-time matrix generation as you type
- Color-coded cells showing different operations
- Optimal path highlighting showing the minimum edit sequence

### 📚 **Educational Features**
- Step-by-step animation showing how each cell is calculated
- Preset examples with common string transformations
- Detailed explanations of the algorithm logic
- Fuzzy matching controls with adjustable threshold

## Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm (comes with Node.js)

### Installation

1. Navigate to the project directory
2. Install dependencies:
```bash
npm install
```

### Running the Application

Start the development server:
```bash
npm start
```

The application will open at `http://localhost:4200/`

### Building for Production

```bash
npm run build
```

## How to Use

1. **Basic Usage**: Enter two strings and watch the matrix update in real-time
2. **Preset Examples**: Click preset buttons for common transformations
3. **Step-by-Step**: Use animation controls to see each calculation
4. **Fuzzy Matching**: Adjust threshold to see when strings "match"

## Algorithm Explanation

The Levenshtein distance is the minimum number of single-character edits (insertions, deletions, or substitutions) required to change one string into another.

## Technical Details

- Framework: Angular 19 (Standalone Components)
- Language: TypeScript
- Styling: Pure CSS with responsive design
- Time Complexity: O(m×n) where m and n are string lengths

## License

Created for educational purposes. Free to use for teaching and learning.
