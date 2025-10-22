
import { StyleSheet, Text, View } from "react-native";
import { t } from '../app/tools';
import { useLanguage } from '../components/LanguageContext';

export default function SettingsScreen() {
  const { lang } = useLanguage();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('settings', lang)}</Text>
      <Text style={styles.text}>{t('settingsScreenText', lang)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8f9fa" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 16, color: "#292b2c" },
  text: { fontSize: 18, color: "#343a40" },
});
