
import { Slot } from 'expo-router';
import { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AuthProvider } from '../components/AuthContext';
import { LanguageProvider, useLanguage } from '../components/LanguageContext';


const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ha', label: 'Hausa' },
  { code: 'yo', label: 'Yoruba' },
  { code: 'ig', label: 'Igbo' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ur', label: 'Urdu' },
  { code: 'zu', label: 'Zulu' },
  { code: 'xh', label: 'Xhosa' },
  { code: 'zh', label: 'Mandarin' },
];

function LanguageSelector() {
  const { lang, setLang } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <View style={styles.selectorContainer}>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.selectorButton}>
        <Text style={styles.selectorText}>{LANGUAGES.find(l => l.code === lang)?.label || 'Language'}</Text>
      </TouchableOpacity>
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {LANGUAGES.map(l => (
              <TouchableOpacity key={l.code} onPress={() => { setLang(l.code); setModalVisible(false); }} style={styles.langOption}>
                <Text style={styles.langText}>{l.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function RootLayout() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <View style={{ flex: 1 }}>
          <LanguageSelector />
          <Slot />
        </View>
      </AuthProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  selectorContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 100,
  },
  selectorButton: {
    backgroundColor: '#eee',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectorText: {
    fontSize: 14,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    minWidth: 200,
    alignItems: 'center',
  },
  langOption: {
    padding: 10,
    width: '100%',
    alignItems: 'center',
  },
  langText: {
    fontSize: 16,
    color: '#333',
  },
  closeBtn: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#eee',
    borderRadius: 10,
  },
  closeText: {
    color: '#333',
    fontSize: 14,
  },
});
