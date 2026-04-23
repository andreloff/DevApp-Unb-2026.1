import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function HomeLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#FAFAFA" }}
        edges={["top"]}
      >
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
