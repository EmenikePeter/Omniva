import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChatScreen from "./screens/ChatScreen";
import ToolScreen from "./screens/ToolScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Tools" component={ToolScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
