import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type IconProps = {
  name: keyof typeof Ionicons.glyphMap;
};

type Props = {
  icon?: IconProps;
  title: string;
  children: React.ReactNode;
  containerStyle?: object;
  titleStyle?: object;
  defaultOpen?: boolean;
};

export default function DrawerSection({
  icon,
  title,
  children,
  containerStyle,
  titleStyle,
  defaultOpen = false,
}: Props) {
  const [isOpen, setOpen] = useState(defaultOpen);

  return (
    <View style={[styles.container, containerStyle]}>
      <Pressable style={styles.pressable} onPress={() => setOpen(!isOpen)}>
        {icon && (
          <Ionicons
            name={icon.name}
            size={24}
            color="#757575"
            style={styles.icon}
          />
        )}

        <Text style={[styles.title, titleStyle]}>{title}</Text>
        <Ionicons
          name={isOpen ? "caret-up-outline" : "caret-down-outline"}
          size={24}
          color="#757575"
          style={styles.finalIcon}
        />
      </Pressable>

      {isOpen && <View style={styles.childrenContainer}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#E6E7E8",
  },

  title: {
    color: "#434343",
    paddingLeft: 16,
    fontSize: 14,
    fontFamily: "Roboto_500Medium",
    flex: 1,
  },

  pressable: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    width: "100%",
    paddingRight: 16,
  },

  icon: {
    marginLeft: 16,
    marginRight: 12,
  },

  finalIcon: {
    marginRight: 0,
  },

  childrenContainer: {
    width: "100%",
    backgroundColor: "#FFFFFF",
  },
});
