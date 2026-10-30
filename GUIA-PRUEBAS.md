# Guía de pruebas externas — Mukala v2

Para qué sirve: son las pruebas que **no se pueden hacer desde el código** y que separan el 4,8 de calidad de implementación (columna A de `AUDITORIA-UX.md`) del 4,8 certificable (columna B). Cada bloque dice quién lo hace, cuánto tarda y qué resultado cuenta como aprobado.

| Bloque | Quién | Tiempo | Sube la categoría |
|---|---|---|---|
| 1. Lector de pantalla y teclado | Una persona del equipo (idealmente alguien que ya use lector) | 2–3 h | Accesibilidad |
| 2. Dispositivos y navegadores | Cualquiera con los aparatos | 2 h | Móvil y táctil, Diseño |
| 3. Prueba con 5 compradores | Quien modere + 1 observador | 1 día | Usabilidad, Formularios |
| 4. Validación con Mukala | Contacto del cliente | 1 reunión | Contenido, Formularios |
| 5. Producción | Quien despliegue | 4 semanas de datos | Rendimiento |

Regla de uso: **anota todo en la hoja de hallazgos (§6)**. Al final, cada hallazgo se arregla o se descarta con razón, y se vuelve a puntuar.

### Estado (2026-10-29) — qué ya se ejecutó con scripts y qué falta
Detalle y cifras en `RESULTADOS-PRUEBAS.md`; los scripts, en `tests/`.

| Bloque | Estado | Lo que sigue pendiente de personas o aparatos |
|---|---|---|
| 1 | Teclado y árbol de accesibilidad: **hecho** (0 problemas; axe 0 en 11 estados) | Los lectores reales (VoiceOver iPhone/Mac, TalkBack, NVDA) |
| 2 | Chromium en 15 anchos, WebKit (escritorio, iPhone, iPad), preferencias del sistema, red lenta: **hecho** | Firefox, iPhone/Android físicos, navegadores integrados, gama baja |
| 3 | Solo recorrido guionado de las 5 tareas: **hecho** (no cuenta como prueba de usuarios) | Los 5 compradores, SUS, SEQ |
| 4 | **No hecho** (es del cliente); se añadieron 4 puntos a la lista | Toda la reunión |
| 5 | Build de producción y Lighthouse sobre `dist/`: **hecho** | Hosting real, https, datos de campo |

---

## 1. Lector de pantalla y solo teclado (2–3 h)

### Qué probar
Usa estos lectores (mínimo los tres primeros):
- **VoiceOver en iPhone** con Safari: Ajustes → Accesibilidad → VoiceOver.
- **VoiceOver en Mac** con Safari: `Cmd+F5`. Rotor: `Ctrl+Opción+U`.
- **TalkBack en Android** con Chrome: Ajustes → Accesibilidad → TalkBack.
- **NVDA en Windows** con Firefox o Chrome (gratis). Lista de elementos: `Insert+F7`.

### Guion (repite en cada lector)
Marca ✅ / ❌ y anota qué dijo el lector cuando falle.

| # | Tarea | Debe ocurrir |
|---|---|---|
| 1 | Cargar la página | Anuncia el título «Mukala Construcciones…»; el primer elemento enfocable es «Ir al contenido» |
| 2 | Abrir el menú (en móvil) | El botón se anuncia como «Abrir menú», estado expandido/cerrado; con `Esc` se cierra y el foco vuelve al botón |
| 3 | Rotor/lista de **encabezados** | Un solo H1; los H2 siguen el orden de las secciones; sin saltos raros |
| 4 | Rotor/lista de **regiones** | Cabecera, navegación principal, principal, secciones con nombre, pie |
| 5 | Buscador del inicio | Los botones de tipo anuncian su estado «pulsado»; al cambiar el valor máximo se entiende «Hasta $X M» |
| 6 | Índice de proyectos | Cada fila se lee con nombre, tipo, ciudad, estado y precio; sin leer números decorativos ni flechas |
| 7 | Abrir un proyecto | Se anuncia el diálogo por su título; el foco queda dentro; con `Esc` o «Cerrar» vuelve a la fila de origen |
| 8 | Comparador | Se lee como tabla, con encabezados de fila y columna |
| 9 | Asistente «Encuentra tu proyecto» | Al elegir una opción, el foco pasa a la pregunta siguiente y se anuncia; «Atrás» marca la opción que ya elegiste; `Enter` en el último paso envía |
| 10 | Simulador | Cambiar el deslizador **no** anuncia en cada paso; unos segundos después anuncia «Cuota mensual aproximada: $…». Con tasa 80 el campo se marca inválido y el mensaje se anuncia al salir del campo |
| 11 | Formulario de contacto | Etiquetas con «obligatorio/opcional»; al enviar vacío el foco va al primer campo con error y el lector lo lee junto con el mensaje |
| 12 | Enviar el formulario | Se anuncia «Listo: se abrió WhatsApp…» y existe el enlace «Abrir WhatsApp» |
| 13 | Galería y ampliación | Cada foto dice si es «Foto» o «Render»; el visor tiene botón «Cerrar imagen» |
| 14 | Preguntas frecuentes | Cada pregunta anuncia «contraído/expandido» |
| 15 | Botón/cinta de pausa | «Pausar cinta animada» y «Pausar presentación» existen y funcionan |

