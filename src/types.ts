export interface ImageSet {
    id: string;
    original: string;
    cleaned: string;
    edge: string;
    normals: string;
}

export interface Mask {
    id: number;
    // We will store pixels as a flat array of indices or a compressed format.
    // For simplicity in JS, a Set of indices might be too memory heavy for 1MP+ images.
    // Let's use a specialized structure or just rely on a Uint32Array map where index -> maskId.
    // Actually, for the "Masks" object, we might just need metadata (center, bounds) 
    // and keep the pixel-to-mask mapping in a single big Uint16Array.
    boundingBox: { minX: number; minY: number; maxX: number; maxY: number };
    pixelCount: number;
    color: string; // Random color for visualization
}

export const IMAGE_SETS: ImageSet[] = [
    { id: '1', original: '/images/1/original.png', cleaned: '/images/1/cleaned.png', edge: '/images/1/edge.png', normals: '/images/1/normals.png' },
    { id: '2', original: '/images/2/original.png', cleaned: '/images/2/cleaned.png', edge: '/images/2/edge.png', normals: '/images/2/normals.png' },
    { id: '3', original: '/images/3/original.png', cleaned: '/images/3/cleaned.png', edge: '/images/3/edge.png', normals: '/images/3/normals.png' },
    { id: '4', original: '/images/4/original.png', cleaned: '/images/4/cleaned.png', edge: '/images/4/edge.png', normals: '/images/4/normals.png' },
    { id: '5', original: '/images/5/original.png', cleaned: '/images/5/cleaned.png', edge: '/images/5/edge.png', normals: '/images/5/normals.png' },
    { id: '6', original: '/images/6/original.png', cleaned: '/images/6/cleaned.png', edge: '/images/6/edge.png', normals: '/images/6/normals.png' },
];

export const PAINT_COLORS = [
    { name: 'Classic White', hex: '#F5F5F5' },
    { name: 'Warm Beige', hex: '#E5D0B1' },
    { name: 'Cool Gray', hex: '#A8A9AD' },
    { name: 'Navy Blue', hex: '#2C3E50' },
    { name: 'Forest Green', hex: '#273c2c' },
    { name: 'Terracotta', hex: '#E2725B' },
    { name: 'Charcoal', hex: '#36454F' },
];
