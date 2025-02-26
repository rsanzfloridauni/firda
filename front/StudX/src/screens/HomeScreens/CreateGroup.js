import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";

export default function CreateGroup({ onClose }) {
  const [name, setName] = useState("");
  const [nivel, setNivel] = useState(null);
  // Guardamos la cantidad como texto para permitir que el usuario borre todo
  const [quantity, setQuantity] = useState("");
  const [language, setLanguage] = useState("");
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("userToken");
        if (!storedToken) {
          Alert.alert("Error", "There is no active session.");
          return;
        }
        setToken(storedToken);
      } catch (error) {
        console.log("Error getting token:", error);
      }
    };
    fetchToken();
  }, []);

  /**
   * Lógica para alternar entre A1→A2→null, B1→B2→null, C1→C2→null
   * de forma similar a CreatedExchange.
   */
  const handleNivelPress = (selectedNivel) => {
    if (nivel === selectedNivel) {
      // Si ya estamos en A1 y pulsamos otra vez A1 → pasamos a A2
      // Si ya estamos en A2 y pulsamos A1 → pasamos a null
      // (Idéntico para B1/B2 y C1/C2)
      switch (selectedNivel) {
        case "A1":
          setNivel("A2");
          break;
        case "A2":
          setNivel(null);
          break;
        case "B1":
          setNivel("B2");
          break;
        case "B2":
          setNivel(null);
          break;
        case "C1":
          setNivel("C2");
          break;
        case "C2":
          setNivel(null);
          break;
        default:
          setNivel(null);
      }
    } else {
      // Si estamos en un nivel diferente o en null, al pulsar A1 pasamos a "A1"
      // (similar para B1 y C1)
      setNivel(selectedNivel);
    }
  };

  const handleSave = async () => {
    // Validaciones
    if (!name || !language || !nivel) {
      Alert.alert("Error", "All fields are required.");
      return;
    }
    if (!token) {
      Alert.alert("Error", "Could not get authentication token.");
      return;
    }

    // Convertimos el texto de quantity a número
    const numStudents = parseInt(quantity, 10);
    if (!numStudents || numStudents <= 0) {
      Alert.alert("Error", "Number of students must be greater than 0.");
      return;
    }

    const apiUrl = "http://44.220.1.21:8080/api/groups";
    const data = {
      name,
      // A1 / A2 / B1 / B2 / C1 / C2 (o null)
      level: nivel,
      quantity: numStudents,
      language,
      token,
    };

    try {
      console.log("Sending data:", data);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        Alert.alert("Success", "Group created successfully");
        onClose(); // Cierra la pantalla/modal
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Could not create group");
      }
    } catch (error) {
      Alert.alert("Connection error", error.message);
    }
  };

  // Determina si la burbuja de A/B/C está en su 1er o 2do nivel
  // y asigna el color correspondiente
  const getCircleStyle = (type) => {
    // type: "A", "B", "C"
    // Compara con nivel para ver si estamos en A1, A2, etc.
    switch (type) {
      case "A":
        if (nivel === "A1") return styles.lightGreenA1; // Verde clarito
        if (nivel === "A2") return styles.lightGreenA2; // Verde más oscuro
        return {}; // #ccc
      case "B":
        if (nivel === "B1") return styles.lightYellowB1; // Amarillo clarito
        if (nivel === "B2") return styles.lightYellowB2; // Amarillo más oscuro
        return {};
      case "C":
        if (nivel === "C1") return styles.lightRedC1; // Rojo clarito
        if (nivel === "C2") return styles.lightRedC2; // Rojo más oscuro
        return {};
      default:
        return {};
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.label}>Group Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter the group name"
        />

        <Text style={styles.label}>
          Level {nivel ? `(${nivel.toUpperCase()})` : ""}
        </Text>
        <View style={styles.trafficLight}>
          {/* Al pulsar la burbuja "A", si estamos en A1 o A2, sigue la secuencia, si no, pasa a A1 */}
          <TouchableOpacity
            style={[styles.light, getCircleStyle("A")]}
            onPress={() => {
              if (nivel === "A1" || nivel === "A2") {
                handleNivelPress(nivel);
              } else {
                handleNivelPress("A1");
              }
            }}
          />

          {/* B */}
          <TouchableOpacity
            style={[styles.light, getCircleStyle("B")]}
            onPress={() => {
              if (nivel === "B1" || nivel === "B2") {
                handleNivelPress(nivel);
              } else {
                handleNivelPress("B1");
              }
            }}
          />

          {/* C */}
          <TouchableOpacity
            style={[styles.light, getCircleStyle("C")]}
            onPress={() => {
              if (nivel === "C1" || nivel === "C2") {
                handleNivelPress(nivel);
              } else {
                handleNivelPress("C1");
              }
            }}
          />
        </View>

        <Text style={styles.label}>Number of Students</Text>
        <TextInput
          style={styles.input}
          value={quantity}
          onChangeText={(text) => {
            // Solo permitimos dígitos y dejamos que el usuario borre
            const sanitized = text.replace(/[^0-9]/g, "");
            setQuantity(sanitized);
          }}
          placeholder="Enter number of students"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Language</Text>
        <TextInput
          style={styles.input}
          value={language}
          onChangeText={setLanguage}
          placeholder="Enter the Language"
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 20,
  },
  label: {
    fontSize: 16,
    color: "#000",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  trafficLight: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    marginBottom: 15,
  },
  light: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ccc",
  },

  // Verde clarito A1
  lightGreenA1: {
    backgroundColor: "#A8E6A2",
  },
  // Verde oscuro A2
  lightGreenA2: {
    backgroundColor: "#4CAF50",
  },
  // Amarillo clarito B1
  lightYellowB1: {
    backgroundColor: "#FFEE99",
  },
  // Amarillo oscuro B2
  lightYellowB2: {
    backgroundColor: "#FFCC00",
  },
  // Rojo clarito C1
  lightRedC1: {
    backgroundColor: "#FFB3B3",
  },
  // Rojo oscuro C2
  lightRedC2: {
    backgroundColor: "#FF3B30",
  },

  saveButton: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 40,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
