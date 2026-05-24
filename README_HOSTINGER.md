# 🏠 Decorhouse BAQ — Guía de Publicación en Hostinger

Guía paso a paso para publicar el sitio web en Hostinger y dejarlo 100% operativo con HTTPS, correo y dominio propio.

---

## PASO 1 — Comprar el Dominio

1. Ir a [hostinger.com/co](https://www.hostinger.com/co) y buscar tu dominio ideal.
2. **Dominios recomendados** (en orden de preferencia):
   - `decorhousebaq.com` ← preferida
   - `decorhousebaq.co` ← opción colombiana
   - `decorhouse-baq.com`
3. Agregar al carrito y completar la compra.
4. Si el dominio preferido no está disponible, usar el chat de Hostinger para pedir sugerencias.

---

## PASO 2 — Contratar el Plan de Hosting

> **Requisito mínimo:** Plan **Web Hosting Premium** (incluye SSL gratuito y múltiples sitios web).

1. En Hostinger, ir a **Hosting → Web Hosting**.
2. Seleccionar el plan **Premium** o superior.
3. Elegir el período (1 año mínimo recomendado para mejor precio).
4. Asociar el dominio comprado en el Paso 1 al plan.

---

## PASO 3 — Subir los Archivos del Sitio

### Opción A: File Manager (más fácil — sin instalar nada)

1. Entrar al **Panel de Hostinger (hPanel)** → `hpanel.hostinger.com`
2. Ir a **Hosting → Administrar → File Manager**
3. Navegar a la carpeta `public_html` (esta es la raíz del sitio)
4. **Eliminar** el archivo `index.html` de bienvenida de Hostinger si existe
5. Subir **todos los archivos del proyecto**:
   - Seleccionar todos los archivos y carpetas de la carpeta `Pagina_Decorhousebaq`
   - Usar el botón **Upload** o arrastrar y soltar
   - Asegurarse de que `.htaccess` suba (a veces los archivos con punto se ocultan — activar "Mostrar archivos ocultos")
6. La estructura final en `public_html` debe ser:
   ```
   public_html/
   ├── index.html
   ├── .htaccess
   ├── sitemap.xml
   ├── robots.txt
   ├── css/
   │   ├── style.css
   │   ├── animations.css
   │   └── chatbot.css
   ├── js/
   │   ├── main.js
   │   └── chatbot.js
   └── assets/
       └── favicon.ico
   ```

### Opción B: FTP con FileZilla (para subidas grandes o frecuentes)

1. En hPanel → **Hosting → Administrar → FTP Accounts**
2. Crear una cuenta FTP o usar las credenciales existentes:
   - **Host:** `ftp.tudominio.com` (o la IP del servidor que aparece en hPanel)
   - **Usuario:** el que creaste en FTP Accounts
   - **Contraseña:** la que asignaste
   - **Puerto:** `21`
3. Descargar e instalar [FileZilla](https://filezilla-project.org/) (gratis)
4. Conectar y arrastrar los archivos de tu PC a la carpeta `public_html`

---

## PASO 4 — Activar SSL Gratuito (HTTPS)

> El `.htaccess` ya tiene la regla para redirigir HTTP → HTTPS automáticamente. Solo necesitas activar el certificado primero.

1. En hPanel → **Hosting → Administrar → SSL**
2. Seleccionar **Let's Encrypt** (gratuito, se renueva automáticamente)
3. Hacer clic en **Instalar** para tu dominio
4. Esperar 5-10 minutos mientras se genera el certificado
5. Verificar: abrir `http://tudominio.com` — debe redirigir automáticamente a `https://tudominio.com`

---

## PASO 5 — Apuntar el Dominio al Hosting (DNS)

> Si compraste el dominio y el hosting en Hostinger, este paso es automático. Solo necesitas esto si el dominio está en otro registrador.

**Si el dominio está en otro registrador (GoDaddy, Namecheap, etc.):**

1. En hPanel → **Hosting → Administrar** → buscar la sección **Nameservers** o **DNS**
2. Copiar los nameservers de Hostinger (ejemplo: `ns1.dns-parking.com`, `ns2.dns-parking.com`)
3. Ir al panel del registrador donde compraste el dominio
4. Buscar **Nameservers** o **DNS Settings**
5. Reemplazar los nameservers actuales por los de Hostinger
6. Guardar — la propagación tarda entre 1 y 48 horas

---

## PASO 6 — Verificar que .htaccess Esté Activo

El `.htaccess` necesita el módulo `mod_rewrite` de Apache (Hostinger lo tiene activo por defecto).

**Verificación:**
1. Abrir `http://tudominio.com` — debe redirigir a `https://tudominio.com` ✅
2. Abrir `https://tudominio.com` — el sitio debe cargar correctamente ✅
3. Si el sitio muestra **"500 Internal Server Error"**, probablemente el `.htaccess` tiene un error de sintaxis. Contactar soporte de Hostinger o revisar los logs en hPanel → **Logs de Errores**.

---

## PASO 7 — Reemplazar el Dominio en los Archivos

> El proyecto usa `[tu-dominio]` como placeholder. Debes reemplazarlo con tu dominio real antes o después de subir.

**Archivos a modificar:**

| Archivo | Líneas a cambiar |
|---|---|
| `index.html` | `og:image`, `og:url`, `twitter:image`, `canonical`, JSON-LD `url` e `image` |
| `sitemap.xml` | Todas las etiquetas `<loc>` |
| `robots.txt` | Línea `Sitemap:` |

**Cómo hacerlo rápido en VS Code:**
1. Abrir la carpeta del proyecto en VS Code
2. `Ctrl + Shift + H` → Buscar: `[tu-dominio]` → Reemplazar con: `www.tudominio.com`
3. Hacer clic en **Reemplazar todo**
4. Volver a subir los archivos modificados

---

## PASO 8 — Test de Seguridad

Una vez el sitio esté en línea con HTTPS:

1. Ir a **[securityheaders.com](https://securityheaders.com)**
2. Ingresar `https://tudominio.com`
3. El resultado esperado es calificación **A** o **A+**
4. Si hay headers faltantes, revisar el `.htaccess` y que el módulo `mod_headers` esté activo en Hostinger

---

## PASO 9 — Test de Velocidad

1. Ir a **[pagespeed.web.dev](https://pagespeed.web.dev)**
2. Ingresar la URL del sitio
3. Revisar los resultados de **Mobile** y **Desktop**
4. Puntajes esperados:
   - Performance: 80+ (mobile), 90+ (desktop)
   - Accessibility: 90+
   - Best Practices: 90+
   - SEO: 95+

**Si el Performance es bajo:**
- Verificar que la compresión GZIP del `.htaccess` esté activa
- Considerar subir las imágenes de Decorhouse BAQ en formato `.webp` en lugar de `.jpg`
- Las imágenes de Unsplash ya están optimizadas vía CDN

---

## PASO 10 — Reemplazar Imágenes Placeholder

> Las imágenes actuales son de Unsplash (licencia libre). Para publicar el portafolio real de Decorhouse BAQ:

**Opción A — Reemplazar URLs directamente en el HTML:**
1. Abrir `index.html` en VS Code
2. Buscar cada URL de Unsplash (empieza con `https://images.unsplash.com/`)
3. Reemplazar con la URL o ruta de la foto real de Decorhouse BAQ
4. Si las fotos están en Hostinger: subirlas a `public_html/assets/galeria/` y usar rutas relativas: `assets/galeria/nombre-foto.jpg`

**Opción B — Nombrar archivos igual:**
1. Nombrar las fotos reales con nombres descriptivos (ej: `sala-moderna-barranquilla.webp`)
2. Subirlas a `public_html/assets/`
3. Actualizar las rutas en el HTML

**Formato recomendado para las fotos:**
- Formato: `.webp` (mejor compresión) o `.jpg`
- Tamaño máximo: 200KB por imagen (usar [squoosh.app](https://squoosh.app) para comprimir)
- Dimensiones: 1200×800px para galería, 1920×1080px para hero

---

## PASO 11 — Actualizar el Número de WhatsApp

Si el número de WhatsApp cambia, buscar y reemplazar en estos archivos:

| Archivo | Texto a buscar |
|---|---|
| `index.html` | `573016094742` y `+57 301 609 4742` |
| `js/chatbot.js` | `const PHONE = '573016094742'` |
| `js/main.js` | `573016094742` |

**Formato correcto:** sin el `+`, sin espacios: `57XXXXXXXXXX`

---

## PASO 12 — Lista de Verificación Final ✅

Marcar cada punto antes de considerar el sitio listo para producción:

- [ ] Dominio activo y apuntando al hosting
- [ ] SSL/HTTPS activo (candado verde en el navegador)
- [ ] `.htaccess` funciona (HTTP redirige a HTTPS)
- [ ] `[tu-dominio]` reemplazado en todos los archivos
- [ ] Imágenes reales de Decorhouse BAQ subidas
- [ ] Favicon personalizado con logo de Decorhouse BAQ
- [ ] Test en Chrome, Firefox, Safari, Edge
- [ ] Test en iOS Safari y Chrome Android (mobile)
- [ ] Formulario de contacto probado (abre WhatsApp con datos)
- [ ] Chatbot Valentina probado (flujo completo)
- [ ] Galería con lightbox probada
- [ ] securityheaders.com → calificación A o A+
- [ ] pagespeed.web.dev → Performance 80+
- [ ] Google Search Console configurado (agregar sitemap)
- [ ] Google Business Profile actualizado con el nuevo sitio web

---

## SOPORTE

- **Soporte Hostinger:** chat 24/7 en hPanel
- **WhatsApp Decorhouse BAQ:** +57 301 609 4742
- **Facebook:** [facebook.com/decorhousebaq](https://www.facebook.com/decorhousebaq/)

---

*Guía generada para Decorhouse BAQ — Barranquilla, Colombia*
*Stack: HTML5 + CSS3 + JS Vanilla | Hosting: Hostinger Apache*
