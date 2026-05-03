import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { collection, onSnapshot, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../../src/services/firebaseConfig";

interface Animal {
  id: string;
  nome: string;
  sexo: string;
  porte: string;
  idade: string;
  localizacao: string;
  fotoUrl: string;
}

export default function Adotar() {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const navigation = useNavigation();

  const onMenuPress = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  useEffect(() => {
    const q = query(collection(db, "animais"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs: Animal[] = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() } as Animal);
      });
      setAnimais(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#ffd358" style={{ flex: 1 }} />
    );
  }

  const renderItem = ({ item }: { item: Animal }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/(drawer)/(home)/detalhesAnimal",
          params: { id: item.id },
        })
      }
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.nome}</Text>
        <Ionicons name="heart-outline" size={24} color="#434343" />
      </View>
      <Image
        source={{
          uri: item.fotoUrl?.startsWith("data:image")
            ? item.fotoUrl
            : `data:image/jpeg;base64,${item.fotoUrl}`,
        }}
        style={styles.animalImage}
      />
      <View style={styles.cardInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>{item.sexo?.toUpperCase()}</Text>
          <Text style={styles.infoText}>{item.idade?.toUpperCase()}</Text>
          <Text style={styles.infoText}>{item.porte?.toUpperCase()}</Text>
        </View>
        <Text style={styles.locationText}>{item.localizacao}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={onMenuPress}>
          <Ionicons name="menu-outline" size={24} color="#434343" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adotar</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="search-outline" size={24} color="#434343" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={animais}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 8 }}
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
  },
  listPadding: { padding: 8 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 4,
    marginBottom: 8,
    width: 344,
    alignSelf: "center",
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
    backgroundColor: "#fee29b", // Cor do retângulo do título[cite: 2]
  },
  cardTitle: { fontSize: 16, color: "#434343", fontFamily: "Roboto_500Medium" },
  animalImage: { width: 344, height: 183 },
  cardInfo: { padding: 8, alignItems: "center" },
  infoRow: { flexDirection: "row", gap: 15 },
  infoText: { fontSize: 12, color: "#434343" },
  locationText: { fontSize: 12, color: "#434343", marginTop: 4 },
});
