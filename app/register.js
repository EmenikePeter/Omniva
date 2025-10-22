
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import { t } from '../app/tools';
import { useLanguage } from '../components/LanguageContext';
import api from "./services/api";

export default function RegisterScreen() {
  const router = useRouter();
  const { lang } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", password: "", country: "", language: lang });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => setForm({ ...form, [field]: value });

  const handleRegister = async () => {
    if (!form.email || !form.password) {
      Alert.alert(t('error', lang), t('registerRequired', lang));
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/register", form);
      Alert.alert(t('success', lang), t('registerSuccess', lang));
      router.push("/login");
    } catch (err) {
      Alert.alert(t('error', lang), err.response?.data?.error || t('registerFailed', lang));
    }
    setLoading(false);
  };

  return (
    <View style={{flex:1, padding:16, justifyContent:"center"}}>
      <Text style={{fontSize:24, fontWeight:"bold", marginBottom:16}}>{t('register', lang)}</Text>
      <TextInput placeholder={t('name', lang)} value={form.name} onChangeText={v => handleChange("name", v)} style={{borderWidth:1, marginBottom:8, padding:8}} />
      <TextInput placeholder={t('email', lang)} value={form.email} onChangeText={v => handleChange("email", v)} style={{borderWidth:1, marginBottom:8, padding:8}} autoCapitalize="none" />
      <TextInput placeholder={t('password', lang)} value={form.password} onChangeText={v => handleChange("password", v)} style={{borderWidth:1, marginBottom:8, padding:8}} secureTextEntry />
      <TextInput placeholder={t('country', lang)} value={form.country} onChangeText={v => handleChange("country", v)} style={{borderWidth:1, marginBottom:8, padding:8}} />
      <TextInput placeholder={t('language', lang)} value={form.language} onChangeText={v => handleChange("language", v)} style={{borderWidth:1, marginBottom:8, padding:8}} />
      <Button title={loading ? t('registering', lang) : t('register', lang)} onPress={handleRegister} disabled={loading} />
      <Button title={t('loginPrompt', lang)} onPress={() => router.push("/login")} style={{marginTop:8}} />
    </View>
  );
}
