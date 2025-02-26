import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Dimensions,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
  TextInput,
  FlatList,
  Platform,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useTheme } from "../../../context/ThemeContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import { TextInput as PaperTextInput } from "react-native-paper";

const { width } = Dimensions.get("window");

const flags = {
  Spanish: { img: require("../../../images/Banderas/ES.png") },
  English: { img: require("../../../images/Banderas/GB.png") },
  French: { img: require("../../../images/Banderas/FR.png") },
  German: { img: require("../../../images/Banderas/DE.png") },
  Italian: { img: require("../../../images/Banderas/IT.png") },
  Portuguese: { img: require("../../../images/Banderas/PT.png") },
  Dutch: { img: require("../../../images/Banderas/NL.png") },
  Russian: { img: require("../../../images/Banderas/RU.png") },
  Chinese: { img: require("../../../images/Banderas/CN.png") },
  Japanese: { img: require("../../../images/Banderas/JP.png") },
  Korean: { img: require("../../../images/Banderas/KR.png") },
  Arabic: { img: require("../../../images/Banderas/SA.png") },
  Turkish: { img: require("../../../images/Banderas/TR.png") },
  Bulgarian: { img: require("../../../images/Banderas/BG.png") },
  Czech: { img: require("../../../images/Banderas/CZ.png") },
  Danish: { img: require("../../../images/Banderas/DK.png") },
  Finnish: { img: require("../../../images/Banderas/FI.png") },
  Greek: { img: require("../../../images/Banderas/GR.png") },
  Hungarian: { img: require("../../../images/Banderas/HU.png") },
  Indonesian: { img: require("../../../images/Banderas/ID.png") },
  Hebrew: { img: require("../../../images/Banderas/IL.png") },
  Hindi: { img: require("../../../images/Banderas/IN.png") },
  Persian: { img: require("../../../images/Banderas/IR.png") },
  Malay: { img: require("../../../images/Banderas/MY.png") },
  Norwegian: { img: require("../../../images/Banderas/NO.png") },
  Filipino: { img: require("../../../images/Banderas/PH.png") },
  Polish: { img: require("../../../images/Banderas/PL.png") },
  Romanian: { img: require("../../../images/Banderas/RO.png") },
  Swedish: { img: require("../../../images/Banderas/SE.png") },
  Thai: { img: require("../../../images/Banderas/TH.png") },
  Ukrainian: { img: require("../../../images/Banderas/UA.png") },
  Vietnamese: { img: require("../../../images/Banderas/VN.png") }
};

const levelColors = {
  A1: "#A5D6A7",
  A2: "#4CAF50",
  B1: "#FFB74D",
  B2: "#FF9800",
  C1: "#E57373",
  C2: "#D32F2F",
};

const learningImg = require("../../../images/LogosExchanges/Studying.png");
const speak = require("../../../images/LogosExchanges/Speak.png");
const level = require("../../../images/LogosExchanges/Nivel.png");
const students = require("../../../images/LogosExchanges/Estudiante.png");
const edit = require("../../../images/LogosExchanges/Editar.png");
const deleteimg = require("../../../images/LogosExchanges/Borrar.png");