### Solo teclado (sin ratón, sin lector)
- `Tab` recorre todo en orden lógico y **siempre se ve dónde está el foco** (anillo dorado, o negro sobre fondo blanco).
- Nada queda atrapado: diálogos se cierran con `Esc`; el menú móvil también.
- Pestañas «Encuentra tu proyecto / Simula tu cuota»: flechas ← → cambian de pestaña.
- El botón flotante de WhatsApp y la barra inferior **no** reciben foco hasta que son visibles.

### Aprobado si
Ningún ❌ que impida completar las tareas 7, 9, 11 y 12 en ningún lector, y no más de 3 ❌ menores en total.

---

## 2. Dispositivos y navegadores (2 h)

### Matriz mínima
| Dispositivo / navegador | Qué mirar |
|---|---|
| **iPhone con muesca, Safari**, vertical y **horizontal** | Contenido no queda bajo la muesca ni bajo la barra inferior; barra fija de WhatsApp/llamar no tapa botones; ventanas (diálogo, visor) caben con la barra de Safari |
| **Android de gama baja**, Chrome | Fluidez del scroll, que el inicio no se trabe, tiempo hasta ver el titular |
| **Navegador integrado de Instagram / Facebook / WhatsApp** | El envío por WhatsApp: si no se abre, debe aparecer el enlace «Abrir WhatsApp» y funcionar |
| **Safari, Firefox y Chrome de escritorio** | Fuente cargada, cuadrículas, menú que pasa a botón en ≤ 1340 px |
| **Zoom 200 % y 400 %** (escritorio) | Sin pérdida de contenido ni scroll en dos direcciones a 400 % |
| **«Reducir movimiento» activado** (iOS/macOS/Windows) | Sin presentación automática, sin cinta en movimiento, sin fundidos |
| **Texto grande del sistema** (iOS/Android) | Nada se corta ni se solapa |

### Cómo ver el sitio en tu teléfono (solo para QA, en tu red)
Con el teléfono en el **mismo Wi-Fi** que el Mac:
```bash
cd ~/Claude/mukala-redesign-v2 && python3 -m http.server 8766 --bind 0.0.0.0
```
Abre `http://<IP-de-tu-Mac>:8766` en el teléfono (Ajustes → Wi-Fi → tu red → IP; o `ipconfig getifaddr en0` en el Mac). Apaga el servidor al terminar.
Las pruebas de **navegadores integrados** de Instagram/Facebook/WhatsApp piden una URL pública con https; eso lo decide quien despliegue el sitio de Mukala, no está resuelto aquí.

### Aprobado si
Cero ❌ bloqueantes (no se puede completar una tarea) y cualquier solapamiento o recorte se arregla antes de publicar.

---

## 3. Prueba con 5 compradores (1 día)

Regla práctica de Nielsen: con **5 personas del mismo perfil** aparecen la gran mayoría de los problemas de usabilidad; si hay perfiles muy distintos, haz 5 por perfil.

### A quién
Personas de **25 a 55 años** en el Eje Cafetero que estén buscando, o hayan buscado en el último año, vivienda o local. Mezcla: al menos 3 usan el celular como dispositivo principal, 1 con poca experiencia digital, 1 que use lector de pantalla o ampliador si es posible reclutarla. Que **no** conozcan Mukala.

### Cómo
- 30–40 min por persona, en su propio celular (o el tuyo con el sitio ya cargado), **pensando en voz alta**.
- Una persona modera, otra observa y anota. No ayudes ni expliques: pregunta «¿qué esperabas que pasara?».
- Pide permiso para grabar pantalla y voz, y explica que se evalúa el sitio, no a la persona.
- Reinicia el sitio (recarga) entre participantes.

