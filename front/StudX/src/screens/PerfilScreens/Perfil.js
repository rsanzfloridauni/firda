import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  Dimensions,
  ImageBackground,
  TouchableOpacity
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { Avatar, IconButton } from "react-native-paper";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

export default function Perfil() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "Profile"
    });
  }, [navigation]);

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useTheme();

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) {
        console.log("There is no active session.");
        setUserData(null);
        return;
      }

      const response = await fetch(
        `http://44.220.1.21:8080/api/users/me?token=${token}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setUserData(data);
      } else {
        console.log("Error: Could not get user information.");
        setUserData(null);
      }
    } catch (error) {
      console.log("Error getting user data:", error);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.fotosContainer}>
        <ImageBackground
          source={{
            uri: userData?.urlHeaderPicture || "https://picsum.photos/200/200"
          }}
          style={styles.coverImage}
        >
          <View style={styles.avatarWrapper}>
            <Avatar.Image
              size={width * 0.3}
              source={{
                uri: userData?.urlProfilePicture || "https://picsum.photos/200/200"
              }}
            />
          </View>
        </ImageBackground>
      </View>

      <View
        style={[
          styles.infoContainer,
          { backgroundColor: darkMode ? "#111" : "#fff" }
        ]}
      >
        <ScrollView>
          <Text
            style={[
              styles.label,
              { color: darkMode ? "white" : "black", width: width * 0.9, maxWidth: 400 }
            ]}
          >
            Name
          </Text>
          <Text style={[styles.info, { color: darkMode ? "#BBB" : "#666" }]}>
            {userData?.name || "Not available"}
          </Text>

          <Text
            style={[
              styles.label,
              { color: darkMode ? "white" : "black", width: width * 0.9, maxWidth: 400 }
            ]}
          >
            Email
          </Text>
          <Text style={[styles.info, { color: darkMode ? "#BBB" : "#666" }]}>
            {userData?.email || "Not available"}
          </Text>

          <Text
            style={[
              styles.label,
              { color: darkMode ? "white" : "black", width: width * 0.9, maxWidth: 400 }
            ]}
          >
            University
          </Text>
          <Text style={[styles.info, { color: darkMode ? "#BBB" : "#666" }]}>
            {userData?.university || "Not available"}
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.save}
              onPress={() => {
              
                navigation.navigate("Editar Perfil");
              }}
            >
              <Text style={styles.saveButt}>Edit</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "red"
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  fotosContainer: {
    width: "100%",
    flex: 35
  },
  infoContainer: {
    flex: 65,
    paddingHorizontal: 15
  },
  coverImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    justifyContent: "center"
  },
  avatarWrapper: {
    position: "absolute",
    left: 0,
    bottom: 0,
    alignItems: "flex-start",
    padding: 10
  },
  label: {
    fontSize: 16,
    color: "#000",
    marginBottom: 5,
    marginTop: 20
  },
  info: {
    fontSize: 16,
    marginBottom: 10
  },

  buttonContainer: {
    marginTop: 120,
    marginBottom: 70,
    alignItems: "center" 
  },
  save: {
    backgroundColor: "black",
    borderRadius: 40,
    width: 200,
    height: 50,
    alignItems: "center",
    justifyContent: "center"
  },
  saveButt: {
    color: "white"
  }
});
