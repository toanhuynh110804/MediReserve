import { CatalogManager } from '../features/catalog/CatalogManager'

export function AdminPage() {
  return (
    <CatalogManager
      role="admin"
      title="Khu vực quản trị"
      description="Quản lý các danh mục hệ thống: bệnh viện, khoa, chuyên khoa, thuốc và bảo hiểm."
    />
  )
}
