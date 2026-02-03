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
        const setParams = IMAGE_SETS.find(s => s.id === setId);
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
        const { averageColor: c1, averageNormal: n1 } = targetMask;

        // Dynamic Thresholds based on Sensitivity (0-100)
        // Sensitivity 50 = 1.0 multiplier (Base values)
        // Sensitivity 100 = 0.2 multiplier (Very strict)
        // Sensitivity 0 = 2.0 multiplier (Very loose)
        const factor = Math.max(0.1, 2.0 - (state.similaritySensitivity / 50));

        const BASE_COLOR_THRESHOLD = 25;
        const BASE_NORMAL_THRESHOLD = 15;

        const COLOR_THRESHOLD = BASE_COLOR_THRESHOLD * factor;
        const NORMAL_THRESHOLD = BASE_NORMAL_THRESHOLD * factor;

        // Iterate all masks
        state.masks.forEach((mask) => {
            if (mask.id === maskId) return; // Skip self

            const c2 = mask.averageColor;
            const n2 = mask.averageNormal;

            // Euclidean distance for Color
            const distC = Math.sqrt(
                Math.pow(c1.r - c2.r, 2) +
                Math.pow(c1.g - c2.g, 2) +
                Math.pow(c1.b - c2.b, 2)
            );

            // Euclidean distance for Normal
            const distN = Math.sqrt(
                Math.pow(n1.x - n2.x, 2) +
                Math.pow(n1.y - n2.y, 2) +
                Math.pow(n1.z - n2.z, 2)
            );

            if (distC < COLOR_THRESHOLD && distN < NORMAL_THRESHOLD) {
                newSelection.add(mask.id);
            }
        });

        return { selectedMaskIds: newSelection };
    }),
}));
