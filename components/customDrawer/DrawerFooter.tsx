import { Pressable, StyleSheet, Text, View } from 'react-native';

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
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: "#88C9BF",
    width: 304,
    height: 48,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginTop: 40,
    marginLeft: 16,
    marginBottom: 12,
    backgroundColor: "#4F46E5",
  },

  button: {
    alignItems: "center",
    width: 304,
    height: 48,
  },

  buttonText: {
    paddingTop: 14,
    textAlign: "center",
    color: "#434343",
    fontFamily: "Roboto_500Medium",
  },
  
});