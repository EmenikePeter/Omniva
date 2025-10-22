import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import { useAuth } from "../components/AuthContext";
import api from "./services/api";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => setForm({ ...form, [field]: value });

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      Alert.alert("Error", "Email and password are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      // Save token and user to context
      login(res.data.user, res.data.token);
      Alert.alert("Success", "Logged in!");
      router.push("/dashboard");
    } catch (err) {
      Alert.alert("Error", err.response?.data?.error || "Login failed");
    }
    setLoading(false);
  };

  return (
    <View style={{flex:1, padding:16, justifyContent:"center"}}>
      <Text style={{fontSize:24, fontWeight:"bold", marginBottom:16}}>Login</Text>
      <TextInput placeholder="Email" value={form.email} onChangeText={v => handleChange("email", v)} style={{borderWidth:1, marginBottom:8, padding:8}} autoCapitalize="none" />
      <TextInput placeholder="Password" value={form.password} onChangeText={v => handleChange("password", v)} style={{borderWidth:1, marginBottom:8, padding:8}} secureTextEntry />
      <Button title={loading ? "Logging in..." : "Login"} onPress={handleLogin} disabled={loading} />
      <Button title="Don't have an account? Register" onPress={() => router.push("/register")} style={{marginTop:8}} />
    </View>
  );
}
