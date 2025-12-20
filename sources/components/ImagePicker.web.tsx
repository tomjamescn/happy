import * as React from 'react';
import { View, Pressable, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Typography } from '@/constants/Typography';
import { hapticsLight } from './haptics';

interface ImagePickerProps {
    onImageSelected: (file: File) => void;
    disabled?: boolean;
    uploading?: boolean;
}

const stylesheet = StyleSheet.create((theme) => ({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 8,
        paddingVertical: 6,
        justifyContent: 'center',
        height: 32,
    },
    icon: {
        color: theme.colors.button.secondary.tint,
    },
}));

export function ImagePicker(props: ImagePickerProps) {
    const styles = stylesheet;
    const { theme } = useUnistyles();
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handlePress = React.useCallback(() => {
        if (props.disabled || props.uploading) return;
        hapticsLight();
        inputRef.current?.click();
    }, [props.disabled, props.uploading]);

    const handleFileChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            // Validate file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                alert('Image size must be less than 10MB');
                return;
            }

            props.onImageSelected(file);
        }

        // Reset input so same file can be selected again
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    }, [props.onImageSelected]);

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
            <Pressable
                onPress={handlePress}
                hitSlop={{ top: 5, bottom: 10, left: 0, right: 0 }}
                style={(p) => ({
                    ...styles.button,
                    opacity: (props.disabled || props.uploading) ? 0.5 : (p.pressed ? 0.7 : 1),
                })}
                disabled={props.disabled || props.uploading}
            >
                {props.uploading ? (
                    <ActivityIndicator size="small" color={theme.colors.button.secondary.tint} />
                ) : (
                    <Ionicons
                        name="image-outline"
                        size={16}
                        style={styles.icon}
                    />
                )}
            </Pressable>
        </>
    );
}
