import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import {
    collection,
    doc,
    onSnapshot,
    orderBy,
    query,
    runTransaction,
    serverTimestamp,
    Timestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { auth, db } from "../../../src/services/firebaseConfig";

type TipoNotificacao = "interesse_adocao";
type StatusNotificacao = "pendente" | "aceita" | "recusada";

interface NotificacaoInteresseAdocao {
  id: string;
  tipo: TipoNotificacao;
  destinatarioId: string;
  remetenteId: string;
  remetenteNome?: string;
  animalId: string;
  animalNome?: string;
  status: StatusNotificacao;
  lida: boolean;
  criadaEm: Timestamp;
}

// Formata o Timestamp do Firestore em algo legível (ex: "12/06/2026 14:30")
function formatarData(timestamp?: Timestamp) {
  if (!timestamp) return "";
  return timestamp.toDate().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Notificacoes() {
  const [notificacoes, setNotificacoes] = useState<NotificacaoInteresseAdocao[]>([]);
  const [loading, setLoading] = useState(true);
  const [processandoId, setProcessandoId] = useState<string | null>(null);
  const navigation = useNavigation();
  const router = useRouter();

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

  const aceitarNotificacao = async (notificacao: NotificacaoInteresseAdocao) => {
    if (processandoId) return; // evita duplo toque enquanto já está processando
    setProcessandoId(notificacao.id);

    try {
      await runTransaction(db, async (transaction) => {
        const notificacaoRef = doc(db, "notificacoes", notificacao.id);
        const chatRef = doc(collection(db, "chats")); // gera um id novo

        // TODO: ajustar este formato com a estrutura de chats
        transaction.set(chatRef, {
          participantes: [notificacao.destinatarioId, notificacao.remetenteId],
          animalId: notificacao.animalId,
          criadoEm: serverTimestamp(),
        });

        transaction.update(notificacaoRef, {
          status: "aceita",
        });
      });

      // Navegação para rota do chat criado
      // router.push({ pathname: "/(drawer)/(home)/chat", params: { id: chatRef.id } });
    } catch (error) {
      console.log("Erro ao aceitar notificação:", error);
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

  const renderItem = ({ item }: { item: NotificacaoInteresseAdocao }) => {
    const processandoEsta = processandoId === item.id;

    return (
      <View style={[styles.card, !item.lida && styles.cardNaoLida]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="paw-outline"
              size={20}
              color="#434343"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.cardTitle}>Interesse em adoção</Text>
          </View>
          {!item.lida && <View style={styles.dotNaoLida} />}
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.mensagemText}>
            {item.remetenteNome ?? "Alguém"} demonstrou interesse em adotar{" "}
            {item.animalNome ?? "seu animal"}.
          </Text>
          <Text style={styles.dataText}>{formatarData(item.criadaEm)}</Text>

          <View style={styles.acoesRow}>
            <TouchableOpacity
              style={[styles.botao, styles.botaoRecusar]}
              disabled={processandoEsta}
              //onPress={() => recusarNotificacao(item)}
            >
              {processandoEsta ? (
                <ActivityIndicator size="small" color="#434343" />
              ) : (
                <Text style={styles.botaoTextoRecusar}>Recusar</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.botao, styles.botaoAceitar]}
              disabled={processandoEsta}
              //onPress={() => aceitarNotificacao(item)}
            >
              {processandoEsta ? (
                <ActivityIndicator size="small" color="#434343" />
              ) : (
                <Text style={styles.botaoTextoAceitar}>Aceitar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

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
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 8 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={40} color="#bbb" />
            <Text style={styles.emptyText}>Nenhuma notificação por aqui</Text>
          </View>
        }
      />
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 4,
    marginBottom: 8,
    width: 344,
    alignSelf: "center",
    elevation: 2,
  },
  cardNaoLida: {
    borderLeftWidth: 4,
    borderLeftColor: "#ffd358",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#fee29b",
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    color: "#434343",
    fontFamily: "Roboto_500Medium",
    flexShrink: 1,
  },
  dotNaoLida: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#e74c3c",
    marginLeft: 8,
  },
  cardInfo: { padding: 12 },
  mensagemText: { fontSize: 14, color: "#434343" },
  dataText: { fontSize: 12, color: "#888", marginTop: 6 },
  acoesRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
  },
  botao: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  botaoRecusar: {
    backgroundColor: "#f0f0f0",
  },
  botaoAceitar: {
    backgroundColor: "#ffd358",
  },
  botaoTextoRecusar: {
    color: "#434343",
    fontSize: 13,
    fontWeight: "600",
  },
  botaoTextoAceitar: {
    color: "#434343",
    fontSize: 13,
    fontWeight: "700",
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
});
