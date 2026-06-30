import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  deleteDoc,
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
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Bubble, GiftedChat } from "react-native-gifted-chat";
import { auth, db } from "../../src/services/firebaseConfig";

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  
  const [chatPartnerName, setChatPartnerName] = useState("Carregando...");
  const [chatPartnerPhoto, setChatPartnerPhoto] = useState("");
  const [imageError, setImageError] = useState(false);
  const [minhaFoto, setMinhaFoto] = useState("");

  const [idTutor, setIdTutor] = useState("");
  const [idInteressado, setIdInteressado] = useState("");
  const [animalId, setAnimalId] = useState("");
  const [chatStatus, setChatStatus] = useState("ativa");
  const [finalizarModalVisible, setFinalizarModalVisible] = useState(false);
  const [processando, setProcessando] = useState(false);

  const usuarioAtual = auth.currentUser;

  useEffect(() => {
    async function fetchChatDetails() {
      if (!id || !usuarioAtual) return;
      try {
        const chatRef = doc(db, "conversas", id as string);
        const chatSnap = await getDoc(chatRef);
        if (chatSnap.exists()) {
          const chatData = chatSnap.data();
          setIdTutor(chatData.id_tutor || "");
          setIdInteressado(chatData.id_interessado || "");
          setAnimalId(chatData.id_animal || "");
          setChatStatus(chatData.status || "ativa");
          if (usuarioAtual.uid === chatData.id_interessado) {
            setChatPartnerName(chatData.nome_tutor || "Tutor");
            setChatPartnerPhoto(chatData.foto_tutor || "");
          } else {
            setChatPartnerName(chatData.nome_interessado || "Interessado");
            setChatPartnerPhoto(chatData.foto_interessado || "");
          }
        }
        const meuUserSnap = await getDoc(doc(db, "usuarios", usuarioAtual.uid));
        if (meuUserSnap.exists()) {
          setMinhaFoto(meuUserSnap.data().fotoUrl || "");
        }
      } catch (error) { console.error(error); }
      setLoading(false);
    }
    fetchChatDetails();
  }, [id, usuarioAtual]);

  useEffect(() => {
    if (!id) return;
    const chatRef = doc(db, "conversas", id as string);
    const unsubscribe = onSnapshot(chatRef, (snap) => {
      if (snap.exists()) {
        setChatStatus(snap.data().status || "ativa");
      }
    });
    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const mensagensRef = collection(db, "conversas", id as string, "mensagens");
    const q = query(mensagensRef, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          _id: docSnap.id,
          text: data.text,
          createdAt: data.createdAt?.toDate(),
          user: { _id: data.user?._id, name: data.user?.name, avatar: data.user?.avatar },
        };
      });
      setMessages(msgs);
    });
  }, [id]);

  const handleSend = async () => {
    if (inputText.trim() === "" || !usuarioAtual || chatStatus === "finalizada" || chatStatus === "recusado") return;
    const text = inputText;
    setInputText("");
    const mensagensRef = collection(db, "conversas", id as string, "mensagens");
    await addDoc(mensagensRef, {
      text,
      createdAt: serverTimestamp(),
      user: { _id: usuarioAtual.uid, name: "Eu", avatar: minhaFoto },
    });
    await updateDoc(doc(db, "conversas", id as string), {
      ultima_mensagem: text,
      data_atualizacao: serverTimestamp(),
    });
  };

  const handleAceitarFinalizacao = async () => {
    if (!animalId || !id) return;
    setProcessando(true);
    try {
      await runTransaction(db, async (transaction) => {
        const animalRef = doc(db, "animais", animalId);
        const conversaRef = doc(db, "conversas", id as string);
        const animalSnap = await transaction.get(animalRef);
        if (!animalSnap.exists()) {
          throw new Error("Animal não encontrado.");
        }
        transaction.update(animalRef, {
          usuarioId: idInteressado,
          disponivel: false,
        });
        transaction.update(conversaRef, {
          status: "finalizada",
        });
      });

      const notificacoesRef = collection(db, "notificacoes");
      const notificacoesQuery = query(
        notificacoesRef,
        where("animalId", "==", animalId)
      );
      const notificacoesSnap = await getDocs(notificacoesQuery);
      await Promise.all(
        notificacoesSnap.docs.map((notifDoc) => deleteDoc(notifDoc.ref))
      );

      setChatStatus("finalizada");
    } catch (error) {
      console.log("Erro ao finalizar adoção:", error);
    } finally {
      setProcessando(false);
      setFinalizarModalVisible(false);
    }
  };

  const handleRecusarFinalizacao = async () => {
    if (!id) return;
    setProcessando(true);
    try {
      await updateDoc(doc(db, "conversas", id as string), {
        status: "recusado",
      });
      setChatStatus("recusado");
    } catch (error) {
      console.log("Erro ao recusar finalização:", error);
    } finally {
      setProcessando(false);
      setFinalizarModalVisible(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#88c9bf" />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color="#434343" />
        </TouchableOpacity>
        {chatPartnerPhoto && !imageError ? (
          <Image source={{ uri: chatPartnerPhoto }} style={styles.headerAvatar} onError={() => setImageError(true)} />
        ) : (
          <View style={styles.headerAvatarPlaceholder}>
            <Ionicons name="person" size={18} color="#757575" />
          </View>
        )}
        <Text style={styles.headerTitle}>{chatPartnerName}</Text>
        {usuarioAtual?.uid === idTutor && chatStatus === "ativa" && (
          <TouchableOpacity
            style={styles.finalizarButton}
            onPress={() => setFinalizarModalVisible(true)}
          >
            <Text style={styles.finalizarButtonText}>Finalizar</Text>
          </TouchableOpacity>
        )}
      </View>

      <GiftedChat
        messages={messages}
        user={{ _id: usuarioAtual?.uid || "" }}
        renderInputToolbar={() => <View />}
        messagesContainerStyle={{ backgroundColor: "#fafafa" }}
        renderBubble={(props) => (
          <Bubble
            {...props}
            wrapperStyle={{ right: { backgroundColor: "#5fb3a5" }, left: { backgroundColor: "#fff" } }}
            textStyle={{ right: { color: "#fff" } }}
          />
        )}
      />

      {chatStatus === "finalizada" || chatStatus === "recusado" ? (
        <View style={styles.finalizadaContainer}>
          <Ionicons name="lock-closed-outline" size={16} color="#9a9a9a" />
          <Text style={styles.finalizadaText}>
            {chatStatus === "finalizada" ? "Conversa finalizada" : "Pedido recusado"}
          </Text>
        </View>
      ) : (
        <View style={styles.manualInputContainer}>
          <TextInput 
            style={styles.input} 
            placeholder="Mensagem..." 
            value={inputText} 
            onChangeText={setInputText} 
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={finalizarModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !processando && setFinalizarModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Finalizar adoção?</Text>
            <Text style={styles.modalSubtitle}>
              Ao aceitar, a posse do animal será transferida para o interessado e ele deixará de aparecer como disponível.
            </Text>

            {processando ? (
              <ActivityIndicator color="#88c9bf" style={{ marginVertical: 12 }} />
            ) : (
              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonRecusar]}
                  onPress={handleRecusarFinalizacao}
                >
                  <Text style={styles.modalButtonTextRecusar}>Recusar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonAceitar]}
                  onPress={handleAceitarFinalizacao}
                >
                  <Text style={styles.modalButtonTextAceitar}>Aceitar</Text>
                </TouchableOpacity>
              </View>
            )}

            {!processando && (
              <TouchableOpacity
                style={styles.modalCancelar}
                onPress={() => setFinalizarModalVisible(false)}
              >
                <Text style={styles.modalCancelarText}>Cancelar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  header: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 45,
    height: Platform.OS === "android" ? 60 + (StatusBar.currentHeight || 0) : 95,
    backgroundColor: "#cfe9e5", flexDirection: "row", alignItems: "center", paddingHorizontal: 15
  },
  headerAvatar: { width: 36, height: 36, borderRadius: 18, marginLeft: 10 },
  headerAvatarPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#e0e0e0", justifyContent: "center", alignItems: "center", marginLeft: 10 },
  headerTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 10, color: "#434343", flex: 1 },
  iconButton: { padding: 5 },
  manualInputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e0e0e0', alignItems: 'center', paddingBottom: Platform.OS === 'android' ? 20 : 10 },
  input: { flex: 1, height: 40, backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 15, marginRight: 10 },
  sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#88c9bf", justifyContent: "center", alignItems: "center" },
  finalizadaContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 14,
    backgroundColor: "#f0f0f0",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  finalizadaText: { color: "#9a9a9a", fontSize: 13, fontWeight: "600" },
  finalizarButton: {
    backgroundColor: "#434343",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  finalizarButtonText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: { fontSize: 17, fontWeight: "700", color: "#434343", marginBottom: 8 },
  modalSubtitle: { fontSize: 13, color: "#757575", marginBottom: 16 },
  modalButtonsRow: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
  },
  modalButtonRecusar: { backgroundColor: "#f0f0f0" },
  modalButtonAceitar: { backgroundColor: "#88c9bf" },
  modalButtonTextRecusar: { color: "#434343", fontWeight: "600" },
  modalButtonTextAceitar: { color: "#fff", fontWeight: "600" },
  modalCancelar: { marginTop: 12, alignItems: "center" },
  modalCancelarText: { color: "#9a9a9a", fontSize: 13 },
});