import { Button, Text, View } from "react-native";

export default function ToolScreen() {
  return (
    <View style={{padding:16}}>
      <Text style={{fontSize:20, marginBottom:16}}>Tools Dashboard</Text>
      <Button title="Expense Tracker" onPress={() => alert("Open Expense Tracker")} />
      <Button title="Business Ideas" onPress={() => alert("Open Business Ideas")} />
      <Button title="Symptom Check" onPress={() => alert("Open Symptom Check")} />
    </View>
  );
}
