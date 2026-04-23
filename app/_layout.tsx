import { Courgette_400Regular, useFonts } from "@expo-google-fonts/courgette";
import { Roboto_400Regular } from "@expo-google-fonts/roboto";
import { Stack } from "expo-router";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Courgette_400Regular,
    Roboto_400Regular,
  });
  if (!fontsLoaded) {
    return null;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}
