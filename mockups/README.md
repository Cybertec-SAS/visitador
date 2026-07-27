# Mockups — Módulo de visitas

Carpeta de trabajo para **mockups (HTML + Tailwind) y mocks de datos** de features nuevos,
antes de integrarlos al código React. No se compila ni forma parte del build de Vite.

## Cómo verlos

1. `npm install` en la raíz del proyecto (una vez) — instala `@tailwindcss/browser`,
   que los mockups referencian localmente desde `node_modules`.
2. Abrir **`mockups/index.html`** (doble clic, o clic derecho → "Open with Live Server").
   Desde ahí hay links a las 3 vistas.

No requieren internet para los estilos (Tailwind corre desde `node_modules`, no desde CDN).
Solo la fuente Inter se carga desde Google Fonts; sin internet cae a Arial como fallback,
sin romper el layout.

⚠️ **No confundir con el `index.html` de la raíz del proyecto** — ese es la app React real
y solo funciona con `npm run dev` (Vite). Si lo abrís con Live Server o doble clic vas a ver
errores de consola (`main.tsx` con MIME type equivocado, `favicon.svg` 404, etc.) porque
ningún servidor estático puede transpilar TSX/JSX — eso es trabajo de Vite, no algo a corregir
en el HTML.

## Estructura

```
mockups/
├── index.html                 # Landing con links a las vistas — abrir este primero
├── data/                      # Mocks de datos (window.MOCK_*, consumidos por los HTML)
│   ├── clients-farms.mock.js  # Jerarquía Client → Farm → Galpon (ficticia)
│   ├── visits.mock.js         # Visitas, estados, tipos, técnicos, paginación
│   └── visit-detail.mock.js   # Detalle de una visita (checklist, galpones, hallazgos)
├── shared/
│   └── icons.js               # Heroicons v1 outline (mismos de react-icons/hi) → ICON(name, cls)
└── visits/
    ├── visits-list.html       # Tabla de vista superior (listado de visitas)
    ├── visit-form.html        # Formulario progresivo (wizard 4 pasos)
    └── visit-detail.html      # Vista individual (detalle de visita)
```

## Convención clave: clases copy-paste

Cada HTML incluye en `<style type="text/tailwindcss">` un bloque `@theme` **copiado 1:1 de
[src/index.css](../src/index.css)**. Así las clases (`bg-primary-soft`, `rounded-section`,
`text-heading`, `border-line`, …) son idénticas a las del proyecto y el markup se puede
trasladar a JSX casi sin cambios. Si cambian los tokens en `src/index.css`, replicarlos aquí.

## Patrones extraídos → fuente

| Patrón en el mockup | Extraído de |
|---|---|
| Step indicator + barra de progreso + navegación Anterior/Siguiente | [FarmForm.tsx](../src/components/forms/FarmForm.tsx) |
| Toggle-cards con revelación progresiva (switch → revela campos) | [FarmForm.tsx](../src/components/forms/FarmForm.tsx) (pasos 2 y 3) |
| SummaryCard con botón "Editar" que regresa al paso | [FarmForm.tsx](../src/components/forms/FarmForm.tsx) (paso Resumen) |
| Selector visual de tipo (botones con icono) | [FarmContactForm.tsx](../src/components/forms/FarmContactForm.tsx) |
| Breadcrumb + header de página + banner de flujo | [FarmFormPage.tsx](../src/pages/farms/FarmFormPage.tsx) |
| Tabla (thead `bg-input-bg`, filas hover, botones de acción por fila) | [FarmsListPage.tsx](../src/pages/farms/FarmsListPage.tsx) |
| Estado vacío (icono circular + mensaje + CTA) y spinner de carga | [FarmsListPage.tsx](../src/pages/farms/FarmsListPage.tsx) |
| Paginación con info de rango | [Pagination.tsx](../src/components/ui/Pagination.tsx) |
| Header card de detalle (icono + título + badges + botón editar) | [FarmDetailPage.tsx](../src/pages/farms/FarmDetailPage.tsx) |
| Banner guiado con checklist (aquí: "ejecución de la visita") | [FarmDetailPage.tsx](../src/pages/farms/FarmDetailPage.tsx) (`?new=1`) |
| `Section` / `InfoRow` / `BoolRow` | [FarmDetailPage.tsx](../src/pages/farms/FarmDetailPage.tsx) (subcomponentes) |
| Lista colapsable con header de badges y sub-lista de sistemas | [FarmDetailPage.tsx](../src/pages/farms/FarmDetailPage.tsx) (sección Galpones) |

## Decisiones provisionales (ajustar cuando se defina el flujo real)

- **Entidad Visit propuesta**: `code`, `client_id`, `farm_id`, `tipo` (tecnica / instalacion /
  seguimiento / novedad), `fecha_programada`, `hora`, `technician_id`, `estado` (programada /
  en_curso / completada / cancelada), `galpon_ids[]`, `observations`. **No existe en el backend**;
  es un borrador para el mockup.
- **Color del módulo**: verde `field` (reservado para visitas según FRONTEND.md) como acento de
  identidad (icono del header, badge "Completada"); los controles interactivos siguen en
  `primary` azul como el resto de la app.
- **Pasos del wizard**: Contexto → Programación → Alcance → Resumen (placeholder hasta recibir
  el flujo definitivo).
- **Vista de detalle**: incluye checklist de ejecución (programación → llegada → galpones →
  informe), revisión por galpón con estado de sistemas (OK / Requiere atención) y sección de
  **hallazgos** con severidad — esta última anticipa el módulo Reportes (naranja `report`).
  El botón ✓ de cada galpón pendiente lo marca como revisado (interacción mock).
- `visits-list.html` tiene una barra flotante "Mock" (abajo a la derecha) para alternar los
  estados **Datos / Vacío / Cargando** — es una herramienta del mockup, no parte del diseño.

## Al agregar un mockup nuevo

1. Datos en `data/<feature>.mock.js` exponiendo `window.MOCK_*`.
2. HTML en `<feature>/` copiando el bloque `@theme` y los `<script src>` relativos.
3. Comentario al inicio del HTML indicando de qué componente(s) del proyecto se extrajo el patrón.
