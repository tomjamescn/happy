import * as React from 'react';
import { View, Text, Pressable } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';
import { ToolViewProps } from './_all';
import { knownTools } from '../../tools/knownTools';
import { ToolSectionView } from '../../tools/ToolSectionView';
import { sync } from '@/sync/sync';
import { useHappyAction } from '@/hooks/useHappyAction';
import { t } from '@/text';

interface Question {
    question: string;
    header?: string;
    multiSelect?: boolean;
    options: Array<{
        label: string;
        description?: string;
    }>;
}

export const AskUserQuestionView = React.memo<ToolViewProps>(({ tool, sessionId }) => {
    // Parse the tool input to get questions
    const parsedInput = knownTools.AskUserQuestion.input.safeParse(tool.input);

    if (!parsedInput.success || !parsedInput.data.questions || parsedInput.data.questions.length === 0) {
        return null;
    }

    const questions: Question[] = parsedInput.data.questions;

    // Disable interaction if tool is completed
    const isCompleted = tool.state === 'completed';

    return (
        <ToolSectionView>
            <View style={styles.container}>
                {questions.map((question, questionIndex) => (
                    <QuestionCard
                        key={questionIndex}
                        question={question}
                        sessionId={sessionId}
                        isCompleted={isCompleted}
                    />
                ))}
            </View>
        </ToolSectionView>
    );
});

interface QuestionCardProps {
    question: Question;
    sessionId: string | undefined;
    isCompleted: boolean;
}

const QuestionCard = React.memo<QuestionCardProps>(({ question, sessionId, isCompleted }) => {
    const { theme } = useUnistyles();
    const [selectedOptions, setSelectedOptions] = React.useState<Set<number>>(new Set());

    const isMultiSelect = question.multiSelect ?? false;

    const handleSingleSelect = React.useCallback((optionIndex: number) => {
        if (isCompleted || !sessionId) return;

        const selectedLabel = question.options[optionIndex].label;
        sync.sendMessage(sessionId, selectedLabel);
    }, [isCompleted, sessionId, question.options]);

    const toggleMultiSelect = React.useCallback((optionIndex: number) => {
        if (isCompleted) return;

        setSelectedOptions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(optionIndex)) {
                newSet.delete(optionIndex);
            } else {
                newSet.add(optionIndex);
            }
            return newSet;
        });
    }, [isCompleted]);

    const [isSubmitting, handleConfirmSelection] = useHappyAction(async () => {
        if (!sessionId || selectedOptions.size === 0) return;

        const selectedLabels = Array.from(selectedOptions)
            .sort((a, b) => a - b)
            .map(index => question.options[index].label);

        const responseText = selectedLabels.join(', ');
        await sync.sendMessage(sessionId, responseText);

        // Clear selection after sending
        setSelectedOptions(new Set());
    });

    const canConfirm = !isCompleted && selectedOptions.size > 0 && !isSubmitting;

    return (
        <View style={styles.questionCard}>
            {/* Question header */}
            {question.header && (
                <View style={styles.headerBadge}>
                    <Text style={styles.headerText}>{question.header}</Text>
                </View>
            )}

            {/* Question text */}
            <Text style={styles.questionText}>{question.question}</Text>

            {/* Options */}
            <View style={styles.optionsContainer}>
                {question.options.map((option, optionIndex) => {
                    const isSelected = selectedOptions.has(optionIndex);

                    return (
                        <Pressable
                            key={optionIndex}
                            style={({ pressed }) => [
                                styles.optionCard,
                                isSelected && styles.optionCardSelected,
                                pressed && !isCompleted && styles.optionCardPressed,
                                isCompleted && styles.optionCardDisabled
                            ]}
                            onPress={() => {
                                if (isMultiSelect) {
                                    toggleMultiSelect(optionIndex);
                                } else {
                                    handleSingleSelect(optionIndex);
                                }
                            }}
                            disabled={isCompleted}
                        >
                            <View style={styles.optionContent}>
                                {isMultiSelect && (
                                    <View style={styles.checkboxContainer}>
                                        <Ionicons
                                            name={isSelected ? 'checkbox' : 'square-outline'}
                                            size={24}
                                            color={isSelected ? theme.colors.permissionButton.allow.background : theme.colors.textSecondary}
                                        />
                                    </View>
                                )}
                                <View style={styles.optionTextContainer}>
                                    <Text style={[
                                        styles.optionLabel,
                                        isCompleted && styles.optionLabelDisabled
                                    ]}>
                                        {option.label}
                                    </Text>
                                    {option.description && (
                                        <Text style={[
                                            styles.optionDescription,
                                            isCompleted && styles.optionDescriptionDisabled
                                        ]}>
                                            {option.description}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        </Pressable>
                    );
                })}
            </View>

            {/* Confirm button for multi-select */}
            {isMultiSelect && (
                <Pressable
                    style={[
                        styles.confirmButton,
                        !canConfirm && styles.confirmButtonDisabled
                    ]}
                    onPress={handleConfirmSelection}
                    disabled={!canConfirm}
                >
                    <Text style={[
                        styles.confirmButtonText,
                        !canConfirm && styles.confirmButtonTextDisabled
                    ]}>
                        {t('tools.askQuestion.confirmSelection')}
                    </Text>
                </Pressable>
            )}
        </View>
    );
});

const styles = StyleSheet.create((theme) => ({
    container: {
        gap: 16,
    },
    questionCard: {
        gap: 12,
    },
    headerBadge: {
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.surfaceHighest,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    headerText: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    questionText: {
        fontSize: 15,
        fontWeight: '500',
        color: theme.colors.text,
        lineHeight: 20,
    },
    optionsContainer: {
        gap: 8,
    },
    optionCard: {
        backgroundColor: theme.colors.surfaceHigh,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: theme.colors.divider,
        overflow: 'hidden',
    },
    optionCardSelected: {
        borderColor: theme.colors.permissionButton.allow.background,
        backgroundColor: theme.colors.surfaceHighest,
    },
    optionCardPressed: {
        opacity: 0.7,
    },
    optionCardDisabled: {
        opacity: 0.5,
    },
    optionContent: {
        flexDirection: 'row',
        padding: 12,
        gap: 12,
        alignItems: 'center',
    },
    checkboxContainer: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionTextContainer: {
        flex: 1,
        gap: 4,
    },
    optionLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.text,
        lineHeight: 18,
    },
    optionLabelDisabled: {
        color: theme.colors.textSecondary,
    },
    optionDescription: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        lineHeight: 17,
    },
    optionDescriptionDisabled: {
        opacity: 0.7,
    },
    confirmButton: {
        backgroundColor: theme.colors.permissionButton.allow.background,
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        marginTop: 4,
    },
    confirmButtonDisabled: {
        backgroundColor: theme.colors.divider,
    },
    confirmButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.permissionButton.allow.text,
    },
    confirmButtonTextDisabled: {
        color: theme.colors.textSecondary,
    },
}));
