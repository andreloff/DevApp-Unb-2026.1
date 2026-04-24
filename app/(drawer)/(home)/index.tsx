import { useAuth } from "@/src/hooks/useAuth"; // 1. Importação necessária para checar o login
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { Image } from "expo-image";
import { useNavigation, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuth(); // 2. Puxa o estado atual do usuário (logado ou não)

  // 3. Função para decidir se vai para a tela de 'Ops!' ou para a função do app
  const handleProtectedAction = (route: string) => {
    if (user) {
      router.push(route);
    } else {
      router.push("/cadastro"); // Manda para a tela de "Ops!" (app/cadastro.tsx)
    }
  };

  const onLoginPress = async () => {
    router.push("/loginScreen");
  };

  const onMenuPress = async () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View style={styles.bgContainer}>
      <Pressable style={styles.menuPressable} onPress={onMenuPress}>
        <Ionicons name="menu-outline" size={32} color="#88C9BF" />
      </Pressable>

      <Text style={styles.titleText}>Olá!</Text>

      <Text style={styles.bodyText}>
        Bem vindo ao Meau!{"\n"}Aqui você pode adotar, doar e ajudar cães e
        gatos com facilidade. 
        {"\n"}Qual o seu interesse?
      </Text>

      <Pressable 
        style={styles.bodyButton} 
        onPress={() => handleProtectedAction("/failScreen")}
      >
        <Text style={styles.buttonText}>ADOTAR</Text>
      </Pressable>

      <Pressable 
        style={styles.bodyButton} 
        onPress={() => handleProtectedAction("/failScreen")}
      >
        <Text style={styles.buttonText}>AJUDAR</Text>
      </Pressable>

      <Pressable 
        style={styles.bodyButton} 
        onPress={() => handleProtectedAction("/cadastroAnimal")}
      >
        <Text style={styles.buttonText}>CADASTRAR ANIMAL</Text>
      </Pressable>

      <Text style={styles.loginText} onPress={onLoginPress}>
        login
      </Text>
      <Image
        source={require("@/assets/images/meau_marca_2.png")}
        style={styles.meauLogoImage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bgContainer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  menuPressable: {
    alignSelf: "flex-start",
    paddingTop: 10,
    paddingLeft: 14,
  },
  titleText: {
    textAlign: "center",
    fontSize: 100,
    color: "#FFD358",
    fontFamily: "Courgette_400Regular",
  },
  bodyText: {
    textAlign: "center",
    margin: 20,
    fontSize: 20,
    color: "#757575",
    fontFamily: "Roboto_400Regular",
  },
  bodyButton: {
    width: 240,
    height: 60,
    borderRadius: 5,
    margin: 8,
    alignItems: "center",
    backgroundColor: "#FFD358",
    elevation: 4,
  },
  buttonText: {
    textAlign: "center",
    margin: 20,
    fontSize: 18,
    color: "#757575",
  },
  loginText: {
    textAlign: "center",
    margin: 20,
    fontSize: 20,
    color: "#88C9BF",
  },
  meauLogoImage: {
    margin: 20,
    width: 154,
    height: 55,
  },
});