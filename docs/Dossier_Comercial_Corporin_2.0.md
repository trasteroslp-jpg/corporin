# Dossier Comercial: Evolución AVIS Corporín 2.0
**Propuesta de Valor para la Transformación Digital de la Atención al Cliente**

---

## 1. Executive Summary (Resumen Ejecutivo)
La presente propuesta detalla la transición del actual sistema de asistencia (Bot 1.0) hacia el nuevo ecosistema **Corporín 2.0**. Basado en Inteligencia Artificial Generativa (LLMs), este nuevo motor no solo responde dudas, sino que **razona, extrae datos críticos proactivamente y se integra en la operativa de seguridad** de la compañía, reduciendo la carga del Call Center y mejorando la satisfacción del cliente corporativo.

---

## 2. Comparativa: Bot 1.0 vs. Corporín 2.0

| Característica | Chatbot 1.0 (Anterior) | Corporín 2.0 (Propuesta) |
| :--- | :--- | :--- |
| **Tecnología** | Basado en flujo rígido/palabras clave. | IA Generativa (Gemini 2.5 Flash). |
| **Comprensión** | Limitada. No entiende contexto ni matices. | Natural y multilingüe. Entiende voz y texto. |
| **Gestión de Datos** | El usuario debe repetir datos (DNI, Matrícula). | **Extracción automática** mediante Regex y memoria de sesión. |
| **Resolución** | Deriva casi todo al Call Center (928...). | Resuelve dudas complejas usando el manual (`extracted_knowledge.txt`). |
| **Alertas Críticas** | Mensaje estándar de "incidencia enviada". | **Notificaciones inmediatas al Admin** con ficha completa del cliente. |
| **Simulación de Email** | Básica o inexistente. | Generación de log de emails con **historial completo de conversación**. |

---

## 3. Puntos Críticos Resueltos (Basado en Auditoría 2026)
Analizando las conversaciones reales de 2026, hemos detectado y corregido en la versión 2.0:
- **Frustración por "No me atienden"**: El Bot 1.0 solía enviar un mensaje genérico de "un agente le atenderá" incluso en fin de semana. Corporín 2.0 identifica el horario y sugiere alternativas reales o escala alertas críticas al instante.
- **Dificultad en Identificación**: Los clientes perdían tiempo dando su DNI. Corporín 2.0 extrae el DNI y la matrícula en cuanto aparecen en el chat, enviándolos ya masticados al departamento correspondiente.
- **Soporte Multilingüe Real**: A diferencia del 1.0, el motor 2.0 maneja inglés, italiano, alemán y español con fluidez nativa.

---

## 4. Funcionalidades de Corporín 2.0 (Fases)

### Fase Actual (Implementada)
*   **Omnicanalidad**: Soporte para mensajes de voz (transcripción automática) y texto.
*   **Seguridad Administrada**: Registro de un `adminId` único para la recepción de alertas de incidentes graves (fuego, accidentes).
*   **Base de Conocimiento Dinámica**: Acceso a manuales internos para respuestas precisas sobre procesos de entrega/devolución.
*   **Ficha de Incidencia**: Generación de logs con DNI, Matrícula, Usuario y Contexto para el Customer Service.

### Fase Futura (Escalabilidad)
*   **Integración API ReserS** (En estudio): Consultar estado de reserva en tiempo real desde el chat.
*   **Check-in Digital asistido**: Ayudar al usuario a validar su documentación mediante visión artificial.
*   **Dashboard de Métricas**: Analítica avanzada sobre los motivos de consulta más frecuentes para toma de decisiones en flota.

---

## 5. Conclusión y Visión para el CEO
La implementación de Corporín 2.0 sitúa a AVIS Canarias a la vanguardia tecnológica del Rent-a-Car. No se trata de un simple chat de respuesta, sino de un **asistente proactivo** que ahorra costes operativos, filtra las urgencias reales y garantiza que ningún cliente se sienta desatendido, especialmente en momentos críticos de recogida o devolución del vehículo.

---
**Preparado por:** Antigravity (IA Development Team)
**Para:** Dirección General AVIS Canarias
**Fecha:** 09 de Marzo de 2026
