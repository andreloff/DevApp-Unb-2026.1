import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CadastroAnimal() {
  const [nome, setNome] = useState("");

  const [especie, setEspecie] = useState();
  const [sexo, setSexo] = useState();
  const [porte, setPorte] = useState();
  const [idade, setIdade] = useState();
  const [temperamento, setTemperamento] = useState<string[]>([]);
  const [saude, setSaude] = useState<string[]>([]);
  const [doenca, setDoenca] = useState("");
  const [necessidades, setNecessidades] = useState<string[]>([]);
  const [medicamentos, setMedicamentos] = useState("");
  const [objetos, setObjetos] = useState("");
  const [outros, setOutros] = useState("");

  const [sobre, setSobre] = useState("");

  //função pra deixar os botoes renderizados de forma correta
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
  //funcao pra ver se ja tem o item (multipla seleção), se nao tiver, adiciona, se tiver remove
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
  //função de multiseleção
  const MultiSelector = ({ label, options, currentSelection }: any) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{label}</Text>
      <View style={styles.radioGroup}>
        {options.map((opt: string) => {
          const isSelected = currentSelection.includes(opt);
          return (
            <TouchableOpacity
              key={opt}
              onPress={() => toggleSelection(opt)}
              style={[
                styles.radioButton,
                isSelected && styles.radioButtonActive,
              ]}
            >
              <Text
                style={[styles.radioText, isSelected && styles.radioTextActive]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView style={styles.container}>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Tem um pet para adoção? Preencha os campos abaixo para cadastrá-lo.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOME DO ANIMAL</Text>
          <TextInput
            style={[styles.input, { opacity: nome.length > 0 ? 1 : 0.5 }]}
            placeholder="Nome do animal"
            //placeholderTextColor="#bdbdbd"
            value={nome}
            onChangeText={setNome}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FOTOS DO ANIMAL</Text>
          <TouchableOpacity style={styles.photoContainer}>
            <Ionicons name="add-circle-outline" size={40} color="#757575" />
            <Text style={styles.photoText}>adicionar fotos</Text>
          </TouchableOpacity>
        </View>

        {/* Seletores Dinâmicos */}
        <Selector
          label="ESPÉCIE"
          options={["Cachorro", "Gato"]}
          currentEntry={especie}
          setEntry={setEspecie}
        />

        <Selector
          label="SEXO"
          options={["Macho", "Fêmea"]}
          currentEntry={sexo}
          setEntry={setSexo}
        />

        <Selector
          label="PORTE"
          options={["Pequeno", "Médio", "Grande"]}
          currentEntry={porte}
          setEntry={setPorte}
        />

        <Selector
          label="IDADE"
          options={["Filhote", "Adulto", "Idoso"]}
          currentEntry={idade}
          setEntry={setIdade}
        />
        <MultiSelector
          label="TEMPERAMENTO"
          options={[
            "Brincalhão",
            "Tímido",
            "Calmo",
            "Guarda",
            "Amoroso",
            "Preguiçoso",
          ]}
          currentSelection={temperamento}
        />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SAÚDE</Text>
          <View style={styles.radioGroup}>
            {["Vermifugado", "Vacinado", "Castrado", "Doente"].map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => toggleSaude(item)}
                style={[
                  styles.radioButton,
                  saude.includes(item) && styles.radioButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.radioText,
                    saude.includes(item) && styles.radioTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.detailsContainer}>
            <TextInput
              style={[styles.input, { opacity: doenca.length > 0 ? 1 : 0.5 }]}
              placeholder="Doenças do animal"
              value={doenca}
              onChangeText={setDoenca}
            />
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NECESSIDADES DO ANIMAL</Text>
          <View style={styles.radioGroupV}>
            {["Alimento", "Auxílio financeiro", "Medicamento"].map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => toggleNecessidade(item)}
                style={[
                  styles.radioButton,
                  necessidades.includes(item) && styles.radioButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.radioText,
                    necessidades.includes(item) && styles.radioTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.detailsContainer}>
            <TextInput
              style={[
                styles.input,
                { opacity: medicamentos.length > 0 ? 1 : 0.5 },
              ]}
              placeholder="Nome do medicamento"
              value={medicamentos}
              onChangeText={setMedicamentos}
            />
          </View>
          <View style={styles.radioGroup}>
            {["Objetos"].map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => toggleNecessidade(item)}
                style={[
                  styles.radioButton,
                  necessidades.includes(item) && styles.radioButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.radioText,
                    necessidades.includes(item) && styles.radioTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.detailsContainer}>
            <TextInput
              style={[styles.input, { opacity: objetos.length > 0 ? 1 : 0.5 }]}
              placeholder="Especifique o(s) objeto(s)"
              value={objetos}
              onChangeText={setObjetos}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SOBRE O ANIMAL</Text>
          <TextInput
            style={[styles.input, { opacity: sobre.length > 0 ? 1 : 0.5 }]}
            placeholder="Compartilhe a história do animal"
            //placeholderTextColor="#bdbdbd"
            value={sobre}
            onChangeText={setSobre}
          />
        </View>

        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitButtonText}>COLOCAR PARA ADOÇÃO</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  safeArea: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  detailsContainer: {
    marginTop: 10,
    gap: 10,
  },
  infoBox: {
    backgroundColor: "#CFE9E5",
    padding: 16,
    margin: 16,
    borderRadius: 4,
  },
  infoText: {
    fontFamily: "Roboto_400Regular",
    color: "#434343",
    fontSize: 14,
    textAlign: "center",
  },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: {
    fontFamily: "Roboto_400Regular",
    color: "#F7A800",
    fontSize: 12,
    marginBottom: 8,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#BDBDBD",
    paddingVertical: 8,
    //opacity: 0.3,
    fontFamily: "Roboto_400Regular",
  },
  photoContainer: {
    height: 128,
    backgroundColor: "#E6E7E8",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    elevation: 2,
  },
  photoText: { fontFamily: "Roboto_400Regular", color: "#757575" },
  radioGroup: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
  radioGroupV: {
    flexDirection: "column",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  radioButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: "#EDEEF0", // Cor desativada
    //minWidth: 80,
    alignItems: "center",
  },
  radioButtonActive: {
    backgroundColor: "#F7A800", // Cor quando selecionado
  },
  radioText: {
    fontFamily: "Roboto_400Regular",
    color: "#757575",
  },
  radioTextActive: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  submitButton: {
    backgroundColor: "#F7A800",
    margin: 16,
    padding: 12,
    alignItems: "center",
    borderRadius: 2,
    elevation: 2,
    marginBottom: 40,
  },
  submitButtonText: {
    fontFamily: "Roboto_400Regular",
    color: "#434343",
    fontWeight: "bold",
  },
});
