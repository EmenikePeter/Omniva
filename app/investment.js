
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { t } from '../app/tools';
import { useAuth } from '../components/AuthContext';
import { useLanguage } from '../components/LanguageContext';

export default function Investment() {
  const [opportunities, setOpportunities] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { lang } = useLanguage();

  // Require authentication for actions
  const requireAuth = (action) => {
    if (!user || !user.id) {
      router.push('/login');
      return;
    }
    action && action();
  };

  useEffect(() => {
    fetch('/api/investment/opportunities')
      .then(res => res.json())
      .then(data => setOpportunities(data.opportunities || []));
  }, []);

  const handleCreate = async () => {
    requireAuth(async () => {
      if (!title) return;
      setLoading(true);
      const res = await fetch('/api/investment/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, amount: parseFloat(amount) || 0 })
      });
      const data = await res.json();
      if (data.success) setOpportunities(prev => [data.opportunity, ...prev]);
      setTitle(''); setDescription(''); setAmount('');
      setLoading(false);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('investment', lang)}</Text>
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder={t('title', lang)} value={title} onChangeText={setTitle} />
        <TextInput style={styles.input} placeholder={t('description', lang)} value={description} onChangeText={setDescription} />
        <TextInput style={styles.input} placeholder={t('amount', lang)} value={amount} onChangeText={setAmount} keyboardType="numeric" />
        <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? t('adding', lang) : t('addOpportunity', lang)}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={opportunities}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text>{item.description}</Text>
            <Text style={styles.amount}>${item.amount}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No opportunities yet.</Text>}
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
  amount: { color: '#007AFF', fontWeight: 'bold' },
});
