
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { t } from '../app/tools';
import { useAuth } from '../components/AuthContext';
import { useLanguage } from '../components/LanguageContext';

export default function MarketplaceScreen() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
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

  // Fetch items from backend
  useEffect(() => {
    fetch('/api/marketplace/items')
      .then(res => res.json())
      .then(data => setItems(data.items || []));
  }, []);

  // Create new item
  const handleCreate = async () => {
    if (!title) return;
    setLoading(true);
    const res = await fetch('/api/marketplace/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, price: parseFloat(price) || 0 })
    });
    const data = await res.json();
    if (data.success) setItems(prev => [data.item, ...prev]);
    setTitle(''); setDescription(''); setPrice('');
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('marketplace', lang)}</Text>
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder={t('title', lang)} value={title} onChangeText={setTitle} />
        <TextInput style={styles.input} placeholder={t('description', lang)} value={description} onChangeText={setDescription} />
        <TextInput style={styles.input} placeholder={t('price', lang)} value={price} onChangeText={setPrice} keyboardType="numeric" />
        <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? t('adding', lang) : t('addItem', lang)}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={items}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text>{item.description}</Text>
            <Text style={styles.price}>${item.price}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No items yet.</Text>}
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
  price: { color: '#007AFF', fontWeight: 'bold' },
});
