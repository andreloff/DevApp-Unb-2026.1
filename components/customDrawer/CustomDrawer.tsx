import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { auth, db } from "../../src/services/firebaseConfig";
import DrawerFooter from "./DrawerFooter";
import DrawerHeader from "./DrawerHeader";
import DrawerItem from "./DrawerItem";
import DrawerSection from "./DrawerSection";

export default function CustomDrawer(props: any) {
  const [userName, setUserName] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserName(null);
        setUserPhoto(null);
        return;
      }

      try {
        const userSnap = await getDoc(doc(db, "usuarios", user.uid));
        if (userSnap.exists()) {
          const data = userSnap.data() as any;
          setUserName(
            data.nome_usuario || data.nome_completo || user.email || "Usuário",
          );
          setUserPhoto(data.fotoUrl || null);
        } else {
          setUserName(user.email || "Usuário");
          setUserPhoto(null);
        }
      } catch {
        setUserName(user.email || "Usuário");
        setUserPhoto(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCadastroPet = () => {
    if (auth.currentUser) {
      props.navigation.navigate("(home)", { screen: "cadastroAnimal" });
    } else {
      router.push("/loginScreen");
    }
  };

  const handleMeusPets = () => {
    if (auth.currentUser) {
      props.navigation.navigate("(home)", { screen: "meusAnimais" });
    } else {
      router.push("/loginScreen");
    }
  };

  const handleHeaderPress = () => {
    if (!auth.currentUser) {
      router.push("/loginScreen");
    }
  };

  const handleNotificacaoPress = () => {
    if (auth.currentUser) {
      props.navigation.navigate("(home)", { screen: "notificacoes" });
    } else {
      router.push("/loginScreen");
    }
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContent}
      style={styles.drawerScroll}
    >
      <DrawerHeader
        name={userName}
        photoUrl={userPhoto}
        onPress={handleHeaderPress}
      />

      <DrawerSection
        title={userName || "Fazer login"}
        containerStyle={styles.userSectionContainer}
      >
        <DrawerItem
          label="Meu Perfil"
          onPress={() => props.navigation.navigate("(profile)")}
        />
        <DrawerItem label="Meus Pets" onPress={handleMeusPets} />
        <DrawerItem
          label="Favoritos"
          onPress={() => props.navigation.navigate("(profile)")}
        />
        <DrawerItem
          label="Chat"
          onPress={() => {
            if (auth.currentUser) {
              props.navigation.navigate("chats");
            } else {
              router.push("/loginScreen");
            }
          }}
        />
      </DrawerSection>

      <DrawerSection
        icon={{ name: "bug-outline" }}
        title="Atalhos"
        containerStyle={styles.shortcutSectionContainer}
      >
        <DrawerItem
          label="Notificações"
          onPress={handleNotificacaoPress}
        />
        <DrawerItem label="Cadastrar um pet" onPress={handleCadastroPet} />
        <DrawerItem
          label="Adotar um pet"
          onPress={() =>
            props.navigation.navigate("(home)", { screen: "adotar" })
          }
        />
        <DrawerItem
          label="Mapa"
          onPress={() =>
            props.navigation.navigate("(home)", { screen: "mapa" })
          }
        />
        <DrawerItem
          label="Ajudar um pet"
          onPress={() => props.navigation.navigate("(profile)")}
        />
        <DrawerItem
          label="Apadrinhar um pet"
          onPress={() => props.navigation.navigate("(profile)")}
        />
      </DrawerSection>

      <DrawerSection
        icon={{ name: "information-circle-outline" }}
        title="Informações"
        containerStyle={styles.infoSectionContainer}
      >
        <DrawerItem
          label="Dicas"
          onPress={() => props.navigation.navigate("(profile)")}
        />
        <DrawerItem
          label="Eventos"
          onPress={() => props.navigation.navigate("(profile)")}
        />
        <DrawerItem
          label="Legislação"
          onPress={() => props.navigation.navigate("(profile)")}
        />
        <DrawerItem
          label="Termo de adoção"
          onPress={() => props.navigation.navigate("(profile)")}
        />
        <DrawerItem
          label="Histórias de adoção"
          onPress={() => props.navigation.navigate("(profile)")}
        />
      </DrawerSection>

      <DrawerSection
        icon={{ name: "settings-outline" }}
        title="Configurações"
        containerStyle={styles.configSectionContainer}
      >
        <DrawerItem
          label="Privacidade"
          onPress={() => props.navigation.navigate("(profile)")}
        />
      </DrawerSection>

      <DrawerFooter />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    padding: 0,
    margin: 0,
  },

  drawerScroll: {
    paddingHorizontal: 0,
  },

  userSectionContainer: {
    backgroundColor: "#88C9BF",
    borderTopWidth: 0,
    marginTop: -1,
  },

  shortcutSectionContainer: {
    backgroundColor: "#FEE29B",
  },

  infoSectionContainer: {
    backgroundColor: "#CFE9E5",
  },

  configSectionContainer: {
    backgroundColor: "#E6E7E8",
  },
});
