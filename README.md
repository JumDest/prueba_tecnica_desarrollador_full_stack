# MedLeads - Sistema de Gestión de Valoraciones Médicas

Aplicación Full Stack desarrollada para **AH MEDTECH S.A.S.** que permite la captura de solicitudes de valoración médica de pacientes nacionales e internacionales, asignándolas automáticamente a la coordinación correspondiente y permitiendo su gestión a través de un panel administrativo protegido.

---

## Tecnologías Utilizadas

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS.
- **Backend:** Next.js Route Handlers (API Routes).
- **Base de Datos & ORM:** PostgreSQL (vía Supabase) y Prisma ORM.
- **Despliegue:** Vercel.

---

## Cómo Ejecutar en Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/JumDest/prueba_tecnica_desarrollador_full_stack.git
   cd prueba_tecnica_desarrollador_full_stack

2.	Instalar dependencias:
Bash
npm install

3.	Configurar el archivo .env: Copia las variables de entorno explicadas en la sección anterior en un archivo .env.

4.	Sincronizar el esquema de la base de datos con Prisma:
Bash
npx prisma db push

5.	Generar el cliente de Prisma:
Bash
npx prisma generate

6.	Iniciar el servidor de desarrollo:
Bash
npm run dev

7.	Probar la aplicación:
o	Formulario público: Accede a http://localhost:3000
o	Panel de administración: Accede a http://localhost:3000/admin e ingresa la contraseña configurada en ADMIN_PASSWORD.

**Decisiones Técnicas***
1.	Arquitectura Unificada (Next.js App Router): Se seleccionó la implementación de Route Handlers de Next.js (/api/leads y /api/admin/leads) para mantener la aplicación en un repositorio único (monorepo simplificado). Esto optimiza los tiempos de desarrollo, reduce la latencia cliente-servidor y facilita el despliegue continuo en Vercel.

2.	Validación en Doble Capa:
o	Cliente: Validación en tiempo real para retroalimentación inmediata del usuario (HTML required y expresión regular para formato de correo).
o	Servidor: Validación estricta en el Route Handler antes de interactuar con la base de datos para evitar la inyección de datos incompletos mediante peticiones directas por API.

3.	Asignación Automática de Coordinación: Se realiza lógica del negocio del lado del servidor al recibir la petición: si el país seleccionado es Colombia, la solicitud se etiqueta como Nacional; de lo contrario, se asigna a Internacional.

4.	Prisma ORM & PostgreSQL (Supabase): Garantiza seguridad de tipos (Type-Safety) con TypeScript en todo el flujo de datos. Supabase ofrece una instancia administrada de PostgreSQL altamente confiable y escalable.

5.	Autenticación Liviana para /admin: Se implementó una verificación por cabecera de autorización contra la variable de entorno ADMIN_PASSWORD, impidiendo la lectura o modificación de datos sin autenticación previa.
Declaración sobre Uso de Inteligencia Artificial
De acuerdo con las reglas de la prueba técnica:
•	Se utilizaron herramientas de Inteligencia Artificial (Gemini / ChatGPT / Cursor) como asistente de soporte técnico para:
o	Diagnóstico y resolución del error de compatibilidad de CLI en versiones de Prisma.
o	Estructuración y formato en Markdown para los archivos de documentación (RESPUESTAS.md y README.md).
o	Redacción preliminar de las respuestas teóricas y casos de infraestructura de la Parte C.
•	Verificación: Toda la lógica de negocio (validaciones, asignación automática, persistencia en Supabase, diseño responsive con Tailwind CSS y control de estados en el admin) fue revisada, ajustada y probada manualmente.

## Puntos Adicionales e Implementaciones Avanzadas

### 1. Webhook de Pagos con Firma HMAC-SHA256 e Idempotencia
* **Ruta:** `POST /api/webhooks/pago`
* **Verificación de Seguridad:** Valida el encabezado `x-signature` calculando la firma HMAC con algoritmo SHA-256 a partir del cuerpo de la petición y la clave secreta `WEBHOOK_SECRET`.
* **Garantía de Idempotencia (ACID):** Utiliza la tabla `ProcessedWebhook` con la restricción `unique(eventId)`. Si un evento ya fue procesado, retorna un código `200 OK` con la leyenda `"Evento ya procesado previamente (Idempotente)"` sin duplicar la actualización en base de datos.
* **Atomicidad:** La inserción del evento en `ProcessedWebhook` y el cambio de estado del paciente a `Convertido` se realizan dentro de una transacción atómica de Prisma (`prisma.$transaction`).

### 2. Clasificación de Prioridad por IA con Modo Fallback Heurístico
* **Lógica de Triage:** Evalúa el mensaje del paciente y el procedimiento de interés para clasificar la prioridad en `Alta`, `Media` o `Baja`.
* **Integración OpenAI:** Consume el modelo `gpt-3.5-turbo` ajustado a un límite estricto de tokens (`max_tokens: 10`) y un prompt del sistema especializado en triage médico.
* **Resguardo Heurístico (Fallback):** Si `OPENAI_API_KEY` no está configurada o la API externa falla, el sistema conmuta automáticamente a un algoritmo de concordancia de palabras clave (`urgente`, `dolor`, `complicac` $\rightarrow$ *Alta*; `precio`, `cotiz`, `descuento` $\rightarrow$ *Media*; otros $\rightarrow$ *Baja*), garantizando alta disponibilidad sin interrumpir el registro del lead.

### 3. Containerización con Docker
* **Archivos:** `Dockerfile` y `docker-compose.yml`.
* **Despliegue:** Expone el puerto `3000` y gestiona las variables de entorno necesarias para levantar el servicio en cualquier entorno aislado mediante:
  ```bash
  docker compose up --build

  ##  Guía de Pruebas y Verificación Local

### Probar el Webhook de Pagos
Para verificar la firma HMAC y la idempotencia en local, ejecuta el script de prueba en tu terminal:

```bash
node test-webhook.js