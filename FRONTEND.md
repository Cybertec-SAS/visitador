# FRONTEND.md — Visitator

Documentación técnica granular del proyecto frontend.

---

## Tabla de contenidos

1. [Stack y dependencias](#1-stack-y-dependencias)
2. [Configuración del proyecto](#2-configuración-del-proyecto)
3. [Estructura de directorios](#3-estructura-de-directorios)
4. [Routing](#4-routing)
5. [Modelos de dominio](#5-modelos-de-dominio)
6. [Esquemas de validación](#6-esquemas-de-validación)
7. [Capa API](#7-capa-api)
8. [Hooks personalizados](#8-hooks-personalizados)
9. [Componentes de layout](#9-componentes-de-layout)
10. [Componentes UI](#10-componentes-ui)
11. [Componentes de formulario](#11-componentes-de-formulario)
12. [Páginas](#12-páginas)
13. [Patrones de diseño](#13-patrones-de-diseño)
14. [Convenciones](#14-convenciones)

---

## 1. Stack y dependencias

### Producción

| Paquete | Versión | Uso |
|---|---|---|
| `react` | 19.2.4 | UI |
| `react-dom` | 19.2.4 | Renderizado DOM |
| `react-router-dom` | 7.14.1 | Routing |
| `react-hook-form` | 7.72.1 | Manejo de formularios |
| `@hookform/resolvers` | latest | Integración Zod + RHF |
| `zod` | 4.3.6 | Validación de esquemas |
| `axios` | 1.15.0 | Cliente HTTP |
| `leaflet` | 1.9.4 | Mapas interactivos |
| `react-leaflet` | 5.0.0 | Wrapper React para Leaflet |
| `sileo` | 0.1.5 | Notificaciones toast |
| `react-icons` | 5.6.0 | Iconografía |

### Desarrollo

| Paquete | Versión | Uso |
|---|---|---|
| `typescript` | ~6.0.2 | Tipado estático |
| `vite` | 8.0.4 | Bundler / dev server |
| `@vitejs/plugin-react` | latest | Soporte JSX/React en Vite |
| `@tailwindcss/vite` | latest | Plugin Tailwind para Vite |
| `tailwindcss` | 4.2.2 | Utilidades CSS |

---

## 2. Configuración del proyecto

### vite.config.ts

```ts
// path alias: @/ → ./src/
// plugins: tailwindcss(), react()
```

- Alias `@/` apunta a `./src/`
- Tailwind integrado como plugin de Vite (no PostCSS)

### tsconfig.json

- Composite project con referencias a `tsconfig.app.json` y `tsconfig.node.json`

### index.html

- `lang="es"`
- Google Fonts: **Inter** (pesos 400, 500, 600, 700, 800)
- `<title>Visitador</title>`

### src/index.css

Variables CSS del tema:

| Variable | Valor | Uso |
|---|---|---|
| Primary blue | `#2563eb` | Acción principal |
| Field green | — | Módulo visitas |
| Report orange | — | Módulo reportes |
| Danger red | — | Errores / eliminación |

---

## 3. Estructura de directorios

```
src/
├── api/                    # Clientes HTTP por recurso
│   ├── client.ts           # Instancia Axios base
│   ├── auth.ts
│   ├── clients.ts
│   ├── farms.ts
│   ├── georreferences.ts
│   ├── farmContacts.ts
│   ├── galpones.ts
│   ├── galponSystems.ts
│   ├── systemsCatalog.ts
│   ├── projects.ts
│   ├── colombiaApi.ts
│   ├── payloadTransforms.ts
│   └── index.ts            # Re-exporta todos los módulos
├── components/
│   ├── forms/              # Formularios multi-paso
│   │   ├── ClientForm.tsx
│   │   ├── FarmForm.tsx
│   │   ├── FarmGeolocationForm.tsx
│   │   ├── FarmContactForm.tsx
│   │   ├── GalponForm.tsx
│   │   ├── GalponSystemForm.tsx
│   │   └── MapPicker.tsx
│   ├── layout/             # Estructura de la app
│   │   ├── AppLayout.tsx
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   └── ui/                 # Componentes genéricos
│       ├── Breadcrumb.tsx
│       ├── ConfirmDialog.tsx
│       ├── LoadingSpinner.tsx
│       └── Pagination.tsx
├── context/
│   └── AuthContext.tsx
├── hooks/
│   └── useColombiaLocation.ts
├── pages/
│   ├── DashboardPage.tsx
│   ├── LoginPage.tsx
│   ├── clients/
│   │   ├── ClientsListPage.tsx
│   │   ├── ClientFormPage.tsx
│   │   └── ClientDetailPage.tsx
│   └── farms/
│       ├── FarmsListPage.tsx
│       ├── FarmFormPage.tsx
│       └── FarmDetailPage.tsx
├── router/
│   ├── index.tsx
│   ├── ProtectedRoute.tsx
│   └── GuestRoute.tsx
├── schemas/
│   └── index.ts
├── types/
│   └── api.ts
├── App.tsx
└── main.tsx
```

---

## 4. Routing

Archivo: [src/router/index.tsx](src/router/index.tsx)

```
/login                  → LoginPage          (GuestRoute)
/                       → AppLayout          (ProtectedRoute)
  /                     → DashboardPage
  /clients              → ClientsListPage
  /clients/new          → ClientFormPage
  /clients/:id          → ClientDetailPage
  /clients/:id/edit     → ClientFormPage
  /farms                → FarmsListPage
  /farms/new            → FarmFormPage
  /farms/:id            → FarmDetailPage
  /farms/:id/edit       → FarmFormPage
```

### Query params relevantes

| Ruta | Param | Efecto |
|---|---|---|
| `/farms/new` | `?client_id=X` | Preselecciona el cliente en el formulario y lo bloquea |
| `/farms/:id` | `?new=1` | Activa el banner de registro guiado con checklist |

### Guardas de ruta

- **ProtectedRoute** — redirige a `/login` si no hay sesión activa; muestra spinner mientras carga
- **GuestRoute** — redirige a `/` si ya hay sesión activa

---

## 5. Modelos de dominio

Archivo: [src/types/api.ts](src/types/api.ts)

### Respuestas genéricas

```ts
PaginatedResponse<T>   // data[], meta (page, per_page, total, last_page)
SingleResponse<T>      // data: T
ValidationError        // message, errors: Record<string, string[]>
```

### Client

```ts
interface Client {
  id: number
  razon_social: string
  nit: string
  email: string
  phone_number: string
  created_at: string
}
```

### Farm

```ts
interface Farm {
  id: number
  client_id: number
  client?: Client
  nombre: string
  // Eléctrico
  farm_voltage?: string
  farm_electric_current?: string
  transformer_capacity?: string
  feeds_other_installations?: boolean
  // Infraestructura
  trailer_access?: boolean
  has_address?: boolean
  staff_availability?: boolean
  storage_warehouse_count?: number
  total_galpones?: number
  quote_galpones?: number
  observations?: string
}
```

### FarmGeorreference

```ts
interface FarmGeorreference {
  id: number
  farm_id: number
  address?: string
  town?: string
  department?: string
  map_url_reference?: string
}
```

### FarmContact

```ts
type FarmContactType = 'administrador' | 'veterinario' | 'encargado' | 'otro'

interface FarmContact {
  id: number
  farm_id: number
  type: FarmContactType
  name: string
  email?: string
  phone?: string
}
```

### Galpon

```ts
interface Galpon {
  id: number
  farm_id: number
  name: string
  code?: string
  status?: 'active' | 'inactive'
  // Dimensiones (metros)
  largo?: number
  ancho?: number
  altura_canal?: number
  altura_cumbrera?: number
  // Técnico
  tipo_estructura?: string
  tipo_cubierta?: string
  observations?: string
  systems?: GalponSystem[]
}
```

### GalponSystem

```ts
interface GalponSystem {
  id: number
  galpon_id: number
  system_id: number
  system?: SystemCatalog
  quantity: number
  notes?: string
  technical_attributes?: { capacidad?: string }
}
```

### SystemCatalog

```ts
interface SystemCatalog {
  id: number
  code: string
  name: string
  is_active: boolean
}
```

### Project

```ts
interface Project {
  id: number
  client_id: number
  farm_id: number
  name: string
  code: string
  tipo: 'tipo_a' | 'tipo_b' | ...   // union de strings
  linea: 'linea_x' | 'linea_y' | ... // union de strings
  description?: string
}
```

---

## 6. Esquemas de validación

Archivo: [src/schemas/index.ts](src/schemas/index.ts)

Todos los mensajes de error están en español.

### clientSchema

| Campo | Regla |
|---|---|
| `razon_social` | requerido |
| `nit` | requerido |
| `email` | requerido, formato email |
| `phone_number` | requerido |

### farmSchema

| Campo | Regla |
|---|---|
| `client_id` | requerido |
| `nombre` | requerido |
| demás campos | opcionales (13 campos) |

### georreferenceSchema

| Campo | Regla |
|---|---|
| `farm_id` | requerido |
| `address`, `town`, `department`, `map_url_reference` | opcionales |

### farmContactSchema

| Campo | Regla |
|---|---|
| `farm_id`, `type`, `name` | requeridos |
| `email`, `phone` | opcionales |

### galponSchema

| Campo | Regla |
|---|---|
| `name` | requerido |
| demás campos | opcionales |

### galponSystemSchema

| Campo | Regla |
|---|---|
| `system_id`, `quantity` | requeridos |
| `notes`, `technical_attributes` | opcionales |

### projectSchema

| Campo | Regla |
|---|---|
| `client_id`, `farm_id`, `name`, `code`, `tipo`, `linea` | requeridos |
| `description` | opcional |

---

## 7. Capa API

### src/api/client.ts — Instancia Axios base

- `baseURL`: variable de entorno `VITE_API_URL` o fallback `/api`
- Header `Authorization: Bearer <token>` inyectado automáticamente
- Interceptor de respuesta 401: limpia sesión y redirige a `/login`

### src/api/clients.ts

```ts
list(page: number, params?: { per_page?: number })   // GET /clients
get(id: number)                                        // GET /clients/:id
create(data: ClientFormData)                           // POST /clients
update(id: number, data: ClientFormData)               // PATCH /clients/:id
delete(id: number)                                     // DELETE /clients/:id
```

### src/api/farms.ts

```ts
list(page, { client_id?, per_page? })   // GET /farms
get(id)                                  // GET /farms/:id
create(data)                             // POST /farms
update(id, data)                         // PATCH /farms/:id
delete(id)                               // DELETE /farms/:id
```

### src/api/georreferences.ts

```ts
list(page)          // GET /farm-georreferences
get(id)             // GET /farm-georreferences/:id
create(data)        // POST /farm-georreferences
update(id, data)    // PUT  /farm-georreferences/:id
delete(id)          // DELETE /farm-georreferences/:id
```

### src/api/farmContacts.ts

```ts
list(page)          // GET /farm-contacts
get(id)             // GET /farm-contacts/:id
create(data)        // POST /farm-contacts
update(id, data)    // PUT  /farm-contacts/:id
delete(id)          // DELETE /farm-contacts/:id
```

### src/api/galpones.ts — dos objetos exportados

```ts
// Galpones en el contexto de una granja
galponesPorGranjaApi.list(farmId)          // GET /farms/:farmId/galpones
galponesPorGranjaApi.create(farmId, data)  // POST /farms/:farmId/galpones

// Operaciones sobre un galpón individual
galponesApi.update(galponId, data)         // PATCH /galpones/:galponId
galponesApi.delete(galponId)               // DELETE /galpones/:galponId
```

### src/api/galponSystems.ts

```ts
create(galponId, data)   // POST /galpones/:galponId/systems
update(id, data)         // PATCH /galpon-systems/:id
delete(id)               // DELETE /galpon-systems/:id
```

### src/api/systemsCatalog.ts

```ts
list()   // GET /systems-catalog  (per_page: 100)
```

### src/api/projects.ts

```ts
list(page, { client_id?, farm_id?, per_page? })   // GET /projects
get(id)                                             // GET /projects/:id
create(data)                                        // POST /projects
update(id, data)                                    // PATCH /projects/:id
delete(id)                                          // DELETE /projects/:id
```

### src/api/colombiaApi.ts — API externa

Base URL: `https://api-colombia.com/api/v1`

```ts
fetchDepartments()                     // GET /Department → ColombiaDepartment[] (sorted)
fetchCitiesByDepartment(departmentId)  // GET /Department/:id/cities → ColombiaCity[] (sorted)

interface ColombiaDepartment { id: number; name: string }
interface ColombiaCity       { id: number; name: string }
```

### src/api/payloadTransforms.ts

`normalizePayload(payload)` — transforma el payload antes de enviarlo:

- Convierte strings a **UPPERCASE**
- **Excepciones** (no se transforman):
  - Campos que terminan en `_id`
  - Campos que contienen `url`
  - Campos en `NON_UPPERCASE_FIELDS`: `email`, `map_url_reference`, `farm_voltage`, `farm_electric_current`, `type`, `status`, `password`
- Procesa recursivamente arrays y objetos anidados

### src/api/index.ts

Re-exporta todos los módulos anteriores para importación centralizada.

---

## 8. Hooks personalizados

### src/hooks/useColombiaLocation.ts

Gestiona la selección de departamento/ciudad colombiana.

**Estado**:

| Nombre | Tipo | Descripción |
|---|---|---|
| `departments` | `ColombiaDepartment[]` | Lista cargada al montar |
| `cities` | `ColombiaCity[]` | Lista de la provincia seleccionada |
| `loadingDepartments` | `boolean` | |
| `loadingCities` | `boolean` | |
| `selectedDepartmentId` | `number \| null` | |

**Métodos**:

| Nombre | Descripción |
|---|---|
| `setSelectedDepartmentId(id)` | Carga las ciudades del departamento |
| `setDepartmentByName(name)` | Resolución diferida por nombre (safe) |

**Uso**: `FarmGeolocationForm` lo usa para cargar los dropdowns de departamento y municipio.

---

## 9. Componentes de layout

### src/components/layout/AppLayout.tsx

- Grid 2 columnas: sidebar fijo 288px + área de contenido (`<Outlet />`)
- Header sticky con logo
- Menú overlay para móvil (toggle con botón hamburguesa)

### src/components/layout/Sidebar.tsx

Secciones:

| Sección | Ítems | Estado |
|---|---|---|
| Registro | Clientes | Habilitado |
| Campo | Visitas | Deshabilitado ("Pronto") |
| Hallazgos | Reportes | Deshabilitado ("Pronto") |

- Acción rápida: "Registrar nuevo" → `/clients/new`
- Footer: avatar con inicial, nombre, email, botón logout
- Colapsable (cada sección es expandible)

### src/components/layout/Header.tsx

- Muestra nombre del usuario
- Botón logout (con toast)
- Actualmente sin uso activo en el diseño principal

---

## 10. Componentes UI

### src/components/ui/LoadingSpinner.tsx

Borde animado giratorio. Acepta `className` para personalización de tamaño/color.

### src/components/ui/Pagination.tsx

- Rango inteligente: muestra página actual ± 2
- Botones primera/última página con `…` (ellipsis)
- Anterior/Siguiente deshabilitados en los límites
- Prop: `onPageChange(page: number)`

### src/components/ui/Breadcrumb.tsx

- Trail de navegación con separadores chevron
- Todos los ítems son enlaces excepto el último
- Props: array de `{ label, href? }`

### src/components/ui/ConfirmDialog.tsx

Modal de confirmación:
- Backdrop overlay
- Props: `title`, `message`, `confirmLabel`, `cancelLabel`, `onConfirm`, `onCancel`, `isLoading`
- Estado de carga: spinner en el botón de confirmar

---

## 11. Componentes de formulario

### src/components/forms/ClientForm.tsx — Wizard 2 pasos

**Paso 1 — Identificación**
- `razon_social` (requerido)
- `nit` (requerido)

**Paso 2 — Contacto**
- `email` (requerido)
- `phone_number` (requerido)
- Mini-resumen del paso 1 visible

**UI**:
- Barra de progreso (% de los 4 campos requeridos rellenos)
- Indicadores de paso con checkmarks
- Barras conectoras entre pasos

**Sub-componente `FieldCard`**:
- Props: `icon`, `label`, `hint`, `filled` (boolean), `error`
- Estado visual diferente según `filled`

---

### src/components/forms/FarmForm.tsx — Wizard 4 pasos

**Paso 1 — Cliente & Granja**
- `client_id`: dropdown (se bloquea si viene preseleccionado por query param o en modo edición)
- `nombre`: input requerido

**Paso 2 — Sistema eléctrico**
- `farm_voltage`, `farm_electric_current`
- Toggle transformador → revela `transformer_capacity`
- Toggle alimenta otras instalaciones → revela campos relacionados

**Paso 3 — Infraestructura**
- Toggle acceso carretera → revela `trailer_access`
- Toggle tiene dirección → revela campo dirección
- `staff_availability` (toggle)
- `storage_warehouse_count` (número)
- `total_galpones`, `quote_galpones` (números)

**Paso 4 — Resumen**
- Cards por sección con datos ingresados
- Cada card tiene botón "Editar" que regresa al paso correspondiente

**UI**:
- Progreso: 2 campos requeridos + 7 opcionales
- Indicador de pasos optimizado para móvil

**Sub-componentes**:
- `StepHeader`: icono + título + descripción
- `ToggleField`: checkbox estilizado como switch
- `SummaryCard`: grid 2 columnas con datos + link de edición

---

### src/components/forms/FarmGeolocationForm.tsx — Wizard 2 pasos

**Paso 1 — Dirección**
- `address` (texto libre)
- `department` (dropdown vía colombiaApi)
- `town` (dropdown, carga según departamento seleccionado)

**Paso 2 — Mapa**
- `MapPicker` embebido (Leaflet)
- Input de URL de mapa
  - Extrae coordenadas automáticamente vía regex
  - Verifica si es link de Google Maps
- Botón "Usar mi ubicación" (Geolocation API del navegador)

**Dependencias**: `useColombiaLocation` hook

---

### src/components/forms/FarmContactForm.tsx

**Tipo de contacto** — 4 botones visuales:

| Tipo | Color |
|---|---|
| administrador | — |
| veterinario | — |
| encargado | — |
| otro | — |

Cada botón tiene icono + label + esquema de color propio.

**Campos**:
- `name` (requerido)
- `email`, `phone` (opcionales)
- Barra de progreso (4 campos)

---

### src/components/forms/GalponForm.tsx

| Campo | Tipo | Requerido |
|---|---|---|
| `name` | texto | Sí |
| `code` | texto | No |
| `status` | select (active/inactive) | No |
| `tipo_estructura` | texto | No |
| `tipo_cubierta` | texto | No |
| `largo` | número (m) | No |
| `ancho` | número (m) | No |
| `altura_canal` | número (m) | No |
| `altura_cumbrera` | número (m) | No |
| `observations` | textarea | No |

---

### src/components/forms/GalponSystemForm.tsx

| Campo | Tipo | Requerido |
|---|---|---|
| `system_id` | select (desde catálogo) | Sí |
| `quantity` | número | Sí |
| `capacidad` | texto (atributo técnico) | No |
| `notes` | textarea | No |

---

### src/components/forms/MapPicker.tsx

- Mapa Leaflet interactivo
- Centro por defecto: Colombia (4.5709, -74.2973), zoom 6
- Zoom 15 si se proveen coordenadas iniciales
- Click en el mapa coloca marcador (icono teardrop azul con `divIcon`)
- Marcador se sincroniza si las coordenadas cambian externamente
- Tile layer: OpenStreetMap
- Coordenadas actuales visibles al pie del mapa
- Leaflet se carga con `dynamic import` (lazy) y su CSS se inyecta una sola vez

---

## 12. Páginas

### src/pages/DashboardPage.tsx

- Saludo con el primer nombre del usuario (`useAuth`)
- 3 tarjetas de acción:
  1. **Registrar** — activa, badge "1→2→3 pasos", lleva a `/clients/new`
  2. **Visitas** — deshabilitada, color verde campo
  3. **Reportes** — deshabilitada, color naranja reporte, tags de tipo (Técnico, Novedad, etc.)
- Indicadores de estado (online, premium, etc.)

---

### src/pages/clients/ClientsListPage.tsx

**Tabla**: `razon_social` · `nit` · `email` · `phone_number` · acciones

- Paginación con `Pagination`
- Estado vacío: icono + mensaje + botón crear
- Botones por fila: Editar → `/clients/:id/edit` | Eliminar → `ConfirmDialog`
- Maneja errores 422 de validación

---

### src/pages/clients/ClientFormPage.tsx

- **Breadcrumb**: Clientes → [nombre del cliente] → Crear | Editar
- Banner informativo en modo creación (explica el flujo de 3 pasos)
- En creación: navega a `/clients/:id` tras guardar
- En edición: navega de vuelta a `/clients/:id`

---

### src/pages/clients/ClientDetailPage.tsx

**Header**:
- Avatar con iniciales de `razon_social`
- `razon_social` + `nit`
- Contador de granjas
- Botón editar

**Grid de info**: `nit` · `email` · `phone_number` · `created_at`

**Sección Granjas**:
- Tarjetas por granja: nombre + municipio (de `FarmGeorreference`)
- Estado vacío: hint "Paso 2 de 3"
- Botón nueva granja → `/farms/new?client_id={id}`

---

### src/pages/farms/FarmsListPage.tsx

**Tabla**: `nombre` · cliente (link a detalle) · `farm_voltage` · `farm_electric_current` · acciones

- Paginación, estado vacío, editar/eliminar por fila

---

### src/pages/farms/FarmFormPage.tsx

- **Breadcrumb**: maneja contexto de cliente preseleccionado o modo edición
- Carga todos los clientes (`per_page: 200`) para el dropdown
- Muestra advertencia si no hay clientes registrados
- `client_id` desde `?client_id=X` → queda preseleccionado y bloqueado
- En creación: navega a `/farms/:id?new=1`
- En edición: navega de vuelta a `/farms/:id`

---

### src/pages/farms/FarmDetailPage.tsx *(1078 líneas)*

La página más grande del proyecto. Implementa el flujo completo de registro de una granja.

#### Banner de registro guiado (`?new=1`)

Checklist de 4 pasos que se activa al crear una granja nueva:

1. Georreferencia
2. Contacto
3. Galpones
4. Sistemas

- Cada paso tiene botón para marcar como completado
- Botón "Descartar" elimina `?new=1` de la URL

#### Header

- Nombre de la granja
- Link al cliente propietario
- Botón editar → `/farms/:id/edit`

#### Sección: Sistema eléctrico

Muestra en grid: `farm_voltage` · `farm_electric_current` · `transformer_capacity` · `feeds_other_installations`

#### Sección: Acceso e infraestructura

Muestra: acceso carretera · total/quote galpones · bodegas · booleanos · observaciones

#### Sección: Georreferencia

- **Sin dato**: botón "Agregar"
- **Con dato**: muestra dirección, municipio, departamento, link al mapa
- Toggle para mostrar/ocultar `FarmGeolocationForm` inline

#### Sección: Contactos

- Toggle para mostrar `FarmContactForm` inline
- Tarjetas por contacto: badge de tipo · nombre · email · teléfono
- Botones editar/eliminar por contacto
- `ConfirmDialog` para eliminación

#### Sección: Galpones

Lista colapsable. Cada ítem tiene:

**Header del galpón** (siempre visible):
- Nombre · badge code · badge status (active/inactive) · contador de sistemas · dimensiones resumidas
- Botones: editar inline | eliminar

**Contenido expandido** (toggle):
- Si está en modo edición: `GalponForm` inline
- Si no: grid de dimensiones + atributos técnicos + observaciones

**Sub-sección Sistemas** (dentro del expandido):
- Botón "Agregar sistema"
- Lista: nombre del sistema · cantidad · notas
- Editar inline con `GalponSystemForm`
- Eliminar con `ConfirmDialog`

#### Sub-componentes internos

```tsx
Section(icon, title, count?, children)  // Tarjeta con header y borde
InfoRow(label, value)                   // Fila label + valor
BoolRow(label, value)                   // Fila con checkbox visual (sí/no/vacío)
```

---

## 13. Patrones de diseño

### Jerarquía de entidades

```
Client
  └── Farm
        ├── FarmGeorreference   (1:1)
        ├── FarmContact[]       (1:N)
        └── Galpon[]            (1:N)
              └── GalponSystem[] (1:N)
```

### Formularios multi-paso

Todos los formularios de creación usan wizards con:
- Barra de progreso visual (% de campos completados)
- Indicadores de paso con estado (pendiente / activo / completado)
- Navegación anterior/siguiente + submit solo en el último paso

### Edición inline

Las páginas de detalle alternan entre modo vista y modo edición sin navegar:
- Un flag `boolean` local controla cuál se muestra
- Al guardar, se recarga el recurso y se cierra el formulario

### Flujo guiado de onboarding

Al crear una granja (`?new=1`), `FarmDetailPage` muestra un checklist de 4 pasos. Cada paso lleva al usuario a la sección correspondiente de la misma página.

### Revelación progresiva

En `FarmForm`, los toggles muestran/ocultan campos relacionados:
- Toggle "tiene transformador" → revela `transformer_capacity`
- Toggle "tiene acceso carretera" → revela campos de acceso

### Normalización de payload

`normalizePayload()` se aplica antes de cada POST/PATCH para convertir a mayúsculas los campos de texto, excluyendo los campos de la lista de excepciones.

---

## 14. Convenciones

### Nomenclatura

- Nombres de entidades y campos en **español** (siguiendo el backend)
- Componentes React en **PascalCase**
- Funciones y variables en **camelCase**
- Archivos de componentes en **PascalCase.tsx**
- Archivos de módulos utilitarios en **camelCase.ts**

### Texto en UI

- Todo el texto visible al usuario está en **español**
- Mensajes de error de Zod en español
- Etiquetas de formulario y headings en español

### Importaciones

- Alias `@/` para rutas absolutas desde `src/`
- `src/api/index.ts` como punto de entrada centralizado para todos los módulos API

### Errores HTTP

- `422` — errores de validación del servidor: se extraen y mapean a campos del formulario
- `401` — sesión expirada: interceptor global redirige a `/login`
