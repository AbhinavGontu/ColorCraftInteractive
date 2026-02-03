import { create } from 'zustand';
import { IMAGE_SETS } from '../types';
import type { ImageSet, Mask } from '../types';

interface AppState {
    currentSetId: string;
    currentSet: ImageSet;

    // Status
    isLoading: boolean;
    processingStatus: string; // 'idle' | 'loading_images' | 'generating_masks' | 'ready'

    // Data
    availableSets: ImageSet[]; // Dynamic list of sets
    // We store the mask map (pixel -> maskId) as a Int32Array for performance and to support >65k masks
    maskMap: Int32Array | null;
    width: number;
    height: number;
    masks: Map<number, Mask>; // Metadata for each mask

    // Selection & Coloring
    selectedMaskIds: Set<number>;
    maskColors: Map<number, string>; // maskId -> hex color
    showAllMasks: boolean;

    // Viewport State
    zoom: number;
    pan: { x: number, y: number };
    setZoom: (zoom: number) => void;
    setPan: (x: number, y: number) => void;

    // Actions
    addCustomSet: (set: ImageSet) => void;
    setParameters: (setId: string) => void;
    setLoading: (loading: boolean, status?: string) => void;
    setMaskData: (width: number, height: number, maskMap: Int32Array, masks: Map<number, Mask>) => void;

    selectMask: (maskId: number, multiSelect: boolean) => void;
    deselectMask: (maskId: number) => void;
    clearSelection: () => void;

    applyColorToSelection: (colorHex: string) => void;
    removeColorFromSelection: () => void; // New
    clearAllColors: () => void; // New
    toggleShowAllMasks: () => void;
    selectSimilar: (maskId: number) => void;

    similaritySensitivity: number;
    setSimilaritySensitivity: (val: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
    currentSetId: '1',
    currentSet: IMAGE_SETS[0],
    availableSets: [...IMAGE_SETS], // Initialize with default imported sets

    isLoading: false,
    processingStatus: 'idle',

    maskMap: null,
    width: 0,
    height: 0,
    masks: new Map(),

    selectedMaskIds: new Set(),
    maskColors: new Map(),
    showAllMasks: false,

    zoom: 1,
    pan: { x: 0, y: 0 },

    setZoom: (zoom) => set({ zoom }),
    setPan: (x, y) => set({ pan: { x, y } }),

    setParameters: (setId) => set((state) => {
        // Look up in our dynamic list, not the static one
        const setParams = state.availableSets.find(s => s.id === setId);
        if (!setParams) return state;
        return {
            currentSetId: setId,
            currentSet: setParams,
            // Reset data on set change
            maskMap: null,
            masks: new Map(),
            selectedMaskIds: new Set(),
            maskColors: new Map(),
            processingStatus: 'idle',
            zoom: 1, // Reset Zoom
            pan: { x: 0, y: 0 } // Reset Pan
        };
    }),

    addCustomSet: (newSet: ImageSet) => set((state) => ({
        availableSets: [...state.availableSets, newSet]
    })),

    setLoading: (loading, status) => set({ isLoading: loading, ...(status && { processingStatus: status }) }),

    setMaskData: (width, height, maskMap, masks) => set({ width, height, maskMap, masks, processingStatus: 'ready', isLoading: false }),

    selectMask: (maskId, multiSelect) => set((state) => {
        const newSelection = new Set(multiSelect ? state.selectedMaskIds : []);
        if (state.selectedMaskIds.has(maskId) && multiSelect) {
            newSelection.delete(maskId);
        } else {
            newSelection.add(maskId);
        }
        return { selectedMaskIds: newSelection };
    }),

    deselectMask: (maskId) => set((state) => {
        const newSelection = new Set(state.selectedMaskIds);
        newSelection.delete(maskId);
        return { selectedMaskIds: newSelection };
    }),

    clearSelection: () => set({ selectedMaskIds: new Set() }),

    applyColorToSelection: (colorHex) => set((state) => {
        const newColors = new Map(state.maskColors);
        state.selectedMaskIds.forEach(id => {
            newColors.set(id, colorHex);
        });
        return { maskColors: newColors };
    }),

    removeColorFromSelection: () => set((state) => {
        const newColors = new Map(state.maskColors);
        state.selectedMaskIds.forEach(id => {
            newColors.delete(id);
        });
        return { maskColors: newColors };
    }),

    clearAllColors: () => set({ maskColors: new Map() }),

    toggleShowAllMasks: () => set((state) => ({ showAllMasks: !state.showAllMasks })),

    similaritySensitivity: 50, // 0-100, default 50
    setSimilaritySensitivity: (val: number) => set({ similaritySensitivity: val }),

    selectSimilar: (maskId: number) => set((state) => {
        const targetMask = state.masks.get(maskId);
        if (!targetMask) return state;

        const newSelection = new Set(state.selectedMaskIds);
        const { averageColor: c1, averageNormal: n1, boundingBox: b1, pixelCount: p1 } = targetMask;

        // Geometric Properties
        const w1 = b1.maxX - b1.minX;
        const h1 = b1.maxY - b1.minY;
        const ratio1 = w1 / (h1 || 1);

        // Dynamic Thresholds based on Sensitivity (0-100)
        // Sensitivity 50 = 1.0 multiplier (Base values)
        // Sensitivity 100 = 0.2 multiplier (Very strict)
        const factor = Math.max(0.1, 2.0 - (state.similaritySensitivity / 50));

        // IMPROVED: Relax Color, Enforce Geometry
        const BASE_COLOR_THRESHOLD = 60; // Was 25. Much looser to catch shadows.
        const BASE_NORMAL_THRESHOLD = 20; // Was 15.

        const COLOR_THRESHOLD = BASE_COLOR_THRESHOLD * factor;
        const NORMAL_THRESHOLD = BASE_NORMAL_THRESHOLD * factor;

        // Iterate all masks
        state.masks.forEach((mask) => {
            if (mask.id === maskId) return; // Skip self

            // 1. Geometric Filter (Fastest First)
            const p2 = mask.pixelCount;

            // Size Check: Must be within 50% - 200% of target size
            // Windows are rarely 3x larger or smaller than each other
            if (p2 < p1 * 0.5 || p2 > p1 * 2.0) return;

            const b2 = mask.boundingBox;
            const w2 = b2.maxX - b2.minX;
            const h2 = b2.maxY - b2.minY;
            const ratio2 = w2 / (h2 || 1);

            // Aspect Ratio Check: Must be reasonably similar (e.g., both rectangular)
            // Allow 40% variance
            const ratioDiff = Math.abs(ratio1 - ratio2) / ratio1;
            if (ratioDiff > 0.4) return;


            // 2. Normal Filter (Strict) - Surfaces must face the same way
            const n2 = mask.averageNormal;
            const distN = Math.sqrt(
                Math.pow(n1.x - n2.x, 2) +
                Math.pow(n1.y - n2.y, 2) +
                Math.pow(n1.z - n2.z, 2)
            );
            if (distN > NORMAL_THRESHOLD) return;

            // 3. Color Filter (Relaxed)
            const c2 = mask.averageColor;
            const distC = Math.sqrt(
                Math.pow(c1.r - c2.r, 2) +
                Math.pow(c1.g - c2.g, 2) +
                Math.pow(c1.b - c2.b, 2)
            );

            if (distC < COLOR_THRESHOLD) {
                newSelection.add(mask.id);
            }
        });

        return { selectedMaskIds: newSelection };
    }),
}));
