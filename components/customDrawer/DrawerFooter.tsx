import { Pressable, StyleSheet, Text, View } from "react-native";

export default function DrawerFooter() {
  return (
    <View style={styles.container}>
      <Pressable style={styles.button}>
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
