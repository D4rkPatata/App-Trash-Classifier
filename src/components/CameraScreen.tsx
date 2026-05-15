import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useClassifier, ClassificationResult } from '../hooks/useClassifier';
import { ResultCard } from './ResultCard';

type ScreenState = 'camera' | 'classifying' | 'result';

export function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const { classify, ready } = useClassifier();
  const cameraRef = useRef<CameraView>(null);

  const [state, setState] = useState<ScreenState>('camera');
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [result, setResult] = useState<ClassificationResult | null>(null);

  async function handleCapture() {
    if (!cameraRef.current || !ready) return;

    const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
    if (!photo) return;

    setCapturedUri(photo.uri);
    setState('classifying');

    try {
      const classification = await classify(photo.uri);
      setResult(classification);
      setState('result');
    } catch (e) {
      console.error('Error clasificando:', e);
      setState('camera');
    }
  }

  function handleRetry() {
    setCapturedUri(null);
    setResult(null);
    setState('camera');
  }

  // Permiso denegado permanentemente
  if (permission && !permission.canAskAgain && !permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionText}>
          Permiso de cámara denegado. Habilitalo desde Configuración.
        </Text>
      </View>
    );
  }

  // Pedir permiso
  if (!permission?.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionText}>Necesitamos acceso a la cámara</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Conceder permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (state === 'result' && capturedUri && result) {
    return <ResultCard imageUri={capturedUri} result={result} onRetry={handleRetry} />;
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />

      {state === 'classifying' && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#4ade80" />
          <Text style={styles.classifyingText}>Clasificando...</Text>
        </View>
      )}

      {state === 'camera' && (
        <View style={styles.controls}>
          {!ready && (
            <Text style={styles.loadingModel}>Cargando modelo...</Text>
          )}
          <TouchableOpacity
            style={[styles.captureButton, !ready && styles.captureButtonDisabled]}
            onPress={handleCapture}
            disabled={!ready}
            activeOpacity={0.8}
          >
            <View style={styles.captureInner} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 32,
    gap: 16,
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#4ade80',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 50,
  },
  permissionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  classifyingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  controls: {
    position: 'absolute',
    bottom: 48,
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  loadingModel: {
    color: '#9ca3af',
    fontSize: 14,
  },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.4,
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
  },
});
