import { CatalogManager } from '../features/catalog/CatalogManager'

export function StaffPage() {
  return (
    <CatalogManager
      role="staff"
      title="Khu vực nhân viên"
      description="Theo dõi danh mục hệ thống và cập nhật thuốc, bảo hiểm theo quyền của nhân viên."
    />
  )
}
