# Resultados de las pruebas ejecutadas — Mukala v2

Fecha: 2026-10-29. Se ejecutó todo lo de `GUIA-PRUEBAS.md` que se puede hacer con scripts, sobre dos versiones: el **código fuente** (sin comprimir) y la **versión de producción** (`dist/`: minificada, con hash en el nombre, brotli y caché inmutable, servida localmente). Los scripts están en `tests/` y se pueden volver a correr (`tests/README.md`).

> **Lectura honesta.** Un script comprueba que algo *existe y funciona*; no comprueba que una persona lo *entienda*. Estos resultados suben la confianza en la implementación (columna A de `AUDITORIA-UX.md`). **No convierten el 4,8 en «certificable»** (columna B): para eso siguen haciendo falta lectores de pantalla reales, aparatos físicos, compradores y la aprobación del cliente.

## 1. Resumen por bloque de la guía

| Bloque | Qué se ejecutó aquí | Resultado | Qué NO se pudo (queda para personas/aparatos) |
|---|---|---|---|
| **1. Lector de pantalla y teclado** | Recorrido completo con teclado (160 paradas con `Tab` en escritorio, foco visible, sin trampas); diálogo, pestañas con flechas, asistente, simulador, formulario, menú móvil y «Ir al contenido». Árbol de accesibilidad de Chrome como sustituto de lo que leería un lector. axe-core 4.14.0 en 11 estados. | **Aprobado**: 0 problemas, 0 violaciones axe en los 11 estados, tanto en fuente como en `dist/`. | **VoiceOver (iPhone y Mac), TalkBack, NVDA.** El árbol de accesibilidad no es un lector: no prueba el orden de lectura real, la verbosidad ni los gestos. |
| **2. Dispositivos y navegadores** | 15 anchos (320–1920 px); WebKit 2370 (motor de Safari) en escritorio, iPhone 14 vertical y horizontal e iPad; Chrome con perfil Pixel 7; movimiento reducido, colores forzados, texto grande 150 % y 200 %, zoom 200 %, márgenes seguros; red 4G y 3G lenta con CPU 6× más lenta. | **Aprobado** tras 8 correcciones (§2): 0 problemas en matriz, preferencias y WebKit; sin errores de consola. | **Firefox** (no arranca en este equipo), **iPhone y Android físicos**, **navegadores integrados** de Instagram/Facebook/WhatsApp, zoom 400 % real, gama baja real. WebKit en Mac no es Safari en iOS. |
| **3. Prueba con 5 compradores** | Solo las 5 tareas del guion como **recorrido guionado** (cuenta toques y comprueba que lo necesario queda a la vista). | Tarea 1: 4 toques → «Mukala Dosquebradas». Tarea 2: 2 toques → zonas comunes y cuota ($1.827.103). Tarea 3: 4 toques → recomendación (Álamos). Tarea 4: 1 toque → botón «Hablar con un asesor». Tarea 5: VIS y SMMLV definidos antes de su primer uso. | **Todo lo que importa de este bloque**: comprensión, dudas, tiempos, SUS, confianza. Un script no equivale a un usuario; no se calculó SUS ni éxito de tareas. |
| **4. Validación con Mukala** | Nada (depende del cliente). Se añadieron 4 puntos nuevos a la lista (`GUIA-PRUEBAS.md` §4). | — | Cifras, textos propuestos, texto legal de datos (Ley 1581), logo, testimonios. |
| **5. Producción** | Build de producción y Lighthouse sobre `dist/` servido con brotli y caché inmutable. | Ver §3. | Hosting real, https, CDN, datos de campo (Search Console) tras ~4 semanas. |

## 2. Fallos encontrados y corregidos al ejecutar las pruebas

