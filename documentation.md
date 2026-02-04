# ColorCraft: The Definitive Technical Compendium

**Version**: 3.1
**Date**: February 2026

---

## 📖 1. Executive Summary

ColorCraft is a high-performance, local-first Single Page Application (SPA) designed to solve a specific computer vision problem: **instant architectural segmentation in the browser**.

This document serves as the **comprehensive technical manual** for the system. It replaces all prior scattered documentation.


---

## 🏗️ 2. System Architecture

ColorCraft is a **Local-First, Offline-Capable SPA**. It relies on the "Thick Client" model, where the user's browser acts as the server.

### A. Context & Data Flow
*   **Rounded Edges**: Indicate Processes/Services.
*   **Cylinders**: Indicate Data Stores.

```mermaid
graph TD
    %% Styling Definitions
    classDef interaction fill:#f9f,stroke:#333,stroke-width:2px,rx:10,ry:10;
    classDef logic fill:#bbf,stroke:#333,stroke-width:2px,rx:10,ry:10;
    classDef storage fill:#ff9,stroke:#333,stroke-width:2px;

    User((User)):::interaction
    
    subgraph Browser_Environment [User's Browser Runtime]
        direction TB
        
        UI(React Frontend):::interaction
        Dispatcher(Action Dispatcher):::logic
        
        subgraph Background_Layer [Background Threads]
            Worker(Segmentation Engine):::logic
        end
        
        subgraph Memory_Layer [Heap Memory]
            Store[(Zustand State)]:::storage
            Binary[(Shared ArrayBuffers)]:::storage
        end
    end
    
    Cloud(Vercel CDN):::storage
    
    %% Connections
    User -->|Interacts| UI
    UI -->|Fetches Assets| Cloud
    UI -->|1. User Action| Dispatcher
    Dispatcher -->|2. Offload Math| Worker
    Worker -->|3. Read/Write| Binary
    Worker -->|4. Return Result| Dispatcher
    Dispatcher -->|5. Hydrate| Store
    Store -->|6. Re-Render| UI
```

### B. UML Component Hierarchy
A strict breakdown of component responsibilities.

```mermaid
classDiagram
    direction TB
    %% Core View Components
    class App {
        +render()
    }
    class Sidebar {
        +selectedSetId: string
        +handleFileUpload()
        +renderPalette()
    }
    class ImageViewer {
        -canvasRef: HTMLCanvasElement
        +interactionState: 'idle' | 'painting'
        +handleMouseDown()
        +render()
    }
    
    %% Logic & State
    class AppStore {
        +maskMap: Int32Array
        +selectedMaskIds: Set<number>
        +addImageSet()
        +selectSimilar()
    }
    class SegmentationWorker {
        -visited: Uint8Array
        -queue: number[]
        +process(pixels, edges, normals)
        -floodFill()
    }

    App *-- Sidebar
    App *-- ImageViewer
    Sidebar ..> AppStore : Mutates
    ImageViewer ..> AppStore : Reads/Observes
    AppStore <..> SegmentationWorker : Asynchronous Bridge
```

---

## 🖥️ 3. User Interaction State Machine

The application is modeless but state-dependent. The `ImageViewer` transitions between states based on input type (Mouse vs. Keyboard).

```mermaid
stateDiagram-v2
    classDef active fill:#bbf,stroke:#333,stroke-width:2px;
    
    [*] --> Idle:::active
    
    state Idle {
        [*] --> Hovering
        Hovering --> DisplayTooltip : MouseHover (Region Hit)
        Hovering --> NoAction : MouseHover (Void)
    }

    state "Panning (Zoom)" as Panning
    state "Painting (Select)" as Painting
    state "Loading (Processing)" as Loading

    %% Transitions
    Idle --> Panning : Middle Click / Space+Drag
    Idle --> Painting : Left Click
    Idle --> Loading : Image Set Swapped
    
    Panning --> Idle : MouseUp
    
    state Painting {
        [*] --> IdentifyRegion
        IdentifyRegion --> UpdateSelection
        UpdateSelection --> ReRenderCanvas
    }
    
    Painting --> Idle : Animation Frame Done
    Loading --> Idle : Worker Complete
```

---

## 🧠 4. Algorithmic Core: Smart Segmentation

The "Heart" of ColorCraft. We use a modified **Breadth-First Search (BFS)** that traverses pixels based on a multi-factor heuristic.

**The Heuristic Function**:
$$ Cost(p_1, p_2) = \Delta Normal(p_1, p_2) + EdgePenalty(p_2) $$

### A. The Flood Fill Pipeline

