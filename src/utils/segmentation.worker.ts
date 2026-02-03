import type { Mask } from "../types";

// Thresholds for segmentation
const NORMAL_DIFF_THRESHOLD = 25; // Sensitivity to changes in normal map
const EDGE_THRESHOLD = 200; // Brightness threshold: Pixels DARKER than this are edges (for white background)

interface SegmentationInput {
    width: number;
    height: number;
    edgeData: Uint8ClampedArray;
    normalData: Uint8ClampedArray;
}

interface SegmentationResult {
    width: number;
    height: number;
    maskMap: Int32Array;
    masks: Map<number, Mask>;
}

self.onmessage = (e: MessageEvent<SegmentationInput>) => {
    const { width, height, edgeData, normalData, colorData } = e.data;

    try {
        const result = processValues(width, height, edgeData, normalData, colorData);
        self.postMessage({ success: true, result });
    } catch (error) {
        self.postMessage({ success: false, error });
    }
};

const processValues = (
    width: number,
    height: number,
    edgeData: Uint8ClampedArray,
    normalData: Uint8ClampedArray,
    colorData: Uint8ClampedArray
): SegmentationResult => {
    const totalPixels = width * height;
    const visited = new Uint8Array(totalPixels); // 0 = unvisited, 1 = visited
    const maskMap = new Int32Array(totalPixels);
    const masks = new Map<number, Mask>();
    let currentMaskId = 1;

    const getIdx = (x: number, y: number) => y * width + x;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = getIdx(x, y);

            if (visited[idx]) continue;

            const edgeVal = edgeData[idx * 4];

            // INVERTED LOGIC: Edge map is Black-on-White (sketch style)
            // Lines are dark (low values), Background is white (high values)
            // So if value is LOW, it is an edge/barrier.
            if (edgeVal < EDGE_THRESHOLD) {
                visited[idx] = 1;
                maskMap[idx] = 0; // Marked as edge/background
                continue;
            }

            const regionId = currentMaskId++;
            const stack = [idx];
            visited[idx] = 1;
            maskMap[idx] = regionId;

            let minX = x, maxX = x, minY = y, maxY = y;
            let count = 0;

            // Accumulators for averages
            let sumR = 0, sumG = 0, sumB = 0;
            let sumNX = 0, sumNY = 0, sumNZ = 0;

            // Use Golden Angle approximation for distinct colors
            // Golden Angle ~ 137.5 degrees
            // Hue = (regionId * 137.508) % 360
            const hue = (regionId * 137.508) % 360;
            // High saturation and lightness for vibrant look
            const saturation = 70 + (regionId % 30); // 70-100%
            const lightness = 45 + (regionId % 20);  // 45-65%

            // Convert HSL to Hex
            const h = hue / 360;
            const s = saturation / 100;
            const l = lightness / 100;
            let r, g, b;
            if (s === 0) {
                r = g = b = l;
            } else {
                const hue2rgb = (p: number, q: number, t: number) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1 / 6) return p + (q - p) * 6 * t;
                    if (t < 1 / 2) return q;
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                };
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }
            const toHex = (x: number) => {
                const hex = Math.round(x * 255).toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            };
            const color = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

            while (stack.length > 0) {
                const currIdx = stack.pop()!;
                const cx = currIdx % width;
                const cy = Math.floor(currIdx / width);

                count++;
                if (cx < minX) minX = cx;
                if (cx > maxX) maxX = cx;
                if (cy < minY) minY = cy;
                if (cy > maxY) maxY = cy;

                // Accumulate Color Data
                sumR += colorData[currIdx * 4];
                sumG += colorData[currIdx * 4 + 1];
                sumB += colorData[currIdx * 4 + 2];

                // Accumulate Normal Data
                sumNX += normalData[currIdx * 4];
                sumNY += normalData[currIdx * 4 + 1];
                sumNZ += normalData[currIdx * 4 + 2];

                const neighbors = [
                    { nx: cx + 1, ny: cy },
                    { nx: cx - 1, ny: cy },
                    { nx: cx, ny: cy + 1 },
                    { nx: cx, ny: cy - 1 }
                ];

                for (const { nx, ny } of neighbors) {
                    if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;

                    const nIdx = getIdx(nx, ny);
                    if (visited[nIdx]) continue;

                    const nEdgeVal = edgeData[nIdx * 4];
                    if (nEdgeVal < EDGE_THRESHOLD) {
                        continue;
                    }

                    const r1 = normalData[currIdx * 4];
                    const g1 = normalData[currIdx * 4 + 1];
                    const b1 = normalData[currIdx * 4 + 2];

                    const r2 = normalData[nIdx * 4];
                    const g2 = normalData[nIdx * 4 + 1];
                    const b2 = normalData[nIdx * 4 + 2];

                    const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);

                    if (diff < NORMAL_DIFF_THRESHOLD) {
                        visited[nIdx] = 1;
                        maskMap[nIdx] = regionId;
                        stack.push(nIdx);
                    }
                }
            }

            // Calculate Averages
            // Avoid division by zero (though count always >= 1 here)
            const safeCount = count > 0 ? count : 1;
            const averageColor = {
                r: Math.round(sumR / safeCount),
                g: Math.round(sumG / safeCount),
                b: Math.round(sumB / safeCount)
            };
            const averageNormal = {
                x: Math.round(sumNX / safeCount),
                y: Math.round(sumNY / safeCount),
                z: Math.round(sumNZ / safeCount)
            };

            masks.set(regionId, {
                id: regionId,
                color,
                pixelCount: count,
                boundingBox: { minX, minY, maxX, maxY },
                averageColor,
                averageNormal
            });
        }
    }

    // 5. Post-Processing: Gap Filling (Dilation)
    // Iterate all pixels. If a pixel is ID 0 (Edge) but has a valid neighbor, assign it to that neighbor.
    // This "thickens" the masks to cover the anti-aliased edges.
    const newMaskMap = new Int32Array(maskMap); // Copy to avoid reading/writing same buffer race
    let updates = 0;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            if (maskMap[idx] !== 0) continue; // Already has a mask

            // Check neighbors for a non-zero voting
            const neighborCounts: Record<number, number> = {};
            let maxCount = 0;
            let bestId = 0;

            // Check 8-neighbors for better coverage
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        const nId = maskMap[ny * width + nx];
                        if (nId > 0) {
                            neighborCounts[nId] = (neighborCounts[nId] || 0) + 1;
                            if (neighborCounts[nId] > maxCount) {
                                maxCount = neighborCounts[nId];
                                bestId = nId;
                            }
                        }
                    }
                }
            }

            if (bestId > 0) {
                newMaskMap[idx] = bestId;
                updates++;
            }
        }
    }

    // Apple the updates
    if (updates > 0) {
        maskMap.set(newMaskMap);
    }

    return {
        width,
        height,
        maskMap,
        masks
    };
};
