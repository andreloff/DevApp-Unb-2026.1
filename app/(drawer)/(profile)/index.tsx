import { auth, db } from "@/src/services/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { Image } from "expo-image";
import { useNavigation, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type UserProfileData = {
  nome_completo?: string;
  nome_usuario?: string;
  email?: string;
  endereco?: string;
  telefone?: string;
  idade?: string;
  fotoUrl?: string;
  cidade?: string;
  estado?: string;
};

export default function ProfileScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setUserData(null);
        setLoading(false);
        return;
      }

      try {
        const userSnap = await getDoc(doc(db, "usuarios", currentUser.uid));
        if (userSnap.exists()) {
          setUserData(userSnap.data() as UserProfileData);
        } else {
          setUserData({ email: currentUser.email || "" });
        }
      } catch (error) {
        console.log("Erro ao buscar dados de perfil:", error);
        setUserData({ email: currentUser?.email || "" });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const profileImageSource = userData?.fotoUrl
    ? { uri: userData.fotoUrl }
    : require("@/assets/images/meau_marca_2.png");

  const renderInfoRow = (label: string, value?: string) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "Não informado"}</Text>
    </View>
  );

  return (
    <View style={styles.bgContainer}>
      <Pressable
        style={styles.menuPressable}
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      >
        <Ionicons name="menu-outline" size={32} color="#88C9BF" />
      </Pressable>

      <Text style={styles.titleText}>PERFIL</Text>

      <View style={styles.card}>
        <Image
          source={profileImageSource}
          style={styles.profileImage}
          contentFit="cover"
        />

        {loading ? (
          <Text style={styles.loadingText}>Carregando dados da conta...</Text>
        ) : userData ? (
          <>
            <Text style={styles.nameText}>
              {userData.nome_completo ||
                userData.nome_usuario ||
                userData.email ||
                "Usuário"}
            </Text>
            {renderInfoRow("Email", userData.email)}
            {renderInfoRow("Telefone", userData.telefone)}
            {renderInfoRow("Idade", userData.idade)}
            {renderInfoRow("Endereço", userData.endereco)}
            {renderInfoRow(
              "Cidade / Estado",
              [userData.cidade, userData.estado].filter(Boolean).join(" - "),
            )}
          </>
        ) : (
          <Text style={styles.loadingText}>Nenhuma conta conectada.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bgContainer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    paddingTop: 24,
  },

  menuPressable: {
    alignSelf: "flex-start",
    paddingTop: 10,
    paddingLeft: 14,
  },

  titleText: {
    textAlign: "center",
    fontSize: 36,
    fontWeight: "700",
    color: "#FFD358",
    marginBottom: 16,
  },

  card: {
    width: "92%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },

  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 120,
    marginBottom: 18,
    backgroundColor: "#E6E7E8",
  },

  loadingText: {
    color: "#757575",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },

  nameText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 16,
    textAlign: "center",
  },

  infoRow: {
    width: "100%",
    marginBottom: 12,
  },

  infoLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#88C9BF",
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  infoValue: {
    fontSize: 16,
    color: "#555555",
    lineHeight: 22,
  },
});
