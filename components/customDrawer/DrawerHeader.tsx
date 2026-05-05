import { Ionicons } from "@expo/vector-icons";
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
      <View style={styles.headerInfo}>
        <Text style={styles.nameText}>{name || "Fazer login"}</Text>
        <Ionicons
          name="caret-down-outline"
          size={20}
          color="#434343"
          style={styles.headerIcon}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 172,
    paddingTop: 40,
    paddingLeft: 16,
    paddingRight: 16,
    backgroundColor: "#88C9BF",
    justifyContent: "flex-start",
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F7F7F7",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  headerInfo: {
    marginTop: 12,
    marginLeft: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  nameText: {
    color: "#434343",
    fontSize: 18,
    fontFamily: "Roboto_500Medium",
  },

  headerIcon: {
    marginLeft: 12,
  },
});
