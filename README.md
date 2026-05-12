# 🚗 Corporin - Asistente Inteligente Multimodal (AVIS Canarias)

**Corporin** es un ecosistema de asistencia virtual de vanguardia diseñado para el soporte de clientes corporativos de AVIS en las Islas Canarias. Utiliza Inteligencia Artificial Generativa (Google Gemini) para ofrecer una experiencia multimodal (Texto, Voz e Imagen) y omnicanal (Telegram y Teléfono).

---

## 🌟 Características Destacadas

*   **🧠 IA Multimodal (Gemini 2.5 Flash):** Capacidad para analizar textos complejos, fotos de incidencias/daños y notas de voz simultáneamente.
*   **📞 Integración de Voz (Vapi + Deepgram):** Soporte para llamadas telefónicas automáticas con latencia mínima, utilizando voces neuronales de alta calidad.
*   **🤖 Orquestación Multi-mensaje (Debounce):** Sistema inteligente que agrupa mensajes consecutivos del usuario para procesarlos como una única unidad de contexto.
*   **🛡️ Arquitectura Segura (Proxy LLM):** Las API Keys de inteligencia artificial están protegidas tras una capa de **Google Cloud Functions**, evitando exposición en el cliente.
*   **📡 Alertas en Tiempo Real:** Sistema de triaje automático que detecta emergencias y notifica al instante a los administradores vía Telegram.
*   **📊 Telemetría y Métricas:** Registro detallado en **Firestore** de cada interacción para análisis de sentimiento, uso de tokens y efectividad del soporte.

---

## 🏗️ Diagrama de Arquitectura

El sistema está diseñado bajo una arquitectura modular y serverless para garantizar escalabilidad y seguridad:

```mermaid
graph TD
    %% Usuarios
    User_Telegram[Usuario en Telegram]
    User_Phone[Usuario Telefónico]
    
    %% Core Telegram
    subgraph Telegram_Bot [Node.js Core Bot]
        Bot[index.js - Telegraf]
        Audio[Procesamiento Audio / FFmpeg]
        Images[Procesamiento Fotos]
    end

    %% Firebase Serverless
    subgraph Firebase_Cloud_Functions [Cloud Functions]
        Proxy[geminiProxy]
        Webhook[vapiWebhook]
    end

    %% Voz Vapi
    subgraph Vapi_Platform [Plataforma Vapi]
        Voice_AI[Voicebot IA]
    end

    %% Bases de Datos
    subgraph Firebase_Storage_y_DB [Firebase Backend]
        Storage[(Firebase Storage)]
        Firestore[(Firestore)]
    end

    %% Interacciones Telegram
    User_Telegram -- Texto / Fotos / Voz --> Bot
    Bot -- Guarda Fotos --> Storage
    Bot -- Consulta IA --> Proxy
    Bot -- Escribe Logs/Métricas --> Firestore
    Bot -- Notificaciones --> Admin[Administrador Telegram]

    %% Interacciones Voz
    User_Phone -- Llama --> Voice_AI
    Voice_AI -- Webhooks / Tools --> Webhook
    Webhook -- Registra llamada/incidencia --> Firestore
    Webhook -- Alertas urgentes --> Admin

    %% Gemini
    Proxy -- Peticiones seguras --> Google_Gemini[API Google Gemini]
```

---

## 🔍 Flujos de Operación

### 1. El Sistema de "Debounce"
Para evitar que la IA procese mensajes fragmentados, el bot utiliza un temporizador inteligente de 2.5s que reinicia el buffer cada vez que llega un nuevo elemento (texto, audio o foto), permitiendo que el usuario envíe una incidencia completa antes de generar una respuesta.

### 2. Capa de Seguridad (Proxy)
El bot principal **no tiene acceso directo** a las llaves de Gemini. Realiza peticiones a `geminiProxy` (Cloud Function), donde reside la lógica de autenticación y el manejo de cuotas.

