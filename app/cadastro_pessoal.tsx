import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../firebaseConfig';

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

  const realizarCadastro = async () => {
    if (senha !== confirmaSenha) {
      Alert.alert('Erro', 'As senhas não coincidem!');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      await setDoc(doc(db, "usuarios", user.uid), {
        nome_completo: nome,
        idade: idade,
        email: email,
        estado: estado,
        cidade: cidade,
        endereco: endereco,
        telefone: telefone,
        nome_usuario: usuario,
        uid: user.uid
      });

      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
      router.replace('/home'); 
    } catch (error: any) {
      Alert.alert('Erro no Cadastro', 'Verifique os dados ou se o e-mail já existe.');
    }
  };

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
        <TextInput style={styles.input} placeholder="Nome completo" placeholderTextColor="#bdbdbd" value={nome} onChangeText={setNome} />
        <TextInput style={styles.input} placeholder="Idade" placeholderTextColor="#bdbdbd" keyboardType="numeric" value={idade} onChangeText={setIdade} />
        <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor="#bdbdbd" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Estado" placeholderTextColor="#bdbdbd" value={estado} onChangeText={setEstado} />
        <TextInput style={styles.input} placeholder="Cidade" placeholderTextColor="#bdbdbd" value={cidade} onChangeText={setCidade} />
        <TextInput style={styles.input} placeholder="Endereço" placeholderTextColor="#bdbdbd" value={endereco} onChangeText={setEndereco} />
        <TextInput style={styles.input} placeholder="Telefone" placeholderTextColor="#bdbdbd" keyboardType="phone-pad" value={telefone} onChangeText={setTelefone} />

        <Text style={styles.sectionLabel}>INFORMAÇÕES DE PERFIL</Text>
        <TextInput style={styles.input} placeholder="Nome de usuário" placeholderTextColor="#bdbdbd" value={usuario} onChangeText={setUsuario} />
        <TextInput style={styles.input} placeholder="Senha" placeholderTextColor="#bdbdbd" secureTextEntry value={senha} onChangeText={setSenha} />
        <TextInput style={styles.input} placeholder="Confirmação de senha" placeholderTextColor="#bdbdbd" secureTextEntry value={confirmaSenha} onChangeText={setConfirmaSenha} />

        <Text style={styles.sectionLabel}>FOTO DE PERFIL</Text>
        <TouchableOpacity style={styles.photoSquare}>
          <MaterialIcons name="control-point" size={24} color="#757575" />
          <Text style={styles.photoText}>adicionar foto</Text>
        </TouchableOpacity>

        {/* Adicionado o onPress para chamar a função */}
        <TouchableOpacity style={styles.btnFinalizar} onPress={realizarCadastro}>
          <Text style={styles.btnText}>FAZER CADASTRO</Text>
        </TouchableOpacity>
      </View>
      <StatusBar barStyle="dark-content" backgroundColor="#88c9bf" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' }, 
  header: { backgroundColor: '#88c9bf', height: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }, 
  headerTitle: { color: '#434343', fontSize: 20, fontWeight: '500' }, 
  infoBox: { backgroundColor: '#cfe9e5', padding: 15, marginHorizontal: 16, marginTop: 16, borderRadius: 4, minHeight: 80, justifyContent: 'center' },
  infoText: { color: '#434343', fontSize: 14, textAlign: 'center', lineHeight: 20 }, 
  form: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionLabel: { color: '#88c9bf', fontSize: 14, marginTop: 28, marginBottom: 15, fontWeight: '500' }, 
  input: { borderBottomWidth: 0.8, borderBottomColor: '#e6e7e8', paddingVertical: 8, marginBottom: 15, color: '#434343' }, 
  photoSquare: { backgroundColor: '#e6e7e7', width: 128, height: 128, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginTop: 10 }, 
  photoText: { color: '#757575', fontSize: 14 },
  btnFinalizar: { backgroundColor: '#88c9bf', width: 232, height: 40, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginTop: 30, elevation: 2 }, 
  btnText: { color: '#434343', fontSize: 12, fontWeight: 'bold' } 
});