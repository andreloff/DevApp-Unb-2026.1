import { Courgette_400Regular, useFonts } from "@expo-google-fonts/courgette";
import { Roboto_400Regular } from "@expo-google-fonts/roboto";
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef } from "react";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Courgette_400Regular,
    Roboto_400Regular,
  });

  const router = useRouter();
  const lastNotificationResponse = Notifications.useLastNotificationResponse();
  const listenerRef = useRef<Notifications.EventSubscription | null>(null);
  const processedNotificationIds = useRef<Set<string>>(new Set());

  function handleNotificationResponse(
    response: Notifications.NotificationResponse
  ) {
    const notificationId = response.notification.request.identifier;

    if (processedNotificationIds.current.has(notificationId)) {
      return;
    }
    processedNotificationIds.current.add(notificationId);

    const data = response.notification.request.content.data;

    if (data?.tipo === "chat_iniciado" && data?.chatId) {
      router.push(`/chat/${data.chatId}`);
      return;
    }

    if (data?.tipo === "aceita") {
      router.push(`/meusAnimais`);
      return;
    }

    if (data?.tipo === "interesse_adocao") {
      router.push(`/notificacoes`);
      return;
    }
  }

  useEffect(() => {
    if (lastNotificationResponse) {
      handleNotificationResponse(lastNotificationResponse);
    }
  }, [lastNotificationResponse]);

  useEffect(() => {
    listenerRef.current =
      Notifications.addNotificationResponseReceivedListener(
        handleNotificationResponse
      );

    return () => {
      listenerRef.current?.remove();
    };
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
