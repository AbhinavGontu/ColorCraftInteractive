# ColorCraft: Interactive Paint Visualizer

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=flat&logo=vite&logoColor=white)

> **Experience the future of architectural visualization.**
> Select any region of a building and instantly visualize new paint colors with pixel-perfect precision.

---

## 🚀 Features

- **Smart Segmentation**: Uses advanced edge and normal map analysis to automatically detect distinct architectural regions (walls, pillars, beams).
- **Real-time Visualization**: Instantly apply colors to selected regions with high-performance WebGL/Canvas rendering.
- **Multiple Views**: Toggle between the original photo and the interactive mask overlay.
- **Optimized Performance**: Heavy computation is offloaded to Web Workers, ensuring the UI remains buttery smooth.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Styling**: Vanilla CSS Variables (Theming)
- **Segmentation**: Custom Hybrid Algorithm (Edge detection + Normal similarity flood fill)

## 📦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/colorcraft.git
    cd colorcraft
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📖 Architecture

For a deep dive into how the system works, including data flow diagrams and the segmentation algorithm, please read [ARCHITECTURE.md](./ARCHITECTURE.md).

## 📂 Project Structure

```bash
src/
├── components/      # UI Components (Sidebar, Viewer)
├── store/           # Global State (Zustand)
├── utils/           # Core Logic (Image Loader, Worker)
└── types.ts         # TypeScript Definitions
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to get started.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
