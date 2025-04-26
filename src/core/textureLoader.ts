import { Texture } from 'pixi.js';

export async function loadTextureFromURL(url: string): Promise<Texture> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            // Create a new canvas for this texture
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            if (!context) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            // Set canvas size to match image
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw image to canvas
            context.drawImage(img, 0, 0);

            // Create texture from canvas
            const texture = Texture.from(canvas);
            resolve(texture);
        };

        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
    });
} 