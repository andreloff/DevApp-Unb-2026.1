import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, Image, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../src/services/firebaseConfig';

export default function CadastroPessoal() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [email, setEmail] = useState('');
  const [estado, setEstado] = useState('');
  const [cidade, setCidade] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [image, setImage] = useState<string | null>(null);

  // Configuração para pegar imagem e converter para Base64
  const pickImage = async (useCamera: boolean) => {
    const result = useCamera 
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.3, base64: true })
      : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.3, base64: true });

    if (!result.canceled && result.assets[0].base64) {
      setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const realizarCadastro = async () => {
    if (senha.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (senha !== confirmaSenha) {
      Alert.alert('Atenção', 'As senhas não coincidem!');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      // Salva os dados no Firestore (fotoUrl recebe a string Base64)
      await setDoc(doc(db, "usuarios", user.uid), {
        nome_completo: nome,
        idade: idade,
        email: email,
        estado: estado,
        cidade: cidade,
        endereco: endereco,
        telefone: telefone,
        nome_usuario: usuario,
        uid: user.uid,
        fotoUrl: image || "",
        animais: [] 
      });

      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
      router.replace('/(drawer)/(home)'); 

    } catch (error: any) {
      console.log("ERRO REAL DO FIREBASE:", error);
      let mensagemErro = 'Verifique os dados digitados e tente novamente.';
      
      if (error.code === 'auth/email-already-in-use') {
        mensagemErro = 'Este e-mail já está cadastrado no aplicativo.';
      } else if (error.code === 'auth/invalid-email') {
        mensagemErro = 'O formato do e-mail é inválido.';
      } else if (error.code === 'auth/weak-password') {
        mensagemErro = 'A senha é muito fraca (mínimo de 6 caracteres).';
      }

      Alert.alert('Erro no Cadastro', mensagemErro);
    }
  };

  // Regras de validação para os checks verdes
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isSenhaValid = senha.length >= 6;
  const isConfirmaSenhaValid = confirmaSenha.length >= 6 && confirmaSenha === senha;
  const isTelefoneValid = telefone.length >= 10;
  const isIdadeValid = idade.length > 0 && parseInt(idade) > 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="menu" size={24} color="#434343" style={{marginRight: 16}} />
        <Text style={styles.headerTitle}>Cadastro Pessoal</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          As informações preenchidas serão divulgadas apenas para a pessoa com a qual você realizar o processo de adoção e/ou apadrinhamento, após a formalização do processo.
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.sectionLabel}>INFORMAÇÕES PESSOAIS</Text>
        
        <InputField placeholder="Nome completo" value={nome} onChangeText={setNome} isValid={nome.trim().length >= 3} />
        <InputField placeholder="Idade" value={idade} onChangeText={setIdade} keyboardType="numeric" isValid={isIdadeValid} />
        <InputField placeholder="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" isValid={isEmailValid} />
        <InputField placeholder="Estado" value={estado} onChangeText={setEstado} isValid={estado.trim().length >= 2} />
        <InputField placeholder="Cidade" value={cidade} onChangeText={setCidade} isValid={cidade.trim().length >= 3} />
        <InputField placeholder="Endereço" value={endereco} onChangeText={setEndereco} isValid={endereco.trim().length >= 5} />
        <InputField placeholder="Telefone" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" isValid={isTelefoneValid} />

        <Text style={styles.sectionLabel}>INFORMAÇÕES DE PERFIL</Text>
        <InputField placeholder="Nome de usuário" value={usuario} onChangeText={setUsuario} isValid={usuario.trim().length >= 3} />
        <InputField placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry={true} isValid={isSenhaValid} />
        <InputField placeholder="Confirmação de senha" value={confirmaSenha} onChangeText={setConfirmaSenha} secureTextEntry={true} isValid={isConfirmaSenhaValid} />

        <Text style={styles.sectionLabel}>FOTO DE PERFIL</Text>
        <TouchableOpacity 
          style={styles.photoSquare} 
          onPress={() => {
            Alert.alert("Foto", "Escolha a fonte:", [
              { text: "Câmera", onPress: () => pickImage(true) },
              { text: "Galeria", onPress: () => pickImage(false) },
              { text: "Cancelar", style: "cancel" }
            ]);
          }}
        >
          {image ? (
            <Image source={{ uri: image }} style={{ width: 128, height: 128, borderRadius: 2 }} />
          ) : (
            <>
              <MaterialIcons name="add-circle-outline" size={32} color="#757575" />
              <Text style={styles.photoText}>adicionar foto</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnFinalizar} onPress={realizarCadastro}>
          <Text style={styles.btnText}>FAZER CADASTRO</Text>
        </TouchableOpacity>
      </View>
      <StatusBar barStyle="dark-content" backgroundColor="#88c9bf" />
    </ScrollView>
  );
}

// --- COMPONENTE MOVIDO PARA FORA PARA EVITAR PERDA DE FOCO DO TECLADO ---
const InputField = ({ placeholder, value, onChangeText, secureTextEntry, keyboardType, isValid }: any) => (
  <View style={styles.inputContainer}>
    <TextInput 
      style={styles.input} 
      placeholder={placeholder} 
      placeholderTextColor="#bdbdbd" 
      value={value} 
      onChangeText={onChangeText} 
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
    />
    {isValid && (
      <MaterialIcons name="check" size={24} color="#88c9bf" style={{ marginLeft: 8 }} />
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' }, 
  header: { backgroundColor: '#88c9bf', height: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }, 
  headerTitle: { color: '#434343', fontSize: 20, fontWeight: '500' }, 
  infoBox: { backgroundColor: '#cfe9e5', padding: 15, marginHorizontal: 16, marginTop: 16, borderRadius: 4, minHeight: 80, justifyContent: 'center' },
  infoText: { color: '#434343', fontSize: 14, textAlign: 'center', lineHeight: 20 }, 
  form: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionLabel: { color: '#88c9bf', fontSize: 14, marginTop: 28, marginBottom: 15, fontWeight: '500' }, 
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 0.8, borderBottomColor: '#e6e7e8', marginBottom: 15 },
  input: { flex: 1, paddingVertical: 8, color: '#434343' }, 
  photoSquare: { backgroundColor: '#e6e7e7', width: 128, height: 128, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginTop: 10, borderRadius: 2, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2 }, 
  photoText: { color: '#757575', fontSize: 14, marginTop: 4 },
  btnFinalizar: { backgroundColor: '#88c9bf', width: 232, height: 40, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginTop: 30, elevation: 2 }, 
  btnText: { color: '#434343', fontSize: 12, fontWeight: 'bold' } 
});