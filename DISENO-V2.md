# Mukala Construcciones — rediseño v2

Archivos: `index.html`, `styles.css`, `app.js`, `assets/` (código fuente editable, se abre directo en el navegador; la tipografía Archivo está alojada en `assets/fonts/`, sin Google Fonts). Lo que se publicaría es `dist/`, generado con `npm install && npm run build` (minifica CSS y JS y les pone hash). Pruebas automáticas en `tests/`; resultados en `RESULTADOS-PRUEBAS.md`. **Después de editar el código fuente hay que volver a ejecutar el build.**
La v1 sigue intacta en `../mukala-redesign/`. Contenido por confirmar y lo que falta para producción: ver `../mukala-redesign/DIAGNOSTICO.md` (aplica igual a esta versión).

## 1. Paleta (medida del sitio original, sin cambios)
| Uso | Valor |
|---|---|
| Dorado de marca (texto del logo, acentos) | `#FFC143` |
| Carbón de fondo | `#2B2B2B` |
| Superficie | `#353131` |
| Negro | `#000000` |
| Texto sobre oscuro | `#DBDBDB` |
| Blanco | `#FFFFFF` |

En la v1 usé negros y cremas cálidos que no eran de Mukala; en la v2 solo hay estos valores (más transparencias de ellos). Las secciones alternan negro / carbón / una sección blanca (como en el sitio original), y el dorado se reserva para acentos, botones y la cinta de valores.

## 2. Qué se investigó y qué se tomó de cada sitio
| Sitio | Qué hace bien | Qué se aplicó |
|---|---|---|
| **Amarilo** | Buscador en el inicio, tarjetas con precio + ficha técnica, guía de compra con calculadoras | Buscador con filtros reales, ficha técnica, simulador de cuota |
| **Marval** | Titular que invita a buscar, rango de precio, cuestionario guiado de 5 pasos, agenda con estados claros | Rango de precio en el buscador y asistente «Encuentra tu proyecto» que recomienda uno y manda el contexto al asesor |
| **Constructora Bolívar** | Precio en pesos y en SMMLV, doble botón por tarjeta, guía de 5 pasos, simulador | Precio con SMMLV (135 en Álamos), «Ver detalle» + WhatsApp, guía de compra |
| **Cusezar** | Tarjetas con los mismos campos para comparar, WhatsApp flotante | Tabla comparativa de los 5 proyectos |
| **Aedas Homes / Emaar** | Etiquetas de estado de obra, «desde» como ancla de precio, barra de conversión fija, disponibilidad como señal | Chips «En construcción / Disponible», «Desde $…», botón flotante y barra fija en móvil |
| **111 West 57th, Bentley Residences** | Tipografía enorme, ritmo lento, mucho espacio negativo | Titular grande con revelado por línea, texto del manifiesto que se enciende al hacer scroll, índice de proyectos con vista previa al pasar el cursor |
| **Arquitectura y Concreto** | Filtro por tipo + ubicación en la primera pantalla | Selector de tipo (Todos/Apartamentos/Casas/Locales) + ciudad en el buscador |

Hallazgos de buenas prácticas (guías de UX inmobiliaria): pocos filtros y visibles, una ficha por unidad, formularios cortos, mobile primero, mostrar estado de obra. Las cifras de conversión que citan esas guías son de agencias y no las usé como argumento.

## 3. Qué trae la v2
- **Hero** con presentación de 2 imágenes (pausable), titular en tres líneas, curvas de nivel doradas (la topografía del Eje Cafetero) y buscador acoplado con conteo en vivo.
- **Cinta dorada** con los 4 valores y el eslogan.
- **Manifiesto** con texto que se ilumina al desplazarse y contadores (9+, 270, 5, VIS).
- **Índice de proyectos** (estilo arquitectura) con vista previa al pasar el cursor y ficha en ventana; **comparador** de los 5 proyectos.
- **Álamos de Mukala** como proyecto destacado: galería, hechos clave, precio en pesos y SMMLV, zonas comunes con íconos.
- **Valores** en cuatro columnas que se llenan de dorado al pasar el cursor.
- **Mukala te guía:** asistente de 5 pasos que recomienda un proyecto y manda todo por WhatsApp, y simulador de cuota.
- **Galería** horizontal arrastrable con ampliación, **proceso** «de los permisos a tu llave en la mano», **FAQ**, **contacto** y pie con la marca gigante.
- Accesible por teclado, respeta `prefers-reduced-motion`, barra de WhatsApp fija en móvil.

## 3b. Ronda de pulido (2026-10-29)
- Hero: en portátiles de poca altura (p. ej. 1280×720) el buscador ahora entra completo en la primera pantalla.
- El botón flotante de WhatsApp aparece solo después de pasar el hero (antes tapaba los controles del inicio).
- Índice de proyectos en tablet: la etiqueta de estado ya no se encima con el precio.
- Pestañas de «Mukala te guía» navegables con flechas, Inicio y Fin; el asistente tiene «Empezar de nuevo»; el asistente y el formulario confirman cuando abren WhatsApp.
- Datos estructurados (JSON-LD `GeneralContractor`) y metadatos Open Graph; aviso si JavaScript no carga. Falta agregar `og:image` y la URL canónica cuando exista el dominio.
- Vista previa del índice sin salirse de la pantalla; marca gigante del pie ajustada; ítem «Consultar» más corto en casas campestres.
- Verificado en 375, 820, 1280×720, 1440 y 1920 de ancho, sin errores de consola.