### Guion del moderador
**Intro (2 min):** «Vamos a probar una página web de una constructora. No hay respuestas buenas ni malas. Si algo no se entiende, el problema es de la página. Piensa en voz alta, por favor.»

**Tareas** (lee una escena, no las instrucciones de clic):
1. *«Estás buscando un apartamento de hasta $200 millones en Dosquebradas. Encuentra opciones.»* → éxito: llega a «Mukala Dosquebradas» (o dice que no hay en Pereira) sin ayuda.
2. *«Quieres saber qué trae Álamos de Mukala y cuánto costaría al mes.»* → éxito: abre el proyecto, encuentra la lista de zonas comunes, y obtiene una cuota con el simulador.
3. *«No sabes qué te conviene. Que la página te recomiende algo.»* → éxito: completa el asistente y entiende la recomendación.
4. *«Quieres que un asesor te contacte.»* → éxito: llega a enviar el mensaje por WhatsApp (puedes detenerlo antes de enviarlo realmente).
5. *«¿Qué significa VIS y qué es SMMLV?»* → éxito: lo encuentra sin ayuda (mide si las siglas se entienden).

### Qué medir
| Métrica | Cómo | Meta propuesta* |
|---|---|---|
| Éxito por tarea | ✅ solo / ⚠ con tropiezo / ❌ no pudo | ≥ 80 % ✅ y ningún ❌ en tareas 1 y 4 |
| Tiempo por tarea | cronómetro | registrar; investigar valores atípicos |
| Errores | clics equivocados, retrocesos | ≤ 2 por tarea |
| Facilidad percibida (SEQ) | «De 1 a 7, ¿qué tan fácil fue?» tras cada tarea | promedio ≥ 5,5 |
| Satisfacción global (SUS) | cuestionario de abajo | **≥ 80** (68 es el promedio de la escala) |

\* Las metas son **propuestas mías** (la escala SUS sí es estándar); acuérdalas con Mukala antes de empezar.

### Cuestionario SUS (al final, 1 = totalmente en desacuerdo … 5 = totalmente de acuerdo)
1. Creo que me gustaría usar este sitio con frecuencia.
2. Encontré el sitio innecesariamente complejo.
3. Pensé que el sitio era fácil de usar.
4. Creo que necesitaría ayuda de un experto para usar este sitio.
5. Las funciones del sitio están bien integradas.
6. Pensé que había demasiada inconsistencia en este sitio.
7. Imagino que la mayoría de la gente aprendería a usar este sitio muy rápido.
8. Encontré el sitio muy incómodo de usar.
9. Me sentí muy seguro/a usando el sitio.
10. Necesité aprender muchas cosas antes de poder usar el sitio.

**Puntaje:** en las preguntas impares resta 1 a la respuesta; en las pares calcula 5 menos la respuesta. Suma las diez cifras y multiplica por 2,5 (da 0–100).

### Preguntas de cierre
- ¿Confiarías en esta constructora para dejar tus datos? ¿Qué te faltó para confiar más?
- ¿Qué información echaste de menos al comparar proyectos? (testimonios, planos y avance de obra aún no existen: anota si lo mencionan)
- ¿Algo te pareció confuso o difícil de leer?

---

## 4. Validación con Mukala (una reunión)

