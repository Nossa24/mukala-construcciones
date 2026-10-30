# Pruebas automáticas — Mukala v2

Son las pruebas que sí se pueden ejecutar con scripts. **No reemplazan** lector de pantalla real, aparatos físicos ni compradores reales (ver `../GUIA-PRUEBAS.md`).
Resultados de la última corrida: `../RESULTADOS-PRUEBAS.md`.

## Requisitos
- Node 20+ y Google Chrome instalado en `/Applications/Google Chrome.app` (ruta fija en `lib.mjs`; cámbiala si usas otro sistema).
- Dependencias: `cd tests && npm install`. Para WebKit: `npx playwright install webkit` (Firefox no arrancó en el equipo donde se probó).

## Uso
```bash
# 1. Construir la versión de producción (desde la raíz del proyecto; requiere esbuild: npm install allí)
cd ~/Claude/mukala-redesign-v2 && npm install && npm run build

# 2. Servir las dos versiones: código fuente (8780, sin comprimir) y dist (8781, con brotli/caché como en producción)
cd tests
node serve.mjs .. 8780 dev &
node serve.mjs ../dist 8781 prod &

# 3. Correr las suites (BASE elige cuál versión se prueba; sin BASE usa el puerto 8780)
for s in b1-keyboard b1b-axtree b2-matrix b2-prefs b3-tasks b6-axe-states; do BASE=http://127.0.0.1:8781/ node $s.mjs; done
BASE=http://127.0.0.1:8781/ node engines.mjs        # WebKit (Safari), Chrome móvil
mkdir -p out && URL=http://127.0.0.1:8781/ zsh run-lh.sh out prod   # Lighthouse móvil y escritorio → out/lh-prod-*.json
```
Cada suite imprime JSON/tabla; `"problemas": []` o «PROBLEMAS: ninguno» significa que pasó.

| Script | Qué comprueba |
|---|---|
| `b1-keyboard.mjs` | Recorrido con Tab (paradas, foco visible, sin trampas), diálogo, pestañas con flechas, asistente, simulador, formulario, menú móvil, enlace «Ir al contenido» |
| `b1b-axtree.mjs` | Árbol de accesibilidad de Chrome: encabezados, regiones, nombres y estados, tabla, imágenes, regiones vivas |
| `b2-matrix.mjs` | Anchos de 320 a 1920 px: desbordes (ignora los carruseles internos), menú, objetivos táctiles, fuentes |
| `b2-prefs.mjs` | Movimiento reducido, colores forzados, texto grande 150/200 %, zoom 200 %, márgenes seguros, red 4G/3G lenta con CPU 6× |
| `b3-tasks.mjs` | Las 5 tareas del guion de compradores, como recorrido guionado (cuenta toques y verifica visibilidad) |
| `b6-axe-states.mjs` | axe-core en 11 estados (diálogo abierto, visor, formulario con error/éxito, simulador inválido, menú móvil, tablet…) |
| `engines.mjs` | Mismos flujos en WebKit (escritorio, iPhone 14 vertical/horizontal, iPad) y Chrome Pixel 7 |
| `fps.mjs` | Fluidez de scroll (cuadros por encima de 33 ms) con CPU normal y 6× más lenta, escritorio y móvil |
| `card-contrast.mjs` | Contraste real (muestreo de píxeles) de títulos, datos y precios sobre las fotos de las tarjetas de proyecto |
| `navfit.mjs` | Que el botón del encabezado quepa a 1341, 1366, 1440 y 1536 px |
| `snap.mjs` | Capturas por sección en 3 anchos (para comparar píxel a píxel antes y después de un cambio de CSS) |
| `run-lh.sh` | Lighthouse (rendimiento, accesibilidad, buenas prácticas, SEO), móvil y escritorio |

`serve.mjs` en modo `prod` imita un hosting correcto (brotli/gzip, `ETag`, caché inmutable para archivos con hash); no es un servidor para publicar.
