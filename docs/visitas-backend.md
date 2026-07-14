# Módulo de Visitas — Estructura de datos para backend

> Documento de contrato para el equipo de backend. Describe el recurso **`Visit`**
> (visita técnica), sus endpoints y su esquema de datos, tal como los produce y
> consume el frontend (React). Hoy el frontend guarda contra un **store en memoria**
> (`src/api/_visitsMockStore.ts`); al publicar el endpoint real basta con reemplazar
> el cuerpo de cada método en `src/api/visits.ts` (cada uno tiene un `// TODO(backend)`
> con la llamada equivalente, idéntica a `farmsApi`).

## 1. Resumen del recurso

Una **visita** es una inspección técnica realizada sobre **un galpón** de una granja.
Reutiliza los recursos existentes **Cliente → Granja → Galpón** (selección en cascada,
paso 1 del formulario) y agrega toda la información capturada en un asistente de 8 pasos,
más un informe.

- Relaciones: `client_id → clients.id`, `farm_id → farms.id`, `galpon_id → galpones.id`.
- Ciclo de estado: `draft` (borrador) → `completed` (finalizada). Hoy el frontend
  marca `completed` al pulsar "Finalizar visita".
- **Tipo de visita** (`type`): por ahora sólo `diagnostico_tecnico` (el asistente actual).
  El campo es un enum extensible: habrá otros tipos (instalación, comercial, seguimiento).

## 2. Endpoints propuestos

Mismo estilo REST/Laravel que el resto de recursos (`clients`, `farms`), con respuesta
paginada `{ data, links, meta }` para listas y `{ data }` para un elemento.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/visits?page=1&per_page=15` | Listado paginado (orden desc. por fecha). |
| GET | `/api/visits/{id}` | Detalle de una visita. |
| POST | `/api/visits` | Crear visita. |
| PATCH | `/api/visits/{id}` | Actualizar (edición / cambio de estado). |
| DELETE | `/api/visits/{id}` | Eliminar. |

Filtros útiles para el listado (opcionales): `client_id`, `farm_id`, `status`, `type`.

Errores de validación: formato Laravel `422` → `{ message, errors: { campo: [..] } }`
(el frontend ya lo sabe interpretar).

## 3. Esquema de datos

Estrategia recomendada (consistente con el proyecto, que ya usa `dimensions_json` /
`technical_attributes_json` en galpones): **columnas escalares/relacionales** para lo
que se filtra o lista, y **columnas JSON por sección** para el detalle de la inspección.

### 3.1 Columnas de la tabla `visits`

| Campo | Tipo | Null | Descripción |
|---|---|---|---|
| `id` | bigint (PK) | no | |
| `type` | enum/string | no | Tipo de visita. Hoy `diagnostico_tecnico`. |
| `status` | enum/string | no | `draft` \| `completed`. Default `draft`. |
| `client_id` | bigint (FK) | no | Cliente. |
| `farm_id` | bigint (FK) | no | Granja. |
| `galpon_id` | bigint (FK) | no | Galpón inspeccionado. |
| `fecha` | date | no | Fecha de la visita. |
| `num_aves` | int | sí | Nº de aves del lote actual. |
| `dia_lote` | int | sí | Día de lote. |
| `cliente_nombre` | string | sí | Snapshot del nombre del cliente al momento. |
| `granja_nombre` | string | sí | Snapshot del nombre de la granja. |
| `galpon_numero` | string | sí | Snapshot del identificador del galpón. |
| `ubicacion` | string | sí | Snapshot de la ubicación (georreferencia de la granja). |
| `total_galpones` | int | sí | Snapshot del total de galpones de la granja. |
| `contacto_json` | json | sí | Snapshot de contactos (ver 3.2). |
| `control_json` | json | sí | Paso 2 (ver 3.3). |
| `tablero_json` | json | sí | Paso 3 (ver 3.4). |
| `variables_json` | json | sí | Paso 4 (ver 3.5). |
| `ventilacion_json` | json | sí | Paso 5 (ver 3.6). |
| `mecanicos_json` | json | sí | Paso 6 (ver 3.7). |
| `evidencia_json` | json | sí | Paso 7 (ver 3.8). |
| `informe_json` | json | sí | Paso 8 (ver 3.9). |
| `created_at` / `updated_at` | timestamp | no | |

> **Snapshot vs. referencia:** `client_id/farm_id/galpon_id` son la referencia viva;
> `cliente_nombre`, `granja_nombre`, `galpon_numero`, `ubicacion`, `total_galpones` y
> `contacto_json` son **copias congeladas** al momento de la visita, para que el informe
> histórico no cambie si luego se edita la granja/el contacto. El frontend los envía ya
> resueltos.

> El JSON que envía el frontend usa **exactamente** los mismos nombres de campo aquí
> descritos (anidados dentro de un objeto por sección). El backend puede guardarlos tal
> cual en las columnas `*_json`, o normalizarlos a tablas si lo prefiere, siempre que la
> respuesta los devuelva con la misma forma.

### 3.2 `contacto_json`
```jsonc
{ "adm_nombre": string|null, "adm_cel": string|null,
  "vet_nombre": string|null, "vet_cel": string|null, "correo": string|null }