```mermaid
flowchart TD
    %% Node Styling
    classDef process fill:#e1f5fe,stroke:#01579b,stroke-width:2px,rx:10,ry:10;
    classDef decision fill:#fff9c4,stroke:#fbc02d,stroke-width:2px,rx:5,ry:5;
    classDef terminator fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,rx:20,ry:20;

    Start([Start: Pixel X,Y]):::terminator --> CheckVisited{Visited?}:::decision
    
    CheckVisited -- Yes --> Skip([Skip]):::terminator
    CheckVisited -- No --> CheckEdge{Is Edge Line?}:::decision
    
    CheckEdge -- Yes --> MarkBoundary(Mark as Boundary):::process
    MarkBoundary --> Skip
    
    CheckEdge -- No --> NewRegion(Create Region ID):::process
    NewRegion --> Queue(Push to Queue):::process
    
    subgraph Core_Loop [Flood Fill Iteration]
        Queue --> Pop(Pop Pixel P):::process
        Pop --> Neighbors(Get 4 Neighbors):::process
        Neighbors --> Loop{For Each Neighbor N}:::decision
        
        Loop --> IsWall{Is Edge / Wall?}:::decision
        IsWall -- Yes --> Next
        
        IsWall -- No --> Calc(Calculate Normal Diff):::process
        Calc --> Threshold{Diff < 0.1?}:::decision
        
        Threshold -- Yes --> Add(Tag ID & Push N):::process
        Threshold -- No --> Next
    end
    
    Add --> Queue
    Loop -- Queue Empty --> EndRegion([Region Complete]):::terminator
```

---

## 💾 5. Memory Architecture

We utilize **TypedArrays** (Binary Buffers) to bypass JavaScript's Garbage Collector overhead.

### Comparison: Object vs. Binary

```mermaid
graph TB
    subgraph Rejected_Memory_Model [Legacy Object Model]
        direction LR
        Obj1("{ x:0, y:0, id:1 }") --- Obj2("{ x:1, y:0, id:1 }")
        Obj2 --- Obj3("{ x:2, y:0, id:2 }")
        style Rejected_Memory_Model fill:#ffebee,stroke:#d32f2f,stroke-dasharray: 5 5
    end
    
    subgraph Adopted_Memory_Model [Compact Binary Model]
        direction LR
        Buffer[Int32Array] --> Val1[1] --> Val2[1] --> Val3[2]
        style Adopted_Memory_Model fill:#e8f5e9,stroke:#2e7d32
    end
```

*   **Legacy**: ~200 bytes/pixel -> **800MB** (Mobile Crash).
*   **Adopted**: 4 bytes/pixel -> **32MB** (Stable).

---

## ⚔️ 6. Key Technical Challenges

### I. Concurrency (The Frozen Window)
*   **Issue**: Running 33 million comparison operations on the Main Thread blocked the Event Loop (~3000ms unresponsive).
*   **Fix**: **Web Workers**. We migrated all segmentation logic to `segmentation.worker.ts`.
*   **Result**: The UI remains interactive (60fps) even while the engine crunches a 4K image.

### II. The "Invisible Edge" (Wall vs Ceiling)
*   **Issue**: A white wall and a white ceiling share the same pixel color. Standard Flood Fill bleeds across the corner.
*   **Fix**: **Normal Maps**. We check the *surface angle*. Even if colors match, the normal relationship ($N_1 \cdot N_2 \approx 0$) reveals the corner.

---

## 🧪 7. Architectural Evolution (Discarded Prototypes)

We strictly document major prototypes that were implemented and then discarded.

### Prototype A: The "Legacy Main Thread"
*   **Approach**: React `useEffect` + Simple recursion.
*   **Result**: The browser froze for 3-5 seconds per click.
*   **Verdict**: **DISCARDED**. The UX was unacceptable.

### Prototype B: The "AI Experiment"
*   **Approach**: We integrated **Meta's SAM 2** (Segment Anything Model) via `onnxruntime-web`.
*   **Result**:
    1.  **Bloat**: The model weights added **20MB** to the download.
    2.  **Latency**: Inference took **4 seconds** on a laptop GPU.
    3.  **Accuracy (Fuzzy Masks)**: The AI produced *probability maps* (0.0 - 1.0). Thresholding these created "fuzzy" edges that looked bad when painted.
*   **Verdict**: **REVERTED**. We returned to the Heuristic (Flood Fill) engine because it produces **Watertight Hard Masks** (Integer IDs) instantly and with zero download size.

*Note: No other prototypes (e.g., native apps) were attempted in this repository.*

---

## 🌊 8. Workflow: Secure File Uploads

```mermaid
sequenceDiagram
    participant User
    participant UI as Sidebar UI
    participant App as App Context
    participant Engine as Worker Engine

    Note over User, UI: The User selects local files (Clean, Edge, Normal)

    User->>UI: Upload Files
    UI->>UI: Validate MIME Types
    
    par Parallel Read
        UI->>UI: FileReader.readAsDataURL(Clean)
        UI->>UI: FileReader.readAsDataURL(Edge)
        UI->>UI: FileReader.readAsDataURL(Normal)
    end
    
    UI->>App: dispatch(addCustomSet)
    App->>App: Update State (availableSets)
    App-->>User: Show New Dropdown Item
    
    User->>App: Select New Set
    App->>Engine: postMessage(Init)
    Engine-->>App: postMessage(Success)
```

---

**End of Handbook**
