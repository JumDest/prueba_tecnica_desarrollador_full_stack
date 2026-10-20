# RESPUESTAS PRUEBA TÉCNICA - AH MEDTECH S.A.S.

## Parte A. Conocimientos técnicos

### A.1 Selección múltiple

1. **b** — Una operación síncrona pesada bloquea el único hilo del Event Loop, deteniendo las demás peticiones.
2. **b** — `A` y `D` son síncronos; `C` es una microtarea de Promise que se ejecuta antes de la macrotarea `B` del `setTimeout`.
3. **b** — En el App Router de Next.js, todo componente es un Server Component por defecto a menos que se use `"use client"`.
4. **b** — ISR / `revalidate` es ideal para actualizar páginas periódicamente manteniendo un excelente SEO y carga rápida estática.
5. **c** — Los Pipes, como `ValidationPipe`, se encargan de validar y transformar el payload contra el DTO.
6. **a** — Los Guards se ejecutan antes de los interceptores y manejan la autorización/roles.
7. **b** — Crear un índice en la columna `email` es la solución directa para búsquedas exactas en tablas grandes.
8. **b** — Es el problema de iterar sobre una lista y hacer un `SELECT` por cada ítem en lugar de usar un `JOIN` o `IN`.
9. **a** — Las transacciones ACID garantizan que o se completan ambos pasos, o se hace rollback y no se guarda ninguno.
10. **b** — Los volúmenes en Docker son el mecanismo estándar para persistir datos fuera del ciclo de vida del contenedor.
11. **b** — En la red interna de Docker Compose, los servicios se resuelven por su nombre de servicio (ej. `postgres:5432`).
12. **b** — Un error 502 significa que Nginx funciona como proxy, pero la aplicación Node.js/NestJS está caída o no responde en el puerto esperado.
13. **b** — Verificar la firma garantiza seguridad, y la idempotencia evita que un reintento de la pasarela duplique un pago.
14. **b** — Las claves de API nunca deben exponerse con `NEXT_PUBLIC_`, deben quedarse seguras en el servidor/Route Handler.
15. **a** — Los registros tipo A (Address) mapean un dominio o subdominio a una dirección IPv4.

---

### A.2 Respuesta corta

16. **Autenticación y Autorización con JWT:**
    - **Diferencia:** La autenticación verifica la identidad del usuario (quién es), mientras que la autorización determina los permisos y accesos a los recursos (qué puede hacer).
    - **Implementación y Almacenamiento:** NestJS valida las credenciales y devuelve un *access token* (corta duración) y un *refresh token* (larga duración). Ambos se almacenan en el cliente utilizando cookies con las banderas `httpOnly`, `Secure` y `SameSite=Strict` enviadas directamente desde la respuesta del backend. En Next.js, la gestión de estas peticiones se realiza mediante Route Handlers o Server Actions para asegurar la correcta transmisión de las cookies.
    - **Justificación:** El uso de cookies `httpOnly` evita que código JavaScript malicioso acceda a los tokens (mitigando ataques XSS), mientras que los atributos `Secure` y `SameSite` previenen vulnerabilidades CSRF.

17. **Git Merge vs Git Rebase y Flujo de Trabajo:**
    - **Diferencia:** `git merge` integra historiales creando un commit de fusión que preserva el contexto exacto de las ramas, mientras que `git rebase` reescribe el historial moviendo los commits a la punta de la rama destino, logrando un árbol lineal y limpio.
    - **Flujo propuesto (Equipos pequeños / VPS):**
      1. `main`: Rama protegida que refleja estrictamente el código en producción.
      2. `feature/*` o `fix/*`: Ramas de desarrollo creadas a partir de `main`.
      3. **Integración:** Vía Pull Request usando *Squash and merge* para mantener el historial de `main` conciso (1 feature = 1 commit).
      4. **Despliegue:** Automatizado vía GitHub Actions que, al detectar un merge en `main`, ingresa al VPS por SSH y ejecuta el pipeline de actualización (`git pull && docker compose up -d --build`).

18. **Optimización de LCP (Largest Contentful Paint):**
    - **Pre-carga del LCP (Hero):** Asignar la propiedad `priority` en el componente `<Image/>` de Next.js para la imagen principal, forzando al navegador a precargarla en el inicio de la cascada de red.
    - **Server Components (RSC):** Entregar el HTML inicial pre-renderizado desde el servidor en lugar de bloquear la carga esperando peticiones de datos en el cliente (como un `useEffect`).
    - **Carga diferida de scripts:** Utilizar el componente `<Script>` con `strategy="afterInteractive"` o `lazyOnload` para posponer la carga de JS de terceros (analíticas, chatbots) que bloqueen el hilo principal.
    - **Auto-alojamiento de fuentes:** Implementar `next/font` para cargar fuentes localmente en tiempo de compilación, eliminando llamadas de red adicionales a Google Fonts y evitando retrasos de renderizado.