```

### 3.3 `control_json` (Control y automatización)
```jsonc
{
  "marca": string|null, "modelo": string|null, "serial": string|null, "version": string|null,
  "volt_ac": number|null, "volt_dc": number|null,
  "sensores": {                         // clave = tipo de sensor
    "temp": { "instalados": number|null, "detectados": number|null, "estado": "b|r|m|n" },
    "pres": { ... }, "hum": { ... }, "co2": { ... }, "amm": { ... }
  },
  "lecturas": { "temp": number|null, "hum": number|null, "pres": number|null,
                "co2": number|null, "amm": number|null },
  "estado_fisico": {                    // clave = criterio (ver enums 4)
    "pantalla": "b|r|m|n", "teclado": "...", "gabinete": "...",
    "cableado": "...", "fuente": "..."
  },
  "observaciones": string|null
}
```

### 3.4 `tablero_json`
```jsonc
{
  "fisico": { "limpieza": "b|r|m", "humedad": "...", "corrosion": "...", "orden": "..." },
  "obs_fisico": string|null,
  "otros_equipos": { "dimmer": "b|r|m", "rdt5": "...", "rswrsu": "...", "backup": "..." },
  "obs_otros_equipos": string|null,
  "mediciones": { "l1l2": number|null, "l2l3": number|null, "l1l3": number|null,
                  "l1n": number|null, "l2n": number|null, "l3n": number|null },
  "termografia": { "temp_max": number|null, "puntos_calientes": "si|no"|null, "obs": string|null }
}
```

### 3.5 `variables_json`
```jsonc
{
  "prueba_emergencia": {                // clave = criterio → si|no
    "alarma_sonora": "si|no", "alarma_visual": "...", "desarme_cortina": "...",
    "ventilacion_forzada": "...", "backup": "...", "temperatura_alta": "...", "presion_alta": "..."
  },
  "obs_prueba_emergencia": string|null,
  "termostatos": { "instalados": number|null, "operativos": number|null },
  "obs_termostatos": string|null,
  "med_ambientales": {                  // clave = criterio → { valor, estado }
    "presSellamiento": { "valor": number|null, "estado": "b|r|m|n" },
    "presVentMinima": { ... }, "velAire": { ... }, "intensidadLuz": { ... }
  },
  "obs_med_ambientales": string|null
}
```

### 3.6 `ventilacion_json`
```jsonc
{
  "extractores": { "marca": string|null, "cantidad": number|null, "estado": "b|r|m" },
  "panel_humedo": { "estado_general": "b|r|m", "moja_uniforme": "si|no|na", "estado_bomba": "b|m" },
  "inlets": { "velocidad": number|null, "cantidad": number|null, "estado": "b|r|m" },
  "tunel": { "n_puertas": number|null, "longitud": number|null, "estado": "b|r|m" },
  "nebulizacion": { "estado": "b|m" },
  "ventiladores": { "estado": "b|m" },
  "observaciones": string|null
}
```

### 3.7 `mecanicos_json`
```jsonc
{
  "comedero": { "longitud": number|null, "n_lineas": number|null, "estado": "b|r|m" },
  "bebedero": { "longitud": number|null, "n_lineas": number|null,
                "estado_panel_hidraulico": "b|m", "estado_filtro": "b|m", "estado_dosatron": "b|m" },
  "alimentacion": { "n_silos": number|null, "n_lineas": number|null, "estado": "b|r|m" },
  "observaciones": string|null,
  "cierre": { "recibe_nombre": string|null, "realiza_nombre": string|null,
              "recibe_firma": string|null, "realiza_firma": string|null }
}
```

### 3.8 `evidencia_json`
```jsonc
{ "fotos": [ { "id": string, "url": string, "descripcion": string|null } ] }
```
> Hoy el frontend sube imágenes como **dataURL base64** en `url` (mock). Cuando exista
> un endpoint de subida de archivos, `url` debe pasar a ser la URL del archivo
> almacenado (S3/disco) y conviene un `POST /api/visits/{id}/fotos` (multipart) que
> devuelva `{ id, url }`. Ver §6.

### 3.9 `informe_json`
```jsonc
{ "objetivos": string|null, "alcance": string|null, "actividades": string|null,
  "resultados": string|null, "conclusiones": string|null, "recomendaciones": string|null }
