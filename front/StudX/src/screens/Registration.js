import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Platform
} from "react-native";
import { CommonActions } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { TextInput as PaperTextInput } from "react-native-paper";
import { KeyboardAvoidingView, ScrollView } from "react-native";

export default function Registration({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [university, setUniversity] = useState("");

  const [loading, setLoading] = useState(false);

  const validateEmail = (text) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(text).toLowerCase());
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    setIsValidEmail(validateEmail(value));
  };

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword || !university) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (!isValidEmail) {
      Alert.alert("Error", "Email is not valid.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);

    const userData = {
      name: username,
      email,
      password,
      university,
    };

    try {
      const response = await fetch("http://44.220.1.21:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        Toast.show({
          type: "success",
          position: "bottom",
          text1: "Success",
          text2: "Register completed. Now you can login.",
        });

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Login" }],
          })
        );
      } else {
        const responseText = await response.text();
        Alert.alert(
          "Error",
          responseText || `Error ${response.status}: Failed to register`
        );
      }
    } catch (error) {
      Alert.alert("Error", "Error connecting to server. Check your connection.");
      console.error("Error en el registro:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
          
          <View style={styles.zonaLogo}>
            <Image
              source={require("../images/logoIndividual.png")}
              style={styles.image}
            />
          </View>

          <View style={styles.zonaUsuariContrasenya}>
            
            <PaperTextInput
              style={styles.input}
              placeholder="User"
              placeholderTextColor="#888"
              value={username}
              onChangeText={setUsername}
              mode="flat"
              underlineColor="transparent"
              theme={{ colors: { text: "#000" } }}
            />

            <PaperTextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              mode="flat"
              underlineColor="transparent"
              theme={{ colors: { text: "#000" } }}
              right={
                isValidEmail ? (
                  <PaperTextInput.Icon icon="check" color="green" />
                ) : null
              }
            />

            <PaperTextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              mode="flat"
              underlineColor="transparent"
              theme={{ colors: { text: "#000" } }}
            />

            <PaperTextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#888"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              mode="flat"
              underlineColor="transparent"
              theme={{ colors: { text: "#000" } }}
            />

            <PaperTextInput
              style={styles.input}
              placeholder="University/School"
              placeholderTextColor="#888"
              value={university}
              onChangeText={setUniversity}
              mode="flat"
              underlineColor="transparent"
              theme={{ colors: { text: "#000" } }}
            />
          </View>

          <View style={styles.zonaBoton}>
            {loading ? (
              <ActivityIndicator size="large" color="#000" />
            ) : (
              <TouchableOpacity style={styles.boton} onPress={handleRegister}>
                <Text style={styles.botonTexto}>Register</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  zonaLogo: {
    flex: 3,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  zonaUsuariContrasenya: {
    flex: 2,
    width: "90%",
    alignItems: "center",
    justifyContent: "center",
  },
  zonaBoton: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    width: "100%",
    height: 50,
    marginVertical: 10,
    fontSize: 16,
    backgroundColor: "#fff", 
  },
  boton: {
    backgroundColor: "#000",
    paddingVertical: 20,
    paddingHorizontal: 20,
    width: "70%",
    alignItems: "center",
    borderRadius: 8,
    marginVertical: 10,
  },
  botonTexto: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  image: {
    width: 220,
    height: 220,
    resizeMode: "contain",
    alignSelf: "center",
  },
});
