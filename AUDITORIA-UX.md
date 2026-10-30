# Auditoría UX/UI de la v2 — evidencia y puntajes

Objetivo pedido: **≥ 4,8 / 5 en buenas prácticas de UX/UI.**
Fecha: 2026-10-29. Archivos auditados: `index.html`, `styles.css`, `app.js`.

> Una nota «auto-asignada» vale poco. Por eso cada categoría se apoya en mediciones reproducibles y en **cuatro rondas de revisión independiente del código** hechas por un revisor que no veía mis conclusiones. Lo que no se puede medir sin personas o aparatos reales está marcado como tal.

## 1. Resultado

| Categoría | Ronda 1 | Ronda 2 | Ronda 3 | **Final (A) código** | **Final (B) certificable hoy** |
|---|---|---|---|---|---|
| Accesibilidad | 3,5 | 4,0 | 4,5 | **4,8** | 4,0 |
| Usabilidad / heurísticas | 4,0 | 4,5 | 4,5 | **4,8** | 4,0 |
| Móvil y táctil | 3,5 | 4,5 | 4,5 | **4,8** | 4,0 |
| Rendimiento | 3,5 | 4,5 | 4,8 | **4,8** | 4,5 |
| Formularios y conversión | 3,5 | 4,5 | 4,5 | **4,8** | 3,5 |
| Diseño visual y consistencia | 3,5 | 4,5 | 4,5 | **4,8** | 4,0 |
| Contenido y microcopy | 4,0 | 4,5 | 4,5 | **4,8** | 3,5 |
| **Promedio** | 3,6 | 4,4 | 4,5 | **4,8** | 3,9 |

- **(A) Calidad de implementación en código** — lo que se puede juzgar leyendo el código y las medidas objetivas, sin penalizar lo que por naturaleza exige pruebas externas. **Llega a 4,8 en las siete categorías**, según el revisor independiente (4.ª ronda).
- **(B) Certificable hoy con evidencia** — incluye lo que no se pudo probar. **No llega a 4,8 y no puedo afirmarlo honestamente**: depende de pruebas que no se pueden hacer desde aquí (ver §4).
- Ninguna categoría llega a 5,0: quedan el sublema del logotipo a 10,6 px (exento por ser logotipo) y un hosting real sin medir. (El minificado ya existe: `npm run build` genera `dist/`; ver `RESULTADOS-PRUEBAS.md`.)
- Después de estas cuatro rondas se **ejecutaron las pruebas automatizables de la guía** (teclado, árbol de accesibilidad, 15 anchos, WebKit, preferencias del sistema, red lenta, axe en 11 estados, Lighthouse sobre `dist/`). Hallaron 9 fallos más, ya corregidos; cifras y límites en `RESULTADOS-PRUEBAS.md`. **Los puntajes de esta tabla no se modificaron**: esas pruebas respaldan la columna (A), no la (B).

## 2. Evidencia objetiva

### Lighthouse (Chrome; simulación móvil con red lenta, y escritorio)
| | Rendimiento | Accesibilidad | Mejores prácticas | SEO |
|---|---|---|---|---|
| **Línea base** móvil | 99 | **90** | 100 | 100 |
| **Final** móvil | **100** | **100** | **100** | **100** |
| **Final** escritorio | **100** | **100** | **100** | **100** |
| **`dist/`** (minificado, brotli, caché) móvil / escritorio | 100 / 100 | 100 / 100 | 100 / 100 | 100 / 100 |

Final móvil (código fuente, sin comprimir): LCP 1,4 s · TBT 0 ms · CLS 0 · 372 KiB. Escritorio: LCP 0,4 s · CLS 0 · 400 KiB. Sobre `dist/`: LCP 0,8 s móvil y 0,2 s escritorio.
Antes: ≈ 2,4 MB solo en imágenes y una petición a Google Fonts. Ahora: WebP con variantes responsivas (−57 %), fuente Archivo alojada en el propio sitio, **cero peticiones externas**.
A mitad del trabajo introduje yo mismo una regresión (LCP 4,7 s por un fundido retrasado en el párrafo del hero y una carga de fuente diferida): Lighthouse la detectó y se corrigió.

### axe-core 4.10.2 en las rondas; 4.14.0 en la pasada final (WCAG 2.0/2.1/2.2 A y AA + buenas prácticas)
Antes: 5 violaciones (una crítica). **Ahora: 0** en escritorio y en móvil (59 reglas aprobadas), también con el mensaje de error/éxito del formulario visible. La pasada final (4.14.0) cubre 11 estados —incluidos diálogo y visor abiertos, formulario con error y con éxito, simulador inválido, menú móvil y tablet— y encontró una violación nueva (nombre accesible de las fotos de la galería) que se corrigió: 0 en los 11 estados, en código fuente y en `dist/`.
Las verificaciones de contraste «incompletas» son texto sobre imágenes o sobre pseudo-elementos que axe no puede evaluar; se midieron aparte.

