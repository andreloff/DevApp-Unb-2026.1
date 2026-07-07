import { Ionicons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { Image } from "expo-image";
import { useNavigation, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const onMenuPress = async () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View style={styles.bgContainer}>
      <Pressable style={styles.menuPressable} onPress={onMenuPress}>
        <Ionicons name="menu-outline" size={32} color="#88C9BF" />
      </Pressable>

      <Text style={styles.titleText}>Sobre os desenvolvimento do projeto</Text>

      <Text style={styles.bodyText}>
        Esse aplicativo foi desenvolvido como parte da disciplina de
        desenvolvimento de aplicativos, durante o semestre 2026.1.
      </Text>
      <Text style={styles.bodyText}>
        O projeto foi desenvolvido pelos seguintes alunos: {"\n"} André Cassio
        Barros de Souza - 160111943 {"\n"} Luan Marques de Melo - 221030310{" "}
        {"\n"} Vinicius Chaves - 211060764
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
  },

  bodyText: {
    textAlign: "center",
    margin: 20,
    fontSize: 20,
    color: "#757575",
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
