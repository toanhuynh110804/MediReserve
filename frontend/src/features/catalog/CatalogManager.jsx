import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createDepartmentApi,
  createHospitalApi,
  createInsuranceApi,
  createMedicineApi,
  createSpecialtyApi,
  deleteDepartmentApi,
  deleteHospitalApi,
  deleteInsuranceApi,
  deleteMedicineApi,
  deleteSpecialtyApi,
  getDepartmentsApi,
  getHospitalsApi,
  getInsurancesApi,
  getSpecialtiesApi,
  updateDepartmentApi,
  updateHospitalApi,
  updateInsuranceApi,
  updateMedicineApi,
  updateSpecialtyApi,
} from '../../shared/api/catalogApi'
import { getMedicinesApi } from '../../shared/api/medicineApi'
import { getPatientsApi } from '../../shared/api/patientApi'
import { CATALOG_CONFIG, CATALOG_ORDER } from './catalogConfig'
import {
  buildCatalogPayload,
  canDeleteCatalogItem,
  canManageCatalog,
  getCatalogDatasetKey,
  getEmptyFormState,
  getFieldOptions,
  getFormStateFromItem,
} from './catalogHelpers'

const LOADERS = {
  hospitals: getHospitalsApi,
  departments: getDepartmentsApi,
  specialties: getSpecialtiesApi,
  medicines: getMedicinesApi,
  insurances: getInsurancesApi,
  patients: getPatientsApi,
}

const MUTATIONS = {
  hospital: { create: createHospitalApi, update: updateHospitalApi, delete: deleteHospitalApi },
  department: { create: createDepartmentApi, update: updateDepartmentApi, delete: deleteDepartmentApi },
  specialty: { create: createSpecialtyApi, update: updateSpecialtyApi, delete: deleteSpecialtyApi },
  medicine: { create: createMedicineApi, update: updateMedicineApi, delete: deleteMedicineApi },
  insurance: { create: createInsuranceApi, update: updateInsuranceApi, delete: deleteInsuranceApi },
}

