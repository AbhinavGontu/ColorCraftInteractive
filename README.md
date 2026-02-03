# 🎨 ColorCraft: Interactive Paint Visualizer
**Professional Architectural Color Visualization in the Browser**

[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

ColorCraft is a high-performance, client-side tool designed for architects and homeowners to visualize exterior paint colors. By leveraging **Web Workers** for heavy computation and **Vector Analysis** for region identification, it provides a smooth, "smart" painting experience entirely in the web browser.

---

## 🚀 Key Features

*   **⚡ Non-Blocking Performance**: Uses specialized Web Workers to process millions of pixels without freezing the UI.
*   **🧠 Smart Segmentation**: Automatically identifies walls, windows, and trim using Edge Mapping and 3D Surface Normals.
*   **✨ Smart Grouping**: Select one window frame, and instantly select all similar windows across the entire building facade.
*   **🎨 Realistic Blending**: Uses `multiply` blending modes to ensure paint looks like it's soaked into the texture of the brick or wood.
*   **🔍 Interactive Viewport**: Silky-smooth zoom and pan controls optimized for large architectural images.

---

## 📖 Documentation (Source of Truth)

For a deep dive into the math, architecture, and code, please refer to:
👉 **[MASTER_PROJECT_DOCUMENTATION.md](file:///Users/abhi/.gemini/antigravity/brain/d866e71a-3161-4eb2-903b-df1bb856ce06/MASTER_PROJECT_DOCUMENTATION.md)**

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development
```bash
npm run dev
```
The app will be available at: **`http://localhost:3000`**

---

## 📦 Deployment

This project is optimized for **Vercel**. 
1. Push your code to GitHub.
2. Connect the repo to Vercel.
3. It's live! (Port and build settings are automatically handled).

---

## 🏗️ Requirements
- **Node.js**: v18+ (Recommended)
- **Browser**: Modern Chrome, Firefox, or Safari (Requires Web Worker & Canvas support)

---

## 🔧 troubleshooting
- **Image Mismatch**: If adding new images, ensure the `edge.png`, `normals.png`, and `cleaned.png` files have identical dimensions.
- **Cache**: If images don't update after replacement, use `Shift + F5` for a hard refresh.
