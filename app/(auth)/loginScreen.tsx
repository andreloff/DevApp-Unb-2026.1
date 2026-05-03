import { useAuth } from "@/src/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const { handleLogin, handleRegister, error } = useAuth();
  const router = useRouter();

  const onLoginPress = async () => {
    const success = await handleLogin(email, password);

    if (success) {
      console.log("Indo pra home...");
      router.replace("/(drawer)/(home)/adotar");
    } else {
      console.log("Login falhou");
    }
  };

  return (
    <View style={styles.bgContainer}>
      <View style={styles.headerContainer}>
        <Pressable style={styles.menuPressable}>
          <Ionicons name="menu-outline" size={32} color="#757575" />
        </Pressable>
        <Text style={styles.titleText}>Login</Text>
      </View>

      <View style={inputFieldStyles.inputFieldContainer}>
        <TextInput
          style={inputFieldStyles.inputText}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <View style={inputFieldStyles.passwordFieldContainer}>
          <TextInput
            style={inputFieldStyles.passwordInput}
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <Pressable
            style={inputFieldStyles.passwordToggle}
            onPress={() => setShowPassword((prev) => !prev)}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={24}
              color="#757575"
            />
          </Pressable>
        </View>
      </View>

      <Pressable style={styles.bodyButton} onPress={onLoginPress}>
        <Text style={styles.buttonText}>ENTRAR</Text>
      </Pressable>

      <View style={socialMediaStyles.socialLoginContainer}>
        <Pressable style={socialMediaStyles.facebookLoginButton}>
          <Ionicons name="logo-facebook" size={32} color="#FAFAFA" />
          <Text style={socialMediaStyles.socialButtonText}>
            ENTRAR COM FACEBOOK
          </Text>
        </Pressable>
        <Pressable style={socialMediaStyles.googleLoginButton}>
          <Ionicons name="logo-google" size={32} color="#FAFAFA" />
          <Text style={socialMediaStyles.socialButtonText}>
            ENTRAR COM GOOGLE
          </Text>
        </Pressable>
      </View>

      <Pressable
        style={{ marginTop: 40, marginBottom: 20 }}
        onPress={() => router.push("/cadastro_pessoal")}
      >
        <Text style={{ color: "#88c9bf", fontWeight: "bold", fontSize: 16 }}>
          Não tem conta? Cadastre-se
        </Text>
      </Pressable>
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

  titleText: {
    paddingTop: 14,
    paddingLeft: 40,
    fontSize: 24,
    color: "#000000",
  },

  bodyButton: {
    width: 300,
    height: 60,
    borderRadius: 5,
    margin: 40,
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

const inputFieldStyles = StyleSheet.create({
  inputFieldContainer: {
    alignItems: "center",
    width: "100%",
    paddingTop: 40,
  },

  inputText: {
    width: 340,
    height: 60,
    paddingLeft: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    elevation: 1,
    marginBottom: 16,
    fontSize: 16,
  },

  passwordFieldContainer: {
    width: 340,
    height: 60,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
    elevation: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  passwordInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
  },

  passwordToggle: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});

const socialMediaStyles = StyleSheet.create({
  socialLoginContainer: {
    alignItems: "center",
    width: "100%",
    paddingTop: 60,
  },

  facebookLoginButton: {
    flexDirection: "row",
    width: 300,
    height: 60,
    borderRadius: 5,
    paddingLeft: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0a1c61",
    elevation: 4,
  },

  googleLoginButton: {
    flexDirection: "row",
    width: 300,
    height: 60,
    borderRadius: 5,
    justifyContent: "center",
    margin: 8,
    alignItems: "center",
    backgroundColor: "#ad2f2f",
    elevation: 4,
  },

  socialButtonText: {
    textAlign: "center",
    margin: 20,
    fontSize: 16,
    color: "#FAFAFA",
  },
});
