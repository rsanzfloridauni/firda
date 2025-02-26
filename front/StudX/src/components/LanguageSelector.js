import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { SelectList } from "react-native-dropdown-select-list";

const LanguageSelector = ({ name, onLanguageChange }) => {
  const [selectedLanguage, setSelectedLanguage] = useState("");

  const languages = require("../../languages.json");

  return (
    <View style={styles.container}>
      <SelectList
        data={languages}
        setSelected={(val) => {
          setSelectedLanguage(val); // Establecer el idioma seleccionado
          const selectedObj = languages.find((lang) => lang.key === val); // Buscar el objeto con la clave
          onLanguageChange(selectedObj ? selectedObj.value : ""); // Pasar la clave seleccionada al padre
          console.log("Idioma seleccionado:", selectedObj ? selectedObj.value : "");
        }}
        boxStyles={styles.dropdownBox}
        placeholder="Select a Language"
        search={true}
        searchPlaceholder="Search a Language"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  dropdownBox: {
    height: 50,
    width: "100%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
  },
});

export default LanguageSelector;