Lleva esta lista y que **el cliente responda por escrito**:
- [ ] Precios, áreas y habitaciones de los 5 proyectos; que **135 SMMLV = $236.372.175** con el salario mínimo vigente al momento de publicar.
- [ ] **Cómo se calcula el precio de Álamos.** $236.372.175 = 135 SMMLV × $1.750.905 (salario mínimo de 2026), y 135 SMMLV coincide con el tope de vivienda VIS que yo conozco. Hay dos riesgos que Mukala (o su asesor legal) debe confirmar: (a) cada enero cambia el salario mínimo y hay que actualizar el valor en pesos, o mostrar solo SMMLV; (b) si el tope VIS y el salario mínimo dejan de moverse juntos (por una norma nueva), «135 SMMLV» podría ya no ser el límite VIS. No afirmo la norma exacta: hay que citarla con su fuente antes de publicar.
- [ ] **Casa de 51 m².** El sitio original la muestra con precio `$0` y sin ubicación. La v2 pone «Consulta el valor» y «Consulta la ubicación con un asesor»; confirmar precio, ciudad y disponibilidad reales.
- [ ] Fechas de entrega («2026–2027») y estados («En construcción», «Disponible»).
- [ ] Datos de **Álamos de Mukala**: la web de Mukala y Metrocuadrado no coinciden (habitaciones, áreas, amenidades, precio). ¿Cuál es la fuente de verdad?
- [ ] «5 proyectos en venta», «270 apartamentos», «9+ años».
- [ ] **Sección «Compra desde el exterior» (v3).** El texto es mío y orientativo: confirmar si Mukala vende a compradores que viven fuera de Colombia y cómo (documentos, medios de pago, firma a distancia, escrituración) y reemplazar las frases genéricas por el proceso real. Las tres frases de «por qué invertir» («un patrimonio en tu país», «un hogar para cuando vuelvas», «un clima y un paisaje únicos») también son propuesta mía.
- [ ] **«Artica»** (renders de día y noche que envió el cliente, ya en la portada, en una tarjeta y en la galería): confirmar el nombre exacto (Artica, Ártica o Ática), si es un proyecto nuevo o un render nuevo de Álamos, ciudad, precios, áreas, estado de obra y si cuenta entre los «5 proyectos en venta». Hoy la tarjeta dice solo «Nuevo», «Consulta la ubicación con un asesor» y «Consulta el valor»; «dos torres, piscina y zonas verdes» sale de lo que muestra el render.
- [ ] **Textos nuevos más cortos** de los 4 valores y de los pasos del proceso (v3): siguen siendo propuesta mía.
- [ ] **«5 proyectos en venta»:** incluye «Casas campestres · Cerritos», que dice «Consulta disponibilidad»; confirmar si cuenta como en venta.
- [ ] Textos propuestos por mí: descripciones de los 4 valores y los 4 pasos de «Proceso».
- [ ] **Texto legal de tratamiento de datos (Ley 1581 de 2012) y enlace a la política.** El aviso actual de los formularios es mío y no está aprobado.
- [ ] Logo vectorial original, fotos sin marca de agua, videos originales, testimonios y planos reales.
- [ ] Teléfono, WhatsApp, correo, dirección; si hay sala de ventas con dirección propia.

---

## 5. Producción (cuando se despliegue)

- Lo que se despliega es la carpeta **`dist/`** (`npm install && npm run build`): ya viene minificada y con hash en los nombres de CSS y JS. Que el servidor **comprima** (brotli/gzip), ponga **caché** larga a los archivos con hash y a `assets/`, deje el HTML en `no-cache` y sirva por **https**. `tests/serve.mjs ... prod` muestra la configuración que se mide aquí.
- Correr **PageSpeed Insights** y **WebPageTest** (móvil, 4G) sobre la URL real y guardar capturas.
- Tras ~4 semanas, mirar los **datos de campo** (Search Console → Core Web Vitals) y, si se instala analítica, el embudo: visita → abre proyecto → usa asistente/simulador → envía WhatsApp.
- Meta propuesta: LCP ≤ 2,5 s, CLS ≤ 0,1, INP ≤ 200 ms en el percentil 75 (son los umbrales «buenos» de Core Web Vitals).

---

## 6. Hoja de hallazgos (copia esta tabla)

| ID | Dónde (sección / pantalla) | Qué pasó | Dispositivo / lector | Severidad | Evidencia (captura, video, nota) | Estado |
|---|---|---|---|---|---|---|
| 1 | | | | Bloqueante / Mayor / Menor | | Abierto |

**Severidad:** *Bloqueante* = no se puede completar una tarea; *Mayor* = se completa con mucha dificultad o confusión; *Menor* = molestia o inconsistencia.

---

## 7. Cómo reclamar «4,8 certificable»

Propuesta de criterio (acordarlo con Mukala; no es un estándar):
1. Bloque 1: aprobado en los tres lectores móviles/escritorio principales.
2. Bloque 2: sin bloqueantes en la matriz mínima.
3. Bloque 3: ≥ 80 % de éxito, SUS ≥ 80 y ningún bloqueante sin resolver.
4. Bloque 4: textos y datos aprobados por escrito, con texto legal enlazado.
5. Bloque 5: LCP/CLS/INP «buenos» con datos reales.

Cuando los cinco se cumplan, vuelve a puntuar las siete categorías de `AUDITORIA-UX.md` con esta evidencia.
