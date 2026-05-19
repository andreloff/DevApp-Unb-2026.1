
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

type DrawerHeaderProps = {
  name?: string | null;
  photoUrl?: string | null;
  onPress?: () => void;
};

export default function DrawerHeader({
  name,
  photoUrl,
  onPress,
}: DrawerHeaderProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.container}
    >
      <View style={styles.avatar}>
        {photoUrl ? (
          <Image
            source={{
              uri: photoUrl.startsWith("data:image")
                ? photoUrl
                : `data:image/jpeg;base64,${photoUrl}`,
            }}
            style={styles.avatarImage}
          />
        ) : (
          <Image
            source={require("../../assets/images/avatar_placeholder.png")}
            style={styles.avatarImage}
          />
        )}
      </View>
      {/* <View style={styles.headerInfo}>
        <Text style={styles.nameText}>{name || "Fazer login"}</Text>
        <Ionicons
          name="caret-down-outline"
          size={20}
          color="#434343"
          style={styles.headerIcon}
        />
      </View> */}
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

  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 32,
  },

  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F7F7F7",
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
