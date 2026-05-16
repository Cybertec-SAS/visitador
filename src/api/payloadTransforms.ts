const NON_UPPERCASE_FIELDS = new Set([
  'email',
  'map_url_reference',
  'farm_voltage',
  'farm_electric_current',
  'type',
  'status',
  'password',
]);

function shouldUppercase(fieldName?: string): boolean {
  if (!fieldName) return true;
  if (NON_UPPERCASE_FIELDS.has(fieldName)) return false;
  if (fieldName.endsWith('_id')) return false;
  if (fieldName.includes('url')) return false;
  return true;
}

function normalizeValue(value: unknown, fieldName?: string): unknown {
  if (typeof value === 'string') {
    return shouldUppercase(fieldName) ? value.toUpperCase() : value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, normalizeValue(nestedValue, key)]),
    );
  }

  return value;
}

export function normalizePayload<T>(payload: T): T {
  return normalizeValue(payload) as T;
}