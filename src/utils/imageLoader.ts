import type { ImageSet } from "../types";

export interface LoadedImages {
    original: HTMLImageElement;
    cleaned: HTMLImageElement;
    edge: HTMLImageElement;
    normals: HTMLImageElement;
}

export const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = src;
    });
};

export const loadDataset = async (set: ImageSet): Promise<LoadedImages> => {
    const [original, cleaned, edge, normals] = await Promise.all([
        loadImage(set.original),
        loadImage(set.cleaned),
        loadImage(set.edge),
        loadImage(set.normals)
    ]);

    if (
        cleaned.width !== edge.width || cleaned.height !== edge.height ||
        cleaned.width !== normals.width || cleaned.height !== normals.height
    ) {
        throw new Error(`Dimension mismatch: Cleaned(${cleaned.width}x${cleaned.height}) vs Edge(${edge.width}x${edge.height}) vs Normals(${normals.width}x${normals.height})`);
    }

    return { original, cleaned, edge, normals };
};

export const getImageData = (img: HTMLImageElement, width?: number, height?: number): ImageData => {
    const canvas = document.createElement('canvas');
    canvas.width = width || img.width;
    canvas.height = height || img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
};