| # | Hallazgo | Cómo apareció | Corrección |
|---|---|---|---|
| 1 | «Ir al contenido» dejaba el foco en `body`: el siguiente `Tab` volvía a la cabecera | Prueba de teclado | `<main id="main" tabindex="-1">` y sin contorno al recibir foco programático |
| 2 | Fotos de la galería: el nombre accesible no contenía el texto visible (`label-content-name-mismatch`, 2–3 elementos en todos los estados salvo los dos con diálogo o visor abierto; WCAG 2.5.3 «Etiqueta en el nombre») | axe en estados | `aria-label="Ampliar: Foto Mukala Dosquebradas"` ahora incluye el texto visible, en el mismo orden |
| 3 | La vista previa flotante del índice se quedaba pegada al hacer scroll o cambiar de ventana | Pruebas de preferencias/tareas | Se oculta al hacer scroll, al perder el foco de la ventana y con `Esc` |
| 4 | Móvil **horizontal**: el hero y la barra fija ocupaban casi toda la pantalla | Matriz de preferencias | Compactación con `@media (max-height:500px)` (barra, cabecera y hero) |
| 5 | Texto al 200 %: desbordes horizontales en 390 px | Texto grande | Ajustes de anchos y cuadrículas en el CSS; 0 desbordes y 0 recortes al 150 % y 200 % (390 px) |
| 6 | Colores forzados (modo de alto contraste): se perdían la pista del deslizador y el estado seleccionado de los botones | Colores forzados | Bloque `@media (forced-colors:active)`: pista y marcador del deslizador con `ButtonText`/`Highlight`, estados seleccionados con contorno `Highlight`, pestaña activa con subrayado |
| 7 | Tras «Simular cuota» el resultado quedaba fuera de pantalla en móvil | Tarea 2 | Se desplaza para dejar la cuota visible (verificado: top 264 px de 775) |
| 8 | En el asistente el botón de envío quedaba bajo el pliegue | Tarea 3 | `keepInView` tras cada paso; el botón queda visible (619–671 px de 775) |
| 9 | «SMMLV» se usaba antes de definirse | Tarea 5 | Párrafo de definición antes de la tabla comparativa (aparece a 2365 px; el primer uso, a 2410 px); VIS ya se define en el hero |

Errores **de mis propias pruebas** (corregidos, para que no se tomen por fallos del sitio): usé `Ctrl+A` donde en macOS es `Cmd+A`, y contaba como fuga del foco su salida hacia la interfaz del propio navegador al tabular fuera de un diálogo (comportamiento normal); la suite de preferencias apuntaba al código fuente aunque dijera «producción» (descubierto al ver cifras idénticas; ahora respeta `BASE`); un comodín de `rm` en zsh cortó la primera corrida de Lighthouse (se repitió).

## 3. Rendimiento (laboratorio)

Lighthouse 13.6.0, Chrome 156, emulación móvil estándar y escritorio.

| Versión | Dispositivo | Rendimiento / Accesibilidad / Buenas prácticas / SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|
| **`dist/` (producción local)** | Móvil | **100 / 100 / 100 / 100** | 0,8 s | 0,8 s | 0 ms | 0 |
| **`dist/`** | Escritorio | **100 / 100 / 100 / 100** | 0,2 s | 0,2 s | 0 ms | 0 |
| Código fuente (sin comprimir) | Móvil | 100 / 100 / 100 / 100 | 1,4 s | 1,4 s | 0 ms | 0 |
| Código fuente | Escritorio | 100 / 100 / 100 / 100 | 0,4 s | 0,4 s | 0 ms | 0 |

Peso de los archivos de texto críticos en producción (brotli): HTML 7,9 KB + CSS 8,4 KB + JS 9,3 KB ≈ **25,6 KB** (originales: 35,2 + 45,9 + 38,6 KB).

Teléfono lento simulado (CPU 6× más lenta, caché desactivada), `dist/`:

| Red | Primer contenido (FCP = LCP) | Carga completa | CLS | Contenido usable |
|---|---|---|---|---|
| 4G lenta (1,6 Mbps, 150 ms) | 1,1 s | 2,6 s | 0 | sí |
| 3G lenta (500 kbps, 400 ms) | 1,8 s | 10,7 s (las imágenes llegan después del texto) | 0,031 | sí |

En el código fuente sin comprimir la misma 3G da 4,7 s: por eso la compresión y la minificación **no son opcionales** al desplegar.

## 4. Límites y cosas que quedan abiertas

- **Firefox no pudo probarse** (Playwright no logra lanzarlo en este equipo). No se afirma nada sobre Firefox; está en el Bloque 2 de la guía.
- axe-core 4.10.2 se usó en las rondas anteriores de la auditoría y 4.14.0 en esta pasada final; ambas dan 0 violaciones. axe cubre una parte de WCAG (las reglas automatizables), no todo.
- Lighthouse y el resto son de **laboratorio** (un solo equipo, una sola red simulada). No sustituyen los datos de campo.
- El texto de consentimiento de datos, las descripciones de los valores, los pasos del proceso y las cifras que no están en el sitio original siguen **sin aprobar por el cliente** (lista en `GUIA-PRUEBAS.md` §4).
- Nada de esto se ha publicado: la v2 está solo en esta carpeta, a propósito (usa nombre, marca y contactos reales de Mukala).


