import { Ionicons } from "@expo/vector-icons";
import { Timestamp } from "firebase/firestore";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export type TipoNotificacao = "interesse_adocao";
export type StatusNotificacao =
  | "pendente"
  | "chat_iniciado"
  | "aceita"
  | "recusada";

export interface NotificacaoInteresseAdocao {
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

interface NotificacaoCardProps {
  notificacao: NotificacaoInteresseAdocao;
  processando: boolean;
  onChat: (notificacao: NotificacaoInteresseAdocao) => void;
  onAceitar: (notificacao: NotificacaoInteresseAdocao) => void;
  onRecusar: (notificacao: NotificacaoInteresseAdocao) => void;
}

// Componente puramente visual: não conhece Firestore, runTransaction,
// nem nada sobre como aceitar/recusar é implementado. Só recebe os dados
// e dispara os callbacks passados pela tela que o utiliza.
export default function NotificacaoCard({
  notificacao,
  processando,
  onChat,
  onAceitar,
  onRecusar,
}: NotificacaoCardProps) {
  return (
    <View style={[styles.card, !notificacao.lida && styles.cardNaoLida]}>
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
        {!notificacao.lida && <View style={styles.dotNaoLida} />}
      </View>

      <View style={styles.cardInfo}>
        <Text style={styles.mensagemText}>
          {notificacao.remetenteNome ?? "Alguém"} demonstrou interesse em
          adotar {notificacao.animalNome ?? "seu animal"}.
        </Text>
        <Text style={styles.dataText}>{formatarData(notificacao.criadaEm)}</Text>

        <View style={styles.acoesRow}>
          <TouchableOpacity
            style={[styles.botao, styles.botaoChat]}
            disabled={processando}
            onPress={() => onChat(notificacao)}
          >
            {processando ? (
              <ActivityIndicator size="small" color="#434343" />
            ) : (
              <Text style={styles.botaoTextoChat}>Chat</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.botao, styles.botaoRecusar]}
            disabled={processando}
            onPress={() => onRecusar(notificacao)}
          >
            {processando ? (
              <ActivityIndicator size="small" color="#434343" />
            ) : (
              <Text style={styles.botaoTextoRecusar}>Recusar</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.botao, styles.botaoAceitar]}
            disabled={processando}
            onPress={() => onAceitar(notificacao)}
          >
            {processando ? (
              <ActivityIndicator size="small" color="#434343" />
            ) : (
              <Text style={styles.botaoTextoAceitar}>Aceitar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    justifyContent: "space-between",
    gap: 6,
    marginTop: 12,
  },
  botao: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignItems: "center",
  },
  botaoRecusar: {
    backgroundColor: "#f0f0f0",
  },
  botaoChat: {
    backgroundColor: "#e3eefc",
  },
  botaoAceitar: {
    backgroundColor: "#ffd358",
  },
  botaoTextoRecusar: {
    color: "#434343",
    fontSize: 13,
    fontWeight: "600",
  },
  botaoTextoChat: {
    color: "#2f6fb3",
    fontSize: 13,
    fontWeight: "600",
  },
  botaoTextoAceitar: {
    color: "#434343",
    fontSize: 13,
    fontWeight: "700",
  },
});