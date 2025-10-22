import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HealthScreen from '../health';
import TelemedicineScreen from '../telemedicine';

const options = [
  { key: 'health', label: 'Health' },
  { key: 'telemedicine', label: 'Telemedicine' },
];

export default function HealthGroupScreen() {
  const [selected, setSelected] = useState('health');

  let ScreenComponent = selected === 'health' ? HealthScreen : TelemedicineScreen;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.segmentedControl}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt.key}
            style={[styles.button, selected === opt.key && styles.selected]}
            onPress={() => setSelected(opt.key)}
          >
            <Text style={selected === opt.key ? styles.selectedText : styles.text}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ flex: 1 }}>
        <ScreenComponent />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  segmentedControl: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
  },
  selected: {
    backgroundColor: '#007AFF',
  },
  text: {
    color: '#333',
    fontWeight: '500',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '700',
  },
});
