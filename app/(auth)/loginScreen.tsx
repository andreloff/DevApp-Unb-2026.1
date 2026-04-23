import { useAuth } from '@/src/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { handleLogin } = useAuth();
  const router = useRouter();

  const onLoginPress = async () => {
    const success = await handleLogin(email, password);
    if (success) {
      router.replace('/(drawer)/(home)');
    }
  };

  return (
    <View style={styles.bgContainer}>
      <View style={styles.headerContainer}>
        <Pressable style={styles.menuPressable}>
          <Ionicons name="menu-outline" size={32} color="#757575"/>
        </Pressable>
        <Text style={styles.titleText}>Login</Text>
      </View>

      <View style={inputFieldStyles.inputFieldContainer}>
        <TextInput
          style={inputFieldStyles.inputText}
          placeholder="Nome de usuário"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={inputFieldStyles.inputText}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
      
      <Pressable style={styles.bodyButton} onPress={onLoginPress}>
        <Text style={styles.buttonText}>ENTRAR</Text>
      </Pressable>

      <View style={socialMediaStyles.socialLoginContainer}>
        <Pressable style={socialMediaStyles.facebookLoginButton}>
          <Ionicons name="logo-facebook" size={32} color="#FAFAFA"/>
          <Text style={socialMediaStyles.socialButtonText}>ENTRAR COM FACEBOOK</Text>
        </Pressable>
        <Pressable style={socialMediaStyles.googleLoginButton}>
          <Ionicons name="logo-google" size={32} color="#FAFAFA"/>
          <Text style={socialMediaStyles.socialButtonText}>ENTRAR COM GOOGLE</Text>
        </Pressable>
      </View>

      {/* Adicionado apenas este bloco para o link funcionar */}
      <Pressable style={{ marginTop: 30 }} onPress={() => router.push('/cadastro')}>
        <Text style={{ color: '#88c9bf', fontWeight: 'bold' }}>Não tem conta? Cadastre-se</Text>
      </Pressable>
    </View>
  );
}

// ... mantenha seus estilos (styles, inputFieldStyles, socialMediaStyles) exatamente como estão abaixo