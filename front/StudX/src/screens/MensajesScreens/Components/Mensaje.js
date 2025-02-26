import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as SecureStore from "expo-secure-store";

const screenWidth = Dimensions.get('window').width;

export default function Mensaje({ mensaje }) {
  const [modalVisible, setModalVisible] = useState(false);
  const { darkMode } = useTheme(); 
  const [mensajeAdaptado, setMensajeAdaptado] = useState({});

  useEffect(() => {
    const extraerEmail = async () => {
      return await SecureStore.getItemAsync("email");
    };

    const obtenerDatos = async () => {
      
      let mail = await extraerEmail(); // Espera a que la promesa se resuelva
      let esPropio = (mensaje.idUserSender === mail); // Comparación estricta
      
      let mensajeAd = {
        "isOwn": esPropio,
        "text": mensaje.message,
      };

      setMensajeAdaptado(mensajeAd);
    };

    obtenerDatos(); 
  }, [mensaje]); // Depende de mensaje para asegurarse de que se ejecute cuando cambie

  return (
    <View
      style={[
        darkMode
          ? mensajeAdaptado.isOwn
            ? styles.darkOwnMessage
            : styles.darkOtherMessage
          : mensajeAdaptado.isOwn
          ? styles.ownMessage
          : styles.otherMessage,
      ]}
    >
      {mensajeAdaptado.text ? (
        <Text style={[styles.messageText, darkMode ? styles.darkText : styles.lightText]}>
          {mensajeAdaptado.text}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  ownMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
    padding: 10,
    borderRadius: 12,
    marginVertical: 5,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  otherMessage: {
    backgroundColor: '#E5E5EA',
    alignSelf: 'flex-start',
    padding: 10,
    borderRadius: 12,
    marginVertical: 5,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  darkOwnMessage: {
    backgroundColor: '#005BBB',
    alignSelf: 'flex-end',
  },
  darkOtherMessage: {
    backgroundColor: '#222',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    color: 'white',
  },
  darkText: {
    color: 'white',
  },
  lightText: {
    color: 'black',
  },
});
