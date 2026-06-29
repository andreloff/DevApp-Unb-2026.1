import { removerTokenNotificacao } from "@/src/services/expoNotifications";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { auth } from "../../src/services/firebaseConfig";

export default function DrawerFooter() {

  const router = useRouter();
  
  const handleLogoutPress = async () => {
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      try{
        router.replace("/loginScreen");
        await removerTokenNotificacao(uid);
        await auth.signOut();
        console.log("Logoff com sucesso!");
      } catch (error) {
        console.error("Erro no logoff: ", error);
      }
    } 
  };

  return (
    <View style={styles.container}>
      <Pressable 
        style={styles.button}
        onPress={handleLogoutPress}
      >
        <Text style={styles.buttonText}>Sair</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 48,
    backgroundColor: "#88C9BF",
  },

  button: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#434343",
    fontSize: 14,
    fontFamily: "Roboto_500Medium",
  },
});
