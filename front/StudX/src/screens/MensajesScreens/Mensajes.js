import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  TouchableWithoutFeedback,
  Image,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";

export default function Mensajes({ route }) {
  const { darkMode } = useTheme();
  const navigation = useNavigation();
  const [selectedChatIds, setSelectedChatIds] = useState(new Set());
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) {
        console.error("No se encontró el token");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://44.220.1.21:8080/api/messages?token=${token}`
        );

        if (!response.ok) {
          console.error("Error en la respuesta del servidor:", response.status);
          return;
        }

        if (response.status === 204) {
          setChats([]);
          return;
        }

        const textResponse = await response.text();

        if (textResponse.trim() === "") {
          setChats([]);
          return;
        }

        const data = JSON.parse(textResponse); // Parseamos el JSON
        const sortedMessages = data.chats.sort(
          (a, b) => new Date(b.lastMessageDate) - new Date(a.lastMessageDate)
        );        

        setChats({"chats" : sortedMessages});
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();

    const intervalId = setInterval(fetchChats, 2000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useLayoutEffect(() => {
    if (selectedChatIds.size > 0) {
      navigation.setOptions({
        headerTitle: `${selectedChatIds.size} selected`,
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => setSelectedChatIds(new Set())}
            style={{ marginLeft: 15 }}
          >
            <MaterialIcons name="close" size={28} color="black" />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity onPress={eliminarChats} style={styles.iconButton}>
            <MaterialIcons name="delete" size={28} color="black" />
          </TouchableOpacity>
        ),
      });
    } else {
      navigation.setOptions({
        headerTitle: "Messages",
        headerLeft: null,
        headerRight: null,
      });
    }
  }, [selectedChatIds, navigation]);

  const handleChatPress = (chat) => {
    if (selectedChatIds.size > 0) {
      toggleChatSelection(chat.id);
    } else {
      navigation.navigate("ChatScreen", { profesor: chat.userId });
    }
  };

  const handleChatLongPress = (id) => {
    toggleChatSelection(id);
  };

  const toggleChatSelection = (id) => {
    setSelectedChatIds((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  };

  const eliminarChats = () => {
    setChats(chats.filter((chat) => !selectedChatIds.has(chat.id)));
    setSelectedChatIds(new Set());
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={() => setSelectedChatIds(new Set())}>
      <View
        style={[
          styles.container,
          darkMode ? styles.darkContainer : styles.lightContainer,
        ]}
      >
        <FlatList
          data={chats?.chats?.length > 0 ? chats.chats : null}
          keyExtractor={(item, index) => item.id || `message-${index}`}
          ListEmptyComponent={
            <View style={styles.emptyMessageContainer}>
              <Text
                style={[
                  styles.emptyMessage,
                  darkMode ? styles.darkText : styles.lightText,
                ]}
              >
                No hay chats disponibles.
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleChatPress(item)}
              onLongPress={() => handleChatLongPress(item.id)}
              style={[
                styles.chatWrapper,
                darkMode ? styles.darkChatWrapper : styles.lightChatWrapper,
                selectedChatIds.has(item.id) && styles.selectedChat,
              ]}
            >
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: item.userProfilePicture }}
                  style={styles.profileImage}
                />
                {selectedChatIds.has(item.id) && (
                  <View style={styles.checkOverlay}>
                    <MaterialIcons name="check" size={24} color="white" />
                  </View>
                )}
              </View>
              <View style={styles.chatTextContainer}>
                <Text
                  style={[
                    styles.chatTitle,
                    darkMode ? styles.darkText : styles.lightText,
                  ]}
                >
                  {item.userName}
                </Text>
                <Text
                  style={[
                    styles.lastMessage,
                    darkMode ? styles.darkSubText : styles.lightSubText,
                  ]}
                >
                  {item.lastMessage}
                  {/* {item.messages.length > 0 ? item.messages[item.messages.length - 1]?.text : "New Chat"} */}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  darkContainer: { backgroundColor: "#111" },
  lightContainer: { backgroundColor: "#fff" },
  chatWrapper: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderRadius: 8,
  },
  darkChatWrapper: { backgroundColor: "#222", borderBottomColor: "#555" },
  lightChatWrapper: { backgroundColor: "white", borderBottomColor: "#ccc" },
  selectedChat: { backgroundColor: "tomato" },
  imageContainer: { position: "relative" },
  profileImage: { width: 50, height: 50, borderRadius: 25 },
  checkOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "green",
    borderRadius: 12,
    padding: 2,
  },
  chatTextContainer: { flex: 1, marginLeft: 10 },
  chatTitle: { fontSize: 16, fontWeight: "bold" },
  lastMessage: { fontSize: 14 },
  darkText: { color: "white" },
  lightText: { color: "black" },
  darkSubText: { color: "lightgray" },
  lightSubText: { color: "gray" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  iconButton: { marginHorizontal: 10 },
});
