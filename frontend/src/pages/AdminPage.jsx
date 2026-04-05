import { useState } from 'react'
import { CatalogManager } from '../features/catalog/CatalogManager'
import { AdminOperationsPanel } from '../features/admin/AdminOperationsPanel'
import { UserManagementPanel } from '../features/admin/UserManagementPanel'
import { CATALOG_SCOPE_GROUPS } from '../features/catalog/catalogConfig'

export function AdminPage() {
  const [activeSection, setActiveSection] = useState('structure')

  return (
    <section>
      <h1>Khu vực quản trị</h1>
      <p>Admin quản trị khoa, chuyên khoa, bác sĩ, phòng, lịch làm việc và nhân sự của Bệnh viện Đa Khoa Thủ Đức.</p>

      <div className="actions" style={{ flexWrap: 'wrap', marginBottom: '1rem' }}>
        <button
          type="button"
          onClick={() => setActiveSection('structure')}
          style={activeSection === 'structure' ? { backgroundColor: '#0f766e', color: '#fff' } : undefined}
        >
          Cấu trúc hệ thống
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('operations')}
          style={activeSection === 'operations' ? { backgroundColor: '#0f766e', color: '#fff' } : undefined}
        >
          Quản lý vận hành
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('access')}
          style={activeSection === 'access' ? { backgroundColor: '#0f766e', color: '#fff' } : undefined}
        >
          Nhân sự và phân quyền
        </button>
      </div>

      {activeSection === 'structure' ? (
        <CatalogManager
          role="admin"
          catalogKeys={CATALOG_SCOPE_GROUPS.admin}
          title="Cấu trúc hệ thống"
          description="Quản lý bệnh viện, khoa và chuyên khoa của toàn hệ thống."
        />
      ) : null}

      {activeSection === 'operations' ? <AdminOperationsPanel /> : null}
      {activeSection === 'access' ? <UserManagementPanel /> : null}
    </section>
  )
}
