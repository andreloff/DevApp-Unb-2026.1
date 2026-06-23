import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { arrayUnion, doc, setDoc } from "firebase/firestore";
import { Platform } from "react-native";
import { db } from "./firebaseConfig";

/**
 * Pede permissão (se necessário), obtém o Expo Push Token do dispositivo
 * e associa ao usuário logado em usuarios/{uid}.pushTokens (array).
 *
 * Retorna o token salvo, ou null se não foi possível obter/salvar
 * (permissão negada, rodando em emulador sem suporte a push, etc).
 */
export async function registrarTokenNotificacao(
  uid: string
): Promise<string | null> {
  try {
    // Push token só existe em dispositivo físico (emuladores sem Google
    // Play Services / simuladores iOS não recebem push de verdade).
    if (!Device.isDevice) {
      console.log("Notificações push exigem dispositivo físico, pulando registro de token.");
      return null;
    }

    const { status: statusAtual } = await Notifications.getPermissionsAsync();
    let statusFinal = statusAtual;

    if (statusAtual !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      statusFinal = status;
    }

    if (statusFinal !== "granted") {
      console.log("Permissão de notificação negada pelo usuário.");
      return null;
    }

    // Necessário no Android para o canal padrão de notificações.
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    // O Expo exige o projectId do EAS para gerar o push token.
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      console.log(
        "EAS projectId não encontrado em app.json (extra.eas.projectId). Não é possível gerar o Expo Push Token."
      );
      return null;
    }

    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    await salvarTokenNoUsuario(uid, expoPushToken);

    return expoPushToken;
  } catch (error) {
    console.log("Erro ao registrar token de notificação:", error);
    return null;
  }
}

/**
 * Adiciona o token ao array usuarios/{uid}.pushTokens, sem duplicar
 * (arrayUnion já evita duplicatas exatas).
 */
async function salvarTokenNoUsuario(uid: string, token: string) {
  const usuarioRef = doc(db, "usuarios", uid);

  await setDoc(
    usuarioRef,
    { pushTokens: arrayUnion(token) },
    { merge: true }
  );

  console.log("Push token associado ao usuário com sucesso.");
}