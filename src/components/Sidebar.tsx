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
        clearSelection
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
                <div className="grid grid-cols-3 gap-2">
                    {IMAGE_SETS.map(set => (
                        <button
                            key={set.id}
                            onClick={() => setParameters(set.id)}
                            className={clsx(
                                "p-2 rounded border text-xs font-medium transition-colors",
                                currentSetId === set.id
                                    ? "bg-blue-600 border-blue-500 text-white"
                                    : "bg-neutral-700 border-neutral-600 text-neutral-300 hover:bg-neutral-600"
                            )}
                        >
                            Set {set.id}
                        </button>
                    ))}
                </div>
            </div>

            {/* Selection Stats */}
            <div className="p-4 border-b border-neutral-700 space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Selection</h2>
                <div className="flex justify-between items-center bg-neutral-900/50 p-3 rounded">
                    <div>
                        <span className="block text-2xl font-light text-white">{selectedMaskIds.size}</span>
                        <span className="text-neutral-500 text-xs">Regions</span>
                    </div>
                    <div className="text-right">
                        <span className="block text-xl font-light text-neutral-300">
                            {(totalSelectedPixels / 1000).toFixed(1)}k
                        </span>
                        <span className="text-neutral-500 text-xs">Pixels</span>
                    </div>
                </div>
                {selectedMaskIds.size > 0 && (
                    <button
                        onClick={clearSelection}
                        className="w-full py-1 text-xs text-red-400 hover:text-red-300 underline"
                    >
                        Clear Selection
                    </button>
                )}
            </div>

            {/* Color Palette */}
            <div className="p-4 flex-1 overflow-y-auto">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">Paint Colors</h2>
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
            </div>
        </aside>
    );
};
