
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import { t } from '../app/tools';
import { useAuth } from "../components/AuthContext";
import { useLanguage } from '../components/LanguageContext';
import api from "./services/api";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { lang } = useLanguage();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => setForm({ ...form, [field]: value });

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      Alert.alert(t('error', lang), t('loginRequired', lang));
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      // Save token and user to context
      login(res.data.user, res.data.token);
      Alert.alert(t('success', lang), t('loginSuccess', lang));
      router.push("/dashboard");
    } catch (err) {
      Alert.alert(t('error', lang), err.response?.data?.error || t('loginFailed', lang));
    }
    setLoading(false);
  };

  return (
    <View style={{flex:1, padding:16, justifyContent:"center"}}>
      <Text style={{fontSize:24, fontWeight:"bold", marginBottom:16}}>{t('login', lang)}</Text>
      <TextInput placeholder={t('email', lang)} value={form.email} onChangeText={v => handleChange("email", v)} style={{borderWidth:1, marginBottom:8, padding:8}} autoCapitalize="none" />
      <TextInput placeholder={t('password', lang)} value={form.password} onChangeText={v => handleChange("password", v)} style={{borderWidth:1, marginBottom:8, padding:8}} secureTextEntry />
      <Button title={loading ? t('loggingIn', lang) : t('login', lang)} onPress={handleLogin} disabled={loading} />
      <Button title={t('registerPrompt', lang)} onPress={() => router.push("/register")} style={{marginTop:8}} />
    </View>
  );
}
