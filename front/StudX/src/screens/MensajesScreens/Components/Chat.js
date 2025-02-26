import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useTheme } from "../../../context/ThemeContext";

export default function Chat({ chat, onPress, onLongPress }) {
  const { darkMode } = useTheme();

  const getImageSource = (imageName) => {
    const images = {
      'img1.jpg': require('../../../images/FotosPerfil/img2.jpg'),
      'img2.jpg': require('../../../images/FotosPerfil/img1.jpg'),
    };
    return images[imageName] || require('../../../images/FotosPerfil/img1.jpg');
  };

  const lastMessage = chat.messages.length > 0 
    ? chat.messages[chat.messages.length - 1].text 
    : 'There are no messages';

  return (
    <TouchableOpacity 
      style={[styles.chatContainer, { backgroundColor: darkMode ? '#222' : '#fff', borderBottomColor: darkMode ? '#555' : '#ccc' }]} 
      onPress={() => onPress(chat)}
      onLongPress={() => onLongPress(chat)} 
    >
      <Image source={getImageSource(chat.image)} style={styles.profileImage} />
      <View style={styles.textContainer}>
        <Text style={[styles.chatTitle, { color: darkMode ? 'white' : 'black' }]}>{chat.name}</Text>
        <Text style={[styles.lastMessage, { color: darkMode ? 'lightgray' : 'gray' }]}>{lastMessage}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 14,
  },
});
