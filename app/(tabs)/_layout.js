import { Tabs } from 'expo-router';
import { AuthProvider } from '../../components/AuthContext';

export default function Layout() {
  return (
    <AuthProvider>
      <Tabs>
  <Tabs.Screen name="dashboard" options={{ title: "Account" }} />
  <Tabs.Screen name="chat" options={{ title: "Chat" }} />
  <Tabs.Screen name="toolsgroup" options={{ title: "Tools" }} />
  <Tabs.Screen name="profile" options={{ title: "Profile" }} />
  <Tabs.Screen name="finance" options={{ title: "Finance" }} />
  <Tabs.Screen name="healthgroup" options={{ title: "Health" }} />
  <Tabs.Screen name="social" options={{ title: "Social" }} />
      </Tabs>
    </AuthProvider>
  );
}
