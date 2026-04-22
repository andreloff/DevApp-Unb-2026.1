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

export default function CadastroAnimal() {
  const [nome, setNome] = useState("");

  return (
    <ScrollView style={styles.container}>
      {/* Header informativo */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Tenho um pet para doação? Preencha os campos abaixo para cadastrá-lo.
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
        <TouchableOpacity style={styles.photoContainer}>
          <Ionicons name="add-circle-outline" size={40} color="#757575" />
          <Text style={styles.photoText}>adicionar fotos</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ESPÉCIE</Text>
        <View style={styles.radioGroup}>
          <View style={styles.radioButton}>
            <Text style={styles.radioText}>Cachorro</Text>
          </View>
          <View style={styles.radioButton}>
            <Text style={styles.radioText}>Gato</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SEXO</Text>
        <View style={styles.radioGroup}>
          <View style={styles.radioButton}>
            <Text style={styles.radioText}>Macho</Text>
          </View>
          <View style={styles.radioButton}>
            <Text style={styles.radioText}>Fêmea</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PORTE</Text>
        <View style={styles.radioGroup}>
          <View style={styles.radioButton}>
            <Text style={styles.radioText}>Pequeno</Text>
          </View>
          <View style={styles.radioButton}>
            <Text style={styles.radioText}>Médio</Text>
          </View>
          <View style={styles.radioButton}>
            <Text style={styles.radioText}>Grande</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.submitButton}>
        <Text style={styles.submitButtonText}>COLOCAR PARA ADOÇÃO</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
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
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
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
  photoText: {
    fontFamily: "Roboto_400Regular",
    color: "#757575",
  },
  radioGroup: {
    flexDirection: "row",
    gap: 10,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioText: {
    fontFamily: "Roboto_400Regular",
    marginLeft: 8,
    color: "#757575",
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
