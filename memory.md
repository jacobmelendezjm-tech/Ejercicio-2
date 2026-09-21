# Memory — Ejercicio 2

Notas del estado del proyecto para retomarlo sin repasar todo el historial.

## Resumen

App Next.js (16.3.4, App Router) con shadcn/ui (estilo `base-nova`) y Tailwind 4.
Una sola página que muestra una tabla de vehículos, con buscador, paginación y orden por
potencia, cuatro tarjetas laterales (tres estadísticas y un gráfico de barras de potencia por país) y un fondo animado con un shader WebGL.

Repositorio: https://github.com/jacobmelendezjm-tech/Ejercicio-2 (público, rama `main`).
Despliegue: https://ejercicio2-mu-vert.vercel.app/ (cuenta `jacob14-416e`, plan Hobby).

## Estructura relevante

| Archivo | Qué hace |
| --- | --- |
| `app/page.tsx` | Página única (componente de servidor). Lee el JSON, ordena, pagina y pinta la tabla. |
| `app/layout.tsx` | Layout raíz. Carga la fuente Inter (`--font-sans`) y el `ThemeProvider`. |
| `components/shader-background.tsx` | Canvas WebGL1 con el shader "Plasma". Componente de cliente. |
| `components/ui/card.tsx` | Card estándar de shadcn base-nova. |
| `components/ui/table.tsx` | Tabla de shadcn (`npx shadcn@latest add table`). |
| `components/ui/pagination.tsx` | Paginación de shadcn (`npx shadcn@latest add pagination`). |
| `components/animated-blobatar.tsx` | Blobatar animado (mueve, parpadea y sus ojos siguen el puntero) para la celda de marca. Cliente. |
| `components/ui/avatar.tsx`, `components/ui/blobatar.tsx` | Instalados con `npx shadcn@latest add @blobatar/avatar` (registro `@blobatar` en `components.json`). |
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
- **Blobatar:** cada marca lleva a la izquierda un blobatar generado a partir del nombre (misma marca, misma cara),
  con `animate="always"` y `useGaze({ travel: 4, lookAt: "pointer" })`. Requiere `blobatar/motion.css` y
  `blobatar/gaze.css`; se desactiva con "reducir movimiento".
- **Estadísticas:** se calculan sobre los resultados filtrados: potencia media (con el coche
  más cercano a la media), coche más cutre (menor potencia) y coche más potente. Debajo, una
  cuarta tarjeta "Potencia por país" con barras de los 6 países con más CV acumulados y su líder.
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

## Despliegue (Vercel)

- El proyecto de Vercel se llama `ejercicio2` y se creó con el flujo de clonar, que genera
  una **copia privada** del repo en GitHub. Si sigue esa copia, los pushes a `Ejercicio-2`
  no lo despliegan.
- Comprobado el 2026-09-21: la URL de producción `ejercicio2-mu-vert.vercel.app` seguía
  mostrando una versión antigua (sin buscador, gráfico ni blobatars) aunque `main` en GitHub
  ya tenía todo. Existe otro despliegue, `ejercicio2-fn71wh64x-jacob14-416e.vercel.app`, pero
  está protegido con inicio de sesión de Vercel y no se puede leer desde fuera.
- Arreglos posibles: en Vercel, Deployments → despliegue más reciente → Promote to Production;
  o Settings → Git → Disconnect y conectar `jacobmelendezjm-tech/Ejercicio-2`.
- No hay CLI de Vercel instalada ni sesión iniciada en esta máquina, así que los despliegues
  se hacen desde la web de Vercel. Se instaló el plugin `vercel/vercel-plugin` en VS Code
  (`npx plugins add vercel/vercel-plugin`, alcance de usuario); hay que reiniciar VS Code
  para que cargue y luego iniciar sesión en Vercel.
- Pendiente: confirmar qué repo tiene conectado Vercel y dejar producción al día.

## GitHub

- Remoto: `origin` → https://github.com/jacobmelendezjm-tech/Ejercicio-2.git, rama `main`.
- Git usa `user.name` = `jacobmelendezjm-tech` y `user.email` = `jacobmelendez.jm@gmail.com`
  solo en este repositorio. `gh` (GitHub CLI) está instalado pero sin sesión iniciada; los
  pushes funcionan por HTTPS con las credenciales de Windows.

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
- Comprobación del despliegue: la URL de Vercel estaba desactualizada respecto a `main`.
- Tarjeta "Potencia por país" (barras) bajo las estadísticas.
- Blobatar animado junto a cada marca, con registro `@blobatar` de shadcn.
- Instalación del plugin de Vercel en VS Code y revisión del estado de los despliegues.