export function CatalogManager({ role, title, description, catalogKeys = CATALOG_ORDER }) {
  const availableCatalogKeys = catalogKeys.length > 0 ? catalogKeys : CATALOG_ORDER
  const [activeTab, setActiveTab] = useState(() => availableCatalogKeys[0])
  const [catalogData, setCatalogData] = useState({
    hospitals: [],
    departments: [],
    specialties: [],
    medicines: [],
    insurances: [],
    patients: [],
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  const [formState, setFormState] = useState(() => getEmptyFormState(availableCatalogKeys[0]))

  const currentConfig = CATALOG_CONFIG[activeTab]
  const currentDatasetKey = getCatalogDatasetKey(activeTab)
  const currentItems = catalogData[currentDatasetKey] || []
  const canManage = canManageCatalog(role, activeTab)
  const canDelete = canDeleteCatalogItem(role, activeTab)

  useEffect(() => {
    if (!availableCatalogKeys.includes(activeTab)) {
      const fallbackTab = availableCatalogKeys[0]
      setActiveTab(fallbackTab)
      setEditingItem(null)
      setFormState(getEmptyFormState(fallbackTab))
      setError('')
      setMessage('')
    }
  }, [activeTab, availableCatalogKeys])

  const loadCatalogs = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [hospitals, departments, specialties, medicines, insurances, patients] = await Promise.all([
        LOADERS.hospitals(),
        LOADERS.departments(),
        LOADERS.specialties(),
        LOADERS.medicines(),
        LOADERS.insurances(),
        LOADERS.patients(),
      ])

      setCatalogData({ hospitals, departments, specialties, medicines, insurances, patients })
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu danh mục.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCatalogs()
  }, [loadCatalogs])

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey)
    setEditingItem(null)
    setFormState(getEmptyFormState(tabKey))
    setError('')
    setMessage('')
  }

  const handleFieldChange = (fieldKey, value) => {
    setFormState((current) => ({
      ...current,
      [fieldKey]: value,
    }))
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormState(getFormStateFromItem(activeTab, item))
    setError('')
    setMessage('')
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
    setFormState(getEmptyFormState(activeTab))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canManage) {
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const payload = buildCatalogPayload(activeTab, formState)

      if (editingItem?._id) {
        await MUTATIONS[activeTab].update(editingItem._id, payload)
        setMessage(`Đã cập nhật ${currentConfig.label.toLowerCase()}.`)
      } else {
        await MUTATIONS[activeTab].create(payload)
        setMessage(`Đã tạo ${currentConfig.label.toLowerCase()} mới.`)
      }

      setEditingItem(null)
      setFormState(getEmptyFormState(activeTab))
      await loadCatalogs()
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu danh mục.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (itemId) => {
    if (!canDelete) {
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      await MUTATIONS[activeTab].delete(itemId)
      setMessage(`Đã xóa ${currentConfig.label.toLowerCase()}.`)
      if (editingItem?._id === itemId) {
        setEditingItem(null)
        setFormState(getEmptyFormState(activeTab))
      }
      await loadCatalogs()
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa danh mục.')
    } finally {
      setSaving(false)
    }
  }

  const fieldOptions = useMemo(() => {
    return currentConfig.fields.reduce((result, field) => {
      if (field.type === 'select') {
        result[field.key] = getFieldOptions(field, catalogData)
      }
      return result
    }, {})
  }, [catalogData, currentConfig.fields])

  return (
    <section>
      <h1>{title}</h1>
      <p>{description}</p>

      {error && <p className="form-error">{error}</p>}
      {message && <p className="muted">{message}</p>}

      <div className="actions" style={{ flexWrap: 'wrap', marginBottom: '1rem' }}>
        {availableCatalogKeys.map((tabKey) => (
          <button
            key={tabKey}
            type="button"
            onClick={() => handleTabChange(tabKey)}
            disabled={loading || saving}
            style={activeTab === tabKey ? { backgroundColor: '#0f766e', color: '#fff' } : undefined}
          >
            {CATALOG_CONFIG[tabKey].label}
          </button>
        ))}
        <button type="button" onClick={loadCatalogs} disabled={loading || saving}>
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      <div className="panel">
        <h2>{currentConfig.label}</h2>
        <p className="muted">
          {canManage
            ? `Bạn có thể tạo và cập nhật ${currentConfig.label.toLowerCase()} trong khu vực này.`
            : `Vai trò hiện tại chỉ có quyền xem ${currentConfig.label.toLowerCase()}.`}
        </p>

        {currentItems.length === 0 ? (
          <p className="muted">Chưa có dữ liệu trong danh mục này.</p>
        ) : (
          <table className="appointments-table">
            <thead>
              <tr>
                {currentConfig.columns.map((column) => (
                  <th key={column.label}>{column.label}</th>
                ))}
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => (
                <tr key={item._id}>
                  {currentConfig.columns.map((column) => (
                    <td key={column.label}>{column.render(item)}</td>
                  ))}
                  <td>
                    <div className="actions" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                      <button type="button" onClick={() => handleEdit(item)} disabled={saving || !canManage}>
                        Chỉnh sửa
                      </button>
                      <button type="button" onClick={() => handleDelete(item._id)} disabled={saving || !canDelete}>
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <form className="panel" onSubmit={handleSubmit}>
        <h2>{editingItem ? `Cập nhật ${currentConfig.label.toLowerCase()}` : `Tạo ${currentConfig.label.toLowerCase()} mới`}</h2>

        {currentConfig.fields.map((field) => {
          const value = formState[field.key] ?? ''

          if (field.type === 'textarea') {
            return (
              <div key={field.key}>
                <label htmlFor={field.key}>{field.label}</label>
                <textarea
                  id={field.key}
                  rows="3"
                  value={value}
                  onChange={(event) => handleFieldChange(field.key, event.target.value)}
                  disabled={saving || !canManage}
                  required={field.required}
                />
              </div>
            )
          }

          if (field.type === 'select') {
            return (
              <div key={field.key}>
                <label htmlFor={field.key}>{field.label}</label>
                <select
                  id={field.key}
                  value={value}
                  onChange={(event) => handleFieldChange(field.key, event.target.value)}
                  disabled={saving || !canManage}
                  required={field.required}
                >
                  <option value="">Chọn {field.label.toLowerCase()}</option>
                  {fieldOptions[field.key]?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )
          }

          return (
            <div key={field.key}>
              <label htmlFor={field.key}>{field.label}</label>
              <input
                id={field.key}
                type={field.type}
                value={value}
                onChange={(event) => handleFieldChange(field.key, event.target.value)}
                disabled={saving || !canManage}
                required={field.required}
              />
            </div>
          )
        })}

        <div className="actions">
          <button type="submit" disabled={saving || !canManage}>
            {saving ? 'Đang lưu...' : editingItem ? 'Lưu cập nhật' : 'Tạo mới'}
          </button>
          <button type="button" onClick={handleCancelEdit} disabled={saving}>
            Bỏ chọn
          </button>
        </div>
      </form>
    </section>
  )
}
