# ColorCraft: Interactive Paint Visualizer

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=flat&logo=vite&logoColor=white)

> **Experience the future of architectural visualization.**
> Select any region of a building and instantly visualize new paint colors with pixel-perfect precision.

ColorCraft is a web-based tool that uses client-side computer vision to segment building facades, allowing users to paint walls, roofs, and accents interactively. Unlike traditional tools that require manual masking or Photoshop, ColorCraft automates the process using a lightweight hybrid algorithm that runs entirely in your browser.

---

## 🏗️ Features

### Core Capabilities
*   **Smart Segmentation**: Automatically detects building regions (walls, pillars, window frames) using Edge and Normal maps.
*   **Instant Visualization**: Apply colors in real-time. No waiting for server renders.
*   **Multi-Selection**: Hold `Shift` to select multiple disjoint regions and paint them simultaneously.
*   **View Modes**: Toggle "Show Mask" to inspect the underlying segmentation boundaries.

### Performance
*   **Web Workers**: All heavy image processing happens off the main thread, keeping the UI buttery smooth.
*   **Memory Optimized**: Uses `Int32Array` buffers to handle 4K resolution images with minimal RAM usage.
*   **Canvas Rendering**: Utilizes hardware-accelerated 2D Canvas for compositing layers (Base + Paint + Highlight).

---

## 🚀 Getting Started

### Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js**: v16.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: v7.0.0 or higher (Installed with Node.js)
- **Git**: ([Download](https://git-scm.com/))

### Installation & Startup Plan

Follow these steps to get the project running locally.

#### 1. System Requirements Check
Ensure your environment meets the minimum version requirements. Run the following check:

```bash
node -v
# Output must be v16.0.0 or higher. Example: v18.17.0
```

#### 2. Clone the Repository
```bash
git clone https://github.com/yourusername/colorcraft.git
cd colorcraft
```

#### 3. Install Dependencies
We strictly use `npm ci` (Clean Install) to ensure your local `node_modules` exactly match the `package-lock.json`. This prevents "it works on my machine" issues.

```bash
npm ci
```
*Troubleshooting*: If `npm ci` fails due to conflicts, run `npm install` to regenerate the lockfile.

#### 4. Environment Verification (Optional)
Before starting, you can run a lint check to ensure all files are healthy.
```bash
npm run lint
```

#### 5. Start the Application
Launch the local development server.
```bash
npm run dev
```

**Successful Output:**
```text
  VITE v4.4.9  ready in 430 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

#### 6. Accessing the App
Open your browser (Chrome/Edge/Firefox) and navigate to:
**[http://localhost:5173](http://localhost:5173)**

*Note: Safari users may experience stricter memory limits on Web Workers.*

### Building for Production

To create an optimized build for deployment:

```bash
npm run build
```

The output will be in the `dist/` folder. You can serve this folder using any static file server (Nginx, Apache, Vercel, Netlify).

---

## 📚 User Guide

### 1. Selecting Regions
- **Hover**: Move your mouse over the building. The system will detect the region under your cursor.
- **Click**: Select the region. It will be highlighted in **Electric Blue**.
- **Multi-Select**: Hold **Shift + Click** to select multiple regions. This is useful for painting all pillars or all window frames at once.
- **Deselect**: Click a selected region again to deselect it.

### 2. Applying Colors
1. Select one or more regions on the building.
2. In the **Sidebar**, browse the "Paint Colors" palette.
3. Click a color swatch (e.g., "Navy Blue").
4. The selected regions will instantly take on that color, blending realistically with the building's texture.

### 3. Changing Images
Use the **"Building Model"** selector in the sidebar to switch between different pre-loaded datasets.
*   *Note: Switching images triggers a re-segmentation process (1-2 seconds).*

### 4. Resetting
- **Clear Selection**: Click the "Clear Selection" button to deselect everything.
- **Clear Paint**: (Currently via refresh) Reload the page to remove all paint modifications.

---

## ⚙️ Configuration & Customization

ColorCraft is designed to be extensible. You can add your own images or change the color palette easily.

### Adding Custom Images
To add a new building to the visualizer, you need 4 pixel-aligned images.

1.  **Place Images**: Create a new folder in `public/images/MyNewBuilding/`.
2.  **Required Files**:
    *   `original.png`: The display photo.
    *   `cleaned.png`: The photo with shadows/occlusions removed (optional, can be same as original).
    *   `edge.png`: An edge map (White Background, Dark Lines).
    *   `normals.png`: A normal map (RGB).
3.  **Register Set**:
    Open `src/types.ts` and add an entry to the `IMAGE_SETS` array:
    ```typescript
    export const IMAGE_SETS: ImageSet[] = [
        // ... existing sets
        {
            id: 'my-building',
            original: '/images/MyNewBuilding/original.png',
            cleaned: '/images/MyNewBuilding/cleaned.png',
            edge: '/images/MyNewBuilding/edge.png',
            normals: '/images/MyNewBuilding/normals.png'
        }
    ];
    ```

### Customizing Colors
Edit `src/types.ts` to modify the `PAINT_COLORS` array:
```typescript
export const PAINT_COLORS = [
    { name: 'Classic White', hex: '#F5F5F5' },
    { name: 'Midnight Blue', hex: '#1A1A2E' }, // Added
    // Remove or add colors here
];
```

---

## 🔧 Troubleshooting

### "Image Dimension Mismatch" Error
**Symptom**: The app fails to load, and the console shows an error about dimensions.
**Cause**: The `original`, `edge`, and `normals` images must have **exactly** the same pixel resolution (e.g., 1024x1024).
**Fix**: Resize your assets in Photoshop/GIMP to match ensuring alignment.

### "Mask ID 0" / Unable to Select
**Symptom**: Clicking the building does nothing, debug logs say "Mask ID 0".
**Cause**: The segmentation algorithm thinks the entire image is an "edge".
**Fix**: Check your `edge.png`. If it has a **Black Background**, you need to invert the logic in `segmentation.worker.ts` or invert the image colors so it has a **White Background**. The current build is optimized for "Sketch Style" (White BG) edge maps.

### UI Freezes during Load
**Symptom**: The spinner stops spinning for a second.
**Cause**: Garbage Collection or extremely large image processing.
**Fix**: Try using smaller images (max 1920x1080). 4K images generate massive arrays that trigger browser memory limits.

---

## 📦 Deployment Guide

### Docker
You can containerize this app for easy deployment.

**Dockerfile**:
```dockerfile
# Build Stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve Stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Run**:
```bash
docker build -t colorcraft .
docker run -p 8080:80 colorcraft
```

### Static Hosting (Vercel/Netlify)
Since ColorCraft is a client-side SPA, it is perfect for static hosting.
1.  Connect your GitHub repo.
2.  Set Build Command: `npm run build`
3.  Set Output Directory: `dist`
4.  Deploy!

---

## 📂 Project Structure

```bash
src/
├── components/      # UI Components
│   ├── ImageViewer.tsx  # The main canvas logic
│   └── Sidebar.tsx      # Controls
├── store/           # Global State
│   └── appStore.ts      # Zustand store
├── utils/           # Core Logic
│   ├── imageLoader.ts        # Fetches assets
│   └── segmentation.worker.ts # The Math/Vision logic
├── types.ts         # TypeScript interfaces
├── App.tsx          # Root layout
└── main.tsx         # Entry point
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to get started.

## 📝 License

This project is licensed under the MIT License.
