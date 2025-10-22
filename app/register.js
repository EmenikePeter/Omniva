import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import api from "./services/api";

export default function RegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", country: "", language: "en" });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => setForm({ ...form, [field]: value });

  const handleRegister = async () => {
    if (!form.email || !form.password) {
      Alert.alert("Error", "Email and password are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/register", form);
      Alert.alert("Success", "Account created!");
      router.push("/login");
    } catch (err) {
      Alert.alert("Error", err.response?.data?.error || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <View style={{flex:1, padding:16, justifyContent:"center"}}>
      <Text style={{fontSize:24, fontWeight:"bold", marginBottom:16}}>Register</Text>
      <TextInput placeholder="Name" value={form.name} onChangeText={v => handleChange("name", v)} style={{borderWidth:1, marginBottom:8, padding:8}} />
      <TextInput placeholder="Email" value={form.email} onChangeText={v => handleChange("email", v)} style={{borderWidth:1, marginBottom:8, padding:8}} autoCapitalize="none" />
      <TextInput placeholder="Password" value={form.password} onChangeText={v => handleChange("password", v)} style={{borderWidth:1, marginBottom:8, padding:8}} secureTextEntry />
      <TextInput placeholder="Country" value={form.country} onChangeText={v => handleChange("country", v)} style={{borderWidth:1, marginBottom:8, padding:8}} />
      <TextInput placeholder="Language" value={form.language} onChangeText={v => handleChange("language", v)} style={{borderWidth:1, marginBottom:8, padding:8}} />
      <Button title={loading ? "Registering..." : "Register"} onPress={handleRegister} disabled={loading} />
      <Button title="Already have an account? Login" onPress={() => router.push("/login")} style={{marginTop:8}} />
    </View>
  );
}
