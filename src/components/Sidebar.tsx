import React from 'react';
import { useAppStore } from '../store/appStore';
import { IMAGE_SETS, PAINT_COLORS } from '../types';
import clsx from 'clsx';

export const Sidebar: React.FC = () => {
    const {
        currentSetId,
        setParameters,
        selectedMaskIds,
        masks,
        applyColorToSelection,
        showAllMasks,
        toggleShowAllMasks,
    } = useAppStore();

    // Calculate selected pixels
    const totalSelectedPixels = Array.from(selectedMaskIds).reduce((acc, id) => {
        return acc + (masks.get(id)?.pixelCount || 0);
    }, 0);

    return (
        <aside className="w-80 bg-neutral-800 border-l border-neutral-700 flex flex-col h-full text-sm">

            {/* Header */}
            <div className="p-4 border-b border-neutral-700">
                <h1 className="font-bold text-lg text-white">ColorCraft</h1>
                <p className="text-neutral-400 text-xs">Interactive Visualizer</p>
            </div>

            {/* Image Set Selection */}
            <div className="p-4 border-b border-neutral-700 space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Building Model</h2>
                <div className="flex gap-2">
                    {IMAGE_SETS.map(set => (
                        <button
                            key={set.id}
                            onClick={() => setParameters(set.id)}
                            className={clsx(
                                "w-8 h-8 rounded border text-xs font-medium transition-colors flex items-center justify-center",
                                currentSetId === set.id
                                    ? "bg-blue-600 border-blue-500 text-white"
                                    : "bg-neutral-700 border-neutral-600 text-neutral-300 hover:bg-neutral-600"
                            )}
                        >
                            {set.id}
                        </button>
                    ))}
                </div>
            </div>

            {/* Selection Stats (Compact) */}
            <div className="p-4 border-b border-neutral-700">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Selection</h2>
                <div className="flex items-center justify-between text-xs text-neutral-300 mb-3">
                    <div>
                        <span className="font-bold text-white">{selectedMaskIds.size}</span> regions
                    </div>
                    <div>
                        <span className="font-bold text-white">{(totalSelectedPixels / 1000).toFixed(1)}k</span> px
                    </div>
                </div>

                <div className="mb-3">
                    <div className="flex justify-between text-xs text-neutral-400 mb-1">
                        <span>Group Sensitivity</span>
                        <span>{useAppStore.getState().similaritySensitivity}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={useAppStore(s => s.similaritySensitivity)}
                        onChange={(e) => useAppStore.getState().setSimilaritySensitivity(parseInt(e.target.value))}
                        className="w-full h-1 bg-neutral-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>

                <button
                    onClick={() => {
                        const id = Array.from(selectedMaskIds)[0];
                        if (id) useAppStore.getState().selectSimilar(id);
                    }}
                    disabled={selectedMaskIds.size !== 1}
                    className="w-full py-1.5 text-xs bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-600/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    Select Similar Group
                </button>
            </div>

            {/* Color Palette */}
            <div className="p-4 flex-1 overflow-y-auto">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">Paint Colors</h2>

                {/* Custom Color Picker */}
                <div className="mb-4">
                    <label className="flex items-center gap-2 p-2 bg-neutral-800 border border-neutral-700 rounded hover:border-neutral-500 cursor-pointer">
                        <input
                            type="color"
                            className="w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0"
                            onChange={(e) => applyColorToSelection(e.target.value)}
                            disabled={selectedMaskIds.size === 0}
                        />
                        <span className="text-xs text-neutral-300">Choose Custom Color...</span>
                    </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {PAINT_COLORS.map(color => (
                        <button
                            key={color.name}
                            onClick={() => applyColorToSelection(color.hex)}
                            disabled={selectedMaskIds.size === 0}
                            className={clsx(
                                "flex items-center gap-2 p-2 rounded border transition-all active:scale-95 text-left",
                                selectedMaskIds.size === 0
                                    ? "opacity-50 cursor-not-allowed border-neutral-700 bg-neutral-800"
                                    : "hover:bg-neutral-700 border-neutral-600 cursor-pointer bg-neutral-800"
                            )}
                        >
                            <div
                                className="w-8 h-8 rounded-full shadow-sm border border-neutral-500/30"
                                style={{ backgroundColor: color.hex }}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-neutral-200 truncate">{color.name}</div>
                                <div className="text-xs text-neutral-500">{color.hex}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* View Controls */}
            <div className="p-4 border-t border-neutral-700 bg-neutral-900/30">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                        <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={showAllMasks}
                            onChange={toggleShowAllMasks}
                        />
                        <div className="w-10 h-6 bg-neutral-600 rounded-full peer-checked:bg-blue-600 transition-colors"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                    </div>
                    <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">Show All Masks</span>
                </label>

                {/* Zoom Controls */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-neutral-700">
                    <span className="text-xs font-semibold text-neutral-500 uppercase">Zoom</span>
                    <div className="flex items-center gap-1">
                        <button
                            className="p-1 px-3 bg-neutral-800 border border-neutral-700 rounded text-neutral-300 hover:bg-neutral-700"
                            onClick={() => useAppStore.getState().setZoom(Math.max(0.5, useAppStore.getState().zoom - 0.25))}
                        >-</button>
                        <span className="text-xs text-neutral-300 w-12 text-center">
                            {(useAppStore.getState().zoom * 100).toFixed(0)}%
                        </span>
                        <button
                            className="p-1 px-3 bg-neutral-800 border border-neutral-700 rounded text-neutral-300 hover:bg-neutral-700"
                            onClick={() => useAppStore.getState().setZoom(Math.min(3, useAppStore.getState().zoom + 0.25))}
                        >+</button>
                    </div>
                </div>

                {/* Clear Actions */}
                <div className="flex  gap-2 mt-4">
                    <button
                        onClick={useAppStore.getState().removeColorFromSelection}
                        disabled={selectedMaskIds.size === 0}
                        className="flex-1 py-2 px-1 text-xs text-yellow-500 border border-yellow-500/30 rounded hover:bg-yellow-500/10 disabled:opacity-50"
                    >
                        Remove Paint
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm('Clear ALL paint from the entire house?')) {
                                useAppStore.getState().clearAllColors();
                            }
                        }}
                        className="flex-1 py-2 px-1 text-xs text-red-500 border border-red-500/30 rounded hover:bg-red-500/10"
                    >
                        Reset All
                    </button>
                </div>

            </div>
        </aside>
    );
};
