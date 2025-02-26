import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

export default function SearchedExchange({ exchange, searchParams, navigation}) {
  // Function to format the date into YYYY-MM-DD
  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');  // Months are 0-based
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Verificar si hay coincidencia en cada campo y aplicar el estilo basado en 'source'
  const isNativeLanguageMatched = searchParams?.nativeLanguage && searchParams.nativeLanguage === exchange.nativeLanguage;
  const isTargetLanguageMatched = searchParams?.targetLanguage && searchParams.targetLanguage === exchange.targetLanguage;
  const isEducationalLevelMatched = searchParams?.educationalLevel && searchParams.educationalLevel === exchange.educationalLevel;
  const isAcademicLevelMatched = searchParams?.academicLevel && searchParams.academicLevel === exchange.academicLevel;
  const isBeginDateMatched = searchParams?.beginDate && searchParams.beginDate === exchange.beginDate;
  const isEndDateMatched = searchParams?.endDate && searchParams.endDate === exchange.endDate;
  const isQuantityStudentsMatched = searchParams?.quantityStudentsMin <= exchange.quantityStudents && searchParams?.quantityStudentsMax >= exchange.quantityStudents;
  const isUniversityMatched = searchParams?.university && searchParams.university === exchange.university;
  const isUserIdMatched = searchParams?.userId && searchParams.userId === exchange.idTeacherCreator;

  // Asumiendo que 'source' es la propiedad que indica de qué búsqueda proviene el intercambio
  const isSourceMatched = (sourceField) => {
    return exchange.source === sourceField;
  }

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{exchange.university}</Text>

        {/* Resaltar en rojo si hay coincidencia */}
        <Text style={isSourceMatched('nativeLanguage') ? styles.highlightedText : null}>
          Native Language: {exchange.nativeLanguage}
        </Text>
        <Text style={isSourceMatched('targetLanguage') ? styles.highlightedText : null}>
          Target Language: {exchange.targetLanguage}
        </Text>
        <Text style={isSourceMatched('educationalLevel') ? styles.highlightedText : null}>
          Educational Level: {exchange.educationalLevel}
        </Text>
        <Text style={isSourceMatched('academicLevel') ? styles.highlightedText : null}>
          Academic Level: {exchange.academicLevel}
        </Text>
        <Text style={isSourceMatched('beginDate') ? styles.highlightedText : null}>
          Start Date: {formatDate(exchange.beginDate)}
        </Text>
        <Text style={isSourceMatched('endDate') ? styles.highlightedText : null}>
          End Date: {formatDate(exchange.endDate)}
        </Text>
        <Text style={isSourceMatched('quantityStudents') ? styles.highlightedText : null}>
          Students: {exchange.quantityStudents}
        </Text>
        <Text style={isSourceMatched('userId') ? styles.highlightedText : null}>
          Teacher: {exchange.idTeacherCreator}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.button, styles.chatButton]}
        onPress={() => navigation.navigate("ChatScreen", {
          profesor: exchange.idTeacherCreator,
        })}
        activeOpacity={0.7}
      >
        <View style={styles.buttonContent}>
          <Ionicons name="chatbubble-outline" size={16} color="white" />
          <Text style={styles.buttonText}>Chat</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 2,
  },
  chatButton: {
    backgroundColor: "#1E88E5",
  },
  solicitudButton: {
    backgroundColor: "#FF5722",
  },
  buttonContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 12,
    marginTop: 2, 
  },
  highlightedText: {
    color: 'red',  // Texto en rojo cuando hay coincidencia
    fontWeight: 'bold',
  },
});