### 3. Escalado Automático
La IA busca etiquetas de instrucción en sus propias respuestas como `[NOTIFICAR_ADMIN]` o `[ENVIAR_EMAIL]`. El orquestador detecta estas etiquetas, ejecuta la acción (notificar al humano) y limpia la respuesta antes de que el usuario final la vea.

---

## 🧩 Lógica del Orquestador Principal (`index.js`)

El funcionamiento del asistente se rige por un conjunto de premisas y protocolos técnicos que garantizan una atención eficiente y segura:

### 1. El "Cerebro" (System Prompt)
La base lógica reside en un `SYSTEM_PROMPT` que define las **Reglas de Oro**:
*   **Prioridad de Resolución:** El bot siempre intenta resolver la incidencia antes de derivar a soporte humano.
*   **Triaje Obligatorio:** Protocolo estricto de autodiagnóstico (Bluetooth, proximidad, reinicio de App) para fallos técnicos.
*   **Control por Etiquetas:** Uso de etiquetas ocultas (`[NOTIFICAR_ADMIN]`, `[ENVIAR_EMAIL]`) para disparar acciones en el backend.
*   **Gestión Horaria de Canarias:** Planes de acción (A, B y C) dinámicos según la hora local y la isla afectada.

### 2. Procesamiento Multimodal y Agregación
*   **Sistema de Debounce:** Agrupa mensajes, fotos y audios enviados en un intervalo de 2.5s para procesarlos como una única consulta contextual.
*   **Tratamiento de Evidencias:** Subida automatizada a Firebase Storage para generar reportes con enlaces permanentes.
*   **Voz y TTS:** Conversión de notas de voz a texto y respuesta mediante síntesis de voz (Google TTS) con ajuste de velocidad (1.2x) para mayor naturalidad.

### 3. Triage y Extracción de Datos
*   **Identificación Automática:** Extracción mediante Regex de **DNI, Matrícula e Isla** para enriquecer el contexto de la conversación.
*   **Persistencia de Contexto:** Mantenimiento de una ventana de contexto de los últimos 20 mensajes.

### 4. Acciones y Monitorización
*   **Reportes Automáticos:** Generación de logs detallados en Firestore (`logs_emails`) ante incidencias reportadas.
*   **Alertas Críticas:** Reenvío inmediato de evidencias y resúmenes al Telegram del administrador.
*   **Feedback de Usuario:** Sistema integrado de valoración de respuestas para mejora continua del modelo.

---

## 📁 Organización del Proyecto

Tras la última optimización, el proyecto sigue esta estructura:

*   `/index.js`: Orquestador principal del bot de Telegram.
*   `/scripts/`: Más de 100 herramientas de utilidad, tests y scripts de debug.
*   `/docs/`: Documentación técnica detallada y especificaciones de IA.
*   `/functions/`: Lógica serverless (Proxy Gemini y Webhooks Vapi).
*   `/data_exports/`: Logs temporales y volcados de métricas locales.
*   `/servicevoice/`: Configuración del asistente de voz telefónico.
*   `/public/` & `/dashboard/`: Interfaces para monitorización de métricas.

---

## 🚀 Instalación y Despliegue

### Requisitos
*   Node.js v18+
*   Firebase CLI configurado
*   FFmpeg instalado en el servidor

### Configuración
1.  Clonar el repositorio.
2.  Crear archivo `.env` con `TELEGRAM_BOT_TOKEN` y `GEMINI_PROXY_URL`.
3.  Añadir `credentials.json` (Firebase Service Account).
4.  Instalar dependencias: `npm install`.

### Ejecución
```bash
# Iniciar Bot de Telegram
node index.js

# Desplegar Funciones de Cloud
firebase deploy --only functions
```

---

## 🛠️ Tecnologías Empleadas
- **Telegraf** (Telegram API)
- **Firebase** (Firestore, Storage, Hosting, Functions)
- **Google Gemini 2.5 Flash** (IA Generativa)
- **Vapi** (Voice Orchestration)
- **Fluent-FFmpeg** (Media Processing)
- **Google TTS** (Voice Synthesis)
