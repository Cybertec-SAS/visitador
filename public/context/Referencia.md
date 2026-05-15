# Frontend Changes — Client Data Module

## Scope

El modulo deja de trabajar con visitas. El flujo activo queda asi:

- 1 cliente -> muchas granjas
- 1 granja -> muchos galpones
- 1 galpon -> muchos sistemas

Los endpoints de visitas, tipos de visita, formularios de visita, media de visita, mediciones de visita, hallazgos, compromisos y solicitudes de materiales dejan de usarse desde frontend.

## Business Rules

- Todo texto libre enviado desde frontend debe ir en mayusculas antes de hacer submit.
- Backend vuelve a normalizar esos campos antes de guardar.
- `farm_voltage` ahora acepta `110V`, `220V` y `440V`.
- `neighboring_properties_notes` y `distance_to_neighbor_boundary_m` salen del flujo y no deben enviarse.
- `map_url_reference` se mantiene sin transformaciones para no romper enlaces de geolocalizacion.
- `total_galpones` queda sincronizado por backend con la cantidad real de galpones asociados a la granja.
- `structure_type` solo acepta `GALPON` y `SYSTEM`.
- Un `SYSTEM` siempre debe tener `parent_structure_id` apuntando a un `GALPON` de la misma granja.
- Un `GALPON` no puede tener padre.
- Si frontend envia `dimensions_json.largo` y `dimensions_json.ancho`, backend calcula `dimensions_json.area_total` cuando no venga informado.

## Frontend Responsibilities

- Convertir a mayusculas los valores de inputs tipo texto antes de armar el payload.
- No modificar automaticamente campos `email`, `url`, `map_url_reference` ni selects cerrados.
- Modelar el bloque de medidas del galpon dentro de `dimensions_json`.
- Consumir `systems` como la coleccion hija oficial de cada galpon.

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
    "galpones": [],
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
    "total_galpones": 2,
    "galpones": [
      {
        "id": 101,
        "farm_id": 10,
        "parent_structure_id": null,
        "structure_type": "GALPON",
        "name": "GALPON NORTE",
        "dimensions_json": {
          "largo": 120,
          "ancho": 15,
          "alto": 4.5,
          "area_total": 1800
        },
        "technical_attributes_json": {
          "tipo_estructura": "METALICA"
        },
        "systems": [
          {
            "id": 201,
            "farm_id": 10,
            "parent_structure_id": 101,
            "structure_type": "SYSTEM",
            "name": "VENTILACION TUNEL"
          }
        ]
      }
    ]
  }
}
```

### POST `/api/structures`

Uso para crear galpones y sistemas.

#### Crear galpon

```json
{
  "farm_id": 10,
  "structure_type": "GALPON",
  "name": "GALPON NORTE",
  "code": "G-01",
  "status": "active",
  "description": "GALPON PRINCIPAL",
  "dimensions_json": {
    "largo": 120,
    "ancho": 15,
    "alto": 4.5
  },
  "technical_attributes_json": {
    "tipo_estructura": "METALICA",
    "tipo_cubierta": "TERMOACUSTICA"
  },
  "observations": "REQUIERE CORTINAS NUEVAS",
  "sort_order": 1
}
```

Reglas:

- `parent_structure_id` no se envia para galpon.
- `dimensions_json` representa el bloque "Medidas del galpon".
- Si no mandas `area_total`, backend la calcula con `largo * ancho`.

#### Crear sistema

```json
{
  "farm_id": 10,
  "parent_structure_id": 101,
  "structure_type": "SYSTEM",
  "name": "VENTILACION TUNEL",
  "code": "SYS-VE-01",
  "status": "active",
  "description": "VENTILACION LONGITUDINAL",
  "technical_attributes_json": {
    "marca": "ACME"
  },
  "sort_order": 1
}
```

Reglas:

- `parent_structure_id` es obligatorio.
- El padre debe ser un `GALPON`.
- `farm_id` del sistema debe coincidir con la granja del galpon padre.

Respuesta esperada para `POST /api/structures`:

```json
{
  "id": 101,
  "farm_id": 10,
  "parent_structure_id": null,
  "structure_type": "GALPON",
  "name": "GALPON NORTE",
  "code": "G-01",
  "status": "active",
  "description": "GALPON PRINCIPAL",
  "dimensions_json": {
    "largo": 120,
    "ancho": 15,
    "alto": 4.5,
    "area_total": 1800
  },
  "technical_attributes_json": {
    "tipo_estructura": "METALICA"
  },
  "observations": "REQUIERE CORTINAS NUEVAS",
  "sort_order": 1,
  "parent": null,
  "systems": [],
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

### GET `/api/structures`

Query params vigentes:

- `farm_id`
- `structure_type` con valores `GALPON` o `SYSTEM`
- `status`
- `parent_only=true` para listar solo galpones raiz

Respuesta:

- Array JSON plano, sin paginacion.
- Cada galpon usa `systems` como coleccion hija.

## Frontend Migration Checklist

1. Eliminar pantallas, stores y llamados HTTP relacionados con visitas.
2. Sacar del formulario de granja el bloque de propiedades vecinas.
3. Agregar `440V` al selector de voltaje.
4. Renderizar `dimensions_json` como bloque de medidas del galpon.
5. Mostrar `systems` dentro de cada galpon y no como listado plano.
6. Convertir a mayusculas los text inputs antes de enviar la peticion.