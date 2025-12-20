import * as React from 'react';
import { View, Pressable, Text, ActivityIndicator, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Typography } from '@/constants/Typography';
import { hapticsLight } from './haptics';
import type { UploadedImage } from '@/hooks/useImageUpload';

interface ImagePreviewProps {
    image: UploadedImage;
    onRemove: () => void;
    uploading?: boolean;
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        paddingHorizontal: 8,
        paddingTop: 8,
        paddingBottom: 4,
    },
    imageContainer: {
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: theme.colors.surface,
        maxWidth: 200,
    },
    image: {
        width: '100%',
        height: 120,
        borderRadius: 12,
    },
    uploadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadingText: {
        color: 'white',
        fontSize: 12,
        marginTop: 8,
        ...Typography.default(),
    },
}));

export function ImagePreview(props: ImagePreviewProps) {
    const styles = stylesheet;
    const { theme } = useUnistyles();

    // Get preview URL
    const imageUri = React.useMemo(() => {
        if (props.image.url) {
            return props.image.url;
        }
        if (props.image.localUri) {
            return props.image.localUri;
        }
        // Web: create object URL from File
        if (Platform.OS === 'web' && props.image.file) {
            return URL.createObjectURL(props.image.file);
        }
        return null;
    }, [props.image]);

    const handleRemove = React.useCallback(() => {
        hapticsLight();
        props.onRemove();
    }, [props.onRemove]);

    if (!imageUri) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: imageUri }}
                    style={styles.image}
                    contentFit="cover"
                />

                {props.uploading && (
                    <View style={styles.uploadingOverlay}>
                        <ActivityIndicator size="small" color="white" />
                        <Text style={styles.uploadingText}>上传中...</Text>
                    </View>
                )}

                {!props.uploading && (
                    <Pressable
                        style={(p) => ({
                            ...styles.removeButton,
                            opacity: p.pressed ? 0.7 : 1,
                        })}
                        onPress={handleRemove}
                    >
                        <Ionicons
                            name="close"
                            size={16}
                            color="white"
                        />
                    </Pressable>
                )}
            </View>
        </View>
    );
}
