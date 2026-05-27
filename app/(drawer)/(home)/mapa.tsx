import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export default function MapaTela() {
  const navigation = useNavigation();
  const [localizacao, setLocalizacao] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onMenuPress = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  useEffect(() => {
    async function pegarLocalizacao() {
      // 1. Solicita a permissão de GPS para o usuário
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permissão de localização negada.");
        setLoading(false);
        return;
      }

      // 2. Captura as coordenadas geográficas atuais
      try {
        const location = await Location.getCurrentPositionAsync({});
        setLocalizacao({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.015, // Define o nível de zoom aproximado na rua
          longitudeDelta: 0.015,
        });
      } catch (error) {
        setErrorMsg("Erro ao obter a localização atual.");
      } finally {
        setLoading(false);
      }
    }

    pegarLocalizacao();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* CABEÇALHO PADRÃO DO SEU APP (IGUAL À TELA ADOTAR) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onMenuPress} style={styles.headerButton}>
          <Ionicons name="menu-outline" size={24} color="#434343" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Mapeamento de Pets</Text>

        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="search-outline" size={24} color="#ffd358" />
        </TouchableOpacity>
      </View>

      {/* ÁREA DE CONTEÚDO */}
      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#ffd358" />
            <Text style={styles.loadingText}>Buscando sinal do GPS...</Text>
          </View>
        ) : errorMsg ? (
          <View style={styles.centerState}>
            <Ionicons name="alert-circle-outline" size={48} color="#e53935" />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : (
          <MapView
            style={styles.map}
            // Centraliza o mapa nas suas coordenadas reais capturadas
            initialRegion={
              localizacao || {
                latitude: -15.793889,
                longitude: -47.882778,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }
            }
            showsUserLocation={true} // Desenha o círculo azul nativo de movimento do Google Maps
            showsMyLocationButton={true} // Adiciona o botão nativo do Google para recentralizar em você
          >
            {/* MARCADOR DA SUA LOCALIZAÇÃO */}
            {localizacao && (
              <Marker
                coordinate={{
                  latitude: localizacao.latitude,
                  longitude: localizacao.longitude,
                }}
                title="Você está aqui"
                description="Sua posição atual no mapa"
                pinColor="#0000ff" // Alfinete Azul para diferenciar dos animais
              />
            )}
          </MapView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
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
  mapContainer: {
    flex: 1,
    padding: 16,
  },
  map: {
    flex: 1,
    borderRadius: 8,
  },
  centerState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  loadingText: {
    marginTop: 12,
    color: "#434343",
    fontSize: 16,
  },
  errorText: {
    marginTop: 12,
    color: "#e53935",
    fontSize: 15,
    textAlign: "center",
  },
});