### Contraste de texto sobre imagen (hero), por muestreo de píxeles
Se ocultó el texto, se capturó el fondo y se calculó el peor caso detrás de cada elemento: **18 de 18 pares cumplen** (mínimo 4,32:1 en el titular grande, umbral 3:1; texto normal desde 5,87:1). Se reforzó el degradado superior para garantizar el menú.
Corregidos: palabras «apagadas» del manifiesto 1,89 → 5,3:1; números de fila 3,94 → 6,1:1; bordes de campos 1,56 → ≈4,3:1; pista del slider; marcador de posición; botón de WhatsApp 1,98 → 12,9:1 (dorado con ícono negro).

### Móvil, táctil y reflujo
- 375 px: **0 objetivos táctiles < 44 px** (antes 16), sin scroll horizontal.
- 320 px: sin desbordes, **incluso con el espaciado de texto de WCAG 1.4.12** (interlineado 1,5, letras 0,12 em, palabras 0,16 em) y con el botón de menú visible.
- Menú: pasa a botón en ≤ 1340 px (8 enlaces + CTA no caben antes); a 1341 y 1366 px el menú inline cabe sin partir líneas.
- Márgenes seguros de iPhone (`viewport-fit=cover` + `env(safe-area-inset-*)`), `dvh` en diálogos.
- Texto < 12 px: solo el sublema del logotipo (exento).

### Consistencia
- Escala tipográfica: de 29 tamaños fijos + 18 `clamp()` sueltos a 14 tokens `--fs-*`.
- Colores: **solo** #FFC143, #2B2B2B, #353131, #000, #DBDBDB y #FFF. El color de error fuera de paleta se eliminó: el error usa ícono circular blanco + texto blanco + aro blanco en el campo (no depende solo del color).

### Flujos probados por script
Validación de nombre, celular (10 dígitos o con indicativo) y correo con `aria-invalid`, mensaje vinculado y foco al campo; Enter envía el asistente (ahora un `<form>`); «Atrás» conserva la opción elegida; tasa del simulador acotada (mensaje al salir del campo); regiones vivas con retardo (la cuota y el conteo no se anuncian en cada tick del slider ni en la carga); lightbox con botón de cierre y `position:fixed` verificado; foco tras limpiar filtros y tras «Simular cuota»; el header reaparece al recibir foco; Esc cierra el menú y devuelve el foco al botón; pestañas con flechas; enlace «Abrir WhatsApp» de respaldo si el navegador (p. ej. el integrado de Instagram) bloquea la ventana; el contenido solo se oculta si el JS arranca (rescate a los 4 s).
Consola del navegador: sin errores.

## 3. Cómo se llegó (qué encontró cada ronda)
1. **Ronda 1 (3,6):** `aria-label` en elementos sin rol, `role="list"` mal usado, barra fija que tapa el foco, header oculto pero enfocable, bordes de campos casi invisibles, lightbox sin salida, imágenes sin variantes responsivas, botones largos recortados a 320 px, `.rv{opacity:0}` sin respaldo, 48 tamaños de fuente, textos legales y siglas sin definir.
2. **Ronda 2 (4,4):** quedaban posibles bug del lightbox (`position:relative` sobre el `<dialog>`), márgenes laterales de iPhone, anuncios del lector de pantalla por cada paso del slider, miniaturas de 96 px que bajaban 65 KB, fuente de Google bloqueante, nav sin Proceso/Preguntas.
3. **Ronda 3 (4,5):** corte del menú a 1340 px, «Comprar» → «Cómo comprar», rescate de la clase `js` si el script falla a medias, residuos en el simulador.
4. **Ronda 4 (4,8):** respaldo de WhatsApp y color de error dentro de la paleta; detalle menor final: íconos generados marcados como decorativos.

Dos fallos propios que las mediciones atraparon y se corrigieron: una sustitución masiva de `1fr` por `minmax(0,1fr)` que borró nombres de propiedad CSS (se detectó por desborde a 320 px y se reparó con verificación de llaves y declaraciones sin propiedad), y la regresión de LCP descrita arriba.

