import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  Animated,
  Dimensions,
  ScrollView,
  PixelRatio,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useTheme } from "../../context/ThemeContext";
import ExchangeTarget from "./components/ExchangeTarget"; 
import OwnExchangesTarget from "./components/OwnExchangesTarget"; 
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const API_URL = "http://44.220.1.21:8080/api/exchanges";
const USER_API_URL = "http://44.220.1.21:8080/api/users/me";

const { width } = Dimensions.get("window");
const scaleFont = (size) => (width / 375) * size;

export default function Home() {
  const { darkMode } = useTheme();
  const navigation = useNavigation();

  const [exchanges, setExchanges] = useState([]);
  const [myExchanges, setMyExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [userName, setUserName] = useState("Usuario");
  const [userEmail, setUserEmail] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchUserData();
    fetchExchanges();
  }, []);

  useEffect(() => {
    fetchMyExchanges();
  }, [userEmail]);

  const fetchUserData = async () => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      const email = await SecureStore.getItemAsync("email");
      if (!token || !email) {
        console.log("⚠ No token or email saved.");
        return;
      }
      setUserEmail(email);
      const response = await fetch(`${USER_API_URL}?token=${token}`);
      if (response.ok) {
        const data = await response.json();
        setUserName(data.name || "Usuario");
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      } else {
        console.log("⚠ Error getting user:", response.status);
      }
    } catch (error) {
      console.log("⚠ Could not connect to the server to get the user.");
    }
  };

  const fetchExchanges = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        console.log("⚠ Error in server response:", response.status);
        throw new Error("Error in server response");
      }
      const data = await response.json();
      setExchanges(data);
      setError(false);
    } catch (error) {
      console.log("⚠ Could not connect to server to get exchanges.");
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMyExchanges = async () => {
    if (!userEmail) return;
    try {
      const response = await fetch(`${API_URL}?userId=${userEmail}`);
      if (!response.ok) {
        console.log("⚠ Error getting user exchanges:", response.status);
        throw new Error("Error in server response");
      }
      const data = await response.json();
      setMyExchanges(data);
    } catch (error) {
      console.log("⚠ Failed to get user exchanges.");
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchExchanges();
    fetchMyExchanges();
  };

  const handleDeleteSuccess = (deletedId) => {
    setMyExchanges((prev) => prev.filter((ex) => ex.id !== deletedId));
    fetchExchanges();
  };


  const renderMyExchangeItem = useCallback(({ item }) => {
    return (
      <OwnExchangesTarget
        alumnos={item.quantityStudents}
        nivel={item.academicLevel.toString()}
        idiomaDeseado={item.targetLanguage}
        idioma={item.nativeLanguage}
        exchangeId={item.id}
        onDeleteSuccess={handleDeleteSuccess}
        onRefresh={onRefresh}
      />
    );
  }, [handleDeleteSuccess, onRefresh]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: darkMode ? "#111" : "#f2f2f2", width },
      ]}
    >
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Animated.View style={[styles.welcomeContainer, { opacity: fadeAnim }]}>
          <Text style={[styles.welcomeText, { color: darkMode ? "white" : "black" }]}>
            ¡Welcome <Text style={styles.userName}>{userName}</Text>!
          </Text>
        </Animated.View>

        {loading ? (
          <ActivityIndicator size="large" color="#ffffff" style={styles.loader} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: darkMode ? "white" : "black" }]}>
              There is no connection to the server.
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            <Text style={[styles.exchangesAvailable, { color: darkMode ? "white" : "black" }]}>
              Exchanges Available
            </Text>

            <FlatList
              data={[...exchanges].reverse()}
              keyExtractor={(item) => item.id}
              horizontal
              renderItem={({ item }) => (
                <ExchangeTarget
                  centro={item.university}
                  profesor={item.idTeacherCreator}
                  alumnos={item.quantityStudents}
                  nivel={item.academicLevel.toString()}
                  idiomaDeseado={item.targetLanguage}
                  idioma={item.nativeLanguage}
                  onChatPress={() =>
                    navigation.navigate("ChatScreen", {
                      profesor: item.idTeacherCreator,
                    })
                  }
                />
              )}
              contentContainerStyle={styles.listContent}
              showsHorizontalScrollIndicator={false}
              initialNumToRender={5}
              windowSize={3}
              maxToRenderPerBatch={5}
            />

            <Text style={[styles.exchangesAvailable, { color: darkMode ? "white" : "black" }]}>
              My Exchanges
            </Text>
            {myExchanges.length === 0 ? (
              <View style={styles.noExchangesContainer}>
                <Text
                  style={[
                    styles.noExchangesText,
                    { color: darkMode ? "#FFF" : "#000" },
                  ]}
                >
                  You don't have exchanges, create one!
                </Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => navigation.navigate("Crear Intercambios")}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={PixelRatio.getPixelSizeForLayoutSize(12)}
                    color={darkMode ? "white" : "black"}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={[...myExchanges].reverse()}
                keyExtractor={(item) => item.id}
                horizontal
                renderItem={renderMyExchangeItem} 
                contentContainerStyle={styles.listContent}
                showsHorizontalScrollIndicator={false}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                initialNumToRender={5}
                windowSize={3}
                maxToRenderPerBatch={5}
              />
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    alignItems: "center",
    paddingBottom: 20,
  },
  welcomeContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: scaleFont(26),
    fontWeight: "bold",
    textAlign: "center",
  },
  userName: {
    color: "#FFD700",
    fontSize: scaleFont(26),
    fontWeight: "bold",
  },
  exchangesAvailable: {
    fontSize: scaleFont(22),
    fontWeight: "bold",
    marginBottom: 10,
    alignSelf: "flex-start",
    marginLeft: 18,
  },
  listContent: {
    alignItems: "center",
    paddingBottom: 20,
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: scaleFont(18),
    fontWeight: "bold",
  },
  noExchangesContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  noExchangesText: {
    fontSize: scaleFont(16),
    marginBottom: 10,
    textAlign: "center",
  },
  createButton: {},
  loader: {
    marginTop: 20,
  },
});
