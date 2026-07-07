import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, or, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth, db } from '../../src/services/firebaseConfig';

export default function ListaChatsScreen() {
  const [conversas, setConversas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const usuarioAtual = auth.currentUser;
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const onNotificationsPress = () => {
    router.push("/notificacoes");
  };

  useEffect(() => {
    if (!usuarioAtual || !isFocused) return;

    const chatsRef = collection(db, 'conversas');
    const q = query(
      chatsRef,
      or(
        where('id_tutor', '==', usuarioAtual.uid),
        where('id_interessado', '==', usuarioAtual.uid)
      )
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      lista.sort((a: any, b: any) => (b.data_atualizacao?.toMillis() || 0) - (a.data_atualizacao?.toMillis() || 0));
      setConversas(lista);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [usuarioAtual, isFocused]);

  const formatarHora = (timestamp: any) => {
    if (!timestamp) return "";
    try {
      const date = timestamp.toDate();
      const horas = date.getHours().toString().padStart(2, '0');
      const minutos = date.getMinutes().toString().padStart(2, '0');
      return `${horas}:${minutos}`;
    } catch (e) {
      return "";
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const souOTutor = item.id_tutor === usuarioAtual?.uid;
    const nomeExibicao = souOTutor ? (item.nome_interessado || "Usuário") : (item.nome_tutor || "Usuário");
    const nomeAnimal = item.nome_animal || "Pet";
    const formatoTitulo = `${nomeExibicao} | ${nomeAnimal}`.toUpperCase();

    const fotoExibicao = souOTutor ? item.foto_interessado : item.foto_tutor;

    return (
      <TouchableOpacity style={styles.chatCard} onPress={() => router.push(`/chat/${item.id}`)}>
        
        {fotoExibicao ? (
          <Image 
            source={{ 
              uri: fotoExibicao.startsWith("data:image") 
                ? fotoExibicao 
                : `data:image/jpeg;base64,${fotoExibicao}` 
            }} 
            style={styles.avatar} 
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={24} color="#bdbdbd" />
          </View>
        )}

        <View style={styles.chatInfo}>
          <Text style={styles.chatTitle}>{formatoTitulo}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.ultima_mensagem || "Não há mensagens..."}
          </Text>
        </View>
        
        <Text style={styles.timeText}>{formatarHora(item.data_atualizacao) || "12:30"}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => router.back()}>
          <Ionicons name="menu" size={24} color="#434343" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat</Text>
        <View style={styles.headerRightGroup}>
          <TouchableOpacity style={styles.headerIcon} onPress={onNotificationsPress}>
            <Ionicons name="notifications-outline" size={24} color="#434343" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#88c9bf" style={{ flex: 1 }} />
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={conversas}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
          />
          <View style={[styles.footerContainer, { paddingBottom: insets.bottom + 16 }]}>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { height: 56, backgroundColor: '#88c9bf', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerTitle: { fontSize: 20, color: '#434343', fontWeight: '500' },
  headerIcon: { padding: 8 },
  listContainer: { paddingBottom: 80 },
  chatCard: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 0.8, borderBottomColor: '#e6e7e8' },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 16 }, 
  avatarPlaceholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f1f2f2', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  chatInfo: { flex: 1 },
  chatTitle: { fontSize: 12, color: '#589b9b', fontWeight: 'bold', marginBottom: 4 },
  lastMessage: { fontSize: 14, color: '#757575' },
  timeText: { fontSize: 12, color: '#589b9b' },
  footerContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center', backgroundColor: 'transparent' },
  btnProcesso: { width: 232, height: 40, borderWidth: 2, borderColor: '#88c9bf', backgroundColor: '#88c9bf', justifyContent: 'center', alignItems: 'center' },
  btnProcessoText: { color: '#434343', fontSize: 12 },
  headerRightGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
});
