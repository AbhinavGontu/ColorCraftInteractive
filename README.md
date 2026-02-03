# ColorCraft: Interactive Paint Visualizer

A client-side architectural visualization tool that allows users to segment and paint building facades in the browser.

## 🚀 Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start Development Server**:
    ```bash
    npm run dev
    ```
    Access at `http://localhost:5173`.

## 🏗️ Requirements
- Node.js v16+

## 📚 Features
- **Smart Segmentation**: Automatically detects regions (walls, windows) using edge & normal maps.
- **Smart Grouping**: Select one window, and automatically select all similar ones.
- **Interactive Painting**: Real-time color application with texture blending.
- **Zoom & Pan**: Scroll to zoom, drag to pan.

## 🛠️ Configuration

### Adding Custom Images
Add new images to `public/images/MyBuilding/` and register them in `src/types.ts`:
- `original.png`: The main display image.
- `cleaned.png`: Optional shadow-free version.
- `edge.png`: Edge map (White background, black lines).
- `normals.png`: Normal map for 3D orientation.

### Customizing Colors
Edit `src/types.ts` to add or remove paint colors from the `PAINT_COLORS` array.

## 🔧 Troubleshooting
- **Browser Caching**: If images don't update (e.g., Set 5 vs 6), try **Shift + Refresh**. The app now uses cache-busting, but strict browser caches can persist.
- **Selection Issues**: Use the "Group Sensitivity" slider in the sidebar to tune how strict the smart selection is.
