import { Ionicons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import * as ImagePicker from 'expo-image-picker';
import { addDoc, arrayUnion, collection, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../../src/services/firebaseConfig"; // Removido uploadImage

export default function CadastroAnimal() {
  const navigation = useNavigation();
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [especie, setEspecie] = useState("");
  const [sexo, setSexo] = useState("");
  const [porte, setPorte] = useState("");
  const [idade, setIdade] = useState("");
  const [temperamento, setTemperamento] = useState<string[]>([]);
  const [saude, setSaude] = useState<string[]>([]);
  const [doenca, setDoenca] = useState("");
  const [necessidades, setNecessidades] = useState<string[]>([]);
  const [medicamentos, setMedicamentos] = useState("");
  const [objetos, setObjetos] = useState("");
  const [sobre, setSobre] = useState("");
  
  const [image, setImage] = useState<string | null>(null);

  const onMenuPress = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  // Ajustado para converter foto do animal em Base64
  const pickImage = async (useCamera: boolean) => {
    const result = useCamera 
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.3, base64: true })
      : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.3, base64: true });

    if (!result.canceled && result.assets[0].base64) {
      setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleCadastrarAnimal = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Erro", "Logue para cadastrar.");
      return;
    }

    try {
      // Salva o animal direto com a string da imagem (fotoUrl) no Firestore
      const docRef = await addDoc(collection(db, "animais"), {
        nome, 
        especie, 
        sexo, 
        porte, 
        idade, 
        temperamento, 
        saude, 
        doenca, 
        necessidades, 
        medicamentos, 
        objetos, 
        sobre,
        usuarioId: user.uid,
        fotoUrl: image || "", // Base64 salvo aqui
        dataCadastro: new Date().toISOString()
      });

      // Atualiza a lista de animais no perfil do usuário
      const userRef = doc(db, "usuarios", user.uid);
      await updateDoc(userRef, {
        animais: arrayUnion(docRef.id)
      });

      Alert.alert("Sucesso", "Animal cadastrado!");
      router.replace("/(drawer)/(home)");
    } catch (e: any) { 
      console.log("ERRO AO SALVAR ANIMAL:", e);
      Alert.alert("Erro", "Erro ao salvar: " + e.message); 
    }
  };

  const Selector = ({ label, options, currentEntry, setEntry }: any) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{label}</Text>
      <View style={styles.radioGroup}>
        {options.map((opt: string) => (
          <TouchableOpacity
            key={opt}
            onPress={() => setEntry(opt)}
            style={[
              styles.radioButton,
              currentEntry === opt && styles.radioButtonActive,
            ]}
          >
            <Text
              style={[
                styles.radioText,
                currentEntry === opt && styles.radioTextActive,
              ]}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const toggleSelection = (item: string) => {
    setTemperamento((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };
  const toggleSaude = (item: string) => {
    setSaude((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };
  const toggleNecessidade = (item: string) => {
    setNecessidades((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  const MultiSelector = ({ label, options, currentSelection, onToggle }: any) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{label}</Text>
      <View style={styles.radioGroup}>
        {options.map((opt: string) => {
          const isSelected = currentSelection.includes(opt);
          return (
            <TouchableOpacity
              key={opt}
              onPress={() => onToggle(opt)}
              style={[
                styles.radioButton,
                isSelected && styles.radioButtonActive,
              ]}
            >
              <Text style={[styles.radioText, isSelected && styles.radioTextActive]}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Pressable style={styles.menuPressable} onPress={onMenuPress}>
        <Ionicons name="menu-outline" size={32} color="#88C9BF" />
      </Pressable>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Tem um pet para adoção? Preencha os campos abaixo para cadastrá-lo.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>NOME DO ANIMAL</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome do animal"
          value={nome}
          onChangeText={setNome}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>FOTOS DO ANIMAL</Text>
        <TouchableOpacity 
          style={styles.photoContainer}
          onPress={() => {
            Alert.alert("Foto", "Escolha a fonte:", [
              { text: "Câmera", onPress: () => pickImage(true) },
              { text: "Galeria", onPress: () => pickImage(false) },
              { text: "Cancelar", style: "cancel" }
            ]);
          }}
        >
          {image ? (
            <Image source={{ uri: image }} style={{ width: '100%', height: 128, borderRadius: 4 }} />
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={40} color="#757575" />
              <Text style={styles.photoText}>adicionar fotos</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Selector label="ESPÉCIE" options={["Cachorro", "Gato"]} currentEntry={especie} setEntry={setEspecie} />
      <Selector label="SEXO" options={["Macho", "Fêmea"]} currentEntry={sexo} setEntry={setSexo} />
      <Selector label="PORTE" options={["Pequeno", "Médio", "Grande"]} currentEntry={porte} setEntry={setPorte} />
      <Selector label="IDADE" options={["Filhote", "Adulto", "Idoso"]} currentEntry={idade} setEntry={setIdade} />
      
      <MultiSelector 
        label="TEMPERAMENTO" 
        options={["Brincalhão", "Tímido", "Calmo", "Guarda", "Amoroso", "Preguiçoso"]} 
        currentSelection={temperamento} 
        onToggle={toggleSelection}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SAÚDE</Text>
        <View style={styles.radioGroup}>
          {["Vermifugado", "Vacinado", "Castrado", "Doente"].map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => toggleSaude(item)}
              style={[styles.radioButton, saude.includes(item) && styles.radioButtonActive]}
            >
              <Text style={[styles.radioText, saude.includes(item) && styles.radioTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          editable={saude.includes("Doente")}
          style={[styles.input, { marginTop: 10 }]}
          placeholder="Doenças do animal"
          value={doenca}
          onChangeText={setDoenca}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>NECESSIDADES DO ANIMAL</Text>
        <View style={styles.radioGroupV}>
          {["Alimento", "Auxílio financeiro", "Medicamento"].map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => toggleNecessidade(item)}
              style={[styles.radioButton, necessidades.includes(item) && styles.radioButtonActive]}
            >
              <Text style={[styles.radioText, necessidades.includes(item) && styles.radioTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          editable={necessidades.includes("Medicamento")}
          style={[styles.input, { marginTop: 10 }]}
          placeholder="Nome do medicamento"
          value={medicamentos}
          onChangeText={setMedicamentos}
        />
        <View style={styles.radioGroup}>
          <TouchableOpacity
            onPress={() => toggleNecessidade("Objetos")}
            style={[styles.radioButton, necessidades.includes("Objetos") && styles.radioButtonActive]}
          >
            <Text style={[styles.radioText, necessidades.includes("Objetos") && styles.radioTextActive]}>Objetos</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          editable={necessidades.includes("Objetos")}
          style={styles.input}
          placeholder="Especifique o(s) objeto(s)"
          value={objetos}
          onChangeText={setObjetos}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SOBRE O ANIMAL</Text>
        <TextInput
          style={styles.input}
          placeholder="Compartilhe a história do animal"
          value={sobre}
          onChangeText={setSobre}
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleCadastrarAnimal}>
        <Text style={styles.submitButtonText}>COLOCAR PARA ADOÇÃO</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ... Estilos permanecem os mesmos ...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  menuPressable: { alignSelf: "flex-start", paddingTop: 10, paddingLeft: 14 },
  infoBox: { backgroundColor: "#CFE9E5", padding: 16, margin: 16, borderRadius: 4 },
  infoText: { color: "#434343", fontSize: 14, textAlign: "center" },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { color: "#F7A800", fontSize: 12, marginBottom: 8 },
  input: { borderBottomWidth: 1, borderBottomColor: "#BDBDBD", paddingVertical: 8 },
  photoContainer: { height: 128, backgroundColor: "#E6E7E8", justifyContent: "center", alignItems: "center", borderRadius: 4, elevation: 2 },
  photoText: { color: "#757575" },
  radioGroup: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
  radioGroupV: { flexDirection: "column", gap: 10, marginTop: 8 },
  radioButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 4, backgroundColor: "#EDEEF0", alignItems: "center" },
  radioButtonActive: { backgroundColor: "#F7A800" },
  radioText: { color: "#757575" },
  radioTextActive: { color: "#FFFFFF" },
  submitButton: { backgroundColor: "#F7A800", margin: 16, padding: 12, alignItems: "center", borderRadius: 2, elevation: 2, marginBottom: 40 },
  submitButtonText: { color: "#434343", fontWeight: "bold" },
});