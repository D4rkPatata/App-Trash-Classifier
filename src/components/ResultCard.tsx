import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { ClassificationResult } from '../hooks/useClassifier';

const CATEGORY_ICONS: Record<string, string> = {
  'Botella plástica': '🍶',
  'Plástico': '🛍️',
  'Metal': '🥫',
  'Vidrio': '🍾',
  'Cartón': '📦',
  'Papel': '📄',
  'Residuo general': '🗑️',
  'Orgánico': '🍃',
  'Pilas': '🔋',
  'RAEE': '📱',
  'Desconocido': '❓',
};

interface Props {
  imageUri: string;
  result: ClassificationResult;
  onRetry: () => void;
}

export function ResultCard({ imageUri, result, onRetry }: Props) {
  const icon = CATEGORY_ICONS[result.label] ?? '♻️';

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.photo} resizeMode="cover" />

      <View style={styles.card}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{result.label}</Text>

        <View style={styles.barBackground}>
          <View style={[
            styles.barFill,
            { width: `${result.confidence}%`, backgroundColor: result.label === 'Desconocido' ? '#6b7280' : '#4ade80' }
          ]} />
        </View>
        <Text style={styles.confidence}>{result.confidence}% de confianza</Text>

        <TouchableOpacity style={styles.button} onPress={onRetry} activeOpacity={0.8}>
          <Text style={styles.buttonText}>
            {result.label === 'Desconocido'
              ? 'Volver a tomar foto al RESIDUO'
              : 'Intentar de nuevo'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  photo: {
    width,
    height: '60%',
  },
  card: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 24,
    gap: 12,
  },
  icon: {
    fontSize: 56,
  },
  label: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  barBackground: {
    width: '100%',
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 4,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#4ade80',
    borderRadius: 5,
  },
  confidence: {
    fontSize: 15,
    color: '#9ca3af',
  },
  button: {
    marginTop: 16,
    backgroundColor: '#4ade80',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 50,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});
