import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function InitialScreen() {
  return (
    <View style={styles.bgContainer}>
      <Pressable style={styles.menuPressable}>
        <Ionicons name="menu-outline" size={32} color="#88C9BF"/>
      </Pressable>
      <Text style={styles.titleText}>Olá</Text>
      <Text style={styles.bodyText}>Bem vindo ao Meau!{"\n"}Aqui você pode adotar, doar e ajudar cães e gatos com facilidade. Qual o seu interesse?</Text>
      <Pressable style={styles.bodyButton}>
        <Text style={styles.buttonText}>ADOTAR</Text>
      </Pressable>
      <Pressable style={styles.bodyButton}>
        <Text style={styles.buttonText}>AJUDAR</Text>
      </Pressable>
      <Pressable style={styles.bodyButton}>
        <Text style={styles.buttonText}>CADASTRAR ANIMAL</Text>
      </Pressable>
      <Text style={styles.loginText}>login</Text>
      <Image
        source={require('@/assets/images/meau_marca_2.png')}
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
    color: "#FFD358"
  },

  bodyText: {
    textAlign: "center",
    margin: 20,
    fontSize: 20,
    color: "#757575"
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
    color: "#757575"
  },

  loginText:{
    textAlign: "center",
    margin: 20,
    fontSize: 20,
    color: "#88C9BF"
  },

  meauLogoImage:{
    margin: 20,
    width: 154,
    height: 55,
  }

})
