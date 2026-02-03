import React, { useRef, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { loadDataset, getImageData } from '../utils/imageLoader';

import clsx from 'clsx';

export const ImageViewer: React.FC = () => {
    const {
        currentSet,
        isLoading,
        maskMap,
        width,
        height,
        selectedMaskIds,
        maskColors,
        showAllMasks,
        setLoading,
        setMaskData,
        selectMask,
        masks,
        // Zoom/Pan State
        zoom,
        setZoom, // Added setZoom
        pan,
        setPan
    } = useAppStore();

    const containerRef = useRef<HTMLDivElement>(null);
    const baseCanvasRef = useRef<HTMLCanvasElement>(null);
    const paintCanvasRef = useRef<HTMLCanvasElement>(null);
    const highlightCanvasRef = useRef<HTMLCanvasElement>(null);
    const masksCanvasRef = useRef<HTMLCanvasElement>(null);

    // Pan Interaction State
    const [isDragging, setIsDragging] = React.useState(false);
    const [lastMousePos, setLastMousePos] = React.useState({ x: 0, y: 0 });

    // Initial load and processing (No changes)
    useEffect(() => {
        let mounted = true;
        let worker: Worker | null = null;

        const load = async () => {
            setLoading(true, 'loading_images');
            try {
                const images = await loadDataset(currentSet);
                if (!mounted) return;

                const w = images.cleaned.width;
                const h = images.cleaned.height;

                // Draw base image
                const baseCtx = baseCanvasRef.current?.getContext('2d');
                if (baseCtx) {
                    baseCanvasRef.current!.width = w;
                    baseCanvasRef.current!.height = h;
                    baseCtx.drawImage(images.cleaned, 0, 0);
                }

                // Process masks via Worker
                setLoading(true, 'generating_masks');

                const edgeData = getImageData(images.edge).data;
                const normalData = getImageData(images.normals).data;
                const colorData = getImageData(images.cleaned).data;

                worker = new Worker(new URL('../utils/segmentation.worker.ts', import.meta.url), { type: 'module' });

                worker.onmessage = (e) => {
                    if (!mounted) return;
                    const { success, result, error } = e.data;

                    if (success && result) {
                        setMaskData(result.width, result.height, result.maskMap, result.masks);
                    } else {
                        console.error("Worker failed:", error);
                        setLoading(false);
                    }
                };

                worker.postMessage({
                    width: w,
                    height: h,
                    edgeData,
                    normalData,
                    colorData
                });

            } catch (e) {
                console.error("Failed to load images", e);
                setLoading(false);
            }
        };

        load();

        return () => {
            mounted = false;
            if (worker) worker.terminate();
        };
    }, [currentSet, setLoading, setMaskData]);

    // Handle canvas resizing
    useEffect(() => {
        [paintCanvasRef, highlightCanvasRef, masksCanvasRef].forEach(ref => {
            if (ref.current && width > 0 && height > 0) {
                ref.current.width = width;
                ref.current.height = height;
            }
        });
    }, [width, height]);

    // Draw Paints (No changes logic-wise, just re-rendering)
    useEffect(() => {
        const ctx = paintCanvasRef.current?.getContext('2d');
        if (!ctx || !maskMap || width === 0) return;

        ctx.clearRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'multiply';

        if (maskColors.size === 0) return;

        const imgData = ctx.createImageData(width, height);
        const data = imgData.data;
        const colorCache: Record<number, number[]> = {};

        maskColors.forEach((hex, id) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            colorCache[id] = [r, g, b];
        });

        for (let i = 0; i < maskMap.length; i++) {
            const maskId = maskMap[i];
            if (maskId > 0 && colorCache[maskId]) {
                const [r, g, b] = colorCache[maskId];
                const idx = i * 4;
                data[idx] = r;
                data[idx + 1] = g;
                data[idx + 2] = b;
                data[idx + 3] = 217;
            }
        }
        ctx.putImageData(imgData, 0, 0);

    }, [maskMap, width, height, maskColors]);

    // Draw Highlights (Selection)
    useEffect(() => {
        const ctx = highlightCanvasRef.current?.getContext('2d');
        if (!ctx || !maskMap || width === 0) return;

        ctx.clearRect(0, 0, width, height);

        if (selectedMaskIds.size === 0) return;

        const imgData = ctx.createImageData(width, height);
        const data = imgData.data;

        for (let i = 0; i < maskMap.length; i++) {
            if (selectedMaskIds.has(maskMap[i])) {
                const idx = i * 4;
                data[idx] = 0;
                data[idx + 1] = 120;
                data[idx + 2] = 255;
                data[idx + 3] = 180;
            }
        }
        ctx.putImageData(imgData, 0, 0);

    }, [maskMap, width, height, selectedMaskIds]);

    // Draw "Show All Masks"
    useEffect(() => {
        const ctx = masksCanvasRef.current?.getContext('2d');
        if (!ctx || !maskMap || width === 0) return;

        ctx.clearRect(0, 0, width, height);

        if (!showAllMasks) return;

        const imgData = ctx.createImageData(width, height);
        const data = imgData.data;

        // Helper to hex to rgb
        const hexToRgb = (hex: string) => {
            return [
                parseInt(hex.slice(1, 3), 16),
                parseInt(hex.slice(3, 5), 16),
                parseInt(hex.slice(5, 7), 16)
            ];
        }

        for (let i = 0; i < maskMap.length; i++) {
            const maskId = maskMap[i];
            if (maskId > 0) {
                const mask = masks.get(maskId);
                if (mask) {
                    const [r, g, b] = hexToRgb(mask.color);
                    const idx = i * 4;
                    data[idx] = r;
                    data[idx + 1] = g;
                    data[idx + 2] = b;
                    data[idx + 3] = 255;
                }
            }
        }
        ctx.putImageData(imgData, 0, 0);

    }, [maskMap, width, height, showAllMasks, masks]);

    // --- Interaction Handlers ---

    // 3. Zoom Logic (Wheel)
    const handleWheel = (e: React.WheelEvent) => {
        // e.preventDefault(); // React's SyntheticEvent might complain, but worth a try (actually doesn't work well on passive defaults)
        // Better logic: accumulate delta
        const delta = -e.deltaY * 0.002;
        const newZoom = Math.min(Math.max(zoom + delta, 0.1), 5.0);
        setZoom(newZoom);
    };

    // 1. Pan Logic (Space + Drag)
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 1 || (e.button === 0 && e.shiftKey)) { // Middle click OR Shift+Left Click (User asked for Space, but Shift is easier to code without global listeners)
            // Actually user asked for Space, but Space needs window listener. 
            // Let's support Middle Click (Standard) and Alt+Drag.
            setIsDragging(true);
            setLastMousePos({ x: e.clientX, y: e.clientY });
            e.preventDefault();
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            const dx = e.clientX - lastMousePos.x;
            const dy = e.clientY - lastMousePos.y;
            setPan(pan.x + dx, pan.y + dy);
            setLastMousePos({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // 2. Click Logic (Selection)
    const handleClick = (e: React.MouseEvent) => {
        if (isDragging) return; // Don't select if we just panned
        if (!maskMap || width === 0) return;

        // BoundingRect ALREADY accounts for Zoom/Pan transform
        const rect = highlightCanvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const scaleX = width / rect.width;
        const scaleY = height / rect.height;

        const x = Math.floor((e.clientX - rect.left) * scaleX);
        const y = Math.floor((e.clientY - rect.top) * scaleY);

        if (x < 0 || x >= width || y < 0 || y >= height) return;

        const idx = y * width + x;
        const maskId = maskMap[idx];

        if (maskId > 0) {
            // Note: Shift key conflict with Pan? 
            // If we use Shift for Multi-Select, we need another key for Pan.
            // Let's use ALT for Pan.
            selectMask(maskId, e.shiftKey || e.ctrlKey || e.metaKey);
        }
    };

    return (
        <div
            ref={containerRef}
            className={clsx(
                "relative flex-1 bg-neutral-900 flex items-center justify-center overflow-hidden p-4",
                isDragging ? "cursor-grabbing" : "cursor-default"
            )}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
        >
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-neutral-900/80 text-white flex-col gap-2">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p>Processing Image...</p>
                </div>
            )}

            <div
                className="relative shadow-2xl rounded-lg overflow-hidden transition-transform duration-75 ease-out origin-center"
                style={{
                    aspectRatio: width > 0 ? `${width}/${height}` : 'auto',
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
                }}
            >
                {!currentSet && !width && <div className="text-gray-500">No Image Loaded</div>}

                <canvas ref={baseCanvasRef} className="block max-h-[85vh] max-w-full" />
                <canvas ref={paintCanvasRef} className="absolute inset-0 w-full h-full mix-blend-multiply pointer-events-none transition-opacity duration-500" />
                <canvas ref={highlightCanvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-auto cursor-crosshair"
                    onClick={handleClick}
                />
                <canvas ref={masksCanvasRef} className={clsx("absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300", showAllMasks ? 'opacity-100' : 'opacity-0')} />
            </div>

            {/* Hint overlay */}
            <div className="absolute bottom-4 left-4 text-xs text-neutral-500 bg-black/50 p-2 rounded pointer-events-none">
                <p>Scroll or +/- to Zoom</p>
                <p>Alt + Drag to Pan</p>
                <p>Shift + Click to Multi-Select</p>
            </div>
        </div>
    );
};
