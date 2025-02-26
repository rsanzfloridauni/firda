import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, CommonActions } from "@react-navigation/native";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  Image,
  PixelRatio,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useTheme } from "../../context/ThemeContext";
import Home from "../HomeScreens/Home";
import Perfil2 from "../PerfilScreens/Perfil";
import Busqueda from "../BusquedaScreens/Busqueda";
import Mensajes from "../MensajesScreens/Mensajes";
import CreateGroup from "./CreateExchange";

const Tab = createBottomTabNavigator();
const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  const { darkMode, setDarkMode } = useTheme();
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const modo = darkMode ? "Light Mode" : "Dark Mode";

  const handleLogout = async () => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      const email = await SecureStore.getItemAsync("email");

      if (!token) {
        Alert.alert("Error", "There is no active session.");
        return;
      }

      const response = await fetch("http://44.220.1.21:8080/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, token }),
      });

      if (response.ok) {
        await SecureStore.deleteItemAsync("userToken");
        await SecureStore.deleteItemAsync("email");

        Alert.alert("Succes", "Successful logout");

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Login" }], 
          })
        );
      } else {
        const responseText = await response.text();
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Login" }], 
          })
        );
        Alert.alert("Error", responseText || `Error ${response.status}: Failed to log out successfully`);
      }
    } catch (error) {
      Alert.alert("Error", "Error connecting to server");
      console.error("Error on logout:", error);
    }
  };

  

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: darkMode ? "#222" : "#fff" },
          headerTintColor: darkMode ? "#fff" : "#000",
          headerTitleAlign: "left",
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Image
                source={darkMode ? require("../../images/Logos/StudXBlanco.png") : require("../../images/Logos/StudX.png")}
                style={[styles.headerLogo, { width: width * 0.1, height: height * 0.05 }]}
              />
              <Text style={[styles.headerTitleText, { color: darkMode ? "white" : "black" }]}>{route.name}</Text>
            </View>
          ),
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              <TouchableOpacity onPress={() => navigation.navigate("Crear Grupos")} style={styles.groupButton}>
                <Ionicons name="people-outline" size={PixelRatio.getPixelSizeForLayoutSize(12)} color={darkMode ? "white" : "black"} />
              </TouchableOpacity>

             
              <TouchableOpacity onPress={() => navigation.navigate("Crear Intercambios")} style={styles.addButton}>
                <Ionicons name="add-circle-outline" size={PixelRatio.getPixelSizeForLayoutSize(12)} color={darkMode ? "white" : "black"} />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)} style={styles.menuButton}>
                <Ionicons name="ellipsis-vertical" size={PixelRatio.getPixelSizeForLayoutSize(8)} color={darkMode ? "white" : "black"} />
              </TouchableOpacity>

              {menuVisible && (
                <View style={[styles.menuDropdown, { backgroundColor: darkMode ? "#333" : "white", right: 0 }]}>
                  <TouchableOpacity style={styles.menuItem} onPress={() => { setDarkMode(!darkMode); setMenuVisible(false); }}>
                    <Text style={{ color: darkMode ? "white" : "black", fontSize: width * 0.04 }}>{modo}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                    <Text style={{ color: darkMode ? "white" : "black", fontSize: width * 0.04 }}>Logout</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ),
          tabBarStyle: {
            backgroundColor: darkMode ? "#222" : "#fff",
            borderTopWidth: 0,
          },
          tabBarPressColor: "transparent",
          tabBarButton: (props) => (
            <TouchableOpacity {...props} activeOpacity={1} onPress={() => { setMenuVisible(false); props.onPress(); }} />
          ),
          tabBarIcon: ({ color, size, focused }) => {
            let iconName;
            if (route.name === "Home") iconName = "home-outline";
            else if (route.name === "Busqueda") iconName = "search-outline";
            else if (route.name === "Mensajes") iconName = "chatbubble-outline";
            else if (route.name === "Perfil") iconName = "person-outline";

            return <Ionicons name={iconName} size={size} color={focused ? (darkMode ? "#FFA500" : "tomato") : darkMode ? "white" : color} />;
          },
          tabBarActiveTintColor: darkMode ? "#FFA500" : "tomato",
          tabBarInactiveTintColor: darkMode ? "lightgray" : "gray",
          tabBarShowLabel: false,
        })}
      >
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Busqueda" component={Busqueda} />
        <Tab.Screen name="Mensajes" component={Mensajes} />
        <Tab.Screen name="Perfil" component={Perfil2} />
      </Tab.Navigator>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: width * 0.03,
  },
  addButton: {
    marginRight: width * 0.05,
  },
  groupButton:{
    marginRight: width * 0.05,
  },
  menuButton: {
    padding: width * 0.015, 
  },
  menuContainer: {
    position: "relative",
    alignItems: "flex-end",
  },
  menuDropdown: {
    position: "absolute",
    top: height * 0.05,
    padding: width * 0.02,
    borderRadius: 8,
    minWidth: width * 0.4,
    elevation: 5,
    alignSelf: "flex-end",
    right: 0,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitleText: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    marginLeft: 10,
  },
  headerLogo: {
    resizeMode: "contain",
  },
  menuItem: {
    paddingVertical: height * 0.015,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
});
