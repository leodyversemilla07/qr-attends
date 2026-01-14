import { Button } from "@/components/ui/Button";
import { MsHeading, MsText } from "@/components/ui/Typography";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Pressable, ScrollView, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface OnboardingSlide {
    title: string;
    subtitle: string;
    color: string;
}

const slides: OnboardingSlide[] = [
    { title: "Welcome to QR Attends", subtitle: "Your offline-first attendance tracking solution", color: "#2563EB" },
    { title: "Create Events", subtitle: "Set up events with date, time, and location", color: "#10B981" },
    { title: "Add Members", subtitle: "Register members or import via CSV", color: "#F59E0B" },
    { title: "Scan & Check In", subtitle: "Point camera at QR codes for instant check-in", color: "#8B5CF6" },
    { title: "You Are Ready!", subtitle: "Start tracking attendance efficiently", color: "#059669" },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const scrollRef = useRef<ScrollView>(null);

    useEffect(() => {
        const checkOnboarding = async () => {
            const completed = await AsyncStorage.getItem("onboardingComplete");
            if (completed === "true") {
                router.replace("/login");
            }
        };
        checkOnboarding();
    }, [router]);

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            scrollRef.current?.scrollTo({ x: (currentIndex + 1) * width, animated: true });
            setCurrentIndex(currentIndex + 1);
        } else {
            completeOnboarding();
        }
    };

    const handleSkip = () => completeOnboarding();

    const completeOnboarding = async () => {
        await AsyncStorage.setItem("onboardingComplete", "true");
        router.replace("/login");
    };

    const handleScroll = (event: any) => {
        const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(newIndex);
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
                <View style={{ flex: 1 }}>
                    <Animated.ScrollView
                        ref={scrollRef as any}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                    >
                        {slides.map((slide, index) => (
                            <View key={index} style={{ width, padding: 24 }}>
                                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                                    <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: `${slide.color}20`, justifyContent: "center", alignItems: "center", marginBottom: 32 }}>
                                        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: `${slide.color}30`, justifyContent: "center", alignItems: "center" }}>
                                            <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: slide.color }} />
                                        </View>
                                    </View>
                                    <MsHeading size="h1" className="text-center mb-4">{slide.title}</MsHeading>
                                    <MsText variant="muted" className="text-center text-lg">{slide.subtitle}</MsText>
                                </View>
                            </View>
                        ))}
                    </Animated.ScrollView>

                    <View style={{ padding: 24 }}>
                        <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 24 }}>
                            {slides.map((_, index) => {
                                const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
                                const dotOpacity = scrollX.interpolate({ inputRange, outputRange: [0.3, 1, 0.3], extrapolate: "clamp" });
                                const dotWidth = scrollX.interpolate({ inputRange, outputRange: [8, 24, 8], extrapolate: "clamp" });
                                return <Animated.View key={index} style={{ width: dotWidth, height: 8, borderRadius: 4, backgroundColor: "#2563EB", marginHorizontal: 4, opacity: dotOpacity }} />;
                            })}
                        </View>

                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <Pressable onPress={handleSkip}><MsText variant="muted" className="text-base px-4 py-2">Skip</MsText></Pressable>
                            <Button onPress={handleNext}>{currentIndex === slides.length - 1 ? "Get Started" : "Next"}</Button>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}
