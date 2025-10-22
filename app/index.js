import { Redirect } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../components/LanguageContext';
import { t } from './tools';

export default function HomeScreen() {
  const { lang } = useLanguage();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('welcome', lang)}</Text>
      <Text style={styles.text}>{t('homeDescription', lang)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default function Index() {
  return <Redirect href="/chat" />;
}

export default function Index() {
  return <Redirect href="/chat" />;
}