export default function OwnExchangesTarget({
  alumnos,
  nivel,
  idiomaDeseado,
  idioma,
  exchangeId,
  onDeleteSuccess,
  onRefresh,
}) {
  const { darkMode } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(nivel);
  const [selectedNativeLanguage, setSelectedNativeLanguage] = useState(idioma);
  const [selectedTargetLanguage, setSelectedTargetLanguage] = useState(idiomaDeseado);

  const [studentsInput, setStudentsInput] = useState(
    alumnos > 0 ? String(alumnos) : ""
  );

  const [beginDate, setBeginDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showBeginPicker, setShowBeginPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [nativeModalVisible, setNativeModalVisible] = useState(false);
  const [nativeSearch, setNativeSearch] = useState("");
  const [targetModalVisible, setTargetModalVisible] = useState(false);
  const [targetSearch, setTargetSearch] = useState("");

  const filteredLanguagesNative = Object.keys(flags).filter((lang) =>
    lang.toLowerCase().includes(nativeSearch.toLowerCase())
  );
  const filteredLanguagesTarget = Object.keys(flags).filter((lang) =>
    lang.toLowerCase().includes(targetSearch.toLowerCase())
  );

  const flagInfo = flags[idiomaDeseado] || flags.Spanish;
  const flagInfo2 = flags[idioma] || flags.Spanish;

  function formatDateDDMMYYYY(dateObj) {
    if (!dateObj) return "";
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  }

  const handleDelete = async () => {
    setModalVisible(false);
    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (!exchangeId || !token) {
        Alert.alert("Error", "Could not get the necessary information to delete.");
        return;
      }

      const apiUrl = `http://44.220.1.21:8080/api/exchanges/?id=${exchangeId}&token=${token}`;
      const response = await fetch(apiUrl, { method: "DELETE" });
      const responseText = await response.text();

      console.log("Response code:", response.status);
      console.log("Server response:", responseText);

      if (response.ok) {
        Alert.alert("Success", "Exchange has been successfully deleted.");
        if (onDeleteSuccess) onDeleteSuccess(exchangeId);
      } else {
        Alert.alert("Error", `Could not delete: ${responseText}`);
      }
    } catch (error) {
      Alert.alert("Connection error", error.message);
    }
  };

  const handleEdit = async () => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (!exchangeId || !token) {
        Alert.alert("Error", "Could not get the necessary information to edit.");
        return;
      }

      const quantityNum = parseInt(studentsInput, 10);
      if (!quantityNum || quantityNum <= 0) {
        Alert.alert("Error", "The number of students must be greater than 0.");
        return;
      }

      const apiUrl = `http://44.220.1.21:8080/api/exchanges/?id=${exchangeId}`;

      const bodyData = {
        token: token,
        nativeLanguage: selectedNativeLanguage,
        targetLanguage: selectedTargetLanguage,
        academicLevel: selectedLevel,
        quantityStudents: quantityNum,
        beginDate: formatDateDDMMYYYY(beginDate),
        endDate: formatDateDDMMYYYY(endDate),
      };

      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      const responseText = await response.text();
      console.log("Response code (PUT):", response.status);
      console.log("Server response (PUT):", responseText);

      if (response.ok) {
        Alert.alert("Success", "The exchange has been successfully edited.");
        setEditModalVisible(false);
        onRefresh();
      } else {
        Alert.alert("Error", "Could not edit: " + responseText);
      }
    } catch (error) {
      Alert.alert("Connection error", error.message);
    }
  };

  const onChangeBeginDate = (event, selectedDate) => {
    setShowBeginPicker(false);
    if (selectedDate) setBeginDate(selectedDate);
  };
  const onChangeEndDate = (event, selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate) setEndDate(selectedDate);
  };

  const handleStudentsChange = (text) => {
    const numericText = text.replace(/[^0-9]/g, "");
    setStudentsInput(numericText);
  };

  const renderNativeItem = ({ item }) => (
    <Pressable
      style={styles.languageItem}
      onPress={() => {
        setSelectedNativeLanguage(item);
        setNativeModalVisible(false);
        setNativeSearch("");
      }}
    >
      <Text style={styles.languageItemText}>{item}</Text>
    </Pressable>
  );

  const renderTargetItem = ({ item }) => (
    <Pressable
      style={styles.languageItem}
      onPress={() => {
        setSelectedTargetLanguage(item);
        setTargetModalVisible(false);
        setTargetSearch("");
      }}
    >
      <Text style={styles.languageItemText}>{item}</Text>
    </Pressable>
  );

  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];

  return (
    <>
      <TouchableOpacity
        onLongPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <ImageBackground
          source={flagInfo.img}
          style={[styles.card, { width: width * 0.56, maxWidth: 250 }]}
          resizeMode="cover"
        >
          <View
            style={[
              styles.overlay,
              { backgroundColor: darkMode ? "#242323" : "white" },
              { borderColor: darkMode ? null : "#d6d4d4" },
            ]}
          >
            <View style={styles.row}>
              <Image source={learningImg} style={styles.studyIcon} />
              <Text style={[styles.text, { color: darkMode ? "white" : "black" }]}>
                {" "}
                Learning:{" "}
              </Text>
              <Text
                style={[
                  styles.textBold,
                  { color: darkMode ? "white" : "black" },
                ]}
              >
                {idiomaDeseado}{" "}
              </Text>
              <Image source={flagInfo.img} style={styles.flag} />
            </View>

            <View style={styles.row}>
              <Image source={speak} style={styles.studyIcon} />
              <Text style={[styles.text, { color: darkMode ? "white" : "black" }]}>
                {" "}
                Speak:{" "}
              </Text>
              <Text
                style={[
                  styles.textBold,
                  { color: darkMode ? "white" : "black" },
                ]}
              >
                {idioma}{" "}
              </Text>
              <Image source={flagInfo2.img} style={styles.flag} />
            </View>

            <View style={styles.row}>
              <Image source={level} style={styles.studyIcon} />
              <Text style={[styles.text, { color: darkMode ? "white" : "black" }]}>
                {" "}
                Level:{" "}
              </Text>
              <View
                style={[
                  styles.highlightContainer,
                  { backgroundColor: levelColors[nivel] || "#A5D6A7" },
                ]}
              >
                <Text style={styles.highlightText}>{nivel.toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <Image source={students} style={styles.studyIcon} />
              <Text style={[styles.text, { color: darkMode ? "white" : "black" }]}>
                {" "}
                Students:{" "}
              </Text>
              <Text
                style={[
                  styles.textBold,
                  { color: darkMode ? "white" : "black" },
                ]}
              >
                {alumnos}
              </Text>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setModalVisible(false);
                setEditModalVisible(true);
              }}
            >
              <Image source={edit} style={styles.menuIcon} />
              <Text style={styles.menuText}>Edit</Text>
            </Pressable>

            <Pressable style={styles.menuItem} onPress={handleDelete}>
              <Image source={deleteimg} style={styles.menuIcon} />
              <Text style={styles.menuText}>Delete</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setEditModalVisible(false)}
        >
          <Pressable
            style={styles.editModalContainer}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.editTitle}>Edit Exchange</Text>

            <Text style={styles.label}>Academic Level:</Text>
            <View style={styles.levelOptionsContainer}>
              {levels.map((lvl) => (
                <Pressable
                  key={lvl}
                  style={[
                    styles.levelOption,
                    selectedLevel === lvl && {
                      backgroundColor: levelColors[lvl],
                    },
                  ]}
                  onPress={() => setSelectedLevel(lvl)}
                >
                  <Text
                    style={[
                      styles.levelOptionText,
                      selectedLevel === lvl && {
                        color: "#fff",
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    {lvl}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.selectedLevelContainer}>
              <Text style={styles.label}>
                Selected: {selectedLevel.toUpperCase()}
              </Text>
            </View>

            <Text style={styles.label}>Native Language:</Text>
            <Pressable
              style={styles.languagePressable}
              onPress={() => setNativeModalVisible(true)}
            >
              <Text style={styles.languagePressableText}>
                {`Select: ${selectedNativeLanguage}`}
              </Text>
            </Pressable>

            <Text style={styles.label}>Target Language:</Text>
            <Pressable
              style={styles.languagePressable}
              onPress={() => setTargetModalVisible(true)}
            >
              <Text style={styles.languagePressableText}>
                {`Select: ${selectedTargetLanguage}`}
              </Text>
            </Pressable>

            <Text style={styles.label}>Begin Date: {formatDateDDMMYYYY(beginDate)}</Text>
            <Pressable
              style={styles.dateButton}
              onPress={() => setShowBeginPicker(true)}
            >
              <Text style={styles.dateButtonText}>Select Begin Date</Text>
            </Pressable>
            {showBeginPicker && (
              <DateTimePicker
                value={beginDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onChangeBeginDate}
              />
            )}

            <Text style={styles.label}>End Date: {formatDateDDMMYYYY(endDate)}</Text>
            <Pressable
              style={styles.dateButton}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={styles.dateButtonText}>Select End Date</Text>
            </Pressable>
            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onChangeEndDate}
              />
            )}

            <Text style={styles.label}>Number of Students:</Text>
            <PaperTextInput
              placeholder=""
              style={[styles.input, styles.paperNumberInput]}
              value={studentsInput}
              onChangeText={handleStudentsChange}
              keyboardType="numeric"
              mode="flat"
              underlineColor="transparent"
              theme={{ colors: { text: "#000" } }}
            />

            <View style={styles.editButtonsContainer}>
              <Pressable style={styles.saveButton} onPress={handleEdit}>
                <Text style={styles.saveButtonText}>Save</Text>
              </Pressable>
              <Pressable
                style={[styles.saveButton, { backgroundColor: "#aaa" }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.saveButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        transparent={true}
        visible={nativeModalVisible}
        onRequestClose={() => setNativeModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            setNativeModalVisible(false);
            setNativeSearch("");
          }}
        >
          <Pressable
            style={styles.searchLangModal}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.editTitle}>Select Native Language</Text>
            <TextInput
              style={styles.input}
              placeholder="Search a language..."
              value={nativeSearch}
              onChangeText={setNativeSearch}
            />
            <FlatList
              data={filteredLanguagesNative}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.languageItem}
                  onPress={() => {
                    setSelectedNativeLanguage(item);
                    setNativeModalVisible(false);
                    setNativeSearch("");
                  }}
                >
                  <Text style={styles.languageItemText}>{item}</Text>
                </Pressable>
              )}
              style={{ maxHeight: 250, width: "100%" }}
              keyboardShouldPersistTaps="handled"
            />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        transparent={true}
        visible={targetModalVisible}
        onRequestClose={() => setTargetModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            setTargetModalVisible(false);
            setTargetSearch("");
          }}
        >
          <Pressable
            style={styles.searchLangModal}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.editTitle}>Select Target Language</Text>
            <TextInput
              style={styles.input}
              placeholder="Search a language..."
              value={targetSearch}
              onChangeText={setTargetSearch}
            />
            <FlatList
              data={filteredLanguagesTarget}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.languageItem}
                  onPress={() => {
                    setSelectedTargetLanguage(item);
                    setTargetModalVisible(false);
                    setTargetSearch("");
                  }}
                >
                  <Text style={styles.languageItemText}>{item}</Text>
                </Pressable>
              )}
              style={{ maxHeight: 250, width: "100%" }}
              keyboardShouldPersistTaps="handled"
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 10,
    borderRadius: 12,
    marginHorizontal: 10,
    elevation: 8,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 4,
    shadowRadius: 6,
    alignSelf: "center",
    overflow: "hidden",
  },
  overlay: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderColor: "#d6d4d4",
    borderWidth: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
    flexWrap: "wrap",
  },
  text: {
    fontSize: 12,
  },
  textBold: {
    fontSize: 12,
    fontWeight: "bold",
  },
  highlightContainer: {
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginLeft: 5,
  },
  highlightText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  flag: {
    width: 20,
    height: 15,
    marginRight: 5,
    resizeMode: "contain",
  },
  studyIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
    resizeMode: "contain",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    width: 200,
    alignItems: "center",
  },
  menuItem: {
    flexDirection: "row",
    paddingVertical: 10,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: {
    fontSize: 16,
    marginLeft: 8,
  },
  menuIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  editModalContainer: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    marginTop: 5,
    width: "100%",
  },
  paperNumberInput: {
    width: "25%",
    height: "5%", 
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    marginTop: 5,
    fontSize: 14,
  },
  editButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  levelOptionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  levelOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 5,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  levelOptionText: {
    fontSize: 12,
  },
  selectedLevelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  languagePressable: {
    marginTop: 8,
    backgroundColor: "#ddd",
    borderRadius: 5,
    padding: 8,
  },
  languagePressableText: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  dateButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginVertical: 6,
    alignSelf: "flex-start",
  },
  dateButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  searchLangModal: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  languageItem: {
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
    width: "100%",
  },
  languageItemText: {
    fontSize: 16,
  },
});
