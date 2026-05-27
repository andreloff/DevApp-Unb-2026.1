import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { useRouter } from "expo-router"; // Importado para navegação dos Callouts
import {
  collection,
  GeoPoint,
  onSnapshot,
  query,
  where,
} from "firebase/firestore"; // Importações do Firestore
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Callout, Marker } from "react-native-maps"; // Importado Callout
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../../src/services/firebaseConfig"; // Conexão com seu Firebase

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

// Interface para tipar os dados do animal que vêm do Firestore
interface AnimalNoMapa {
  id: string;
  nome: string;
  especie: string;
  sexo: string;
  fotoUrl: string;
  coordenadas: GeoPoint | null;
}

export default function MapaTela() {
  const navigation = useNavigation();
  const router = useRouter(); // Instanciando o roteador
  const [localizacao, setLocalizacao] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // NOVO ESTADO: Lista de animais com localização cadastrada
  const [animais, setAnimais] = useState<AnimalNoMapa[]>([]);

  const onMenuPress = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  // EFFECT 1: Captura a localização atual do Usuário (GPS)
  useEffect(() => {
    async function pegarLocalizacao() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permissão de localização negada.");
        setLoading(false);
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
        setLocalizacao({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05, // Um pouco mais de afastamento inicial para enxergar os pets ao redor
          longitudeDelta: 0.05,
        });
      } catch (error) {
        setErrorMsg("Erro ao obter a localização atual.");
      } finally {
        setLoading(false);
      }
    }

    pegarLocalizacao();
  }, []);

  // NOVO EFFECT 2: Escuta em tempo real os animais cadastrados no Firestore
  useEffect(() => {
    const q = query(
      collection(db, "animais"),
      where("disponivel", "==", true), // Filtra apenas animais que estão para adoção
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const lista: AnimalNoMapa[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Só adiciona ao mapa se o pet contiver um objeto GeoPoint válido
          if (data.coordenadas) {
            lista.push({
              id: doc.id,
              nome: data.nome,
              especie: data.especie,
              sexo: data.sexo,
              fotoUrl: data.fotoUrl,
              coordenadas: data.coordenadas, // GeoPoint do Firestore
            });
          }
        });
        setAnimais(lista);
      },
      (error) => {
        console.log("Erro ao escutar animais no mapa: ", error);
      },
    );

    return () => unsubscribe();
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
            initialRegion={
              localizacao || {
                latitude: -15.793889,
                longitude: -47.882778,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }
            }
            showsUserLocation={true}
            showsMyLocationButton={true}
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
                pinColor="#0000ff"
              />
            )}

            {/* NOVO: MAPEAMENTO DOS MARCADORES DE ANIMAIS COM FOTO */}
            {animais.map((animal) => {
              const latPet = animal.coordenadas?.latitude;
              const lngPet = animal.coordenadas?.longitude;

              if (!latPet || !lngPet) return null;

              return (
                <Marker
                  key={animal.id}
                  coordinate={{ latitude: latPet, longitude: lngPet }}
                  title={animal.nome}
                  description={`${animal.especie} - ${animal.sexo}`}
                >
                  {/* ÍCONE CUSTOMIZADO COM FOTO REDONDA */}
                  <View style={styles.markerContainer}>
                    <View style={styles.avatarBorder}>
                      {animal.fotoUrl ? (
                        <Image
                          source={{ uri: animal.fotoUrl }}
                          style={styles.animalImage}
                        />
                      ) : (
                        <Ionicons name="paw" size={16} color="#434343" />
                      )}
                    </View>
                    <View style={styles.markerArrow} />
                  </View>

                  {/* BALÃO AO CLICAR NO PET (LEVA PARA OS DETALHES) */}
                  <Callout
                    onPress={() =>
                      router.push({
                        pathname: "/detalhesAnimal",
                        params: { id: animal.id },
                      })
                    }
                  ></Callout>
                </Marker>
              );
            })}
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

  // NOVOS ESTADOS DE ESTILIZAÇÃO DO MARCADOR DOS PETS
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 46,
    height: 50,
  },
  avatarBorder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: "#ffd358", // Amarelo padrão do Meau envolvido no avatar
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    overflow: "hidden",
  },
  animalImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#ffd358",
    transform: [{ rotate: "180deg" }],
    marginTop: -1,
  },
  calloutContainer: {
    padding: 6,
    width: 130,
    alignItems: "center",
  },
  calloutName: {
    fontWeight: "bold",
    fontSize: 13,
    color: "#434343",
  },
  calloutDetails: {
    fontSize: 11,
    color: "#757575",
    marginVertical: 1,
  },
  calloutLink: {
    fontSize: 11,
    color: "#589b9b",
    fontWeight: "bold",
    marginTop: 3,
  },
});
