
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

export function buildAdminUserPayload(formState) {
  return {
    name: formState.name.trim(),
    email: formState.email.trim().toLowerCase(),
    password: formState.password,
    role: formState.role,
    phone: formState.phone.trim(),
  }
}

export function getInitialAdminUserForm() {
  return {
    name: '',
    email: '',
    password: '',
    role: 'staff',
    phone: '',
  }
}

export function buildStaffPayload(formState) {
  return {
    user: formState.user,
    department: formState.department,
    title: formState.title.trim(),
    role: formState.role,
    status: formState.status,
  }
}

export function getInitialStaffForm(staff) {
  if (!staff) {
    return {
      user: '',
      department: '',
      title: '',
      role: 'staff',
      status: 'active',
    }
  }

  return {
    user: staff.user?._id || staff.user || '',
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
