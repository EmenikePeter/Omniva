import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../components/AuthContext';

export default function Insurance() {
  const [policies, setPolicies] = useState([]);
  const [policyName, setPolicyName] = useState('');
  const [description, setDescription] = useState('');
  const [premium, setPremium] = useState('');
  const [coverage, setCoverage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Require authentication for actions
  const requireAuth = (action) => {
    if (!user || !user.id) {
      router.push('/login');
      return;
    }
    action && action();
  };

  useEffect(() => {
    fetch('/api/insurance/policies')
      .then(res => res.json())
      .then(data => setPolicies(data.policies || []));
  }, []);

  const handleCreate = async () => {
    requireAuth(async () => {
      if (!policyName) return;
      setLoading(true);
      const res = await fetch('/api/insurance/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policyName, description, premium: parseFloat(premium) || 0, coverage })
      });
      const data = await res.json();
      if (data.success) setPolicies(prev => [data.policy, ...prev]);
      setPolicyName(''); setDescription(''); setPremium(''); setCoverage('');
      setLoading(false);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Insurance</Text>
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Policy Name" value={policyName} onChangeText={setPolicyName} />
        <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />
        <TextInput style={styles.input} placeholder="Premium" value={premium} onChangeText={setPremium} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Coverage" value={coverage} onChangeText={setCoverage} />
        <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Adding...' : 'Add Policy'}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={policies}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{item.policyName}</Text>
            <Text>{item.description}</Text>
            <Text style={styles.premium}>Premium: ${item.premium}</Text>
            <Text>Coverage: {item.coverage}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No policies yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, alignSelf: 'center' },
  form: { marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 8 },
  button: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  item: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 12, marginBottom: 12 },
  itemTitle: { fontWeight: 'bold', fontSize: 16 },
  premium: { color: '#007AFF', fontWeight: 'bold' },
});
