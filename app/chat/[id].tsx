import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
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

  const usuarioAtual = auth.currentUser;

  useEffect(() => {
    async function fetchChatDetails() {
      if (!id || !usuarioAtual) return;
      try {
        const chatRef = doc(db, "conversas", id as string);
        const chatSnap = await getDoc(chatRef);
        if (chatSnap.exists()) {
          const chatData = chatSnap.data();
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
    if (inputText.trim() === "" || !usuarioAtual) return;
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
      </View>

      <GiftedChat
        messages={messages}
        user={{ _id: usuarioAtual?.uid || "" }}
        renderInputToolbar={() => <View />}
        messagesContainerStyle={{ backgroundColor: "#fafafa" }}
        renderBubble={(props) => (
          <Bubble {...props} wrapperStyle={{ right: { backgroundColor: "#cfe9e5" }, left: { backgroundColor: "#fff" } }} />
        )}
      />

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
  headerTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 10, color: "#434343" },
  iconButton: { padding: 5 },
  manualInputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e0e0e0', alignItems: 'center', paddingBottom: Platform.OS === 'android' ? 20 : 10 },
  input: { flex: 1, height: 40, backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 15, marginRight: 10 },
  sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#88c9bf", justifyContent: "center", alignItems: "center" }
});