import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type DrawerHeaderProps = {
  name?: string | null;
  onPress?: () => void;
};

export default function DrawerHeader({ name, onPress }: DrawerHeaderProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.container}
    >
      <View style={styles.avatar} />
      <Text style={styles.nameText}>{name || "Fazer login"}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: "#88C9BF",
    width: 304,
    height: 172,
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

  nameText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 16,
  },
});
