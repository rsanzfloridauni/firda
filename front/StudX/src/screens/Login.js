import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  ActivityIndicator,
  Platform
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { CommonActions } from "@react-navigation/native";
import { KeyboardAvoidingView, ScrollView } from "react-native";
import { TextInput as PaperTextInput } from "react-native-paper";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);

  const loginWithToken = async () => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      const email = await SecureStore.getItemAsync("email");
      const response = await fetch("http://44.220.1.21:8080/api/auth/loginWithToken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });

      if (response.ok) {
        console.log('Login succesfull');
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "HomeScreen" }],
          })
        );
        return true;
      } else {
        console.log("Failed login");
        return false;
      }
    } catch (error) {
      console.error("Error in request:", error);
    }
    return false;
  };

  useEffect(() => {
    const checkUserSession = async () => {
      const token = await SecureStore.getItemAsync("userToken");
      console.log(loginWithToken());

      if (token && !loginWithToken) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "HomeScreen" }],
          })
        );
      } else {
        setLoading(false);
      }
    };

    checkUserSession();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://44.220.1.21:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const token = await response.text();
        await SecureStore.setItemAsync("userToken", token);
        await SecureStore.setItemAsync("email", email);
        console.log("token: " + token);

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "HomeScreen" }],
          })
        );
      } else {
        const responseText = await response.text();
        Alert.alert("Error", responseText || `Error ${response.status}: Failed to log in`);
      }
    } catch (error) {
      Alert.alert("Error", "Error connecting to server"+error);
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="#000" />
          
          <View style={styles.zonaLogo}>
            <Image source={require("../images/logoIndividual.png")} style={styles.image} />
          </View>

          <View style={styles.zonaUsuariContrasenya}>
            <PaperTextInput
              style={styles.paperInput}
              placeholder="Email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              mode="flat"
              underlineColor="transparent"
              theme={{ colors: { text: "#000", placeholder: "#888" } }}
            />

            <PaperTextInput
              style={styles.paperInput}
              placeholder="Password"
              placeholderTextColor="#888"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              mode="flat"
              underlineColor="transparent"
              theme={{ colors: { text: "#000", placeholder: "#888" } }}
            />
          </View>

          <View style={styles.zonaBoton}>
            <TouchableOpacity style={styles.boton} onPress={handleLogin}>
              <Text style={styles.botonTexto}>Login</Text>
            </TouchableOpacity>

            <Text style={styles.text}>
              If you dont have account you can{" "}
              <TouchableOpacity onPress={() => navigation.navigate("Registration")}>
                <Text style={{ color: "blue" }}>Register</Text>
              </TouchableOpacity>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  },
  zonaUsuariContrasenya: {
    flex: 2,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  zonaBoton: {
    flex: 2,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  paperInput: {
    width: "90%",
    height: 50,
    marginVertical: 10,
    fontSize: 16,
    backgroundColor: "#fff", 
  },
  boton: {
    backgroundColor: "#000000",
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
  text: {
    fontSize: 16,
    color: "black",
    textAlign: "center",
    marginTop: 10,
  },
  image: {
    width: 220,
    height: 220,
    resizeMode: "contain",
    alignSelf: "center",
  },
});
