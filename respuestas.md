# RESPUESTAS PRUEBA TÉCNICA - AH MEDTECH S.A.S.

## Parte A. Conocimientos técnicos

### A.1 Selección múltiple

1- B
2- B
3- B
4- B
5- C
6- A
7- B
8- B
9- A
10- B
11- B
12- B
13- B
14- B
15- A

### A.2 Respuesta corta

16. **Diferencia:** La autenticación verifica la identidad del usuario (quién es), mientras que la autorización determina los permisos y accesos a los recursos (qué puede hacer).  
**Implementación y Almacenamiento:** NestJS valida las credenciales y devuelve un *access token* (corta duración) y un *refresh token* (larga duración). Ambos deben almacenarse en el cliente utilizando cookies con las banderas `httpOnly`, `Secure` y `SameSite=Strict` enviadas directamente desde la respuesta del backend. En Next.js, la gestión de estas peticiones debe hacerse preferiblemente mediante Route Handlers o Server Actions para asegurar la correcta transmisión de las cookies.  
**Justificación:** El uso de cookies `httpOnly` evita que código JavaScript malicioso acceda a los tokens, mitigando ataques XSS, mientras que los atributos `Secure` y `SameSite` previenen vulnerabilidades CSRF.

17. **Diferencia:** `git merge` integra historiales creando un commit de fusión que preserva el contexto exacto de las ramas, mientras que `git rebase` reescribe el historial moviendo los commits a la punta de la rama destino, logrando un árbol lineal y limpio.  
**Flujo propuesto (Equipos pequeños / VPS):**
1. `main`: Rama protegida que refleja estrictamente el código en producción.
2. `feature/*` o `fix/*`: Ramas de desarrollo creadas a partir de `main`.
3. **Integración:** Vía Pull Request usando *Squash and merge* para mantener el historial de `main` conciso (1 feature = 1 commit).
4. **Despliegue:** Automatizado vía GitHub Actions que, al detectar un merge en `main`, ingresa al VPS por SSH y ejecuta el pipeline de actualización (ej. `git pull && docker compose up -d --build`).

18. **Pre-carga del LCP (Hero):** Asignar la propiedad `priority` en el componente `<Image/>` de Next.js para la imagen principal, forzando al navegador a precargarla en el inicio de la cascada de red.  
**Server Components (RSC):** Entregar el HTML inicial pre-renderizado desde el servidor en lugar de bloquear la carga esperando peticiones de datos en el cliente (como un `useEffect`).  
**Carga diferida de scripts:** Utilizar el componente `<Script>` con `strategy="afterInteractive"` o `lazyOnload` para posponer la carga de JS de terceros (analíticas, chatbots) que bloqueen el hilo principal.  
**Auto-alojamiento de fuentes:** Implementar `next/font` para cargar fuentes localmente en tiempo de compilación, eliminando llamadas de red adicionales a Google Fonts y evitando retrasos de renderizado.

19. Para agregar funcionalidad, crear un **Child Theme** (usando su `functions.php`) o empaquetar el código en un **Plugin personalizado** (o *mu-plugin*).  
Antes de actualizar en producción, se debe realizar un backup completo (base de datos y archivos) y probar primero la actualización en un entorno de Staging.  
**Justificación:** Aislar el código en un plugin o Child Theme evita que las actualizaciones del tema padre sobrescriban tus modificaciones. Los backups y el entorno de staging garantizan la continuidad del negocio al prevenir caídas en producción por posibles incompatibilidades.

20. 
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