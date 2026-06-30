import NotificacaoCard, {
  NotificacaoInteresseAdocao,
} from "@/components/notificacaoCard";
import { enviarPushNotificacao } from "@/src/services/expoNotifications";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where
} from "firebase/firestore";
import LottieView from "lottie-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../../src/services/firebaseConfig";

export default function Notificacoes() {
  const [notificacoes, setNotificacoes] = useState<NotificacaoInteresseAdocao[]>([]);
  const [loading, setLoading] = useState(true);
  const [processandoId, setProcessandoId] = useState<string | null>(null);
  const navigation = useNavigation();
  const router = useRouter();
  const [showAnimation, setShowAnimation] = useState(false);

  const onMenuPress = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  useEffect(() => {
    const uid = auth.currentUser?.uid;

    if (!uid) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "notificacoes"),
      where("destinatarioId", "==", uid),
      where("status", "==", "pendente"),
      orderBy("criadaEm", "desc"),
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs: NotificacaoInteresseAdocao[] = [];
      querySnapshot.forEach((docSnap) => {
        docs.push({ id: docSnap.id, ...docSnap.data() } as NotificacaoInteresseAdocao);
      });
      setNotificacoes(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const iniciarChat = async (notificacao: NotificacaoInteresseAdocao) => {

    if (processandoId) return; 
    
    setProcessandoId(notificacao.id);
    setShowAnimation(true);

    try {
      let nomeTutor = "Tutor";
      let fotoTutor = "";
      const tutorSnap = await getDoc(doc(db, "usuarios", notificacao.destinatarioId));
      
      if (tutorSnap.exists()) {
        const tutorData = tutorSnap.data() as any;
        nomeTutor = tutorData.nome_completo || tutorData.nome_usuario || nomeTutor;
        fotoTutor = tutorData.fotoUrl || "";
      }

      let fotoInteressado = "";
      let pushTokensInteressado: string[] = [];
      const interessadoSnap = await getDoc(doc(db, "usuarios", notificacao.remetenteId));
      if (interessadoSnap.exists()) {
        const interessadoData = interessadoSnap.data() as any;
        fotoInteressado = interessadoData.fotoUrl || "";
        pushTokensInteressado = interessadoData.pushTokens ?? [];
      }

      const chatId = `${notificacao.animalId}_${notificacao.remetenteId}`;

      await runTransaction(db, async (transaction) => {
        const notificacaoRef = doc(db, "notificacoes", notificacao.id);
        const chatRef = doc(db, "conversas", chatId);

        transaction.set(
          chatRef,
          {
            id_animal: notificacao.animalId,
            nome_animal: notificacao.animalNome ?? "",

            id_tutor: notificacao.destinatarioId,
            nome_tutor: nomeTutor,
            foto_tutor: fotoTutor,

            id_interessado: notificacao.remetenteId,
            nome_interessado: notificacao.remetenteNome ?? "",
            foto_interessado: fotoInteressado,

            ultima_mensagem: "Novo chat iniciado",
            data_atualizacao: serverTimestamp(),
          },
          { merge: true },
        );

        transaction.delete(notificacaoRef);
      });

      await enviarPushNotificacao(
        pushTokensInteressado,
        "Novo chat iniciado! 🐾",
        `O dono de ${notificacao.animalNome ?? "o animal"} iniciou um chat com você!`,
        { chatId, tipo: "chat_iniciado" }
      );

      setTimeout(() => {
        setShowAnimation(false);
        router.push(`/chat/${chatId}`);
      }, 1000);

    } catch (error) {
      console.log("Erro ao aceitar notificação:", error);
      setShowAnimation(false);
      Alert.alert("Erro", "Não foi possível iniciar o chat no momento.");
    } finally {
      setProcessandoId(null);
      setShowAnimation(false);
    }
  };

  const aceitarInteresse = async (notificacao: NotificacaoInteresseAdocao) => {
    if (processandoId) return;
    setProcessandoId(notificacao.id);

    try {
      const animalId = notificacao.animalId;
      const uid = auth.currentUser?.uid;

      let pushTokensInteressado: string[] = [];
      const interessadoSnap = await getDoc(doc(db, "usuarios", notificacao.remetenteId));
      if (interessadoSnap.exists()) {
        const interessadoData = interessadoSnap.data() as any;
        pushTokensInteressado = interessadoData.pushTokens ?? [];
      }

      const conversasComoTutorQuery = query(
        collection(db, "conversas"),
        where("id_animal", "==", animalId),
        where("id_tutor", "==", uid),
      );
      const conversasComoTutorSnap = await getDocs(conversasComoTutorQuery);
  
      const conversasComoInteressadoQuery = query(
        collection(db, "conversas"),
        where("id_animal", "==", animalId),
        where("id_interessado", "==", uid),
      );
      const conversasComoInteressadoSnap = await getDocs(conversasComoInteressadoQuery);
      
      const outrasNotificacoesQuery = query(
        collection(db, "notificacoes"),
        where("animalId", "==", animalId),
        where("status", "==", "pendente"),
        where("destinatarioId", "==", uid),
      );
      const outrasNotificacoesSnap = await getDocs(outrasNotificacoesQuery);
    
      await runTransaction(db, async (transaction) => {
        const animalRef = doc(db, "animais", animalId);
        const notificacaoRef = doc(db, "notificacoes", notificacao.id);

        const animalSnap = await transaction.get(animalRef);
        if (!animalSnap.exists()) {
          throw new Error("Animal não encontrado.");
        }

        transaction.update(animalRef, {
          usuarioId: notificacao.remetenteId,
          disponivel: false,
        });

        transaction.delete(notificacaoRef);

        conversasComoTutorSnap.forEach((conversaDoc) => {
          transaction.update(conversaDoc.ref, { status: "finalizada" });
        });

        conversasComoInteressadoSnap.forEach((conversaDoc) => {
          transaction.update(conversaDoc.ref, { status: "finalizada" });
        });

        outrasNotificacoesSnap.forEach((outraNotifDoc) => {
          if (outraNotifDoc.id !== notificacao.id) {
            transaction.delete(outraNotifDoc.ref);
          }
        });
      });

      await enviarPushNotificacao(
        pushTokensInteressado,
        "Adoção confirmada! 🐾",
        `Parabéns! ${notificacao.animalNome ?? "O animal"} agora é seu.`,
        { tipo: "aceita" }
      );

      Alert.alert("Adoção confirmada!", `Parabéns, ${notificacao.animalNome ?? "o animal"} tem um novo lar.`);
    } catch (error) {
      console.log("Erro ao aceitar interesse de adoção:", error);
      Alert.alert("Erro", "Não foi possível confirmar a adoção no momento.");
    } finally {
      setProcessandoId(null);
    }
  };

  const recusarNotificacao = async (notificacao: NotificacaoInteresseAdocao) => {
    if (processandoId) return;
    setProcessandoId(notificacao.id);

    try {
      const notificacaoRef = doc(db, "notificacoes", notificacao.id);
      await updateDoc(notificacaoRef, {
        status: "recusada",
        lida: true,
      });
    } catch (error) {
      console.log("Erro ao recusar notificação:", error);
    } finally {
      setProcessandoId(null);
    }
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#ffd358" style={{ flex: 1 }} />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={onMenuPress}>
          <Ionicons name="menu-outline" size={24} color="#434343" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações</Text>
        <View style={styles.headerButton} />
      </View>
      <FlatList
        data={notificacoes}
        renderItem={({ item }) => (
          <NotificacaoCard
            notificacao={item}
            processando={processandoId === item.id}
            onChat={iniciarChat}
            onAceitar={aceitarInteresse}
            onRecusar={recusarNotificacao}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 8 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={40} color="#bbb" />
            <Text style={styles.emptyText}>Nenhuma notificação por aqui</Text>
          </View>
        }
      />

      <Modal visible={showAnimation} transparent={true} animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.lottieContainer}>
            <LottieView
              source={require("../../../assets/animations/gato_amor.json")}
              autoPlay
              loop={true}
              style={{ width: 250, height: 250 }}
            />
            <Text style={styles.lottieText}>Preparando o chat...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  header: {
    height: 56,
    backgroundColor: "#ffd358",
    paddingTop: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#434343",
    fontSize: 18,
    fontWeight: "700",
  },
  headerButton: {
    padding: 8,
    width: 40,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    color: "#999",
    fontSize: 14,
    marginTop: 8,
  },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  lottieContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  lottieText: {
    marginTop: 10,
    fontSize: 16,
    color: "#434343",
    fontWeight: "600",
  },
});