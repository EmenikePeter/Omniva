import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../components/AuthContext';

export default function Business() {
  const [ideaResult, setIdeaResult] = useState('');
  const [ideaLoading, setIdeaLoading] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  const [imageStatus, setImageStatus] = useState('');
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

  // Load business ideas from cache first
  useEffect(() => {
    const loadBusinessIdea = async () => {
      try {
        const cached = await AsyncStorage.getItem('businessIdea');
        if (cached) setIdeaResult(cached);
      } catch {}
    };
    loadBusinessIdea();
  }, []);

  // Save business idea to cache on change
  useEffect(() => {
    AsyncStorage.setItem('businessIdea', ideaResult);
  }, [ideaResult]);

  // Business idea fetch (existing logic)
  const fetchBusinessIdea = async () => {
    requireAuth(async () => {
      setIdeaLoading(true);
      try {
        const res = await fetch('/api/business/idea', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user?.id || 'demo' }) });
        const data = await res.json();
        setIdeaResult(data.idea || 'No idea returned');
      } catch (err) {
        setIdeaResult('Error fetching idea');
      }
      setIdeaLoading(false);
    });
  };

  // Voice upload
  const uploadVoice = async () => {
    setVoiceStatus('Uploading...');
    const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
    if (result.type === 'success') {
      const formData = new FormData();
      formData.append('voice', { uri: result.uri, name: result.name, type: result.mimeType || 'audio/mpeg' });
      try {
        const res = await fetch('/api/business/voice', { method: 'POST', body: formData, headers: { 'Content-Type': 'multipart/form-data' } });
        const data = await res.json();
        setVoiceStatus(data.success ? `Uploaded: ${data.file.originalname}` : 'Upload failed');
      } catch (err) {
        setVoiceStatus('Upload error');
      }
    } else {
      setVoiceStatus('No file selected');
    }
  };

  // Image upload
  const uploadImage = async () => {
    setImageStatus('Uploading...');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.cancelled) {
      const formData = new FormData();
      formData.append('image', { uri: result.uri, name: 'image.jpg', type: 'image/jpeg' });
      try {
        const res = await fetch('/api/business/image', { method: 'POST', body: formData, headers: { 'Content-Type': 'multipart/form-data' } });
        const data = await res.json();
        setImageStatus(data.success ? `Uploaded: ${data.file.originalname}` : 'Upload failed');
      } catch (err) {
        setImageStatus('Upload error');
      }
    } else {
      setImageStatus('No image selected');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Business Brain</Text>
      <TouchableOpacity style={styles.button} onPress={fetchBusinessIdea}>
        <Icon name="lightbulb-on" size={24} color="#fff" />
        <Text style={styles.buttonText}>Get Business Idea</Text>
      </TouchableOpacity>
      {ideaLoading ? <ActivityIndicator /> : <Text style={styles.result}>{ideaResult}</Text>}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Voice Input</Text>
        <TouchableOpacity style={styles.button} onPress={uploadVoice}>
          <Icon name="microphone" size={24} color="#fff" />
          <Text style={styles.buttonText}>Upload Voice</Text>
        </TouchableOpacity>
        <Text style={styles.status}>{voiceStatus}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Image Input</Text>
        <TouchableOpacity style={styles.button} onPress={uploadImage}>
          <Icon name="image" size={24} color="#fff" />
          <Text style={styles.buttonText}>Upload Image</Text>
        </TouchableOpacity>
        <Text style={styles.status}>{imageStatus}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  button: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#007AFF', padding: 12, borderRadius: 8, marginVertical: 8 },
  buttonText: { color: '#fff', marginLeft: 8, fontSize: 16 },
  result: { marginVertical: 12, fontSize: 16 },
  section: { marginVertical: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  status: { marginTop: 8, fontSize: 14, color: '#555' },
});
