import { RecordingPresets, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../components/AuthContext';

const features = [
  { key: 'track', icon: 'cash', title: 'Track Income/Expenses', desc: 'Log your money in and out (voice/text).' },
  { key: 'save', icon: 'bank', title: 'Help Save & Invest', desc: 'Get saving/investment advice.' },
  { key: 'funding', icon: 'hand-coin', title: 'Find Funding/Loans/Grants', desc: 'Discover funding sources.' },
  { key: 'plan', icon: 'calendar-account', title: 'Plan Personal Finances', desc: 'Budget and plan your finances.' },
  { key: 'predict', icon: 'chart-bar', title: 'Predict Cashflow', desc: 'Forecast your future cashflow.' },
  { key: 'habits', icon: 'lightbulb-on', title: 'Teach Money Habits', desc: 'Learn and track good money habits.' }
];

export default function Money() {
  const [selected, setSelected] = useState(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailConnected, setEmailConnected] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [outlookConnected, setOutlookConnected] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [voiceInput, setVoiceInput] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id || 'guest';

  // Require authentication for actions
  const requireAuth = (action) => {
    if (!user || !user.id) {
      router.push('/login');
      return;
    }
    action && action();
  };

  // Email connect handler (real endpoint)
  const handleConnectEmail = async () => {
    requireAuth(async () => {
      setEmailStatus('Connecting...');
      try {
        const res = await fetch('http://localhost:5000/api/email/connect');
        const data = await res.json();
        // In production, redirect to data.url for OAuth
        if (data && data.url) {
          if (typeof window !== 'undefined' && window.open) {
            window.open(data.url, '_blank');
          }
        }
        setEmailConnected(true);
        setEmailStatus('Email connected! Bank alerts will be parsed automatically.');
      } catch (e) {
        setEmailStatus('Failed to connect email.');
      }
    });
  };

  // Fetch bank alerts from backend
  const handleFetchAlerts = async () => {
    setAlertsLoading(true);
    setAlerts([]);
    try {
      const res = await fetch('http://localhost:5000/api/email/alerts');
      const data = await res.json();
      setAlerts(data.alerts || []);
    } catch {
      setAlerts([]);
    }
    setAlertsLoading(false);
  };

  // Generic handler for all features
  const handleAI = async (feature) => {
    setLoading(true);
    setResult('');
    let endpoint = '';
    let body = { userId };
    switch (feature) {
      case 'track':
        endpoint = 'http://localhost:5000/api/money/track';
        body = { ...body, entry: input };
        break;
      case 'save':
        endpoint = 'http://localhost:5000/api/money/save';
        body = { ...body, query: input };
        break;
      case 'funding':
        endpoint = 'http://localhost:5000/api/money/funding';
        body = { ...body, query: input };
        break;
      case 'plan':
        endpoint = 'http://localhost:5000/api/money/plan';
        body = { ...body, query: input };
        break;
      case 'predict':
        endpoint = 'http://localhost:5000/api/money/predict';
        body = { ...body, query: input };
        break;
      case 'habits':
        endpoint = 'http://localhost:5000/api/money/habits';
        body = { ...body, query: input };
        break;
      default:
        return;
    }
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      setResult(data.result || 'No advice found.');
    } catch {
      setResult('Error connecting to AI.');
    }
    setLoading(false);
  };

  // Add Gmail/Outlook connect buttons and analytics UI
  const handleGmailConnect = async () => {
    // Redirect to backend Gmail OAuth2 endpoint
    window.open('http://localhost:5000/api/email/gmail/auth', '_blank');
    setGmailConnected(true);
    setEmailStatus('Gmail connected!');
  };

  const handleOutlookConnect = async () => {
    window.open('http://localhost:5000/api/email/outlook/auth', '_blank');
    setOutlookConnected(true);
    setEmailStatus('Outlook connected!');
  };

  const handleFetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/email/analytics?userId=${userId}`);
      const data = await res.json();
      setAnalytics(data);
    } catch {
      setAnalytics(null);
    }
    setAnalyticsLoading(false);
  };

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const handleStartRecording = async () => {
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  };

  const handleStopRecording = async () => {
    await audioRecorder.stop();
    setVoiceInput(audioRecorder.uri);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.cancelled) {
      setImageUri(result.uri);
    }
  };

  const handleSendVoice = async () => {
    if (!voiceInput) return;
    // Send voice file to backend
    const formData = new FormData();
    formData.append('voice', { uri: voiceInput, name: 'voice.wav', type: 'audio/wav' });
    await fetch('http://localhost:5000/api/money/voice', { method: 'POST', body: formData });
  };

  const handleSendImage = async () => {
    if (!imageUri) return;
    const formData = new FormData();
    formData.append('image', { uri: imageUri, name: 'image.jpg', type: 'image/jpeg' });
    await fetch('http://localhost:5000/api/money/image', { method: 'POST', body: formData });
  };

  const renderFeature = () => {
    const f = features.find(x => x.key === selected);
    if (!f) return null;
    return (
      <View style={styles.detailBox}>
        <Text style={styles.detailTitle}>{f.title}</Text>
        <Text style={styles.cardDesc}>{f.desc}</Text>
        <TextInput
          style={styles.input}
          placeholder={`Enter details...`}
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity style={styles.primaryBtn} onPress={() => handleAI(f.key)} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Icon name={f.icon} size={20} color="#fff" />}
          <Text style={styles.primaryBtnText}>Ask AI</Text>
        </TouchableOpacity>
        {result ? <Text style={styles.resultText}>{result}</Text> : null}
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => { setSelected(null); setInput(''); setResult(''); }}>
          <Icon name="arrow-left" size={20} color="#007AFF" />
          <Text style={styles.secondaryBtnText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.header}>AI Money Brain</Text>
      <Text style={styles.subhead}>Your personal money assistant.</Text>
      {/* Email integration UI */}
      <View style={styles.emailBox}>
        <Text style={styles.emailTitle}>Connect your email to auto-track bank alerts:</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
          <TouchableOpacity style={styles.emailBtn} onPress={handleGmailConnect}>
            <Icon name="gmail" size={22} color="#fff" />
            <Text style={styles.emailBtnText}>Connect Gmail</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.emailBtn} onPress={handleOutlookConnect}>
            <Icon name="microsoft-outlook" size={22} color="#fff" />
            <Text style={styles.emailBtnText}>Connect Outlook</Text>
          </TouchableOpacity>
        </View>
        {gmailConnected || outlookConnected ? (
          <>
            <Text style={styles.emailStatus}>{emailStatus}</Text>
            <TouchableOpacity style={styles.emailBtn} onPress={handleFetchAlerts}>
              <Icon name="refresh" size={20} color="#fff" />
              <Text style={styles.emailBtnText}>Fetch Bank Alerts</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.emailBtn} onPress={handleFetchAnalytics}>
              <Icon name="chart-bar" size={20} color="#fff" />
              <Text style={styles.emailBtnText}>Show Analytics</Text>
            </TouchableOpacity>
            {alertsLoading ? (
              <ActivityIndicator color="#0984e3" style={{ marginTop: 10 }} />
            ) : alerts.length > 0 ? (
              <View style={styles.alertList}>
                {alerts.map((a, i) => (
                  <View key={i} style={styles.alertCard}>
                    <Text style={styles.alertDate}>{a.date}</Text>
                    <Text style={styles.alertType}>{a.type === 'credit' ? 'Income' : 'Expense'}</Text>
                    <Text style={styles.alertAmount}>₦{a.amount}</Text>
                    <Text style={styles.alertDesc}>{a.description}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            {analyticsLoading ? (
              <ActivityIndicator color="#00b894" style={{ marginTop: 10 }} />
            ) : analytics ? (
              <View style={{ marginTop: 16, backgroundColor: '#fff', borderRadius: 10, padding: 14 }}>
                <Text style={{ fontWeight: '700', color: '#0984e3', fontSize: 16 }}>Spending Analytics</Text>
                <Text>Total Spent: ₦{analytics.total}</Text>
                <Text>Advice: {analytics.advice}</Text>
                <Text style={{ marginTop: 8, fontWeight: '600' }}>By Category:</Text>
                {Object.entries(analytics.byCategory).map(([cat, amt], idx) => (
                  <Text key={idx}>{cat}: ₦{amt}</Text>
                ))}
                <Text style={{ marginTop: 8, fontWeight: '600' }}>By Month:</Text>
                {Object.entries(analytics.byMonth).map(([mon, amt], idx) => (
                  <Text key={idx}>{mon}: ₦{amt}</Text>
                ))}
              </View>
            ) : null}
          </>
        ) : null}
      </View>
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
                <Icon name={f.icon} size={32} color="#0984e3" />
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
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 10 }}>
        <TouchableOpacity style={styles.emailBtn} onPress={handleStartRecording} disabled={isRecording}>
          <Icon name="microphone" size={22} color="#fff" />
          <Text style={styles.emailBtnText}>Start Voice</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.emailBtn} onPress={handleStopRecording} disabled={!isRecording}>
          <Icon name="microphone-off" size={22} color="#fff" />
          <Text style={styles.emailBtnText}>Stop Voice</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.emailBtn} onPress={handleSendVoice}>
          <Icon name="send" size={22} color="#fff" />
          <Text style={styles.emailBtnText}>Send Voice</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.emailBtn} onPress={handlePickImage}>
          <Icon name="image" size={22} color="#fff" />
          <Text style={styles.emailBtnText}>Pick Image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.emailBtn} onPress={handleSendImage}>
          <Icon name="send" size={22} color="#fff" />
          <Text style={styles.emailBtnText}>Send Image</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  alertList: {
    marginTop: 12,
    width: '100%',
    gap: 10,
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 1,
  },
  alertDate: { fontSize: 13, color: '#636e72', marginBottom: 2 },
  alertType: { fontSize: 14, fontWeight: '600', color: '#0984e3' },
  alertAmount: { fontSize: 16, fontWeight: '700', color: '#00b894', marginBottom: 2 },
  alertDesc: { fontSize: 13, color: '#636e72' },
  emailBox: {
    backgroundColor: '#dff9fb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    alignItems: 'center',
  },
  emailTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0984e3',
    marginBottom: 8,
    textAlign: 'center',
  },
  emailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0984e3',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    gap: 8,
  },
  emailBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 8,
  },
  emailStatus: {
    color: '#00b894',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  screen: { padding: 18, backgroundColor: '#f5f6fa' },
  header: { fontSize: 26, fontWeight: '700', color: '#0984e3', marginBottom: 6 },
  subhead: { fontSize: 15, color: '#636e72', marginBottom: 18 },
  cardList: { gap: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
    gap: 16,
  },
  iconWrap: { marginRight: 10 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#0984e3' },
  cardDesc: { fontSize: 14, color: '#636e72', marginTop: 2 },
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
  detailTitle: { fontSize: 20, fontWeight: '700', color: '#0984e3', marginBottom: 10, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#e1e5ef', borderRadius: 10, padding: 10, fontSize: 16, marginBottom: 12, backgroundColor: '#fafbff', minHeight: 40 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0984e3', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, gap: 8, marginBottom: 10 },
  primaryBtnText: { color: '#fff', fontWeight: '600', fontSize: 15, marginLeft: 8 },
  secondaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 18, gap: 6 },
  secondaryBtnText: { color: '#007AFF', fontSize: 15, fontWeight: '600', marginLeft: 6 },
  resultText: { color: '#222f3e', fontSize: 15, marginTop: 10, marginBottom: 4, textAlign: 'center' },
});
