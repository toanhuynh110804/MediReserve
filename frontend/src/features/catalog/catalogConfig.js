export const CATALOG_ORDER = ['department', 'specialty', 'medicine', 'insurance']

export const CATALOG_SCOPE_GROUPS = {
  admin: ['department', 'specialty'],
  staff: ['medicine', 'insurance'],
}

export const CATALOG_CONFIG = {
  department: {
    label: 'Khoa',
    createRoles: ['admin'],
    deleteRoles: ['admin'],
    fields: [
      { key: 'name', label: 'Tên khoa', type: 'text', required: true },
      { key: 'description', label: 'Mô tả', type: 'textarea' },
    ],
    columns: [
      { label: 'Tên', render: (item) => item.name || 'N/A' },
      { label: 'Mô tả', render: (item) => item.description || 'N/A' },
    ],
  },
  specialty: {
    label: 'Chuyên khoa',
    createRoles: ['admin'],
    deleteRoles: ['admin'],
    fields: [
      { key: 'name', label: 'Tên chuyên khoa', type: 'text', required: true },
      { key: 'description', label: 'Mô tả', type: 'textarea' },
    ],
    columns: [
      { label: 'Tên', render: (item) => item.name || 'N/A' },
      { label: 'Mô tả', render: (item) => item.description || 'N/A' },
    ],
  },
  medicine: {
    label: 'Thuốc',
    createRoles: ['staff'],
    deleteRoles: ['admin'],
    fields: [
      { key: 'name', label: 'Tên thuốc', type: 'text', required: true },
      { key: 'description', label: 'Mô tả', type: 'textarea' },
      { key: 'unit', label: 'Đơn vị', type: 'text' },
      { key: 'price', label: 'Giá', type: 'number' },
      { key: 'stock', label: 'Tồn kho', type: 'number' },
    ],
    columns: [
      { label: 'Tên', render: (item) => item.name || 'N/A' },
      { label: 'Đơn vị', render: (item) => item.unit || 'N/A' },
      { label: 'Giá', render: (item) => (item.price ?? 0).toLocaleString('vi-VN') },
      { label: 'Tồn kho', render: (item) => item.stock ?? 0 },
    ],
  },
  insurance: {
    label: 'Bảo hiểm',
    createRoles: ['staff'],
    deleteRoles: ['admin'],
    fields: [
      { key: 'patient', label: 'Bệnh nhân', type: 'select', required: true, optionsKey: 'patients' },
      { key: 'type', label: 'Loại bảo hiểm', type: 'text' },
      { key: 'provider', label: 'Nhà cung cấp', type: 'text' },
      { key: 'policyNumber', label: 'Số hợp đồng', type: 'text' },
      { key: 'coveragePercent', label: 'Phần trăm chi trả', type: 'number' },
      { key: 'validFrom', label: 'Hiệu lực từ', type: 'date' },
      { key: 'validUntil', label: 'Hiệu lực đến', type: 'date' },
    ],
    columns: [
      { label: 'Bệnh nhân', render: (item) => item.patient?.user?.name || item.patient?._id || 'N/A' },
      { label: 'Nhà cung cấp', render: (item) => item.provider || 'N/A' },
      { label: 'Số hợp đồng', render: (item) => item.policyNumber || 'N/A' },
      { label: 'Chi trả', render: (item) => `${item.coveragePercent ?? 0}%` },
    ],
  },
}
