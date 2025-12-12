/**
 * Resizes an image file if it exceeds the specified maximum width.
 * Returns a Promise resolving to the compressed Blob (or original file if no resizing needed/error).
 */
export const resizeImage = (file: File, maxWidth: number = 1024, quality: number = 0.8): Promise<Blob> => {
    return new Promise((resolve) => {
        // If it's not an image, just return it
        if (!file.type.match(/image.*/)) {
            resolve(file);
            return;
        }

        const reader = new FileReader();
        reader.onload = (readerEvent) => {
            const image = new Image();
            image.onload = () => {
                let width = image.width;
                let height = image.height;

                // Scale down if needed
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(file); // Fallback
                    return;
                }

                ctx.drawImage(image, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        resolve(file);
                    }
                }, file.type, quality);
            };
            image.onerror = () => resolve(file);
            image.src = readerEvent.target?.result as string;
        };
        reader.onerror = () => resolve(file);
        reader.readAsDataURL(file);
    });
};
