import { StyleSheet, Text, View } from "react-native";

export default function SupportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Support</Text>
      <Text style={styles.text}>This is the Support screen.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8f9fa" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 16, color: "#f0ad4e" },
  text: { fontSize: 18, color: "#343a40" },
});