## 3c. Auditoría UX/UI (objetivo ≥ 4,8)
Resultado, evidencia y límites en `AUDITORIA-UX.md`: Lighthouse 100/100/100/100 (móvil y escritorio), axe 0 violaciones, 0 objetivos táctiles < 44 px, reflujo limpio a 320 px, y calidad de código 4,8/5 en las siete categorías según un revisor independiente (cuatro rondas). Lo que no se puede certificar sin pruebas externas (lectores de pantalla, dispositivos físicos, usuarios, texto legal) está listado ahí.
Cambios de esa ronda que afectan cómo se edita el proyecto: la tipografía Archivo ahora está en `assets/fonts/` (sin Google Fonts); las imágenes son `.webp` con variantes `-320/-480/-640/-700/-800/-1200` (los JPG originales quedaron en `../mukala-redesign-v2-originals-jpg/`); los tamaños de letra salen de los tokens `--fs-*` en `styles.css`; el menú pasa a botón en ≤ 1340 px.

## 3d. Ronda v3 — «más gráficas y menos texto» (2026-10-30)
Origen: al mostrar la v2 en una reunión con el cliente, la reacción fue que tenía **mucho texto** y que debía ser **más gráfica e interactiva**; además se pidió que impacte («que se vea brutal») sin cambiar los colores de Mukala.
- **Menos texto:** 1148 → 763 palabras (−34 %). Se acortaron los textos que yo había propuesto; el significado y las frases de marca de Mukala se conservan («calidad como prioridad», «tu inversión, en las mejores manos», «desde los permisos…»).
- **Proyectos:** de filas de texto a **tarjetas con la imagen como protagonista** (inclinación suave y foco dorado con el cursor; en el celular, carrusel deslizable). El comparador pasa a un bloque plegable.
- **Nosotros:** tres pilares con ícono (servicios integrales, proyectos VIS, proyectos personalizados) y cifras cortas.
- **Álamos:** cifras grandes con contador, nombre gigante de fondo y zonas comunes en una franja de íconos.
- **Valores:** foto en blanco y negro de fondo, tarjetas de vidrio, una frase de 4–5 palabras por valor.
- **Cómo comprar:** primera pregunta del asistente con íconos; el simulador tiene anillo cuota inicial / crédito, la cuota «viaja» al nuevo valor y se ve la foto del proyecto elegido.
- **Galería y proceso:** tiles más grandes con parallax interno, contador y barra de avance; pasos con ícono.
- **Héroe y navegación:** titular más grande, la imagen de fondo responde al cursor y al scroll (el contenido interactivo no se mueve), y una guía de puntos a la derecha en pantallas ≥ 1280 px.
- **Compra desde el exterior (nueva sección blanca):** globo con rutas hacia el Eje Cafetero (animación de ≤ 5 s al entrar en pantalla), tres pasos y tres datos del sitio; sin herramientas ni calculadoras. Se estudió la estructura de la página de Amarilo sobre el tema (qué temas cubre un comprador en el exterior) y se escribió texto propio de Mukala; **no se copió su contenido, sus imágenes ni su diseño**. El texto es mío y debe aprobarlo el cliente (ver `GUIA-PRUEBAS.md` §4).
- **Encabezado:** «Exterior» entra al menú; «Preguntas» sale del menú en línea (sigue en el menú de botón, la guía lateral y el pie) para que el botón «Hablar con un asesor» no se salga de la pantalla a 1341–1440 px.
- Todo respeta `prefers-reduced-motion`, colores forzados y texto grande; la paleta no cambió.
- **Artica:** los dos renders que envió el cliente (atardecer y noche; archivos tomados de `ora-ai-explorer/img/`, recodificados a WebP con variantes `-320/-800/1600`) son ahora la portada del inicio (3 imágenes: Artica de día, Artica de noche, Álamos), una tarjeta de proyecto («Nuevo», sin precio ni ubicación) y dos fotos de la galería. Nombre exacto, ciudad, precios y estado de obra **sin confirmar**: la tarjeta dice «Consulta la ubicación con un asesor» y «Consulta el valor».

## 4. Límites honestos
- **Videos:** Mukala tiene 5 videos en su Wix (Álamos, Dosquebradas, locales, aptos 1106 y 1402), pero están protegidos y no se pueden bajar. El hero está preparado para usar video: con los originales se reemplaza la imagen por `<video>`.
- **Calidad de imágenes:** varias están reescaladas por IA (la aérea de Dosquebradas, el render de locales). Por eso el hero usa solo 2 imágenes y las demás se muestran en tamaños moderados.
- **Textos propuestos (por aprobar):** descripciones de los 4 valores y los 4 pasos de «De los permisos a tu llave en la mano». Se basan en frases reales del sitio ("desde los permisos hasta las grandes decisiones") pero la redacción es mía.
- **Asistente y simulador:** la recomendación usa solo los datos que hay (tipo, precio, estado). La tasa del simulador (11 % E.A.) es de ejemplo.
- Sin testimonios, planos, avance de obra ni mapa: no hay datos reales para mostrarlos. Son lo siguiente que más subiría la conversión.
