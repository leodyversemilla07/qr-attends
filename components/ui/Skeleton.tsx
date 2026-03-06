import React, { useEffect, useRef } from "react";
import { Animated, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "react-native-paper";

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    style?: StyleProp<ViewStyle>;
}

export function Skeleton({ width, height, style }: SkeletonProps) {
    const { colors } = useTheme();
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.7,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [opacity]);

    return (
        <Animated.View
            style={[
                styles.base,
                {
                    width: width as any,
                    height: height as any,
                    opacity,
                    backgroundColor: colors.surfaceVariant,
                },
                style,
            ]}
        />
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: 8,
    },
});