## 5. Ronda v3 (2026-10-30): rediseño «más gráfico, menos texto»
Después de rehacer la página (tarjetas de proyecto, valores con foto, simulador con anillo, galería inmersiva, sección «Compra desde el exterior») se repitió **toda** la batería sobre el código fuente y sobre `dist/`:
- axe-core 4.14.0 en 11 estados: **0 violaciones**; teclado (160 paradas con Tab), árbol de accesibilidad, 15 anchos, preferencias del sistema, 5 tareas guionadas: **0 problemas**; WebKit (escritorio, iPhone vertical y horizontal, iPad) y Pixel 7: sin errores.
- Lighthouse sobre `dist/`: **100 / 100 / 100 / 100** en móvil y escritorio (móvil: LCP 1,1 s, TBT 30 ms, CLS 0).
- Fluidez de scroll con CPU 6× más lenta (371 cuadros en escritorio, 435 en móvil): mediana 16,7 ms, **0 cuadros por encima de 33 ms**.
- Contraste real de todo el texto sobre foto en las tarjetas (muestreo de píxeles, escritorio y móvil): **mínimo 8,23:1** (antes 2,25:1 en algunos títulos; se reforzó el gradiente dos veces, la segunda al acortar las tarjetas).

**Defectos que las pruebas y el revisor independiente encontraron en esta ronda (todos corregidos):** títulos H1→H3; texto de la tarjeta recortado con letra al 200 %; una palabra larga que ensanchaba la página; contenido interactivo del héroe que se movía con el scroll (hacía fallar el toque); recálculo de diseño forzado; foco que no seguía al abrir una herramienta; tarjetas mal compuestas con 1–3 resultados; contadores que mostraban cifras intermedias en precios; contorno fantasma que cruzaba las cifras; foto de Dosquebradas repetida en 5 sitios; contraste de títulos sobre foto; carrusel móvil sin controles; promesas sin respaldo en textos cortos; **al agregar el enlace «Exterior» el botón del encabezado se salía de la pantalla a 1341–1366 px** (mi prueba no lo medía; ahora sí) y se resolvió acortando la etiqueta y sacando «Preguntas» del encabezado; animaciones infinitas del globo (WCAG 2.2.2), ahora de ≤ 5 s y solo al entrar en pantalla.
**Errores de mis propias pruebas:** las pruebas seguían buscando las filas viejas (`.row`) y daban falsos fallos; la medición de contraste de la tarjeta destacada salió mal por un scroll suave aún en curso; la prueba de teclado daba fallos intermitentes porque medía a mitad de un scroll suave (ahora lo desactiva y pasa 6 de 6 corridas).
**Sigue sin poder hacerse aquí:** lectores de pantalla reales, Firefox, aparatos físicos, usuarios reales, hosting real. Ver §1.

## 6. Cierre de la ronda v3 (2026-10-30)
- Se unieron los 22 selectores CSS repetidos y se comparó píxel a píxel con 30 capturas (escritorio, tablet, móvil × 10 secciones): sin cambios visibles; las únicas diferencias fueron la FAQ (ahora más corta), el fondo con parallax y subpíxeles.
- Tras los últimos cambios, sobre `dist/`: axe 0 en 11 estados; teclado (estable), árbol de accesibilidad, 15 anchos, preferencias y 5 tareas: 0 problemas; WebKit (escritorio, iPhone, iPad) y Pixel 7: sin errores; Lighthouse 100 / 100 / 100 / 100 (móvil LCP 1,1 s, TBT 30 ms); contraste mínimo sobre foto 8,23:1; scroll con CPU 6× más lenta: mediana 16,7 ms.
- Revisor independiente, 5.ª comprobación: **4,8 en las nueve categorías** (calidad de código; ver `AUDITORIA-UX.md` §5). La columna «certificable hoy» no cambió y sigue por debajo.
- Texto visible: ≈ 1148 palabras en la v2 → ≈ 763 (v3 inicial) medidas con el mismo método (texto renderizado); contando el HTML estático, 893 → 934 por la sección nueva del exterior, que es el costo de agregar contenido.

## 7. Artica (2026-10-30)
Se incorporaron los dos renders de Artica (portada de 3 imágenes, tarjeta de proyecto, galería de 9 fotos). Las pruebas se actualizaron a 6 proyectos y 9 fotos y se repitieron sobre `dist/`: axe 0 en 11 estados; teclado, árbol de accesibilidad, 15 anchos, preferencias y 5 tareas: 0 problemas; WebKit y Pixel 7: sin errores; Lighthouse 100 / 100 / 100 / 100 (móvil LCP 0,8 s con la portada nueva); contraste mínimo sobre foto 8,23:1; scroll con CPU 6× más lenta: mediana 16,7 ms. **Esta incorporación no pasó por una nueva revisión independiente**; la calificación de 4,8 de `AUDITORIA-UX.md` §5 es de la versión anterior.
