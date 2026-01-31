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

---

## 🎨 Advanced Features & Usage

### 2.5 Keyboard Shortcuts
For power users, ColorCraft supports keyboard interactions to speed up the workflow.

| Shortcut | Action | Context |
|:--- |:--- |:--- |
| **Shift + Click** | Multi-Select | Canvas |
| **Esc** | Clear Selection | Canvas |
| **Ctrl + Z** | Undo (Planned) | Global |
| **Ctrl + Shift + Z** | Redo (Planned) | Global |
| **1 - 9** | Select Color Preset | Global |
| **H** | Toggle "Show Mask" Overlay | Global |

### 2.6 View Modes Explained

#### Default View
Shows the `cleaned.png` (or `original.png`) base image. When you hover, the system calculates the pixel under the cursor and highlights the corresponding mask ID.

#### Mask View (Toggle 'H')
Displays the raw segmentation result.
- **Random Colors**: Each region is assigned a unique color derived from the Golden Angle.
- **Purpose**: Use this to debug segmentation quality. If you see walls merging into windows, the `edge.png` might be too faint.

---

## ⚙️ Deep Configuration

The application is configured via `src/constants.ts` (if extracted) or defined constants at the top of utility files. Below is a reference of internal constants you can tweak.

### Segmentation Parameters (`segmentation.worker.ts`)

These values control the sensitivity of the architectural detection.

```typescript
// Threshold for Edge Detection (0-255)
// Pixels darker than this (in Sketch mode) are considered 'edges'
const EDGE_THRESHOLD = 200; 

// Threshold for Normal Map Similarity (0-255)
// Maximum allowed difference in RGB values for two pixels to be considered "flat"
const NORMAL_DIFF_THRESHOLD = 25;
```

**Tuning Guide**:
- **Increase `EDGE_THRESHOLD` (e.g., 220)**: Will detect *more* faint lines as edges. Use if walls are leaking into each other.
- **Decrease `EDGE_THRESHOLD` (e.g., 150)**: Will ignore faint lines. Use if a single wall is being broken into too many tiny fragments.
- **Increase `NORMAL_DIFF_THRESHOLD` (e.g., 40)**: Will merge curved surfaces more aggressively/
- **Decrease `NORMAL_DIFF_THRESHOLD` (e.g., 10)**: Will be very strict, treating slight curvature as a new region.

### UI Constants (`ImageViewer.tsx`)

```typescript
// Opacity of the Selection Highlight (0-255)
const SELECTION_ALPHA = 180; // ~70%

// Opacity of the Paint Layer (0-255)
const PAINT_ALPHA = 217; // ~85%
```

---

## 🌐 Browser Compatibility Matrix

ColorCraft relies on modern web standards (ES Modules, Web Workers, Canvas 2D).

| Browser | Supported? | Version Req | Notes |
|:--- |:--- |:--- |:--- |
| **Google Chrome** | ✅ Yes | v80+ | Best performance (V8 Engine) |
| **Microsoft Edge** | ✅ Yes | v80+ | Chromium based |
| **Firefox** | ✅ Yes | v90+ | Good, but Worker message passing is slightly slower in benchmarks |
| **Safari (macOS)** | ⚠️ Partial | v14.1+ | **Warning**: Strict memory limits on Canvas. 4K images may reload the page. |
| **Safari (iOS)** | ⚠️ Partial | v15+ | Max canvas area is limited. 2K max recommended. |
| **Internet Explorer** | ❌ No | N/A | Lacks ES6, Modules, Workers. |

---

## ♿ Accessibility Statement

We are committed to making ColorCraft accessible to everyone, including users with vision impairments.

### Current Status (WCAG 2.1 Level A)
- **Contrast**: UI text meets 4.5:1 contrast ratio.
- **Keyboard**: Basic navigation via Tab.

### Known Limitations & Roadmap
- **Screen Readers**: The Canvas element is currently a "blind spot". We are working on generating a semantic DOM tree to represent the building structure (see Architecture Doc).
- **Reduced Motion**: We respect `prefers-reduced-motion` for UI animations, but the canvas updates are instant.

---

## 🌍 Localization (i18n)

The application currently supports **English (US)**.

### Adding a Language
The text strings are currently hardcoded in JSX. To add a language (e.g., Spanish):

1.  Create a `src/locales/es.json` file.
2.  Extract strings:
    ```json
    {
      "sidebar.title": "Panel de Control",
      "sidebar.reset": "Reiniciar",
      "tooltip.id": "ID de Máscara"
    }
    ```
3.  Implement a simple hook or use `react-i18next` (Recommended for future).

---

## � Comprehensive Troubleshooting

### Algorithm & Visual Issues

#### Q: The paint is bleeding over the edges!
**Reason 1**: The `edge.png` lines are not fully closed. Computer vision flood fill leaks through gaps of even 1 pixel.
**Fix**: Edit `edge.png` in Photoshop/GIMP and ensure all boundary lines are solid pixel-connected lines.
**Reason 2**: `EDGE_THRESHOLD` is too low.
**Fix**: Increase the threshold in the worker file.

