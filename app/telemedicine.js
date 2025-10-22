import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../components/AuthContext';

export default function TelemedicineScreen() {
  const [appointments, setAppointments] = useState([]);
  const [patientName, setPatientName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    fetch('/api/telemedicine/appointments')
      .then(res => res.json())
      .then(data => setAppointments(data.appointments || []));
  }, []);

  const handleCreate = async () => {
  // Require authentication for actions
  const requireAuth = (action) => {
    if (!user || !user.id) {
      router.push('/login');
      return;
    }
    action && action();
  };

    if (!patientName || !doctorName || !date) return;
    setLoading(true);
    const res = await fetch('/api/telemedicine/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientName, doctorName, date, reason })
    });
    const data = await res.json();
    if (data.success) setAppointments(prev => [data.appointment, ...prev]);
    setPatientName(''); setDoctorName(''); setDate(''); setReason('');
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Telemedicine</Text>
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Patient Name" value={patientName} onChangeText={setPatientName} />
        <TextInput style={styles.input} placeholder="Doctor Name" value={doctorName} onChangeText={setDoctorName} />
        <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
        <TextInput style={styles.input} placeholder="Reason" value={reason} onChangeText={setReason} />
        <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Booking...' : 'Book Appointment'}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={appointments}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{item.patientName} with {item.doctorName}</Text>
            <Text>{item.date}</Text>
            <Text>{item.reason}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No appointments yet.</Text>}
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
});
