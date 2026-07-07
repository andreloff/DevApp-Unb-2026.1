import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
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
  where,
} from "firebase/firestore";
import LottieView from "lottie-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Bubble, GiftedChat } from "react-native-gifted-chat";
import { auth, db } from "../../src/services/firebaseConfig";

const animacaoAviao = require("../../assets/animations/aviao.json");
const animacaoCachorro = require("../../assets/animations/cachorro.json");

// Cálculo exato da altura do cabeçalho para guiar o KeyboardAvoidingView
const ALTURA_HEADER =
  Platform.OS === "android" ? 60 + (StatusBar.currentHeight || 0) : 95;

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

  const [animacaoAtiva, setAnimacaoAtiva] = useState<
    "cachorro" | "aviao" | null
  >(null);
  const [selectedMessageForReaction, setSelectedMessageForReaction] =
    useState<any>(null);
  const [reactionMenuVisible, setReactionMenuVisible] = useState(false);

  const isFocused = useIsFocused();
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
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    }
    fetchChatDetails();
  }, [id, usuarioAtual]);

  useEffect(() => {
    if (!id || !isFocused || !usuarioAtual) return;
    const chatRef = doc(db, "conversas", id as string);
    const unsubscribe = onSnapshot(chatRef, (snap) => {
      if (snap.exists()) {
        setChatStatus(snap.data().status || "ativa");
      }
    });
    return () => unsubscribe();
  }, [id, isFocused, usuarioAtual]);

  useEffect(() => {
    if (!id || !isFocused || !usuarioAtual) return;
    const mensagensRef = collection(db, "conversas", id as string, "mensagens");
    const q = query(mensagensRef, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          _id: docSnap.id,
          text: data.text,
          createdAt: data.createdAt?.toDate(),
          user: {
            _id: data.user?._id,
            name: data.user?.name,
            avatar: data.user?.avatar,
          },
          reacao: data.reacao || null,
        };
      });
      setMessages(msgs);
    });
  }, [id, isFocused, usuarioAtual]);

  const handleSend = async () => {
    if (
      inputText.trim() === "" ||
      !usuarioAtual ||
      chatStatus === "finalizada" ||
      chatStatus === "recusado"
    )
      return;
    const text = inputText;
    setInputText("");

    if (usuarioAtual.uid === idInteressado) {
      setAnimacaoAtiva("cachorro");
    } else if (usuarioAtual.uid === idTutor) {
      setAnimacaoAtiva("aviao");
    }

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

  const handleAddReaction = async (emoji: string) => {
    if (!selectedMessageForReaction || !id) return;
    try {
      const msgRef = doc(
        db,
        "conversas",
        id as string,
        "mensagens",
        selectedMessageForReaction._id,
      );
      await updateDoc(msgRef, {
        reacao: emoji,
      });
    } catch (e) {
      console.error("Erro ao salvar reação no Firebase: ", e);
    } finally {
      setReactionMenuVisible(false);
      setSelectedMessageForReaction(null);
    }
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
        where("animalId", "==", animalId),
      );
      const notificacoesSnap = await getDocs(notificacoesQuery);
      await Promise.all(
        notificacoesSnap.docs.map((notifDoc) => deleteDoc(notifDoc.ref)),
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
    <KeyboardAvoidingView
      style={styles.container}
      // Modificado para casar perfeitamente com a configuração do seu app.json
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? ALTURA_HEADER : 0}
    >
      <View style={[styles.header, { height: ALTURA_HEADER }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
        >
          <Ionicons name="arrow-back" size={24} color="#434343" />
        </TouchableOpacity>
        {chatPartnerPhoto && !imageError ? (
          <Image
            source={{ uri: chatPartnerPhoto }}
            style={styles.headerAvatar}
            onError={() => setImageError(true)}
          />
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
        onLongPress={(context, currentMessage) => {
          setSelectedMessageForReaction(currentMessage);
          setReactionMenuVisible(true);
        }}
        renderBubble={(props) => (
          <Bubble
            {...props}
            wrapperStyle={{
              right: {
                backgroundColor: "#5fb3a5",
                marginBottom: props.currentMessage.reacao ? 10 : 0,
              },
              left: {
                backgroundColor: "#fff",
                marginBottom: props.currentMessage.reacao ? 10 : 0,
              },
            }}
            textStyle={{ right: { color: "#fff" } }}
            // Movido para o rodapé nativo para atualizar em tempo real sem bugar o clique
            renderFooter={(bubbleProps) => {
              if (bubbleProps.currentMessage.reacao) {
                return (
                  <View
                    style={[
                      styles.reactionBadge,
                      bubbleProps.position === "right"
                        ? styles.reactionRight
                        : styles.reactionLeft,
                    ]}
                  >
                    <Text style={{ fontSize: 13 }}>
                      {bubbleProps.currentMessage.reacao}
                    </Text>
                  </View>
                );
              }
              return null;
            }}
          />
        )}
      />

      {chatStatus === "finalizada" || chatStatus === "recusado" ? (
        <View style={styles.finalizadaContainer}>
          <Ionicons name="lock-closed-outline" size={16} color="#9a9a9a" />
          <Text style={styles.finalizadaText}>
            {chatStatus === "finalizada"
              ? "Conversa finalizada"
              : "Pedido recusado"}
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
        visible={reactionMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReactionMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.reactionModalOverlay}
          activeOpacity={1}
          onPress={() => setReactionMenuVisible(false)}
        >
          <View style={styles.reactionMenuBar}>
            {["👍", "❤️", "😂", "😮", "😢"].map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={styles.reactionEmojiButton}
                onPress={() => handleAddReaction(emoji)}
              >
                <Text style={styles.reactionEmojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={animacaoAtiva !== null}
        transparent
        animationType="none"
        pointerEvents="none"
      >
        <View style={styles.lottieOverlay} pointerEvents="none">
          {animacaoAtiva === "cachorro" && (
            <LottieView
              source={animacaoCachorro}
              autoPlay
              loop={false}
              style={styles.lottieAnimationFullscreen}
              onAnimationFinish={() => setAnimacaoAtiva(null)}
            />
          )}
          {animacaoAtiva === "aviao" && (
            <LottieView
              source={animacaoAviao}
              autoPlay
              loop={false}
              style={styles.lottieAnimationCenter}
              onAnimationFinish={() => setAnimacaoAtiva(null)}
            />
          )}
        </View>
      </Modal>

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
              Ao aceitar, a posse do animal será transferida para o interessado
              e ele deixará de aparecer como disponível.
            </Text>

            {processando ? (
              <ActivityIndicator
                color="#88c9bf"
                style={{ marginVertical: 12 }}
              />
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
                  <Text style={styles.modalButtonTextAceitar}>Accept</Text>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  header: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 45,
    backgroundColor: "#cfe9e5",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  headerAvatar: { width: 36, height: 36, borderRadius: 18, marginLeft: 10 },
  headerAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#434343",
    flex: 1,
  },
  iconButton: { padding: 5 },
  manualInputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    alignItems: "center",
    paddingBottom: Platform.OS === "android" ? 20 : 10,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#88c9bf",
    justifyContent: "center",
    alignItems: "center",
  },
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

  reactionBadge: {
    position: "absolute",
    bottom: -14,
    backgroundColor: "#ffffff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1.5,
    zIndex: 999,
  },
  reactionRight: { right: 10 },
  reactionLeft: { left: 10 },

  reactionModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  reactionMenuBar: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 30,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    gap: 12,
  },
  reactionEmojiButton: {
    padding: 4,
  },
  reactionEmojiText: {
    fontSize: 26,
  },

  lottieOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  lottieAnimationFullscreen: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  lottieAnimationCenter: {
    width: 300,
    height: 300,
  },

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
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#434343",
    marginBottom: 8,
  },
  modalSubtitle: { fontSize: 13, color: "#757575", marginBottom: 16 },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
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