## 4. Qué NO se pudo medir (y por qué (B) queda por debajo de 4,8)
| Categoría | Prueba externa que la subiría a 4,8 |
|---|---|
| Accesibilidad (4,0) | Pasada manual con **VoiceOver (iOS/macOS), NVDA y TalkBack** y solo con teclado (menú, asistente, diálogos, simulador); idealmente auditoría WCAG 2.2 AA de un tercero. |
| Usabilidad (4,0) | Prueba con **5–8 compradores reales en móvil** (buscar, comparar, contactar) y embudo en analítica. |
| Móvil y táctil (4,0) | **iPhone con muesca en horizontal**, Android de gama baja y los navegadores integrados de WhatsApp/Instagram. Todo lo medido es de Chromium emulado. |
| Rendimiento (4,5) | **Despliegue real** (compresión, caché, CDN, minificado), WebPageTest en 4G y datos de campo de ~4 semanas. Los 100 son de laboratorio. |
| Formularios y conversión (3,5) | **Texto de datos aprobado por el cliente con política enlazada** (Ley 1581 de 2012), prueba de envío extremo a extremo en iOS/Android/WhatsApp Web y medición real de envíos. |
| Diseño visual (4,0) | Capturas en Safari, Firefox y Chrome Android; aprobación de marca (logo vectorial original). |
| Contenido (3,5) | Que **Mukala valide cifras y textos** (precios, 135 SMMLV, fechas, «5 proyectos en venta», descripciones de valores y pasos del proceso, que son propuesta mía), el texto legal, y **testimonios y planos reales** (no existen). |

El aviso de consentimiento de datos personales que aparece en los formularios («Al contactarnos autorizas a Mukala a usar tus datos…») es texto mío, **no aprobado por el cliente**; debe reemplazarse por el texto legal de Mukala con enlace a su política.

## 5. Ronda v3 (2026-10-30): «más gráfico, menos texto»

Tras la reunión con el cliente («mucho texto, más gráficas, más interactiva») la página se rehízo (ver `DISENO-V2.md` §3d) y se sumó una sección «Compra desde el exterior». El mismo revisor independiente —que solo lee el código y las capturas— puntuó la v3 en nueve categorías (las siete de arriba más «Impacto visual y diferenciación» y «Densidad de texto frente a gráfico»). Cada ronda encontró defectos reales que se corrigieron antes de la siguiente.

| Categoría | v3 · R1 | R2 | R3 | R4 | **Final (A) código (5.ª ronda)** |
|---|---|---|---|---|---|
| Accesibilidad | 4,5 | 4,5 | 4,8 | 4,8 | **4,8** |
| Usabilidad / heurísticas | 4,5 | 4,5 | 4,8 | 4,8 | **4,8** |
| Móvil y táctil | 4,5 | 4,8 | 4,8 | 4,8 | **4,8** |
| Rendimiento | 4,5 | 4,8 | 4,8 | 4,8 | **4,8** |
| Formularios y conversión | 4,8 | 4,8 | 4,8 | 4,8 | **4,8** |
| Diseño visual y consistencia | 4,5 | 4,5 | 4,5 | 4,5 | **4,8** |
| Contenido y microcopy | 4,5 | 4,0 | 4,5 | 4,8 | **4,8** |
| Impacto visual y diferenciación | 4,5 | 4,5 | 4,8 | 4,8 | **4,8** |
| Densidad de texto | 4,5 | 4,0 | 4,5 | 4,5 | **4,8** |

*Nota:* «Diseño visual» y «Densidad» se quedaron en 4,5 en la 4.ª ronda. Se corrigieron los defectos que el revisor citó (ficha huérfana del asistente en celular, íconos repetidos, 22 selectores CSS duplicados unificados, con comparación píxel a píxel de 30 capturas) y se recortaron la FAQ y el aviso del simulador. En la **5.ª comprobación el revisor puntuó 4,8 en las nueve categorías y no encontró defectos nuevos** (solo una observación menor: la frase de consentimiento de datos está repetida en los dos formularios y es texto legal sin aprobar). **Esto es calidad de código y diseño según un revisor, no una certificación.**

**(B) Certificable hoy** sigue **por debajo de 4,8** y no puedo afirmar lo contrario: faltan lectores de pantalla reales, aparatos físicos, Firefox, compradores reales, aprobación del cliente de los textos nuevos (sobre todo «Compra desde el exterior» y el texto legal de datos) y fotos nuevas. El techo de «Impacto visual» lo pone el material: la página reutiliza 8 imágenes; los renders de «Artica» (día y noche) que envió el cliente subirían ese puntaje, pero aún no están como archivo (`nuevos/LEEME.txt`).


> **Nota v4 (2026-10-30):** la página se rehízo en versión minimalista (ver `DISENO-V2.md` §3e). Los puntajes de este documento corresponden a versiones **anteriores** con formularios, asistente y simulador; la v4 **no pasó por una nueva revisión independiente**. Sus mediciones están en `RESULTADOS-PRUEBAS.md` §8.
