import { CATALOG_CONFIG } from './catalogConfig'

export function canManageCatalog(role, catalogKey) {
  return CATALOG_CONFIG[catalogKey].createRoles.includes(role)
}

export function canDeleteCatalogItem(role, catalogKey) {
  return CATALOG_CONFIG[catalogKey].deleteRoles.includes(role)
}

export function getEmptyFormState(catalogKey) {
  return CATALOG_CONFIG[catalogKey].fields.reduce((state, field) => {
    state[field.key] = ''
    return state
  }, {})
}

function getNestedValue(source, path) {
  return path.split('.').reduce((current, part) => current?.[part], source)
}

export function getFormStateFromItem(catalogKey, item) {
  const state = getEmptyFormState(catalogKey)

  for (const field of CATALOG_CONFIG[catalogKey].fields) {
    const rawValue = getNestedValue(item, field.key)

    if (field.type === 'select') {
      state[field.key] = rawValue?._id || rawValue || ''
      continue
    }

    if (field.type === 'date') {
      state[field.key] = rawValue ? String(rawValue).slice(0, 10) : ''
      continue
    }

    state[field.key] = rawValue ?? ''
  }

  return state
}

function assignNestedValue(target, path, value) {
  const parts = path.split('.')
  let current = target

  parts.forEach((part, index) => {
    const isLast = index === parts.length - 1

    if (isLast) {
      current[part] = value
      return
    }

    if (!current[part]) {
      current[part] = {}
    }

    current = current[part]
  })
}

function removeEmptyValues(value) {
  if (Array.isArray(value)) {
    return value.map(removeEmptyValues).filter((entry) => entry !== undefined)
  }

  if (value && typeof value === 'object') {
    const cleaned = Object.entries(value).reduce((result, [key, entry]) => {
      const cleanedEntry = removeEmptyValues(entry)
      if (cleanedEntry !== undefined) {
        result[key] = cleanedEntry
      }
      return result
    }, {})

    return Object.keys(cleaned).length > 0 ? cleaned : undefined
  }

  if (value === '' || value === null) {
    return undefined
  }

  return value
}

export function buildCatalogPayload(catalogKey, formState) {
  const payload = {}

  CATALOG_CONFIG[catalogKey].fields.forEach((field) => {
    const rawValue = formState[field.key]

    if (field.type === 'number') {
      assignNestedValue(payload, field.key, rawValue === '' ? undefined : Number(rawValue))
      return
    }

    assignNestedValue(payload, field.key, rawValue)
  })

  return removeEmptyValues(payload) || {}
}

export function getFieldOptions(field, datasets) {
  if (field.optionsKey === 'hospitals') {
    return (datasets.hospitals || []).map((hospital) => ({
      value: hospital._id,
      label: hospital.name,
    }))
  }

  if (field.optionsKey === 'patients') {
    return (datasets.patients || []).map((patient) => ({
      value: patient._id,
      label: patient.user?.name || patient._id,
    }))
  }

  return []
}

export function getCatalogDatasetKey(catalogKey) {
  return `${catalogKey}s`
}
