
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Cadastro() { 
  const router = useRouter();

  const onBackArrowPress = async () => {
    router.back();
  };
  
  const onLoginPress = async () => {
    router.push("/loginScreen"); 
  };

  const onCadastroPress = async () => {
    router.push("/cadastro_pessoal"); 
  };

  return (
    <View style={styles.bgContainer}>
      <View style={styles.headerContainer}>
        <Pressable style={styles.menuPressable} onPress={onBackArrowPress}>
          <Ionicons name="arrow-back-outline" size={32} color="#757575" />
        </Pressable>
        <Text style={styles.headerText}>Cadastro</Text>
      </View>

      <Text style={styles.titleText}>Ops!</Text>

      <View style={bodyStyles.bodyContainer}>
        <Text style={styles.buttonText}>
          Você não pode realizar esta ação sem possuir um cadastro.
        </Text>
        <Pressable style={styles.bodyButton} onPress={onCadastroPress}>
          <Text style={styles.buttonText}>FAZER CADASTRO</Text>
        </Pressable>
      </View>

      <View style={bodyStyles.bodyContainer}>
        <Text style={styles.buttonText}>Já possui cadastro?</Text>
        <Pressable style={styles.bodyButton} onPress={onLoginPress}>
          <Text style={styles.buttonText}>FAZER LOGIN</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bgContainer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#CFE9E5",
    width: "100%",
    height: 60,
  },
  menuPressable: {
    paddingTop: 14,
    paddingLeft: 14,
    width: 40,
    height: 40,
  },
  headerText: {
    paddingTop: 14,
    paddingLeft: 40,
    fontSize: 24,
    color: "#333333",
    fontWeight: "bold",
  },
  titleText: {
    paddingTop: 40,
    textAlign: "center",
    fontSize: 60,
    color: "#88C9BF",
    fontFamily: "Courgette_400Regular",
  },
  bodyButton: {
    width: 300,
    height: 60,
    borderRadius: 5,
    alignItems: "center",
    backgroundColor: "#88C9BF",
    elevation: 4,
  },
  buttonText: {
    textAlign: "center",
    margin: 20,
    fontSize: 18,
    color: "#343434",
  },
});

const bodyStyles = StyleSheet.create({
  bodyContainer: {
    alignItems: "center",
    width: "100%",
    paddingTop: 30,
  },
  inputText: {
    width: 340,
    height: 60,
    padding: 14,
    elevation: 1,
  },
});