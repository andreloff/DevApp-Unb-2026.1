import LocalizacaoSelector from "@/components/seletorLocalização";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  GeoPoint,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { enviarPushNotificacao } from "@/src/services/expoNotifications";
import { auth, db } from "../../../src/services/firebaseConfig";

const animacaoLike = require("../../../assets/animations/like.json");

export default function DetalhesAnimal() {
  const { id } = useLocalSearchParams();
  const { mapLat, mapLng } = useLocalSearchParams<{
    mapLat?: string;
    mapLng?: string;
  }>();
  const router = useRouter();
  const [animal, setAnimal] = useState<any>(null);
  const [ownerLocation, setOwnerLocation] = useState("");
  const [ownerName, setOwnerName] = useState("Tutor");
  const [ownerPhoto, setOwnerPhoto] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAnimation, setShowAnimation] = useState(false);
  const [enviandoInteresse, setEnviandoInteresse] = useState(false);

  const lottieRef = useRef<LottieView>(null);
  const [favoritado, setFavoritado] = useState(false);

  useEffect(() => {
    if (mapLat && mapLng && id) {
      handleAtualizarLocalizacao(parseFloat(mapLat), parseFloat(mapLng));
    }
  }, [mapLat, mapLng]);

  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    async function fetchAnimal() {
      if (!id) return;
      const docRef = doc(db, "animais", id as string);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const animalData = docSnap.data();
        setAnimal(animalData);

        if (animalData.usuarioId) {
          const userSnap = await getDoc(
            doc(db, "usuarios", animalData.usuarioId),
          );
          if (userSnap.exists()) {
            const userData = userSnap.data() as any;
            let localizacaoDefinida = false;

            if (animalData.coordenadas) {
              try {
                const { status } = await Location.getForegroundPermissionsAsync();

                if (status === "granted") {
                  const res = await Location.reverseGeocodeAsync({
                    latitude: animalData.coordenadas.latitude,
                    longitude: animalData.coordenadas.longitude,
                  });
                  if (res && res.length > 0) {
                    const distrito = res[0].district || "";
                    const cidade = res[0].subregion || res[0].city || "";
                    const estado = res[0].region || "";
                    setOwnerLocation(
                      cidade && estado && distrito
                        ? `${distrito} - ${cidade} - ${estado}`
                        : cidade || estado || "Local não mapeado",
                    );
                    localizacaoDefinida = true;
                  }
                }
              } catch (err) {
                console.log("Erro no reverseGeocode do dono: ", err);
              }
            }

            if (!localizacaoDefinida) {
              const cidade = userData.cidade || "";
              const estado = userData.estado || "";
              setOwnerLocation(
                cidade && estado
                  ? `${cidade} - ${estado}`
                  : cidade || estado || "",
              );
            }

            setOwnerName(
              userData.nome_completo || userData.nome_usuario || "Tutor",
            );
            setOwnerPhoto(userData.fotoUrl || "");
          }
        }
      }
      setLoading(false);
    }
    fetchAnimal();
  }, [id]);

  const formatNecessidades = () => {
    const necessidadesArray = Array.isArray(animal?.necessidades)
      ? animal.necessidades
      : animal?.necessidades
        ? [animal.necessidades]
        : [];

    if (necessidadesArray.length === 0) {
      return "Nenhuma";
    }

    const items = necessidadesArray.map((item: string) => {
      if (item === "Medicamento" && animal?.medicamentos) {
        return `Medicamento (${animal.medicamentos})`;
      }
      if (item === "Objetos" && animal?.objetos) {
        return `Objetos (${animal.objetos})`;
      }
      return item;
    });

    if (items.length === 1) {
      return items[0];
    }

    return `${items.slice(0, -1).join(", ")} e ${items[items.length - 1]}`;
  };

  const enviarInteresse = async () => {
    const usuarioAtual = auth.currentUser;

    if (!usuarioAtual) {
      Alert.alert(
        "Atenção",
        "Você precisa estar logado para adotar um animal.",
      );
      router.push("/loginScreen");
      return;
    }

    if (usuarioAtual.uid === animal.usuarioId) {
      Alert.alert("Ops!", "Você é o tutor deste animal.");
      return;
    }

    setEnviandoInteresse(true);

    try {
      const notificacoesRef = collection(db, "notificacoes");
      const queryExistente = query(
        notificacoesRef,
        where("remetenteId", "==", usuarioAtual.uid),
        where("animalId", "==", id),
        where("destinatarioId", "==", animal.usuarioId),
        where("status", "==", "pendente"),
      );
      const snapshotExistente = await getDocs(queryExistente);

      if (!snapshotExistente.empty) {
        Alert.alert(
          "Interesse já enviado",
          `Você já demonstrou interesse em ${animal.nome}. Aguarde a resposta do tutor.`,
        );
        setEnviandoInteresse(false);
        return;
      }

      let pushTokensDestinatario: string[] = [];
      setShowAnimation(true);

      let meuNome = usuarioAtual.displayName || "Interessado";

      const meuDocSnap = await getDoc(doc(db, "usuarios", usuarioAtual.uid));
      if (meuDocSnap.exists()) {
        const meusDados = meuDocSnap.data() as any;
        meuNome = meusDados.nome_usuario || meusDados.nome_completo || meuNome;
      }

      const destinatarioDocSnap = await getDoc(doc(db, "usuarios", animal.usuarioId));
      if (destinatarioDocSnap.exists()) {
        const destinatarioDados = destinatarioDocSnap.data() as any;
        pushTokensDestinatario = destinatarioDados.pushTokens ?? [];
      }

      await addDoc(collection(db, "notificacoes"), {
        animalId: id,
        animalNome: animal.nome,
        criadaEm: serverTimestamp(),
        destinatarioId: animal.usuarioId,
        lida: false,
        remetenteId: usuarioAtual.uid,
        remetenteNome: meuNome,
        status: "pendente",
        tipo: "interesse_adocao",
      });

      await enviarPushNotificacao(
        pushTokensDestinatario,
        "Novo pedido de adoção! 🐾",
        `${meuNome} deseja adotar ${animal.nome}.`,
        { tipo: "interesse_adocao" }
      );

      setTimeout(() => {
        setShowAnimation(false);
        Alert.alert(
          "Interesse enviado!",
          `O tutor de ${animal.nome} foi notificado do seu interesse em adotar.`,
        );
      }, 1500);
      
    } catch (error) {
      console.error("Erro ao enviar interesse: ", error);
      setShowAnimation(false);
      Alert.alert("Erro", "Não foi possível enviar seu interesse agora.");
    } finally {
      setEnviandoInteresse(false);
    }
  };

  const handleLike = () => {
    setFavoritado(!favoritado);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!animal) return <Text>Animal não encontrado.</Text>;

  const handleAtualizarLocalizacao = async (
    latitude: number,
    longitude: number,
  ) => {
    if (!id) return;
    try {
      const docRef = doc(db, "animais", id as string);
      const novoGeoPoint = new GeoPoint(latitude, longitude);

      await updateDoc(docRef, {
        coordenadas: novoGeoPoint,
      });

      setAnimal((prev: any) => ({ ...prev, coordenadas: novoGeoPoint }));
      Alert.alert("Sucesso", "Localização do pet atualizada no banco!");
    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar a localização.");
    }
  };

  const toggleSelection = (item: string) => {
    setTemperamento((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  const toggleSaude = (item: string) => {
    setSaude((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  const toggleNecessidade = (item: string) => {
    setNecessidades((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const usuarioAtual = auth.currentUser;

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color="#434343" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{animal.nome || "Detalhes"}</Text>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="share-social" size={24} color="#434343" />
          </TouchableOpacity>
        </View>
        <Image
          source={{
            uri: animal.fotoUrl?.startsWith("data:image")
              ? animal.fotoUrl
              : `data:image/jpeg;base64,${animal.fotoUrl}`,
          }}
          style={styles.banner}
        />

        <View style={styles.content}>
          <View style={styles.detailsHeader}>
            <Text style={styles.name}>{animal.nome}</Text>
            
            <TouchableOpacity style={styles.fab} onPress={handleLike} activeOpacity={0.7}>
              {favoritado ? (
                <LottieView
                  ref={lottieRef}
                  source={animacaoLike}
                  autoPlay={true}
                  loop={false}
                  style={{ width: 60, height: 60 }}
                />
              ) : (
                <Ionicons name="heart-outline" size={28} color="#434343" />
              )}
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
          <Text style={styles.value}>
            {ownerLocation || animal.localizacao || ""}
          </Text>

          <View style={styles.divider} />

          <View style={styles.infoGrid}>
            <View>
              <Text style={styles.label}>CASTRADO</Text>
              <Text style={styles.value}>
                {animal.castrado ? "Sim" : "Não"}
              </Text>
            </View>
            <View>
              <Text style={styles.label}>VERMIFUGADO</Text>
              <Text style={styles.value}>
                {animal.vermifugado ? "Sim" : "Não"}
              </Text>
            </View>
          </View>
          <View style={styles.infoGrid}>
            <View>
              <Text style={styles.label}>VACINADO</Text>
              <Text style={styles.value}>
                {animal.vacinado ? "Sim" : "Não"}
              </Text>
            </View>
            <View>
              <Text style={styles.label}>DOENÇAS</Text>
              <Text style={styles.value}>
                {animal.doenca ? animal.doenca : "Nenhuma"}
              </Text>
            </View>
          </View>

          <Text style={styles.label}>TEMPERAMENTO</Text>
          <Text style={styles.value}>
            {Array.isArray(animal.temperamento)
              ? animal.temperamento.length === 0
                ? ""
                : animal.temperamento.length === 1
                  ? animal.temperamento[0]
                  : animal.temperamento.slice(0, -1).join(", ") +
                    " e " +
                    animal.temperamento.slice(-1)
              : animal.temperamento || ""}
          </Text>

          <Text style={styles.label}>NECESSIDADES</Text>
          <Text style={styles.value}>{formatNecessidades()}</Text>

          <Text style={styles.label}>
            MAIS SOBRE {animal.nome?.toUpperCase()}
          </Text>
          <Text style={styles.description}>{animal.sobre}</Text>
          {auth.currentUser?.uid === animal.usuarioId && (
            <View style={{ marginVertical: 12 }}>
              <Text style={styles.label}>ATUALIZAR LOCALIZAÇÃO</Text>
              <LocalizacaoSelector
                hasLocation={
                  animal.coordenadas !== undefined &&
                  animal.coordenadas !== null
                }
                onLocationSelected={handleAtualizarLocalizacao}
              />
            </View>
          )}

          {usuarioAtual?.uid !== animal.usuarioId && (
            <TouchableOpacity 
                style={[styles.button, enviandoInteresse && styles.buttonDisabled]}
                onPress={enviarInteresse}
                disabled={enviandoInteresse}
            >
              <Text style={styles.buttonText}>
                {enviandoInteresse ? "ENVIANDO..." : "PRETENDO ADOTAR"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <Modal visible={showAnimation} transparent={true} animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.lottieContainer}>
            <LottieView
              source={require("../../../assets/animations/gato_amor.json")}
              autoPlay
              loop={true}
              style={{ width: 250, height: 250 }}
            />
            <Text style={styles.lottieText}>Enviando seu interesse...</Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  header: {
    height: 56,
    backgroundColor: "#fee29b",
    paddingTop: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { color: "#434343", fontSize: 18, fontWeight: "700" },
  headerButton: { padding: 8 },
  banner: { width: "100%", height: 184 },
  content: { padding: 16 },
  detailsHeader: {
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
    marginTop: -40,
  },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  label: { fontSize: 12, color: "#f7a800", marginTop: 12 },
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
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: { color: "#434343", fontSize: 12, fontWeight: "500" },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  lottieContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  lottieText: {
    marginTop: 10,
    fontSize: 16,
    color: "#434343",
    fontWeight: "600",
  },
});