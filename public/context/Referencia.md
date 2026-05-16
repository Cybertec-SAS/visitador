# Frontend Changes — Client Data Module

## Scope

El modulo deja de trabajar con visitas y con la estructura generica anterior. El flujo activo queda asi:

- 1 cliente -> muchas granjas -> muchos galpones -> muchos sistemas

Los endpoints de visitas, tipos de visita, formularios de visita, media de visita, mediciones de visita, hallazgos, compromisos, solicitudes de materiales y la ruta legacy `/api/structures` dejan de usarse desde frontend.

## Business Rules

- Todo texto libre enviado desde frontend debe ir en mayusculas antes de hacer submit.
- Backend vuelve a normalizar esos campos antes de guardar.
- `farm_voltage` ahora acepta `110V`, `220V` y `440V`.
- `neighboring_properties_notes` y `distance_to_neighbor_boundary_m` salen del flujo y no deben enviarse.
- `map_url_reference` se mantiene sin transformaciones para no romper enlaces de geolocalizacion.
- `total_galpones` se conserva en la granja y ahora se sincroniza cuando se crean o eliminan galpones desde sus endpoints dedicados.
- `projects.tipo` solo acepta `SOLUCION TOTAL`, `AMBIENTE CONTROLADO` o `AMBIENTE ABIERTO`.
- `projects.linea` solo acepta `AVICULTURA: LEVANTE Y PRODUCCION`, `AVICULTURA: ENGORDE DE POLLO`, `PORCICULTURA` o `BOVINO`.
- `systems-catalog` expone 20 sistemas activos actualizados y desactiva catalogos legacy fuera de esa lista.
- Las medidas del galpon viajan dentro de `dimensions_json`.
- Los sistemas instalados en un galpon se crean desde `systems_catalog` usando `system_id`.

## Frontend Responsibilities

- Convertir a mayusculas los valores de inputs tipo texto antes de armar el payload.
- No modificar automaticamente campos `email`, `url`, `map_url_reference` ni selects cerrados.
- Eliminar del frontend cualquier pantalla o store que dependa de `/api/structures`.
- Reemplazar cualquier pantalla vieja de estructuras por el flujo `/api/farms/{farm}/galpones` y `/api/galpones/{galpon}/systems`.

## Endpoints In Scope

### POST `/api/clients`

Body enviado:

```json
{
  "razon_social": "CLIENTES DEL NORTE SAS",
  "nit": "900123456",
  "email": "cliente@example.com",
  "phone_number": "3001234567"
}
```

Respuesta esperada:

```json
{
  "data": {
    "id": 1,
    "razon_social": "CLIENTES DEL NORTE SAS",
    "nit": "900123456",
    "email": "cliente@example.com",
    "phone_number": "3001234567",
    "farms": [],
    "created_at": "ISO8601",
    "updated_at": "ISO8601"
  }
}
```

### POST `/api/farms`

Body enviado:

```json
{
  "client_id": 1,
  "nombre": "GRANJA LA ESPERANZA",
  "transformator_capacity_kva": 150,
  "access_ways": "VIA DESTAPADA",
  "observations": "REQUIERE REVISION DE CARGA",
  "farm_voltage": "440V",
  "farm_electric_current": "triphase",
  "have_own_transformator": true,
  "is_transformator_feeds_other_installations": false,
  "transformator_are_feeding_installations": "CASA PRINCIPAL",
  "have_easy_access_for_trailer": true,
  "staff_availability": true,
  "has_storage_warehouse": true,
  "how_many_warehouses": 1,
  "total_galpones": 2,
  "galpones_a_cotizar": 2
}
```

Respuesta esperada:

```json
{
  "data": {
    "id": 10,
    "client_id": 1,
    "nombre": "GRANJA LA ESPERANZA",
    "transformator_capacity_kva": 150,
    "access_ways": "VIA DESTAPADA",
    "observations": "REQUIERE REVISION DE CARGA",
    "farm_voltage": "440V",
    "farm_electric_current": "triphase",
    "have_own_transformator": true,
    "is_transformator_feeds_other_installations": false,
    "transformator_are_feeding_installations": "CASA PRINCIPAL",
    "have_easy_access_for_trailer": true,
    "staff_availability": true,
    "has_storage_warehouse": true,
    "how_many_warehouses": 1,
    "total_galpones": 2,
    "galpones_a_cotizar": 2,
    "client": { "id": 1 },
    "georreference": null,
    "contacts": [],
    "created_at": "ISO8601",
    "updated_at": "ISO8601"
  }
}
```

Campos removidos del body de granja:

- `distance_to_neighbor_boundary_m`
- `neighboring_properties_notes`

### POST `/api/farm-georreferences`

Body enviado:

```json
{
  "farm_id": 10,
  "address": "KM 5 VIA SONSON",
  "town": "SONSON",
  "department": "ANTIOQUIA",
  "map_url_reference": "https://maps.example.com/farm/10"
}
```

Regla: `map_url_reference` se conserva tal como se escribe.

### POST `/api/farm-contacts`

Body enviado:

