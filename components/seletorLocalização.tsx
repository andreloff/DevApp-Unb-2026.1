import * as Location from "expo-location";
import { useGlobalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface LocalizacaoSelectorProps {
  onLocationSelected: (lat: number, lng: number) => void;
  hasLocation: boolean;
}

export default function LocalizacaoSelector({
  onLocationSelected,
  hasLocation,
}: LocalizacaoSelectorProps) {
  const router = useRouter();
  const globParams = useGlobalSearchParams<{
    mapLat?: string;
    mapLng?: string;
  }>();
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (globParams.mapLat && globParams.mapLng) {
      const latitudeRetornada = parseFloat(globParams.mapLat);
      const longitudeRetornada = parseFloat(globParams.mapLng);

      onLocationSelected(latitudeRetornada, longitudeRetornada);
    }
  }, [globParams.mapLat, globParams.mapLng]);

  // localização aproximada da real
  const handleGetAproximado = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão Negada",
        "Precisamos de acesso ao GPS para obter a localização.",
      );
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});

      // mudar a localização real para aproximada
      const ruidoLat = (Math.random() - 0.5) * 0.002;
      const ruidoLng = (Math.random() - 0.5) * 0.002;

      const latAproximada = location.coords.latitude + ruidoLat;
      const lngAproximada = location.coords.longitude + ruidoLng;

      onLocationSelected(latAproximada, lngAproximada);
      setIsOpen(false);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível ler os sensores de GPS.");
    }
  };

  // direciona para tela de escolha de local pelo mapa
  const handleMarcarNoMapa = () => {
    setIsOpen(false);
    router.push("/selecionarLocal");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.mainButton, hasLocation && styles.mainButtonSuccess]}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={styles.mainButtonText}>
          {hasLocation
            ? "✓ LOCALIZAÇÃO SELECIONADA"
            : "ADICIONAR LOCALIZAÇÃO DO PET"}
        </Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleGetAproximado}
          >
            <Text style={styles.menuItemText}>
              Usar localização aproximada atual (GPS)
            </Text>
          </TouchableOpacity>

          <View style={styles.divisor} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleMarcarNoMapa}
          >
            <Text style={styles.menuItemText}>Marcar manualmente no mapa</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 10, width: 344, alignSelf: "center" },
  mainButton: {
    backgroundColor: "#EDEEF0",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 2,
    elevation: 1,
  },
  mainButtonSuccess: { backgroundColor: "#CFE9E5" },
  mainButtonText: { color: "#434343", fontSize: 12, fontWeight: "bold" },
  menuContainer: {
    backgroundColor: "#FFFFFF",
    marginTop: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#BDBDBD",
    elevation: 3,
  },
  menuItem: { paddingVertical: 14, alignItems: "center" },
  menuItemText: { color: "#757575", fontSize: 13, fontWeight: "500" },
  divisor: {
    height: 1,
    backgroundColor: "#BDBDBD",
    width: "90%",
    alignSelf: "center",
  },
});
