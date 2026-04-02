export function parsePermissions(value) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function formatPermissions(permissions) {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return ''
  }

  return permissions.join('\n')
}

export function buildRolePayload(formState) {
  return {
    name: formState.name.trim(),
    permissions: parsePermissions(formState.permissions),
  }
}

export function buildStaffPayload(formState) {
  return {
    user: formState.user,
    hospital: formState.hospital || undefined,
    department: formState.department || undefined,
    title: formState.title.trim(),
    role: formState.role,
    status: formState.status,
  }
}

export function getInitialStaffForm(staff) {
  if (!staff) {
    return {
      user: '',
      hospital: '',
      department: '',
      title: '',
      role: 'staff',
      status: 'active',
    }
  }

  return {
    user: staff.user?._id || staff.user || '',
    hospital: staff.hospital?._id || staff.hospital || '',
    department: staff.department?._id || staff.department || '',
    title: staff.title || '',
    role: staff.role || 'staff',
    status: staff.status || 'active',
  }
}

export function getInitialRoleForm(role) {
  if (!role) {
    return {
      name: '',
      permissions: '',
    }
  }

  return {
    name: role.name || '',
    permissions: formatPermissions(role.permissions),
  }
}
