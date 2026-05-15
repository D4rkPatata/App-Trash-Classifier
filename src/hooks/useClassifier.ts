import { useEffect, useRef, useState } from 'react';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import { loadTensorflowModel, TfliteModel } from 'react-native-fast-tflite';
import jpeg from 'jpeg-js';

import labels from '../../assets/labels.json';

export interface ClassificationResult {
  label: string;
  confidence: number;
}

export function useClassifier() {
  const modelRef = useRef<TfliteModel | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadModel() {
      try {
        const asset = Asset.fromModule(require('../../assets/model.tflite'));
        await asset.downloadAsync();
        if (!asset.localUri) throw new Error('localUri es null');
        const model = await loadTensorflowModel({ url: asset.localUri }, []);
        if (!cancelled) {
          modelRef.current = model;
          setReady(true);
        }
      } catch (e) {
        console.error('[Classifier] Error cargando modelo:', e);
      }
    }

    loadModel();
    return () => { cancelled = true; };
  }, []);

  async function classify(imageUri: string): Promise<ClassificationResult> {
    if (!modelRef.current) throw new Error('Modelo no cargado');

    // 1. Redimensionar a 224x224
    const resized = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 224, height: 224 } }],
      { format: ImageManipulator.SaveFormat.JPEG, compress: 0.95 }
    );

    // 2. Leer como base64 y decodificar JPEG → pixels RGBA
    const base64 = await FileSystem.readAsStringAsync(resized.uri, {
      encoding: 'base64',
    });
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const { data: pixels } = jpeg.decode(bytes.buffer, { useTArray: true });

    // 3. Extraer RGB como Uint8Array — el modelo hace el preprocesamiento internamente
    const input = new Uint8Array(224 * 224 * 3);
    for (let i = 0; i < 224 * 224; i++) {
      input[i * 3 + 0] = pixels[i * 4 + 0]; // R
      input[i * 3 + 1] = pixels[i * 4 + 1]; // G
      input[i * 3 + 2] = pixels[i * 4 + 2]; // B
    }

    // 4. Inferencia
    const outputs = await modelRef.current.run([input.buffer]);
    const probabilities = new Float32Array(outputs[0]);

    // 5. Argmax
    let maxIdx = 0;
    for (let i = 1; i < probabilities.length; i++) {
      if (probabilities[i] > probabilities[maxIdx]) maxIdx = i;
    }

    const confidence = Math.round(probabilities[maxIdx] * 100);
    return {
      label: confidence >= 75 ? (labels as string[])[maxIdx] : 'Desconocido',
      confidence,
    };
  }

  return { classify, ready };
}
