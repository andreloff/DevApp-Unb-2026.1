import { Ionicons } from "@expo/vector-icons";
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type IconProps = {
  name: keyof typeof Ionicons.glyphMap;
};

type Props = {
  icon?: IconProps;
  title: string;
  children: React.ReactNode;
  containerStyle?: object;
  titleStyle?: object;
}

export default function DrawerSection({icon, title, children, containerStyle, titleStyle} : Props) {
  const [isOpen, setOpen] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>

      <Pressable 
        style={styles.pressable}
        onPress={() => setOpen(!isOpen)}
      >
        {icon && 
          <Ionicons
            name={icon.name}
            size={24}
            color={"#434343"}
            style={styles.icon}
          />  
        }

        <Text style={[styles.title, titleStyle]}>
          {title}
        </Text>
        <Ionicons 
          name= {isOpen ? "caret-up-outline" : "caret-down-outline"} 
          size={24} 
          color="#757575"
          style={styles.finalIcon}
        />
      </Pressable>

      {isOpen && 
        <View style={{ paddingLeft: 0 }}>
          {children}
        </View>
      }

    </View>    
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
    paddingHorizontal: 0,
  },

  title: {
    color: "#434343",
    paddingLeft: 16,
    fontSize: 15,
    fontFamily: "Roboto_500Medium",
  },

  pressable: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },

  icon: {
    paddingLeft: 16,
  },

  finalIcon: {
    marginLeft: "auto",
    marginRight: 16,
  }

});