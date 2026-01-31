import { useRef, useEffect } from 'react';
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
        masks
    } = useAppStore();

    const containerRef = useRef<HTMLDivElement>(null);
    const baseCanvasRef = useRef<HTMLCanvasElement>(null);
    const paintCanvasRef = useRef<HTMLCanvasElement>(null);
    const highlightCanvasRef = useRef<HTMLCanvasElement>(null);
    const masksCanvasRef = useRef<HTMLCanvasElement>(null);

    // Initial load and processing
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

                worker = new Worker(new URL('../utils/segmentation.worker.ts', import.meta.url), { type: 'module' });

                worker.onmessage = (e) => {
                    if (!mounted) return;
                    const { success, result, error } = e.data;

                    if (success && result) {
                        console.log(`[Worker Result] Size: ${result.width}x${result.height}, MaskMap Len: ${result.maskMap.length}`);
                        // Sample check
                        let nonZero = 0;
                        for (let i = 0; i < 1000; i++) {
                            if (result.maskMap[Math.floor(Math.random() * result.maskMap.length)] > 0) nonZero++;
                        }
                        console.log(`[Worker Result] Random Sampling 1000 pixels: ${nonZero} non-zero IDs.`);

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
                    normalData
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

    // Draw Paints
    useEffect(() => {
        const ctx = paintCanvasRef.current?.getContext('2d');
        if (!ctx || !maskMap || width === 0) return;

        ctx.clearRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'multiply'; // Blend mode for realism

        // Create an ImageData buffer for rendering paints
        // Doing pixel manipulation is faster than fillRect for complex shapes or thousands of rects
        // But for "regions", we have the maskMap.
        // If we want to assign colors to pixels:
        // Iterate all pixels, check maskId, if maskId has color, set pixel.

        const imgData = ctx.createImageData(width, height);
        const data = imgData.data;
        const colorCache: Record<number, number[]> = {}; // maskId -> [r,g,b]

        // Precompute rgb for active colors
        maskColors.forEach((hex, id) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            colorCache[id] = [r, g, b];
        });

        // Optimization: Only iterate if there are colors
        if (maskColors.size > 0) {
            for (let i = 0; i < maskMap.length; i++) {
                const maskId = maskMap[i];
                if (maskId > 0 && colorCache[maskId]) {
                    const [r, g, b] = colorCache[maskId];
                    const idx = i * 4;
                    data[idx] = r;
                    data[idx + 1] = g;
                    data[idx + 2] = b;
                    data[idx + 3] = 255; // Full opacity, let blend mode handle interaction with base
                    // Actually, multiply with 255 opacity means the color is multiplied directly.
                    // If we want it to look like paint, maybe 0.8 opacity?
                    // Let's try 217 (approx 0.85) for better coverage while keeping texture
                    data[idx + 3] = 217;
                }
            }
            ctx.putImageData(imgData, 0, 0);
        }

    }, [maskMap, width, height, maskColors]);

    // Draw Highlights (Selection)
    useEffect(() => {
        const ctx = highlightCanvasRef.current?.getContext('2d');
        if (!ctx || !maskMap || width === 0) return;

        ctx.clearRect(0, 0, width, height);

        if (selectedMaskIds.size === 0) return;

        const imgData = ctx.createImageData(width, height);
        const data = imgData.data;

        // Draw a white/blue overlay
        for (let i = 0; i < maskMap.length; i++) {
            if (selectedMaskIds.has(maskMap[i])) {
                const idx = i * 4;
                // Electric Blue Highilght
                data[idx] = 0;
                data[idx + 1] = 120;
                data[idx + 2] = 255;
                data[idx + 3] = 180; // ~70% Opacity for clear visibility
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

        // We stored colors in `masks` metadata
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

    const handleClick = (e: React.MouseEvent) => {
        if (!maskMap || width === 0) return;

        const rect = highlightCanvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const scaleX = width / rect.width;
        const scaleY = height / rect.height;

        const x = Math.floor((e.clientX - rect.left) * scaleX);
        const y = Math.floor((e.clientY - rect.top) * scaleY);

        if (x < 0 || x >= width || y < 0 || y >= height) return;

        const idx = y * width + x;
        const maskId = maskMap[idx];

        console.log(`[Click Debug] x: ${x}, y: ${y}, idx: ${idx}, maskId: ${maskId}, maskMapLen: ${maskMap.length}`);
        if (maskId === 0) {
            // Check valid neighbors to see if we are just unlucky
            const nIds = [
                maskMap[idx + 1], maskMap[idx - 1], maskMap[idx + width], maskMap[idx - width]
            ];
            console.log(`[Click Debug] Neighbors: ${nIds.join(', ')}`);
        }
        console.log(`[Click Debug] Mask Data:`, masks.get(maskId));

        if (maskId > 0) {
            selectMask(maskId, e.shiftKey);
        } else {
            console.log("[Click Debug] Clicked background/edge (Mask ID 0)");
        }
    };

    return (
        <div ref={containerRef} className="relative flex-1 bg-neutral-900 flex items-center justify-center overflow-hidden p-4">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-neutral-900/80 text-white flex-col gap-2">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p>Processing Image...</p>
                </div>
            )}



            <div className="relative shadow-2xl rounded-lg overflow-hidden" style={{ aspectRatio: width > 0 ? `${width}/${height}` : 'auto' }}>
                {!currentSet && !width && <div className="text-gray-500">No Image Loaded</div>}

                <canvas ref={baseCanvasRef} className="block max-h-[85vh] max-w-full" />
                <canvas ref={paintCanvasRef} className="absolute inset-0 w-full h-full mix-blend-multiply pointer-events-none transition-opacity duration-500" />
                <canvas ref={highlightCanvasRef} className="absolute inset-0 w-full h-full pointer-events-auto cursor-pointer" onClick={handleClick} />
                <canvas ref={masksCanvasRef} className={clsx("absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300", showAllMasks ? 'opacity-100' : 'opacity-0')} />
            </div>
        </div>
    );
};
