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

    // Actions
    setParameters: (setId: string) => void;
    setLoading: (loading: boolean, status?: string) => void;
    setMaskData: (width: number, height: number, maskMap: Int32Array, masks: Map<number, Mask>) => void;

    selectMask: (maskId: number, multiSelect: boolean) => void;
    deselectMask: (maskId: number) => void;
    clearSelection: () => void;

    applyColorToSelection: (colorHex: string) => void;
    toggleShowAllMasks: () => void;
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
            processingStatus: 'idle'
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

    toggleShowAllMasks: () => set((state) => ({ showAllMasks: !state.showAllMasks })),
}));