#### Q: The paint looks flat and fake.
**Reason**: We use `mix-blend-mode: multiply`. If the underlying image is Pure White, it works perfectly. If the underlying image is dark (shadow), the paint becomes invisible.
**Fix**: Ensure your `cleaned.png` is relatively bright and desaturated (neutral gray/white) for best results.

#### Q: Selecting one window selects ALL windows.
**Reason**: They are pixel-connected in the `cleaned.png` or `edge.png`. If there is no edge line between them, the flood fill sees them as one ocean.
**Fix**: Draw a line between them in the edge map.

### Technical & build Issues

#### Q: `npm install` fails with "gyp: No Xcode or CLT version detected"
**Reason**: You are likely on macOS and some native dependency allows fails to build.
**Fix**:
1.  Run `xcode-select --install`
2.  Delete `node_modules` and `package-lock.json`.
3.  Run `npm install` again.
*Note: ColorCraft itself implies no native dependencies, but Vite might.*

#### Q: `vite` is not recognized
**Reason**: `npm bin` is not in your PATH.
**Fix**: Use `npm run dev` instead of typing `vite` directly.

#### Q: "SecurityError: The operation is insecure." on Canvas
**Reason**: You might be loading images from a different domain (CDN) without CORS headers. Tainted canvas cannot be read (pixel extraction fails).
**Fix**: Ensure all images are served from the same domain or have `Access-Control-Allow-Origin: *`.

---

## 📜 Complete Folder Structure

```
colorcraft/
├── .vscode/               # Editor settings
│   └── settings.json
├── public/
│   ├── images/            # Assets
│   │   ├── 1/
│   │   │   ├── original.png
│   │   │   ├── cleaned.png
│   │   │   ├── edge.png
│   │   │   └── normals.png
│   │   └── ...
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── ImageViewer.tsx # The brain of the operation. Canvas + Listeners.
│   │   ├── Sidebar.tsx     # Color Palette + Stats
│   ├── store/
│   │   └── appStore.ts     # Zustand global state (Mask Data, Selections)
│   ├── utils/
│   │   ├── imageLoader.ts  # Promise-based image fetcher
│   │   └── segmentation.worker.ts # THE ALGORITHM (Web Worker)
│   ├── App.tsx             # Main Layout
│   ├── App.css             # Global Styles
│   ├── index.css           # Tailwind/Utility Styles
│   ├── main.tsx            # React Entry
│   ├── types.ts            # Shared Interfaces
│   └── vite-env.d.ts       # Vite Types
├── .eslintrc.cjs           # Lint Config
├── .gitignore              # Files to ignore
├── index.html              # Entry HTML
├── package.json            # Deps + Scripts
├── package-lock.json       # Version Lock
├── tsconfig.json           # TS Compiler Options
├── tsconfig.node.json      # Node Tooling Config
└── vite.config.ts          # Bundler Config
```

---

## 🧪 Testing Strategy

Since this is a visual tool, we rely heavily on visual regression testing (planned) and manual QA.

### Manual QA Checklist
| Feature | Test Case | Pass/Fail |
|:--- |:--- |:--- |
| **Load** | App loads without crash | [ ] |
| **Load** | User can switch between Image Sets | [ ] |
| **Selection** | Hover shows highlight | [ ] |
| **Selection** | Click selects region | [ ] |
| **Selection** | Shift+Click adds to selection | [ ] |
| **Selection** | Shift+Click on active deselects | [ ] |
| **Paint** | Color applies to selected region | [ ] |
| **Paint** | Color blends (Multiply mode) | [ ] |
| **View** | "Show Masks" toggles overlay | [ ] |
| **Reset** | "Clear Selection" works | [ ] |
| **Resize** | Canvas handles window resize | [ ] |

---

## 🔮 Future Roadmap

We have big plans for ColorCraft V2.

### Q3 2026: The "Cloud" Update
- **Save Projects**: Login and save your painted houses.
- **Share**: Generate a shareable link `colorcraft.com/s/xyz`.

### Q4 2026: The "AI" Update
- **Auto-Edge**: Remove the need for manual `edge.png` creation. Use a lighter version of Segment Anything (SAM) server-side to generate the assets on upload.
- **Material Helper**: Suggest color palettes based on "Modern", "Classic", "Victorian" styles.

### Q1 2027: The "Mobile" Update
- **Touch Gestures**: Pinch to zoom, Two-finger pan.
- **PWA**: Install functionality for iPad Pro architects.
- **WebGPU**: Migrate renderer for 4k/120fps support.

---

## 📞 Contact & Support

**Maintainer**: Abhi (Your Name)
**Email**: developer@example.com
**Twitter**: @ColorCraftDev

For enterprise support or custom integration (e.g., integrating into a Real Estate portal), please contact us directly.

---
**End of Extended README Manual**
