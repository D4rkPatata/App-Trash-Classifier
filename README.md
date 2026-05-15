# ReciclameApp

App móvil para clasificar residuos mediante la cámara del dispositivo. Toma una foto y el modelo de IA identifica el tipo de material reciclable al instante, sin conexión a internet.

## Tecnologías

- React Native + Expo
- TypeScript
- TensorFlow Lite (inferencia on-device)

## Categorías detectadas

Botella plástica · Plástico · Metal · Vidrio · Cartón · Papel · Residuo general · Orgánico · Baterías · Residuo electrónico (RAEE)

> La clasificación requiere al menos 75% de confianza. Por debajo de ese umbral muestra "Desconocido".

## Requisitos

- Node.js 18+
- Expo CLI
- Android SDK (API 26+) o Xcode para iOS

## Instalación

```bash
npm install
```

## Scripts

| Comando | Descripción |
|---|---|
| `npm start` | Inicia el servidor de desarrollo Expo |
| `npm run android` | Ejecuta en Android |
| `npm run ios` | Ejecuta en iOS |
| `npm run web` | Ejecuta en navegador |

## Estructura

```
assets/          # Modelo TFLite, labels, iconos
src/
  components/    # CameraScreen, ResultCard
  hooks/         # useClassifier (inferencia con TFLite)
App.tsx          # Punto de entrada
```
