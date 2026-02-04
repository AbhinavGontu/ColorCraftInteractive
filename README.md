# ColorCraft: Interactive Paint Visualizer

**The Architectural Visualization Tool for the Web.**

[![Vercel App](https://img.shields.io/badge/Vercel-App-black.svg?logo=vercel)](https://color-craft-interactive.vercel.app/)


---

## 🌟 Overview

**ColorCraft** is a sophisticated single-page application (SPA) that allows users to visualize paint colors on architectural images in real-time. Unlike simple overlay tools, ColorCraft uses **computer vision** (Edge Detection + Surface Normals) to identify distinct architectural regions (walls, windows, trim) and apply "smart" paint that respects shadows and textures.

---

## 🚀 Key Features

### 1. Smart Segmentation
*   **Automatic Region Detection**: Click any part of a building, and the app instantly identifies the entire surface.
*   **Smart Grouping**: Identify all similar windows or trim pieces across the entire facade with one click.
    *   *Controls*: Use the "Similarity Sensitivity" slider to adjust strictness.

### 2. Custom Dataset Upload (New!)
*   **Bring Your Own Data**: Upload your own processed architectural visualizations.
*   **Requirements**: You need 3 aligned images:
    1.  `cleaned.png`: The base photo/render.
    2.  `edge.png`: A black-and-white edge map.
    3.  `normals.png`: A surface normal map (RGB = XYZ vector).
*   **How to Use**: Click the **Upload Icon** in the sidebar and select all 3 files at once.

### 3. Interactive Viewport
*   **Zoom & Pan**:
    *   **Zoom**: Mouse Wheel or Pinch.
    *   **Pan**: Hold `Alt + Drag` or Middle Mouse Button.
*   **Multi-Select**: Hold `Shift + Click` to paint multiple regions at once.
*   **Clear Paint**: Remove paint from specific regions or clear the entire canvas.

### 4. Professional Palette
*   **Curated Colors**: A selection of architecturally tuned colors (Warm Beige, Navy Blue, Forest Green, etc.).
*   **Realistic Blending**: Uses `multiply` mode to preserve building textures under the paint.

---

## �️ Installation & Local Development

### Prerequisites
*   [Node.js](https://nodejs.org/) (v16 or higher)
*   npm (comes with Node.js)

### Step-by-Step Guide

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/AbhinavGontu/ColorCraftInteractive.git
    cd ColorCraftInteractive
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Start the Dev Server**
    ```bash
    npm run dev
    ```
    The app will open at: **[http://localhost:3000](http://localhost:3000)**

4.  **Build for Production**
    ```bash
    npm run build
    ```

---

## � Project Structure

*   **/src**
    *   **/components**: UI elements (`Sidebar`, `ImageViewer`).
    *   **/store**: State management (`appStore.ts` via Zustand).
    *   **/utils**: Core logic (`segmentation.worker.ts`, `imageLoader.ts`).
*   **/public/images**: Default datasets (Models 1-6).
*   **vercel.json**: Configuration for Vercel deployment.

---

