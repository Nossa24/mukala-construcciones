# Mukala Construcciones — propuesta de rediseño (v4, minimalista)

> **Borrador de propuesta, pendiente de aprobación de Mukala.** No es el sitio oficial. La versión publicada lleva `noindex, nofollow` para que los buscadores no la indexen. Usa el nombre, la marca y los datos de contacto reales de Mukala (WhatsApp, teléfono, correo).

**Ver la propuesta:** https://nossa24.github.io/mukala-construcciones/ (se publica desde la carpeta `docs/`).

Sitio estático (HTML, CSS y JavaScript sin frameworks) para Mukala Construcciones SAS (Eje Cafetero): portada a pantalla completa, un panel por proyecto, «Nosotros» y contacto directo por WhatsApp, teléfono y correo, **sin formularios ni herramientas**. Conserva la paleta de la marca (#FFC143, #2B2B2B, #353131, #000, #DBDBDB, #FFF) y el sentido del sitio original: calidad, confianza e «Tu inversión en las mejores manos».

## Qué hay aquí
| Carpeta / archivo | Contenido |
|---|---|
| `docs/` | El sitio ya construido (minificado, con hash) que publica GitHub Pages |
| `index.html`, `styles.css`, `app.js`, `assets/` | Código fuente editable |
| `build.mjs`, `package.json` | Construcción de producción |
| `tests/` | Pruebas automáticas (teclado, accesibilidad, anchos, preferencias, tareas, contraste sobre fotos, axe, Lighthouse, WebKit); ver `tests/README.md` |
| `DISENO-V2.md` | Decisiones de diseño y qué se tomó de cada referencia |
| `AUDITORIA-UX.md`, `RESULTADOS-PRUEBAS.md` | Puntajes, evidencia y límites |
| `GUIA-PRUEBAS.md` | Pruebas que requieren personas o aparatos y la lista de cosas que Mukala debe aprobar |

## Reconstruir
```bash
npm install
npm run build                      # genera dist/
OUT=docs NOINDEX=1 npm run build   # genera docs/ con noindex (versión de muestra)
```
Después de editar el código fuente hay que volver a construir.

## Pendiente de Mukala antes de publicarlo como sitio real
- Si más adelante se agrega algún formulario: texto legal de tratamiento de datos (Ley 1581 de 2012) y enlace a su política. La v4 no recoge datos personales.
- Textos que redactó el equipo de diseño: la frase de «Nosotros», los valores y la línea «¿Vives fuera de Colombia?» (confirmar si venden a quienes viven fuera de Colombia y cómo).
- Cifras y precios (135 SMMLV, «5 proyectos en venta», «9+ años») y los datos de «Artica» (nombre exacto, ciudad, precios, estado de obra).
- Logo vectorial original, fotos sin marca de agua y testimonios reales.
- Al publicar: quitar `noindex`, agregar `og:image` con URL absoluta y la URL canónica, y servir por https con compresión.

Lista completa en `GUIA-PRUEBAS.md` §4.

## Calidad medida (sobre `docs/`)
Lighthouse 100 / 100 / 100 / 100 (móvil y escritorio); axe-core sin violaciones en 5 estados; contraste mínimo del texto sobre fotos 7,45:1; sin errores en WebKit (Safari) ni Chrome móvil. Esta versión **no pasó por una nueva revisión independiente**; los puntajes de `AUDITORIA-UX.md` son de versiones anteriores. Faltan lectores de pantalla reales, aparatos físicos, Firefox y pruebas con compradores.
