import React, { useState, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import Mensaje from "../Components/Mensaje";
import * as ImagePicker from "expo-image-picker";

export default function ChatScreen({ route }) {
  const { profesor } = route.params; // Usamos 'profesor' para obtener el id del chat
  const { darkMode } = useTheme();
  const navigation = useNavigation();
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const flatListRef = useRef(null);
  const socketRef = useRef(null); // Referencia para WebSocket
  const [urlImagen, setUrlImagen] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Para el estado de carga de mensajes
  const [isWebSocketOpen, setIsWebSocketOpen] = useState(false); // Para verificar si WebSocket está abierto

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const imageUrl = await getUserImage(profesor);
        setUrlImagen(imageUrl); // Actualizar el estado con la URL de la imagen
      } catch (error) {
        console.error("Error al obtener la imagen del usuario:", error.message);
      }
    };

    fetchImage();

    // Obtener conversación inicial
    const fetchConversation = async () => {
      try {
        const token = await SecureStore.getItemAsync("userToken"); // Obtén el token de SecureStore
        const email = await SecureStore.getItemAsync("email");

        const response = await fetch(
          `http://44.220.1.21:8080/api/messages/conversation?idUserSender=${email}&idUserRecipient=${profesor}&token=${token}`
        );

        if (!response.ok) {
          throw new Error("Error al obtener la conversación");
        }

        // Verificar si la respuesta es vacía
        const conversationMessages = await response.text(); // Usamos .text() para evitar errores si no es JSON

        // Si no hay mensajes, devolver un array vacío
         if (!conversationMessages.trim()) {
           setMensajes([]); // No hay mensajes, por lo que establecemos el estado como vacío
           setIsLoading(false); // Marcar como no cargando
           return;
         }

        // Si hay mensajes, intentar parsear como JSON
        const parsedMessages = JSON.parse(conversationMessages);

        setMensajes(parsedMessages); // Establecer los mensajes recibidos

        // Hacer scroll al final
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
          setIsLoading(false); // Marcar como no cargando
        }, 100);
      } catch (error) {
        console.error("Error al obtener la conversación:", error.message);
        Alert.alert("Error", "Hubo un problema al obtener la conversación.");
        setIsLoading(false); // Marcar como no cargando
      }
    };

    fetchConversation();

    // Establecer la conexión WebSocket
    const conectarWebSocket = async () => {
      const token = await SecureStore.getItemAsync("userToken"); // Obtén el token de SecureStore
      const email = await SecureStore.getItemAsync("email");

      // Conectar al WebSocket
      socketRef.current = new WebSocket(
        `ws://44.220.1.21:8080/ws?userId=${email}&idUserRecipient=${profesor}&token=${token}`
      );

      // Event Listener para mensajes
      socketRef.current.onmessage = (event) => {
        const mensajeRecibido = JSON.parse(event.data);
        
        // Actualizar el estado correctamente
        if (mensajeRecibido.senderUserId === profesor) {
          // Si el mensaje corresponde al chat actual, agregarlo
          setMensajes((prevMensajes) => [
            ...prevMensajes,
            {
              id: `m${Date.now()}asd`,
              message: mensajeRecibido.text,
              idUserSender: profesor,
            },
          ]);
        }
        // Hacer scroll al final cuando llegue un mensaje
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      };

      // Manejar apertura de conexión
      socketRef.current.onopen = () => {
        console.log("Conexión WebSocket abierta");
        setIsWebSocketOpen(true); // Marcar como WebSocket abierto
      };

      // Manejar cierre de conexión
      socketRef.current.onclose = () => {
        console.log("Conexión WebSocket cerrada");
        setIsWebSocketOpen(false); // Marcar como WebSocket cerrado
      };

      // Manejar errores
      socketRef.current.onerror = (error) => {
        console.log("Error en WebSocket:", error);
        Alert.alert("Error", "Hubo un problema con la conexión WebSocket.");
        setIsWebSocketOpen(false); // Marcar como WebSocket cerrado
      };
    };

    conectarWebSocket();

    // Limpiar la conexión WebSocket cuando el componente se desmonte
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [profesor]);

  const getUserImage = async (email) => {
    try {
      const response = await fetch(
        `http://44.220.1.21:8080/api/users/image?email=${email}`
      );

      if (!response.ok) {
        throw new Error("Usuario no encontrado");
      }

      const data = await response.json();
      const imageUrl = data.urlProfilePicture;
      return imageUrl;
    } catch (error) {
      console.error("Error al obtener la imagen del usuario:", error.message);
    }
  };

  const enviarMensaje = async () => {
    if (nuevoMensaje.trim() === "") return;

    const nuevoMsj = { text: nuevoMensaje, isOwn: true };

    try {
      const token = await SecureStore.getItemAsync("userToken");
      const email = await SecureStore.getItemAsync("email");
      const response = await fetch("http://44.220.1.21:8080/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idUserSender: email,
          idUserRecipient: profesor,
          message: nuevoMensaje,
          typeMessage: "text", // Puedes cambiar el tipo de mensaje si es necesario
          token: token,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al guardar el mensaje");
      }

      const savedMessage = await response.json();

      if (isWebSocketOpen) {
        socketRef.current.send(
          JSON.stringify({
            ...nuevoMsj,
            id: savedMessage.id,
            senderUserId: email,
            recipientUserId: profesor,
          })
        );
      }

      setMensajes((prevMensajes) => [
        ...prevMensajes,
        {
          idUserSender: email,
          message: nuevoMsj.text,
        },
      ]);

      setNuevoMensaje(""); // Limpiar el input después de enviar
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      Alert.alert("Error", "Hubo un problema al enviar el mensaje.");
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: darkMode ? "#121212" : "#fff" },
      ]}
    >
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.botonVolver}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={darkMode ? "white" : "black"}
          />
        </TouchableOpacity>
        <Image source={{ uri: urlImagen }} style={styles.profileImage} />
        <Text
          style={[styles.tituloChat, { color: darkMode ? "white" : "black" }]}
        >
          {profesor}
        </Text>
      </View>

      {isLoading ? (
        <Text style={{ textAlign: "center" }}>Cargando mensajes...</Text>
      ) : (
        <FlatList
          ref={flatListRef}
          data={mensajes}
          keyExtractor={(item, index) => item.id || `message-${index}`}
          renderItem={({ item }) => {
            return <Mensaje mensaje={item} darkMode={darkMode} />;
          }}
        />
      )}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: darkMode ? "#1E1E1E" : "#fff",
            borderColor: darkMode ? "#555" : "#ccc",
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: darkMode ? "#333" : "#fff",
              borderColor: darkMode ? "#555" : "#ccc",
              color: darkMode ? "white" : "black",
            },
          ]}
          placeholder="Write a message..."
          placeholderTextColor={darkMode ? "#aaa" : "#888"}
          value={nuevoMensaje}
          onChangeText={setNuevoMensaje}
        />
        <TouchableOpacity onPress={enviarMensaje} style={styles.botonEnviar}>
          <Ionicons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  headerContainer: {
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 10,
  },
  botonVolver: {
    position: "absolute",
    left: 10,
    top: 10,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 5,
  },
  tituloChat: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  botonEnviar: {
    backgroundColor: "orange",
    padding: 10,
    borderRadius: 20,
  },
});
