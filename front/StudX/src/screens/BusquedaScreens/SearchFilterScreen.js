import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Toast from "react-native-toast-message";
import { useFilters } from "../../context/FiltersContext";

// Example prompts for exchange filters
const examplePrompts = [
  {
    prompt: "Show me exchanges for English to Spanish",
    filters: { nativeLanguage: "English", targetLanguage: "Spanish" },
  },
  {
    prompt: "What exchanges are available for high school students?",
    filters: { educationalLevel: "High School" },
  },
  {
    prompt: "Find exchanges for university students in Germany",
    filters: { university: "Germany", educationalLevel: "University" },
  },
  {
    prompt: "I need exchanges with a minimum of 5 students",
    filters: { quantityStudentsMin: 5 },
  },
  {
    prompt: "What exchanges are available for beginner-level learners?",
    filters: { academicLevel: "Beginner" },
  },
  {
    prompt: "Can you find exchanges starting in the summer?",
    filters: { beginDate: "2025-06-01" },
  },
  {
    prompt:
      "I want exchanges for English speakers with a maximum of 20 students",
    filters: { nativeLanguage: "English", quantityStudentsMax: 20 },
  },
];

const OPENAI_API_KEY = require("../../api.json").key;

export default function ChatScreen({ navigation, route }) {
  const [userInput, setUserInput] = useState(""); // State to store user input
  const [isTyping, setIsTyping] = useState(false); // State to simulate typing indicator
  const [title, setTitle] = useState(""); // State to store title text
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0); // To keep track of the current prompt index
  const { setFilters } = useFilters(); // Usamos la función de actualización del contexto

  useEffect(() => {
    const showNextPrompt = (index) => {
      const prompt = examplePrompts[index].prompt; // Obtén el siguiente prompt
      let charIndex = 0;
      let interval = setInterval(() => {
        charIndex++;
        setTitle(prompt.substring(0, charIndex));
        if (charIndex === prompt.length) {
          clearInterval(interval);

          // Set a timeout to wait 5 seconds before showing the next prompt
          setTimeout(() => {
            // Show the next prompt after 5 seconds
            if (index < examplePrompts.length - 1) {
              showNextPrompt(index + 1); // Recursively call the function for the next prompt
            }
          }, 5000); // 5000 ms = 5 seconds
        }
      }, 100); // Speed of typing (100ms per character)
    };

    showNextPrompt(0); // Start with the first prompt
  }, []);

  const handleSend = async () => {
    if (userInput.trim()) {
      try {
        // Proporcionar el contexto detallado al modelo
        const systemMessage = {
          role: "system",
          content: `
            El usuario está buscando intercambios y puede aplicar varios filtros en su consulta. Los filtros posibles son:
            1. nativeLanguage (idioma nativo, ej. "English")
            2. targetLanguage (idioma objetivo, ej. "Spanish")
            3. educationalLevel (nivel educativo, ej. "High School")
            4. academicLevel (nivel académico, ej. "Beginner")
            5. beginDate (fecha de inicio, ej. "2025-06-01")
            6. endDate (fecha de fin, ej. "2025-08-01")
            7. quantityStudentsMin (número mínimo de estudiantes, ej. 5)
            8. quantityStudentsMax (número máximo de estudiantes, ej. 20)
            9. university (universidad, ej. "Germany")
  
            El usuario proporcionará una consulta, y la IA debe analizarla para identificar los filtros relevantes y generar un JSON con los filtros apropiados. Aquí tienes algunos ejemplos:
  
            Ejemplo 1: Usuario: "Find exchanges for English to Spanish"
            Filtros esperados: { "nativeLanguage": "English", "targetLanguage": "Spanish" }
  
            Ejemplo 2: Usuario: "What exchanges are available for high school students?"
            Filtros esperados: { "educationalLevel": "High School" }
  
            Ejemplo 3: Usuario: "I need exchanges with a minimum of 5 students"
            Filtros esperados: { "quantityStudentsMin": 5 }
  
            Ejemplo 4: Usuario: "Can you find exchanges in Germany?"
            Filtros esperados: { "university": "Germany" }
  
            Ahora, cuando el usuario proporcione una consulta, analiza la entrada y genera el JSON con los filtros relevantes.
          `,
        };

        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: "gpt-3.5-turbo",
              messages: [
                systemMessage, // Proporcionar el contexto explícito
                { role: "user", content: userInput }, // El contenido del usuario como mensaje
              ],
              max_tokens: 100,
              temperature: 0.3,
              top_p: 0.9,
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          const botResponse = data.choices[0].message.content;
          console.log(botResponse);

          setFilters(botResponse);
          Toast.show({
            type: "success",
            position: "bottom",
            text1: "Éxito",
            text2: "Busqueda personalizada exitósa.",
          });
          navigation.goBack();
        } else {
          throw new Error(data.error.message);
        }
      } catch (error) {
        console.error("Error al llamar a la API:", error);
        Toast.show({
          type: "error",
          position: "bottom",
          text1: "Error",
          text2: "Hubo un problema al obtener la respuesta.",
        });
      }

      // Limpiar el input
      setUserInput("");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {/* Displaying title with typing effect */}
      <View style={styles.chatBox}>
        {/* Input for user query below the chat */}
        <TextInput
          style={styles.input}
          placeholder="Ask about exchanges..."
          value={userInput}
          onChangeText={setUserInput}
        />

        {/* Send button */}
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f8fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#007BFF",
  },
  chatBox: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    flexDirection: "column",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: "#f1f1f1",
  },
  sendButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
