import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { MapPressEvent, Marker, Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SelecionarLocalTela() {
  const router = useRouter();
  const [pontoSelecionado, setPontoSelecionado] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [regiaoInicial, setRegiaoInicial] = useState<Region | null>(null);
  const [carregandoLocal, setCarregandoLocal] = useState(true);

  //foca no usuario quando a tela abre
  useEffect(() => {
    async function obterLocalizacaoInicial() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão negada",
          "Não foi possível obter sua localização atual para centralizar o mapa.",
        );
        // se o gps nao funcionar vai em brasilia
        setRegiaoInicial({
          latitude: -15.793889,
          longitude: -47.882778,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setCarregandoLocal(false);
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
        setRegiaoInicial({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        });
      } catch (error) {
        setRegiaoInicial({
          latitude: -15.793889,
          longitude: -47.882778,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } finally {
        setCarregandoLocal(false);
      }
    }

    obterLocalizacaoInicial();
  }, []);

  const aoPressionarMapa = (e: MapPressEvent) => {
    setPontoSelecionado(e.nativeEvent.coordinate);
  };

  const confirmarLocalizacao = () => {
    if (pontoSelecionado) {
      router.setParams({
        mapLat: pontoSelecionado.latitude.toString(),
        mapLng: pontoSelecionado.longitude.toString(),
      });
      router.back();
    }
  };

  if (carregandoLocal) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#ffd358" />
        <Text style={{ marginTop: 10, color: "#757575" }}>
          Buscando sua localização...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back-outline" size={24} color="#434343" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Toque para Marcar o Local</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={regiaoInicial || undefined}
          onPress={aoPressionarMapa}
          showsUserLocation={true}
        >
          {pontoSelecionado && (
            <Marker
              coordinate={pontoSelecionado}
              title="Local do Pet"
              pinColor="#ffd358"
            />
          )}
        </MapView>
      </View>

      {pontoSelecionado && (
        <TouchableOpacity
          style={styles.btnConfirmar}
          onPress={confirmarLocalizacao}
        >
          <Text style={styles.btnTexto}>CONFIRMAR LOCALIZAÇÃO</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  center: { justifyContent: "center", alignItems: "center" },
  header: {
    height: 56,
    backgroundColor: "#ffd358",
    paddingTop: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { color: "#434343", fontSize: 18, fontWeight: "700" },
  headerButton: { padding: 8, width: 40 },
  mapContainer: { flex: 1, padding: 16 },
  map: { flex: 1, borderRadius: 8 },
  btnConfirmar: {
    backgroundColor: "#ffd358",
    padding: 16,
    margin: 16,
    alignItems: "center",
    borderRadius: 4,
    elevation: 2,
  },
  btnTexto: { color: "#434343", fontWeight: "700", fontSize: 14 },
});