```
> La narrativa se **auto-genera** en el frontend a partir de los conteos de criterios,
> pero es **editable** por el usuario; se envía el texto final.

## 4. Enums

| Enum | Valores | Uso |
|---|---|---|
| `type` | `diagnostico_tecnico` (extensible) | Tipo de visita. |
| `status` | `draft`, `completed` | Estado de la visita. |
| Estado de criterio | `b` (bueno), `r` (regular), `m` (malo), `n` (no aplica) | Sensores, estado físico, tablero, etc. Algunos criterios sólo usan un subconjunto: `b/r/m`, `b/m` o `b/r/m/n`. |
| Toggle SÍ/NO | `si`, `no` | Prueba de emergencia, puntos calientes. |
| Toggle SÍ/NO/N-A | `si`, `no`, `na` | Moja uniforme (panel húmedo). |

## 5. Validaciones

- **Obligatorios**: `type`, `client_id`, `farm_id`, `galpon_id`, `fecha`. El resto es opcional.
- Coherencia: en `sensores`, `detectados ≤ instalados` (el frontend ya lo restringe;
  validar también en backend). La **cobertura** (`detectados/instalados`) es **derivada**,
  no se envía ni se almacena.
- Números no negativos donde aplica (cantidades, nº de aves, longitudes, voltajes).
- `galpon_id` debe pertenecer a `farm_id`, y `farm_id` a `client_id`.

## 6. Evidencia fotográfica (nota de implementación)

Para evitar payloads enormes con base64, se recomienda separar la subida de imágenes:
`POST /api/visits/{id}/fotos` (multipart) → `{ id, url }`, y que `evidencia_json.fotos`
guarde `{ id, url, descripcion }`. Mientras eso no exista, el frontend envía dataURLs.

## 7. Ejemplo de payload (`POST /api/visits`)

Basado en los datos de ejemplo del asistente (cliente/granja/galpón provienen de los
recursos reales; los ids son ilustrativos).

```jsonc
{
  "type": "diagnostico_tecnico",
  "status": "completed",
  "client_id": 1, "farm_id": 1, "galpon_id": 3,
  "fecha": "2026-07-11", "num_aves": 32000, "dia_lote": 18,
  "cliente_nombre": "Avícola El Roble S.A.S",
  "granja_nombre": "Granja La Esperanza",
  "galpon_numero": "Galpón 3",
  "ubicacion": "Vereda San Isidro, Pereira, Risaralda",
  "total_galpones": 6,
  "contacto": { "adm_nombre": "Luis Rodriguez", "adm_cel": "300 512 8890",
                "vet_nombre": "Dra. Laura Restrepo", "vet_cel": "311 470 2231",
                "correo": "contacto@elroble.com" },
  "control": {
    "marca": "Rotem", "modelo": "Pro Touch 10", "serial": "RT-88213-A", "version": "v4.2.1",
    "volt_ac": 118.4, "volt_dc": 12.1,
    "sensores": {
      "temp": { "instalados": 8, "detectados": 8, "estado": "b" },
      "pres": { "instalados": 2, "detectados": 2, "estado": "b" },
      "hum":  { "instalados": 4, "detectados": 3, "estado": "r" },
      "co2":  { "instalados": 2, "detectados": 1, "estado": "m" },
      "amm":  { "instalados": 2, "detectados": 2, "estado": "b" }
    },
    "lecturas": { "temp": 24.6, "hum": 61, "pres": 0.08, "co2": 1850, "amm": 12 },
    "estado_fisico": { "pantalla": "b", "teclado": "r", "gabinete": "b",
                       "cableado": "r", "fuente": "b" },
    "observaciones": "Sensor de CO2 con detección intermitente, se recomienda reemplazo."
  },
  "tablero": {
    "fisico": { "limpieza": "b", "humedad": "b", "corrosion": "r", "orden": "b" },
    "obs_fisico": "Ligera oxidación en prensaestopas inferior.",
    "otros_equipos": { "dimmer": "b", "rdt5": "b", "rswrsu": "r", "backup": "b" },
    "obs_otros_equipos": "RSW/RSU con respuesta lenta al reconectar.",
    "mediciones": { "l1l2": 219.4, "l2l3": 220.1, "l1l3": 218.7,
                    "l1n": 126.8, "l2n": 127.2, "l3n": 125.9 },
    "termografia": { "temp_max": 38.5, "puntos_calientes": "no",
                     "obs": "Sin puntos calientes relevantes." }
  },
  "variables": {
    "prueba_emergencia": { "alarma_sonora": "si", "alarma_visual": "si", "desarme_cortina": "si",
      "ventilacion_forzada": "si", "backup": "si", "temperatura_alta": "no", "presion_alta": "no" },
    "obs_prueba_emergencia": "Alarmas de temp. y presión alta no dispararon.",
    "termostatos": { "instalados": 4, "operativos": 4 },
    "obs_termostatos": "Todos responden correctamente.",
    "med_ambientales": {
      "presSellamiento": { "valor": 0.12, "estado": "b" },
      "presVentMinima": { "valor": 0.05, "estado": "b" },
      "velAire": { "valor": 1.8, "estado": "r" },
      "intensidadLuz": { "valor": 8, "estado": "b" }
    },
    "obs_med_ambientales": "Velocidad de aire ligeramente por debajo del óptimo."
  },
  "ventilacion": {
    "extractores": { "marca": "Munters", "cantidad": 8, "estado": "b" },
    "panel_humedo": { "estado_general": "r", "moja_uniforme": "si", "estado_bomba": "b" },
    "inlets": { "velocidad": 2.4, "cantidad": 24, "estado": "b" },
    "tunel": { "n_puertas": 4, "longitud": 110, "estado": "b" },
    "nebulizacion": { "estado": "b" },
    "ventiladores": { "estado": "b" },
    "observaciones": "Panel húmedo con leve canalización de agua en el tercio final."
  },
  "mecanicos": {
    "comedero": { "longitud": 120, "n_lineas": 4, "estado": "b" },
    "bebedero": { "longitud": 120, "n_lineas": 4,
                  "estado_panel_hidraulico": "b", "estado_filtro": "m", "estado_dosatron": "b" },
    "alimentacion": { "n_silos": 2, "n_lineas": 4, "estado": "b" },
    "observaciones": "Filtro del bebedero con sedimento acumulado.",
    "cierre": { "recibe_nombre": "Pedro Perez", "realiza_nombre": "Briam Becerra",
                "recibe_firma": null, "realiza_firma": null }
  },
  "evidencia": { "fotos": [] },
  "informe": {
    "objetivos": "Evaluar el estado operativo de los sistemas...",
    "alcance": "La presente visita técnica cubrió...",
    "actividades": "Durante la visita se revisaron los sensores...",
    "resultados": "De los N criterios evaluados...",
    "conclusiones": "El galpón presenta condiciones...",
    "recomendaciones": "Se recomienda dar seguimiento prioritario..."
  }
}
```

## 8. Ejemplo de respuesta (`GET /api/visits/{id}`)

```jsonc
{
  "data": {
    "id": 101,
    /* ...todos los campos del payload anterior... */,
    "created_at": "2026-07-11T14:03:00Z",
    "updated_at": "2026-07-11T14:03:00Z"
  }
}
```

> Para el **listado** (`GET /api/visits`) basta devolver, además de los ids/estado, los
> snapshots `cliente_nombre`, `granja_nombre`, `galpon_numero`, `fecha`, `type` y `status`
> (es lo que muestra la tabla); las columnas `*_json` pueden omitirse en el listado por
> rendimiento si se desea.
