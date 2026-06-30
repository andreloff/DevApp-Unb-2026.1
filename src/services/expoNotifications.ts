import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { arrayRemove, arrayUnion, doc, setDoc, updateDoc } from "firebase/firestore";
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

export async function removerTokenNotificacao(uid: string) {
  try {

    // O Expo exige o projectId do EAS para gerar o push token.
    const myProjectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: myProjectId,
    });
    const token = tokenData.data;

    if (!token) return;

    const userRef = doc(db, "usuarios", uid);
    await updateDoc(userRef, {
      pushTokens: arrayRemove(token),
    });

    console.log("Token de notificação removido com sucesso.");
  } catch (error) {
    console.error("Erro ao remover token de notificação:", error);
  }
}

export async function enviarPushNotificacao(
  tokens: string[],
  titulo: string,
  corpo: string,
  dados?: Record<string, string>
): Promise<void> {
  if (!tokens || tokens.length === 0) {
    console.log("Nenhum token disponível para envio de push.");
    return;
  }

  const mensagens = tokens.map((token) => ({
    to: token,
    sound: "default",
    title: titulo,
    body: corpo,
    data: dados ?? {},
  }));

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mensagens),
    });

    const resultado = await response.json();
    console.log("Expo Push API respondeu:", JSON.stringify(resultado));
  } catch (error) {
    console.error("Erro ao chamar Expo Push API:", error);
  }
}