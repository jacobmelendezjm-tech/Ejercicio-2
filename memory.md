# Memory — Ejercicio 2

Notas del estado del proyecto para retomarlo sin repasar todo el historial.

## Resumen

App Next.js (16.3.4, App Router) con shadcn/ui (estilo `base-nova`) y Tailwind 4.
Una sola página que muestra una tabla de vehículos, con buscador, paginación y orden por
potencia, tres tarjetas de estadísticas y un fondo animado con un shader WebGL.

Repositorio: https://github.com/jacobmelendezjm-tech/Ejercicio-2 (público, rama `main`).

## Estructura relevante

| Archivo | Qué hace |
| --- | --- |
| `app/page.tsx` | Página única (componente de servidor). Lee el JSON, ordena, pagina y pinta la tabla. |
| `app/layout.tsx` | Layout raíz. Carga la fuente Inter (`--font-sans`) y el `ThemeProvider`. |
| `components/shader-background.tsx` | Canvas WebGL1 con el shader "Plasma". Componente de cliente. |
| `components/ui/card.tsx` | Card estándar de shadcn base-nova. |
| `components/ui/table.tsx` | Tabla de shadcn (`npx shadcn@latest add table`). |
| `components/ui/pagination.tsx` | Paginación de shadcn (`npx shadcn@latest add pagination`). |
| `components/ui/input.tsx` | Input de shadcn (`npx shadcn@latest add input`), usado en el buscador. |
| `public/json/vehiculos_200.json` | 200 vehículos: `id`, `marca`, `modelo`, `potencia_cv`, `pais_fabricacion`. |

## Comportamiento de la página

- **Layout:** div exterior `relative w-full overflow-hidden bg-neutral-950`, contenedor
  centrado `max-w-[1200px]` y grid de 12 columnas (`grid-cols-12`, `min-h-svh`,
  `items-start`, `gap-4`). La tarjeta de la tabla ocupa 9 columnas (`lg:col-span-9`) y
  las tres tarjetas de estadísticas 3 (`lg:col-span-3`), una debajo de otra. En pantallas
  pequeñas todo se apila a ancho completo.
- **Buscador:** formulario GET arriba a la izquierda de la tabla. Estado en la URL: `?q=texto`.
  Busca en ID, marca, modelo, país y potencia, sin distinguir mayúsculas ni acentos. Se
  aplica antes de ordenar y paginar, y las flechas y la paginación conservan `q`.
- **Estadísticas:** se calculan sobre los resultados filtrados: potencia media (con el coche
  más cercano a la media), coche más cutre (menor potencia) y coche más potente.
- **Datos:** el JSON se importa directamente (`@/public/json/vehiculos_200.json`), no con `fs`,
  para que funcione en Vercel.
- **Paginación:** 25 filas por página (`PAGE_SIZE`), 8 páginas. Estado en la URL: `?page=N`.
  Un valor inválido o fuera de rango se ajusta al mínimo o máximo.
- **Orden:** flechas ▲/▼ dentro del encabezado de "Potencia (CV)". Estado en la URL:
  `?sort=asc` (menor a mayor) o `?sort=desc` (mayor a menor). Pulsar la flecha activa
  quita el orden. El orden se aplica a los 200 registros antes de paginar y al cambiarlo
  se vuelve a la página 1. Los enlaces de paginación conservan el orden.

## Shader de fondo

- Estilo "Plasma" (21st.dev Shader Builder). Fragment shader copiado tal cual del
  encabezado original; no editarlo salvo petición expresa.
- Colores (de bajo a alto): `#101010`, `#F5F5F5`, `#B0B0B0`, `#3A3A3A`.
- Uniformes empaquetados: `u_scene`, `u_shape`, `u_surface`, `u_finish`, `u_transform`,
  `u_space`, `u_cursor`. El cursor está apagado. `devicePixelRatio` limitado a 2.
- El bucle `requestAnimationFrame` se pausa con la pestaña oculta.
- `u_surface.z` (brillo) vale `-0.50`, tal como venía en el encabezado, aunque la
  descripción decía brillo 0/100. Si el fondo se ve demasiado oscuro, ponerlo en 0.

## Cosas a tener en cuenta

- `AGENTS.md` avisa de que esta versión de Next tiene cambios incompatibles: consultar
  `node_modules/next/dist/docs/` antes de usar APIs de Next. Ejemplo: `searchParams`
  es una `Promise` en las páginas.
- `lib/utils.ts` exporta `cn` desde el paquete `cn`, no desde `clsx` + `tailwind-merge`.
  Por eso las clases en conflicto no se fusionan.
- `card.tsx` se sustituyó por la versión estándar de shadcn base-nova porque la
  anterior era una versión simplificada que no coincidía con el diseño esperado.

## Comandos

```bash
npm run dev        # servidor de desarrollo en http://localhost:3000
npm run typecheck  # tsc --noEmit
npm run lint
```

## Historial

- Grid de 12 columnas y tarjeta de 4 columnas, luego contenedor de 1200px.
- Tabla de shadcn con los datos de `public/json/vehiculos_200.json`.
- Paginación de 25 elementos por página.
- Fondo de shader WebGL "Plasma".
- Orden por potencia con flechas en el encabezado de la columna.
- Primer commit y subida a GitHub.
- Despliegue en Vercel; el JSON pasó de `fs` a `import`.
- Buscador por texto (`?q=`).
- Tres tarjetas de estadísticas a la derecha de la tabla, con el coche más cercano a la media.
