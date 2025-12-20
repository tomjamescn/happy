import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { getServerUrl } from '@/sync/serverConfig';
import { sync } from '@/sync/sync';

export interface ImageUploadResult {
    url: string;
    width: number;
    height: number;
    thumbhash: string;
}

export interface UploadedImage extends ImageUploadResult {
    localUri?: string; // For preview before upload completes
    file?: File; // Web only
}

export function useImageUpload() {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadImage = useCallback(async (file: File): Promise<ImageUploadResult> => {
        if (Platform.OS !== 'web') {
            throw new Error('Image upload is only supported on web platform');
        }

        const credentials = sync.getCredentials();
        if (!credentials) {
            throw new Error('No authentication token available');
        }
        const token = credentials.token;

        setUploading(true);
        setError(null);

        try {
            // Create FormData
            const formData = new FormData();
            formData.append('image', file);

            // Upload to server
            const serverUrl = getServerUrl();
            const response = await fetch(`${serverUrl}/v1/images/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
                throw new Error(errorData.error || errorData.message || `Upload failed: ${response.statusText}`);
            }

            const result = await response.json();

            return {
                url: result.url,
                width: result.width,
                height: result.height,
                thumbhash: result.thumbhash,
            };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            throw err;
        } finally {
            setUploading(false);
        }
    }, []);

    return {
        uploadImage,
        uploading,
        error,
    };
}
