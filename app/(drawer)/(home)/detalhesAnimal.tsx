import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../../src/services/firebaseConfig";

export default function DetalhesAnimal() {
  const { id } = useLocalSearchParams();
  const [animal, setAnimal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnimal() {
      if (!id) return;
      const docRef = doc(db, "animais", id as string);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setAnimal(docSnap.data());
      }
      setLoading(false);
    }
    fetchAnimal();
  }, [id]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!animal) return <Text>Animal não encontrado.</Text>;

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{
          uri: animal.fotoUrl?.startsWith("data:image")
            ? animal.fotoUrl
            : `data:image/jpeg;base64,${animal.fotoUrl}`,
        }}
        style={styles.banner}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{animal.nome}</Text>
          <TouchableOpacity style={styles.fab}>
            <Ionicons name="heart-outline" size={28} color="#434343" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoGrid}>
          <View>
            <Text style={styles.label}>SEXO</Text>
            <Text style={styles.value}>{animal.sexo}</Text>
          </View>
          <View>
            <Text style={styles.label}>PORTE</Text>
            <Text style={styles.value}>{animal.porte}</Text>
          </View>
          <View>
            <Text style={styles.label}>IDADE</Text>
            <Text style={styles.value}>{animal.idade}</Text>
          </View>
        </View>

        <Text style={styles.label}>LOCALIZAÇÃO</Text>
        <Text style={styles.value}>{animal.localizacao}</Text>

        <View style={styles.divider} />

        <View style={styles.infoGrid}>
          <View>
            <Text style={styles.label}>CASTRADO</Text>
            <Text style={styles.value}>{animal.castrado ? "Sim" : "Não"}</Text>
          </View>
          <View>
            <Text style={styles.label}>VERMIFUGADO</Text>
            <Text style={styles.value}>
              {animal.vermifugado ? "Sim" : "Não"}
            </Text>
          </View>
        </View>

        <Text style={styles.label}>TEMPERAMENTO</Text>
        <Text style={styles.value}>{animal.temperamento}</Text>

        <Text style={styles.label}>
          MAIS SOBRE {animal.nome?.toUpperCase()}
        </Text>
        <Text style={styles.description}>{animal.sobre}</Text>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>PRETENDO ADOTAR</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  banner: { width: "100%", height: 184 },
  content: { padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  name: { fontSize: 16, color: "#434343", fontWeight: "500" },
  fab: {
    width: 56,
    height: 56,
    backgroundColor: "#fafafa",
    borderRadius: 28,
    elevation: 4,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -40, // Efeito de sobreposição
  },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  label: { fontSize: 12, color: "#f7a800", marginTop: 12 }, // Cor laranja das etiquetas
  value: { fontSize: 14, color: "#757575" },
  divider: { height: 1, backgroundColor: "#e0e0e0", marginVertical: 16 },
  description: { fontSize: 14, color: "#434343", lineHeight: 20 },
  button: {
    backgroundColor: "#fdcf58",
    height: 40,
    width: 232,
    borderRadius: 2,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
    marginBottom: 24,
  },
  buttonText: { color: "#434343", fontSize: 12, fontWeight: "500" },
});
