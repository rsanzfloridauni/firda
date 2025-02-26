import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import SearchedExchange from "../../components/SearchedExchange";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useFilters } from "../../context/FiltersContext";
import QueryString from "qs";

export default function Busquedas(props) {
  const { darkMode } = useTheme();
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const { filters, setFilters } = useFilters(); // Usamos la función de actualización del contexto

  function objectToUrlParams(obj) {
    const jsonObj = JSON.parse(obj);
    const params = [];
    
    for (const key in jsonObj) {
      params.push(`${encodeURIComponent(key)}=${encodeURIComponent(jsonObj[key])}`);
    }
  
    return params.join('&');
  }

  useFocusEffect(
    useCallback(() => {
      const fetchDataWithFilters = async () => {
        if (filters && Object.keys(filters).length > 0) {
          // Construir manualmente los parámetros de la URL
          const queryParams = objectToUrlParams(filters);
          
          
          const url = `http://44.220.1.21:8080/api/exchanges?${queryParams}`;
  
          try {
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            const result = await response.json();
            setResultados(result);
          } catch (error) {
            console.error("Error al obtener los datos:", error);
          }
        }
      };
  
      fetchDataWithFilters();
      setFilters(null); // Limpiar los filtros después de usarlos
    }, [filters, setResultados]) // Dependencias del useCallback
  );

    useEffect(() => {
      fetch("http://44.220.1.21:8080/api/exchanges")
        .then((response) => response.json())
        .then((data) => setResultados(data))
        .catch((error) =>
          console.error("Error fetching random exchanges:", error)
        );
    }, []);

    

  const buscarExchanges = () => {
    if (query == "") {
      fetch("http://44.220.1.21:8080/api/exchanges")
        .then((response) => response.json())
        .then((data) => setResultados(data))
        .catch((error) =>
          console.error("Error fetching random exchanges:", error)
        );
    } else {
      setLoading(true);
      const paramsArray = [
        "nativeLanguage",
        "targetLanguage",
        "educationalLevel",
        "academicLevel",
        "university",
        "userId",
      ];

      const resultadosCompletos = [];

      const peticiones = paramsArray.map(async (param) => {
        const params = new URLSearchParams({ [param]: query });

        try {
          const response = await fetch(
            `http://44.220.1.21:8080/api/exchanges?${params.toString()}`
          );
          const data = await response.json();

          // Agregar el parámetro de la petición al objeto de cada intercambio
          const resultadosConFuente = data.map((exchange) => ({
            ...exchange, // Mantener todos los datos originales
            source: param, // Agregar el nombre del parámetro de la petición
          }));

          // Agregar el resultado al array de resultados completos
          resultadosCompletos.push(...resultadosConFuente); // Usamos "push(...)" para aplanar el array
        } catch (error) {
          return console.error(`Error fetching ${param}:`, error);
        }
      });

      // Esperar a que todas las peticiones terminen
      Promise.all(peticiones)
        .then(() => {
          // Ahora setResultados recibe el array único de todos los datos
          setResultados(resultadosCompletos);
        })
        .finally(() => setLoading(false));
    }
  };

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "Search",
    });
  }, [navigation]);

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      <View style={styles.zonaBusqueda}>
        <View style={[styles.searchBar, darkMode && styles.searchBarDark]}>
          <Ionicons
            name="search"
            size={20}
            color={darkMode ? "#ccc" : "#A0A0A0"}
          />
          <TextInput
            placeholder="Search..."
            placeholderTextColor={darkMode ? "#bbb" : "#A0A0A0"}
            style={[styles.input, darkMode && styles.inputDark]}
            value={query}
            onChangeText={setQuery}
          />
        </View>
        <Pressable
          onPress={() => props.navigation.navigate("SearchFilterScreen")}
        >
          <Ionicons
            name="filter"
            size={24}
            color={darkMode ? "#ccc" : 'white'}
            style={styles.filterIcon}
          />
        </Pressable>
        <Pressable onPress={() => buscarExchanges()}>
          <Ionicons
            name="search"
            size={24}
            color={darkMode ? "#ccc" : 'white'}
            style={styles.filterIcon}
          />
        </Pressable>
      </View>

      <ScrollView style={styles.zonaResultados}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={darkMode ? "#ffffff" : "#000000"}
            />
          </View>
        ) : resultados.length > 0 ? (
          resultados.map((exchange, index) => (
            <SearchedExchange key={index} exchange={exchange} navigation={navigation}/>
          ))
        ) : (
          <Text style={darkMode && styles.textDark}>No results</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "blue",
    padding: 10,
  },
  containerDark: {
    backgroundColor: "#121212",
  },
  zonaBusqueda: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  zonaResultados: {
    flex: 1,
    width: "100%",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E5E5", // Mantén el color claro para modo claro
    borderRadius: 25,
    paddingHorizontal: 15, // Añadir más espacio a los lados
    height: 40,
    flex: 1,
    shadowColor: "#000", // Sombra para darle profundidad
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // Sombra para dispositivos Android
  },
  
  searchBarDark: {
    backgroundColor: "#333", // Fondo oscuro en modo oscuro
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  
  input: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: "#333",
  },
  
  inputDark: {
    color: "white",
  },
  
  textDark: {
    color: "white",
  },
  filterIcon: {
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
});
