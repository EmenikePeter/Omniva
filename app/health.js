import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../components/AuthContext';

export default function Health() {
  const [selected, setSelected] = useState(null);
  // State for each feature
  const [symptomInput, setSymptomInput] = useState('');
  const [symptomResult, setSymptomResult] = useState('');
  const [symptomLoading, setSymptomLoading] = useState(false);

  const [treatInput, setTreatInput] = useState('');
  const [treatResult, setTreatResult] = useState('');
  const [treatLoading, setTreatLoading] = useState(false);

  const [reminderInput, setReminderInput] = useState('');
  const [reminderResult, setReminderResult] = useState('');
  const [reminderLoading, setReminderLoading] = useState(false);

  const [trackerInput, setTrackerInput] = useState('');
  const [trackerResult, setTrackerResult] = useState('');
  const [trackerLoading, setTrackerLoading] = useState(false);

  const [clinicInput, setClinicInput] = useState('');
  const [clinicResult, setClinicResult] = useState('');
  const [clinicLoading, setClinicLoading] = useState(false);

  const [mentalInput, setMentalInput] = useState('');
  const [mentalResult, setMentalResult] = useState('');
  const [mentalLoading, setMentalLoading] = useState(false);

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

  const features = [
    {
      key: 'symptom',
      icon: 'stethoscope',
      title: 'Symptom Checker',
      desc: 'Describe your symptoms and get instant AI advice.'
    },
    {
      key: 'treatments',
      icon: 'leaf',
      title: 'Herbal + Modern Treatments',
      desc: 'Explore herbal and modern remedies for common issues.'
    },
    {
      key: 'reminders',
      icon: 'alarm',
      title: 'Reminders for Meds/Habits',
      desc: 'Set up reminders for medication and healthy habits.'
    },
    {
      key: 'tracker',
      icon: 'chart-line',
      title: 'Track Stress/Sleep/Mood',
      desc: 'Log and visualize your stress, sleep, and mood.'
    },
    {
      key: 'clinics',
      icon: 'hospital-building',
      title: 'Clinics & Telemedicine',
      desc: 'Find clinics or connect to telemedicine services.'
    },
    {
      key: 'mental',
      icon: 'emoticon-happy-outline',
      title: 'Mental Health Support',
      desc: 'Get mental health tips, chat, and crisis resources.'
    }
  ];

  // Backend call handlers (replace URLs with your endpoints)
  // Updated endpoints for each health feature
  // TODO: Replace with actual userId from auth context or storage
  const userId = 'demo-user';

  const handleSymptomCheck = async () => {
    setSymptomLoading(true);
    setSymptomResult('');
    try {
      const res = await fetch('http://localhost:5000/api/health/symptom-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, symptoms: symptomInput })
      });
      const data = await res.json();
      setSymptomResult(data.result || 'No advice found.');
    } catch {
      setSymptomResult('Error connecting to AI.');
    }
    setSymptomLoading(false);
  };
  const handleTreatments = async () => {
    setTreatLoading(true);
    setTreatResult('');
    try {
      const res = await fetch('http://localhost:5000/api/health/treatments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, query: treatInput })
      });
      const data = await res.json();
      setTreatResult(data.result || 'No treatments found.');
    } catch {
      setTreatResult('Error connecting to AI.');
    }
    setTreatLoading(false);
  };
  const handleReminders = async () => {
    setReminderLoading(true);
    setReminderResult('');
    try {
      const res = await fetch('http://localhost:5000/api/health/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reminder: reminderInput })
      });
      const data = await res.json();
      setReminderResult(data.result || 'No reminder advice found.');
    } catch {
      setReminderResult('Error connecting to AI.');
    }
    setReminderLoading(false);
  };
  const handleTracker = async () => {
    setTrackerLoading(true);
    setTrackerResult('');
    try {
      const res = await fetch('http://localhost:5000/api/health/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, log: trackerInput })
      });
      const data = await res.json();
      setTrackerResult(data.result || 'No tracking advice found.');
    } catch {
      setTrackerResult('Error connecting to AI.');
    }
    setTrackerLoading(false);
  };
  const handleClinics = async () => {
    setClinicLoading(true);
    setClinicResult('');
    try {
      const res = await fetch('http://localhost:5000/api/health/clinics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, query: clinicInput })
      });
      const data = await res.json();
      setClinicResult(data.result || 'No clinics found.');
    } catch {
      setClinicResult('Error connecting to AI.');
    }
    setClinicLoading(false);
  };
  const handleMental = async () => {
    setMentalLoading(true);
    setMentalResult('');
    try {
      const res = await fetch('http://localhost:5000/api/health/mental-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message: mentalInput })
      });
      const data = await res.json();
      setMentalResult(data.result || 'No mental health advice found.');
    } catch {
      setMentalResult('Error connecting to AI.');
    }
    setMentalLoading(false);
  };

  // Voice upload
  const uploadVoice = async () => {
    setVoiceStatus('Uploading...');
    const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
    if (result.type === 'success') {
      const formData = new FormData();
      formData.append('voice', { uri: result.uri, name: result.name, type: result.mimeType || 'audio/mpeg' });
      try {
        const res = await fetch('/api/health/voice', { method: 'POST', body: formData, headers: { 'Content-Type': 'multipart/form-data' } });
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
        const res = await fetch('/api/health/image', { method: 'POST', body: formData, headers: { 'Content-Type': 'multipart/form-data' } });
        const data = await res.json();
        setImageStatus(data.success ? `Uploaded: ${data.file.originalname}` : 'Upload failed');
      } catch (err) {
        setImageStatus('Upload error');
      }
    } else {
      setImageStatus('No image selected');
    }
  };

  // Load health history from cache first, then try backend
  useEffect(() => {
    const loadHealthHistory = async () => {
      try {
        const cached = await AsyncStorage.getItem('healthHistory');
        if (cached) {
          const history = JSON.parse(cached);
          setSymptomResult(history.symptomResult || '');
          setTreatResult(history.treatResult || '');
          setReminderResult(history.reminderResult || '');
          setTrackerResult(history.trackerResult || '');
          setClinicResult(history.clinicResult || '');
          setMentalResult(history.mentalResult || '');
        }
      } catch {}
    };
    loadHealthHistory();
  }, []);

  // Save health history to cache on change
  useEffect(() => {
    AsyncStorage.setItem('healthHistory', JSON.stringify({
      symptomResult,
      treatResult,
      reminderResult,
      trackerResult,
      clinicResult,
      mentalResult
    }));
  }, [symptomResult, treatResult, reminderResult, trackerResult, clinicResult, mentalResult]);

  // Render feature detail modals/screens
  const renderFeature = () => {
    switch (selected) {
      case 'symptom':
        return (
          <View style={styles.detailBox}>
            <Text style={styles.detailTitle}>Symptom Checker</Text>
            <TextInput
              style={styles.input}
              placeholder="Describe your symptoms..."
              value={symptomInput}
              onChangeText={setSymptomInput}
              multiline
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={handleSymptomCheck} disabled={symptomLoading}>
              {symptomLoading ? <ActivityIndicator color="#fff" /> : <Icon name="robot" size={20} color="#fff" />}
              <Text style={styles.primaryBtnText}>Ask AI</Text>
            </TouchableOpacity>
            {symptomResult ? <Text style={styles.resultText}>{symptomResult}</Text> : null}
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setSelected(null)}>
              <Icon name="arrow-left" size={20} color="#007AFF" />
              <Text style={styles.secondaryBtnText}>Back</Text>
            </TouchableOpacity>
          </View>
        );
      case 'treatments':
        return (
          <View style={styles.detailBox}>
            <Text style={styles.detailTitle}>Herbal + Modern Treatments</Text>
            <TextInput
              style={styles.input}
              placeholder="What do you want to treat?"
              value={treatInput}
              onChangeText={setTreatInput}
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={handleTreatments} disabled={treatLoading}>
              {treatLoading ? <ActivityIndicator color="#fff" /> : <Icon name="leaf" size={20} color="#fff" />}
              <Text style={styles.primaryBtnText}>Find Treatments</Text>
            </TouchableOpacity>
            {treatResult ? <Text style={styles.resultText}>{treatResult}</Text> : null}
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setSelected(null)}>
              <Icon name="arrow-left" size={20} color="#007AFF" />
              <Text style={styles.secondaryBtnText}>Back</Text>
            </TouchableOpacity>
          </View>
        );
      case 'reminders':
        return (
          <View style={styles.detailBox}>
            <Text style={styles.detailTitle}>Reminders for Meds/Habits</Text>
            <TextInput
              style={styles.input}
              placeholder="What do you want to be reminded about?"
              value={reminderInput}
              onChangeText={setReminderInput}
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={handleReminders} disabled={reminderLoading}>
              {reminderLoading ? <ActivityIndicator color="#fff" /> : <Icon name="alarm" size={20} color="#fff" />}
              <Text style={styles.primaryBtnText}>Get Reminder Advice</Text>
            </TouchableOpacity>
            {reminderResult ? <Text style={styles.resultText}>{reminderResult}</Text> : null}
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setSelected(null)}>
              <Icon name="arrow-left" size={20} color="#007AFF" />
              <Text style={styles.secondaryBtnText}>Back</Text>
            </TouchableOpacity>
          </View>
        );
      case 'tracker':
        return (
          <View style={styles.detailBox}>
            <Text style={styles.detailTitle}>Track Stress/Sleep/Mood</Text>
            <TextInput
              style={styles.input}
              placeholder="Log your stress, sleep, or mood..."
              value={trackerInput}
              onChangeText={setTrackerInput}
              multiline
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={handleTracker} disabled={trackerLoading}>
              {trackerLoading ? <ActivityIndicator color="#fff" /> : <Icon name="chart-line" size={20} color="#fff" />}
              <Text style={styles.primaryBtnText}>Analyze</Text>
            </TouchableOpacity>
            {trackerResult ? <Text style={styles.resultText}>{trackerResult}</Text> : null}
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setSelected(null)}>
              <Icon name="arrow-left" size={20} color="#007AFF" />
              <Text style={styles.secondaryBtnText}>Back</Text>
            </TouchableOpacity>
          </View>
        );
      case 'clinics':
        return (
          <View style={styles.detailBox}>
            <Text style={styles.detailTitle}>Clinics & Telemedicine</Text>
            <TextInput
              style={styles.input}
              placeholder="What do you need help with?"
              value={clinicInput}
              onChangeText={setClinicInput}
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={handleClinics} disabled={clinicLoading}>
              {clinicLoading ? <ActivityIndicator color="#fff" /> : <Icon name="hospital-building" size={20} color="#fff" />}
              <Text style={styles.primaryBtnText}>Find Clinics</Text>
            </TouchableOpacity>
            {clinicResult ? <Text style={styles.resultText}>{clinicResult}</Text> : null}
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setSelected(null)}>
              <Icon name="arrow-left" size={20} color="#007AFF" />
              <Text style={styles.secondaryBtnText}>Back</Text>
            </TouchableOpacity>
          </View>
        );
      case 'mental':
        return (
          <View style={styles.detailBox}>
            <Text style={styles.detailTitle}>Mental Health Support</Text>
            <TextInput
              style={styles.input}
              placeholder="How are you feeling or what do you need?"
              value={mentalInput}
              onChangeText={setMentalInput}
              multiline
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={handleMental} disabled={mentalLoading}>
              {mentalLoading ? <ActivityIndicator color="#fff" /> : <Icon name="emoticon-happy-outline" size={20} color="#fff" />}
              <Text style={styles.primaryBtnText}>Ask for Support</Text>
            </TouchableOpacity>
            {mentalResult ? <Text style={styles.resultText}>{mentalResult}</Text> : null}
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setSelected(null)}>
              <Icon name="arrow-left" size={20} color="#007AFF" />
              <Text style={styles.secondaryBtnText}>Back</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.header}>AI Health Brain</Text>
      <Text style={styles.subhead}>Your personal health assistant for body and mind.</Text>
      {selected ? (
        renderFeature()
      ) : (
        <View style={styles.cardList}>
          {features.map(f => (
            <TouchableOpacity
              key={f.key}
              style={styles.card}
              onPress={() => setSelected(f.key)}
              activeOpacity={0.85}
            >
              <View style={styles.iconWrap}>
                <Icon name={f.icon} size={32} color="#16a085" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{f.title}</Text>
                <Text style={styles.cardDesc}>{f.desc}</Text>
              </View>
              <Icon name="chevron-right" size={28} color="#b2bec3" />
            </TouchableOpacity>
          ))}
        </View>
      )}

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
  screen: {
    padding: 20,
    backgroundColor: '#f4f6fb',
    alignItems: 'stretch',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#16a085',
    textAlign: 'center',
    marginBottom: 6,
  },
  subhead: {
    fontSize: 16,
    color: '#636e72',
    textAlign: 'center',
    marginBottom: 18,
  },
  cardList: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 2,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e8f8f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222f3e',
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 14,
    color: '#636e72',
  },
  detailBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginTop: 10,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#16a085',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e5ef',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fafbff',
    minHeight: 40,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a085',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 10,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 8,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    gap: 6,
  },
  secondaryBtnText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
  resultText: {
    color: '#222f3e',
    fontSize: 15,
    marginTop: 10,
    marginBottom: 4,
    textAlign: 'center',
  },
  button: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#007AFF', padding: 12, borderRadius: 8, marginVertical: 8 },
  buttonText: { color: '#fff', marginLeft: 8, fontSize: 16 },
  section: { marginVertical: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  status: { marginTop: 8, fontSize: 14, color: '#555' },
});
