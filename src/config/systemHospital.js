const Hospital = require('../models/Hospital');
const Department = require('../models/Department');

let _systemHospitalId = null;

const DEFAULT_DEPARTMENTS = [
  { name: 'Khoa Cấp cứu', description: 'Tiếp nhận và xử lý các trường hợp cấp cứu' },
  { name: 'Khoa Nội tổng quát', description: 'Khám và điều trị các bệnh nội khoa' },
  { name: 'Khoa Ngoại tổng quát', description: 'Khám và điều trị các bệnh ngoại khoa, phẫu thuật' },
  { name: 'Khoa Sản - Phụ khoa', description: 'Chăm sóc sức khỏe phụ nữ, thai sản và sinh đẻ' },
  { name: 'Khoa Nhi', description: 'Khám và điều trị bệnh cho trẻ em' },
  { name: 'Khoa Tim mạch', description: 'Chẩn đoán và điều trị các bệnh tim mạch' },
  { name: 'Khoa Thần kinh', description: 'Khám và điều trị các bệnh thần kinh' },
  { name: 'Khoa Hô hấp', description: 'Khám và điều trị các bệnh về hô hấp, phổi' },
  { name: 'Khoa Tiêu hóa', description: 'Khám và điều trị các bệnh tiêu hóa' },
  { name: 'Khoa Cơ xương khớp', description: 'Khám và điều trị các bệnh xương khớp' },
  { name: 'Khoa Da liễu', description: 'Khám và điều trị các bệnh về da' },
  { name: 'Khoa Tai Mũi Họng', description: 'Khám và điều trị các bệnh tai, mũi, họng' },
  { name: 'Khoa Mắt', description: 'Khám và điều trị các bệnh về mắt' },
  { name: 'Khoa Răng Hàm Mặt', description: 'Khám và điều trị các bệnh răng, hàm, mặt' },
  { name: 'Khoa Tiết niệu', description: 'Khám và điều trị các bệnh tiết niệu, thận' },
  { name: 'Khoa Ung bướu', description: 'Chẩn đoán và điều trị ung thư' },
  { name: 'Khoa Hồi sức tích cực (ICU)', description: 'Chăm sóc đặc biệt cho bệnh nhân nặng' },
  { name: 'Khoa Chẩn đoán hình ảnh', description: 'X-quang, siêu âm, CT, MRI' },
  { name: 'Khoa Xét nghiệm', description: 'Xét nghiệm máu, nước tiểu và các xét nghiệm lâm sàng' },
  { name: 'Khoa Phục hồi chức năng', description: 'Phục hồi chức năng sau chấn thương và bệnh tật' },
];

/**
 * Trả về ObjectId của bệnh viện hệ thống.
 */
function getSystemHospitalId() {
  return _systemHospitalId;
}

/**
 * Đảm bảo chỉ tồn tại đúng một bệnh viện hệ thống và seed các khoa mặc định.
 */
async function ensureSystemHospital() {
  const hospitals = await Hospital.find().lean();

  if (hospitals.length === 0) {
    const hospital = await Hospital.create({
      name: process.env.SYSTEM_HOSPITAL_NAME || 'Bệnh viện Đa Khoa Thủ Đức',
      phone: process.env.SYSTEM_HOSPITAL_PHONE || '',
      email: process.env.SYSTEM_HOSPITAL_EMAIL || '',
      address: {
        street: 'Quốc lộ 1K',
        city: 'Thủ Đức',
        state: 'TP. Hồ Chí Minh',
        country: 'Việt Nam',
      },
    });
    _systemHospitalId = hospital._id;
    console.log(`[SystemHospital] Đã tạo bệnh viện mặc định: ${hospital.name} (${hospital._id})`);
  } else {
    if (hospitals.length > 1) {
      console.warn(`[SystemHospital] Cảnh báo: Có ${hospitals.length} bệnh viện trong hệ thống.`);
    }
    _systemHospitalId = hospitals[0]._id;
    console.log(`[SystemHospital] Bệnh viện hệ thống: ${hospitals[0].name} (${_systemHospitalId})`);
  }

  // Seed các khoa mặc định nếu chưa có
  const existingCount = await Department.countDocuments({ hospital: _systemHospitalId });
  if (existingCount === 0) {
    const docs = DEFAULT_DEPARTMENTS.map((d) => ({ ...d, hospital: _systemHospitalId }));
    await Department.insertMany(docs);
    console.log(`[SystemHospital] Đã tạo ${docs.length} khoa mặc định.`);
  }
}

module.exports = { ensureSystemHospital, getSystemHospitalId };