19. **Personalización y Actualización en WordPress:**
    - **Estrategia:** Crear un **Child Theme** (usando su `functions.php`) o empaquetar el código en un **Plugin personalizado** (o *mu-plugin*).
    - **Precauciones:** Antes de actualizar en producción, realizar un backup completo (base de datos y archivos) y probar primero la actualización en un entorno de Staging.
    - **Justificación:** Aislar el código en un plugin o Child Theme evita que las actualizaciones del tema padre sobrescriban las modificaciones. Los backups y el entorno de staging garantizan la continuidad del negocio al prevenir caídas en producción por posibles incompatibilidades.

20. **Consulta SQL de Conversión en PostgreSQL:**
    ```sql
    SELECT
        fuente,
        COUNT(*) AS total_leads,
        COUNT(*) FILTER (WHERE estado = 'convertido') AS leads_convertidos,
        ROUND((COUNT(*) FILTER (WHERE estado = 'convertido') * 100.0) / COUNT(*), 2) AS tasa_conversion
    FROM
        leads
    WHERE
        created_at >= NOW() - INTERVAL '30 days'
    GROUP BY
        fuente
    ORDER BY
        tasa_conversion DESC;
    ```
    - **Justificación:** La cláusula `FILTER` propia de PostgreSQL optimiza la agregación condicional frente a sentencias `CASE`. Multiplicar por `100.0` garantiza la conversión implícita a tipo numérico flotante antes del redondeo a dos decimales con `ROUND()`.

---

## Parte C. Casos de diagnóstico e infraestructura

### Caso 1. Sitio caído después de un reinicio

**a) Diagnóstico (Comandos):**
1. Conectarse mediante SSH al servidor: `ssh usuario@ip_servidor`.
2. Verificar el estado del servicio proxy Nginx: `sudo systemctl status nginx`.
3. Consultar los logs de error de Nginx: `sudo tail -n 50 /var/log/nginx/error.log`.
4. Verificar el estado de los contenedores Docker: `docker ps -a`.
5. Inspeccionar los logs del contenedor de la aplicación caído: `docker logs <nombre_o_id_contenedor>`.

**b) Solución:**
1. Iniciar o reiniciar los contenedores afectados mediante Docker Compose: `docker compose up -d`.
2. Confirmar que el puerto mapeado por el contenedor de Node.js coincida exactamente con la directiva `proxy_pass` en la configuración de Nginx (`/etc/nginx/sites-available/`).
3. Recargar la configuración de Nginx: `sudo systemctl reload nginx`.

**c) Prevención:**
1. Configurar la directiva `restart: unless-stopped` en el archivo `docker-compose.yml` para el inicio automático tras reinicios del SO.
2. Habilitar Nginx como servicio del sistema: `sudo systemctl enable nginx`.
3. Configurar monitoreo externo (ej. UptimeRobot) con alertas inmediatas en caso de inactividad.

---

### Caso 2. Código en producción sin control de versiones

**a) Acciones previas:**
1. Crear un respaldo completo del servidor (Snapshot en VPS) y un *dump* de la base de datos de producción (`pg_dump`).
2. Copiar todo el directorio del proyecto del VPS a un entorno local de manera segura mediante `rsync` o `scp`.

**b) Migración a GitHub:**
1. Configurar el archivo `.gitignore` para omitir credenciales, variables de entorno (`.env`), `node_modules` y directorios de compilación (`.next`, `dist`).
2. Crear el archivo `.env.example` con claves de referencia y valores ficticios.
3. Inicializar el repositorio Git (`git init`), crear el primer commit en `main` y sincronizarlo con el repositorio de GitHub (`git push -u origin main`).

**c) Flujo de despliegue futuro:**
1. Implementar flujo basado en ramas (`main` para código de producción, ramas `feature/*` para desarrollo).
2. Configurar CI/CD mediante **GitHub Actions** para que al realizar *merge* a `main`, un *script* se conecte por SSH al VPS, ejecute `git pull` y reinicie los contenedores automáticamente.

---

### Caso 3. Costos del chatbot de IA

**a) Diagnóstico:**
1. Revisar el panel de métricas de la API de IA (tokens por minuto, llamadas totales, errores) para identificar picos anómalos.
2. Analizar el historial de ejecuciones en **n8n** y **ManyChat** para descartar bucles infinitos de mensajes, reintentos en fallo o ataques automáticos de *spam*.

**b) Controles técnicos:**
1. Establecer límites de costo (*Hard Limits* y *Soft Limits*) directamente en el proveedor de la API de IA.
2. Implementar un limitador de tasa (*Rate Limiting*) por IP y usuario en las llamadas al bot.
3. Configurar caché de respuestas (Redis) para evitar invocar el modelo en preguntas frecuentes repetitivas.

**c) Seguridad y Protección de Datos (Ley 1581 de 2012):**
1. **Prompt Injection:** Validar y desinfectar el *input* del usuario antes de incluirlo en el prompt, definiendo un *System Prompt* estricto que prohíba salirse del rol de triage médico.
2. **Habeas Data (Ley 1581):** Configurar el bot para omitir el envío de Datos Personales Sensibles a APIs de terceros y presentar siempre la política de tratamiento de datos antes de iniciar la consulta.