```json
{
  "farm_id": 10,
  "type": "administrador",
  "name": "JUAN PEREZ",
  "email": "contacto@example.com",
  "phone": "3001234567"
}
```

Regla: `type` sigue siendo un valor controlado, no un texto libre.

### GET `/api/farms/{id}`

Respuesta esperada:

```json
{
  "data": {
    "id": 10,
    "client_id": 1,
    "nombre": "GRANJA LA ESPERANZA",
    "total_galpones": 1,
    "galpones_a_cotizar": 2,
    "client": { "id": 1 },
    "georreference": {
      "id": 7,
      "farm_id": 10,
      "address": "KM 5 VIA SONSON"
    },
    "contacts": [],
    "galpones": [
      {
        "id": 21,
        "farm_id": 10,
        "name": "GALPON 1",
        "code": "GAL-01",
        "status": "active",
        "dimensions_json": {
          "largo_m": 110,
          "ancho_m": 13,
          "altura_canal_m": 3,
          "altura_cumbrera_m": 4.5
        },
        "technical_attributes_json": {
          "tipo_estructura": "CONVENCIONAL",
          "tipo_cubierta": "DOS AGUAS"
        },
        "systems": [
          {
            "id": 5,
            "system_id": 8,
            "quantity": 10,
            "notes": "AJUSTE FINAL",
            "system": {
              "id": 8,
              "code": "ventiladores",
              "name": "Ventiladores"
            }
          }
        ]
      }
    ]
  }
}
```

### POST `/api/farms/{farm}/galpones`

Body enviado:

```json
{
  "name": "GALPON 1",
  "code": "GAL-01",
  "status": "active",
  "dimensions_json": {
    "largo_m": 100,
    "ancho_m": 12,
    "altura_canal_m": 2.8,
    "altura_cumbrera_m": 4.2
  },
  "technical_attributes_json": {
    "tipo_estructura": "CONVENCIONAL",
    "tipo_cubierta": "DOS AGUAS"
  },
  "observations": "REQUIERE AISLAMIENTO"
}
```

Uso: crea un galpon asociado a una granja. El backend responde en formato `data`.

### PATCH `/api/galpones/{galpon}`

Body enviado:

```json
{
  "dimensions_json": {
    "largo_m": 110,
    "ancho_m": 13,
    "altura_canal_m": 3,
    "altura_cumbrera_m": 4.5
  },
  "observations": "LISTO PARA MONTAJE"
}
```

Uso: actualiza medidas y observaciones del galpon.

### POST `/api/galpones/{galpon}/systems`

Body enviado:

```json
{
  "system_id": 8,
  "quantity": 10,
  "notes": "AJUSTE FINAL",
  "technical_attributes_json": {
    "capacidad": "36 PULGADAS"
  }
}
```

Uso: agrega un sistema del catalogo activo a un galpon concreto.

### POST `/api/projects`

Body enviado:

```json
{
  "client_id": 1,
  "farm_id": 10,
  "name": "PROYECTO ALPHA",
  "code": "PR-001",
  "tipo": "AMBIENTE CONTROLADO",
  "linea": "AVICULTURA: ENGORDE DE POLLO",
  "status": "active",
  "description": "IMPLEMENTACION INTEGRAL"
}
```

Opciones permitidas:

- `tipo`: `SOLUCION TOTAL`, `AMBIENTE CONTROLADO`, `AMBIENTE ABIERTO`
- `linea`: `AVICULTURA: LEVANTE Y PRODUCCION`, `AVICULTURA: ENGORDE DE POLLO`, `PORCICULTURA`, `BOVINO`

### GET `/api/systems-catalog`

El catalogo activo esperado ahora contiene 20 sistemas:

- `Comedero Automatico`
- `Bebedero Niple`
- `Falso Techo`
- `Cortina Lateral`
- `Calefaccion`
- `Silos`
- `Alimentacion`
- `Ventiladores`
- `Nebulizadores`
- `Iluminacion`
- `Extractores`
- `Panel Humedo`
- `Inlet`
- `Tunel Door`
- `Red Electrica`
- `Tablero de Control y Potencia`
- `Controlador`
- `Sistema Pesaje`
- `Sistema Comunicacion`
- `Aislamiento`

## Endpoints Pausados

- `/api/structures`
- `/api/projects/{project}/structures`
- Todos los endpoints de visitas y sus derivados

Regla: si el frontend todavia tiene pantallas o stores para estructuras legacy, deben ocultarse o migrarse al nuevo flujo de galpones porque el backend ya no expone esas rutas.

## Frontend Migration Checklist

1. Eliminar pantallas, stores y llamados HTTP relacionados con visitas.
2. Eliminar pantallas, stores y llamados HTTP relacionados con estructuras.
3. Sacar del formulario de granja el bloque de propiedades vecinas.
4. Agregar `440V` al selector de voltaje.
5. Crear la gestion de galpones con `POST /api/farms/{farm}/galpones` y `PATCH /api/galpones/{galpon}`.
6. Crear la gestion de sistemas por galpon con `POST /api/galpones/{galpon}/systems` y `PATCH /api/galpon-systems/{id}`.
7. Convertir a mayusculas los text inputs antes de enviar la peticion.