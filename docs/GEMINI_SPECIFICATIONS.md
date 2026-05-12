# Especificaciones de Gemini - Proyecto Corporin

## ⚠️ IMPORTANTE: Configuración de Modelos
Este proyecto tiene una configuración de acceso a modelos de Gemini **poco común** en Google Cloud. Para evitar errores 404 ("Model not found"), se deben seguir estas reglas:

1. **Modelo Principal:** `gemini-2.5-flash`
   - **NO USAR** `gemini-1.5-flash` ni `gemini-2.0-flash` (devuelven error 404 en este proyecto).
   - Este modelo es el que está configurado por defecto tanto en el bot (`index.js`) como en el Proxy (`functions/index.js`).

2. **Gestión de la API Key:**
   - La clave **NUNCA** debe estar en el código ni en el archivo `.env`.
   - Se gestiona como un secreto de Firebase llamado `GEMINI_KEY`.
   - Para actualizarla: `firebase functions:secrets:set GEMINI_KEY`.

3. **Arquitectura del Proxy:**
   - El bot no llama a Google directamente. Llama a la Cloud Function `geminiProxy`.
   - Si se cambia la lógica del proxy, desplegar con: `firebase deploy --only functions:geminiProxy`.

4. **URL del Proxy (DEV):**
   `https://us-central1-corporin-avis-chatbot.cloudfunctions.net/geminiProxy`

---
*Nota: Este archivo ha sido creado tras la resolución del incidente del 12 de Marzo de 2026 para asegurar la estabilidad de PROD y DEV.*
