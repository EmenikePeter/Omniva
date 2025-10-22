import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { t } from '../app/tools';
import { useAuth } from '../components/AuthContext';
import { useLanguage } from '../components/LanguageContext';

export default function CommunityScreen() {
  const [posts, setPosts] = useState([]);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { lang } = useLanguage();

  useEffect(() => {
    fetch('/api/community/posts')
      .then(res => res.json())
      .then(data => setPosts(data.posts || []));
  }, []);

  const handleCreate = async () => {
    if (!content) return;
    setLoading(true);
    const res = await fetch('/api/community/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, content })
    });
    const data = await res.json();
    if (data.success) setPosts(prev => [data.post, ...prev]);
    setAuthor(''); setContent('');
    setLoading(false);
  };

  // Require authentication for actions
  const requireAuth = (action) => {
    if (!user || !user.id) {
      router.push('/login');
      return;
    }
    action && action();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('community', lang)}</Text>
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder={t('author', lang)} value={author} onChangeText={setAuthor} />
        <TextInput style={styles.input} placeholder={t('content', lang)} value={content} onChangeText={setContent} multiline />
        <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? t('posting', lang) : t('post', lang)}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={posts}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{item.author || 'Anonymous'}</Text>
            <Text>{item.content}</Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No posts yet.</Text>}
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
  date: { color: '#888', fontSize: 12 },
});
