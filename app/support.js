
import { StyleSheet, Text, View } from "react-native";
import { t } from '../app/tools';
import { useLanguage } from '../components/LanguageContext';

export default function SupportScreen() {
  const { lang } = useLanguage();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('support', lang)}</Text>
      <Text style={styles.text}>{t('supportScreenText', lang)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8f9fa" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 16, color: "#f0ad4e" },
  text: { fontSize: 18, color: "#343a40" },
});
