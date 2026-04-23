import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function OpsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="arrow-back" size={24} color="#434343" style={{marginRight: 16}} />
        <Text style={styles.headerText}>Cadastro</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.ops}>Ops!</Text>
        <Text style={styles.message}>Você não pode realizar esta ação sem possuir um cadastro.</Text>
        
        <TouchableOpacity style={styles.button} onPress={() => router.push('/cadastro_pessoal')}>
          <Text style={styles.buttonText}>FAZER CADASTRO</Text>
        </TouchableOpacity>

        <Text style={styles.smallText}>Já possui cadastro?</Text>
        
        <TouchableOpacity style={styles.button} onPress={() => router.push('/')}>
          <Text style={styles.buttonText}>FAZER LOGIN</Text>
        </TouchableOpacity>
      </View>
      <StatusBar barStyle="dark-content" backgroundColor="#88c9bf" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: { backgroundColor: '#88c9bf', height: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  headerText: { color: '#434343', fontSize: 20, fontWeight: '500' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  ops: { fontSize: 53, color: '#88c9bf', marginBottom: 50, fontFamily: 'Courgette-Regular' },
  message: { color: '#757575', fontSize: 14, textAlign: 'center', marginBottom: 50 },
  button: { backgroundColor: '#88c9bf', width: 232, height: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 10, elevation: 1 },
  buttonText: { color: '#434343', fontSize: 12, fontWeight: 'bold' },
  smallText: { color: '#757575', fontSize: 12, marginTop: 40, marginBottom: 10 }
});