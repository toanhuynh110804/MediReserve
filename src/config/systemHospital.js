const Hospital = require('../models/Hospital');
const Department = require('../models/Department');
const Specialty = require('../models/Specialty');
const Room = require('../models/Room');

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

const DEFAULT_SPECIALTIES = [
  { name: 'Hồi sức cấp cứu', description: 'Đánh giá, xử trí và hồi sức cho ca cấp cứu, nguy kịch' },
  { name: 'Nội tim mạch', description: 'Chẩn đoán và điều trị bệnh lý tim mạch nội khoa' },
  { name: 'Nội hô hấp', description: 'Điều trị các bệnh lý hô hấp và phổi' },
  { name: 'Nội tiêu hóa - gan mật', description: 'Điều trị các bệnh lý tiêu hóa, gan và mật' },
  { name: 'Nội tiết', description: 'Chẩn đoán và điều trị rối loạn nội tiết, chuyển hóa' },
  { name: 'Thận - tiết niệu', description: 'Điều trị các bệnh lý thận và đường tiết niệu' },
  { name: 'Ngoại tổng quát', description: 'Phẫu thuật và chăm sóc hậu phẫu bệnh ngoại khoa tổng quát' },
  { name: 'Ngoại thần kinh', description: 'Can thiệp ngoại khoa bệnh lý thần kinh và sọ não' },
  { name: 'Ngoại chấn thương chỉnh hình', description: 'Điều trị chấn thương và bệnh lý cơ xương khớp bằng phẫu thuật' },
  { name: 'Sản khoa', description: 'Theo dõi thai kỳ, đỡ sinh và chăm sóc sau sinh' },
  { name: 'Phụ khoa', description: 'Khám, điều trị bệnh lý phụ khoa và sức khỏe sinh sản nữ' },
  { name: 'Nhi tổng quát', description: 'Khám và điều trị bệnh lý thường gặp ở trẻ em' },
  { name: 'Nhi hô hấp', description: 'Điều trị bệnh hô hấp ở trẻ em' },
  { name: 'Nhi tiêu hóa', description: 'Điều trị bệnh tiêu hóa ở trẻ em' },
  { name: 'Tim mạch can thiệp', description: 'Can thiệp mạch vành và tim mạch ít xâm lấn' },
  { name: 'Thần kinh', description: 'Chẩn đoán và điều trị bệnh lý thần kinh' },
  { name: 'Cơ xương khớp', description: 'Điều trị bệnh lý cơ xương khớp và mô liên kết' },
  { name: 'Da liễu', description: 'Khám và điều trị bệnh da, tóc, móng' },
  { name: 'Tai Mũi Họng', description: 'Khám và điều trị bệnh lý tai, mũi, họng' },
  { name: 'Nhãn khoa', description: 'Khám và điều trị bệnh lý mắt' },
  { name: 'Răng Hàm Mặt', description: 'Điều trị bệnh lý răng miệng và hàm mặt' },
  { name: 'Ung bướu', description: 'Chẩn đoán, điều trị và theo dõi bệnh lý ung thư' },
  { name: 'Hồi sức tích cực (ICU)', description: 'Theo dõi và điều trị tích cực cho bệnh nhân nặng' },
  { name: 'Chẩn đoán hình ảnh', description: 'Thực hiện và đọc kết quả X-quang, CT, MRI, siêu âm' },
  { name: 'Xét nghiệm huyết học', description: 'Thực hiện xét nghiệm huyết học và đông máu' },
  { name: 'Xét nghiệm sinh hóa', description: 'Thực hiện xét nghiệm sinh hóa máu, nước tiểu' },
  { name: 'Vi sinh', description: 'Xét nghiệm vi sinh và định danh tác nhân gây bệnh' },
  { name: 'Phục hồi chức năng', description: 'Vật lý trị liệu và phục hồi chức năng sau điều trị' },
];

const DEFAULT_ROOM_FLOORS = 3;
const DEFAULT_ROOMS_PER_FLOOR = 10;

function buildDefaultRooms(departments = []) {
  if (!departments.length) return [];

  const rooms = [];
  let deptIndex = 0;

  for (let floor = 1; floor <= DEFAULT_ROOM_FLOORS; floor += 1) {
    for (let roomNo = 1; roomNo <= DEFAULT_ROOMS_PER_FLOOR; roomNo += 1) {
      const department = departments[deptIndex % departments.length];
      const code = `L${floor}-${String(roomNo).padStart(2, '0')}`;

      rooms.push({
        code,
        type: 'consultation',
        department: department._id,
        capacity: 1,
        status: 'available',
        note: `Lầu ${floor}, phòng khám ${roomNo}`,
      });

      deptIndex += 1;
    }
  }

  return rooms;
}

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

  // Seed chuyên khoa mặc định theo các khoa hiện có (chỉ thêm phần còn thiếu)
  const existingSpecialties = await Specialty.find({}, 'name').lean();
  const existingNames = new Set(existingSpecialties.map((item) => item.name));
  const specialtiesToInsert = DEFAULT_SPECIALTIES.filter((item) => !existingNames.has(item.name));

  if (specialtiesToInsert.length > 0) {
    await Specialty.insertMany(specialtiesToInsert);
    console.log(`[SystemHospital] Đã tạo thêm ${specialtiesToInsert.length} chuyên khoa mặc định.`);
  }

  // Seed phòng mặc định: 3 lầu, mỗi lầu 10 phòng (tự bù các phòng còn thiếu)
  const hospitalDepartments = await Department.find({ hospital: _systemHospitalId }, '_id').lean();
  const defaultRooms = buildDefaultRooms(hospitalDepartments);
  if (defaultRooms.length > 0) {
    const existingRooms = await Room.find({ code: { $in: defaultRooms.map((room) => room.code) } }, 'code').lean();
    const existingCodes = new Set(existingRooms.map((room) => room.code));
    const roomsToInsert = defaultRooms.filter((room) => !existingCodes.has(room.code));

    if (roomsToInsert.length > 0) {
      await Room.insertMany(roomsToInsert);
      console.log(`[SystemHospital] Đã tạo thêm ${roomsToInsert.length} phòng mặc định để đủ layout 3 lầu x 10 phòng.`);
    } else {
      console.log('[SystemHospital] Layout phòng mặc định đã đầy đủ (3 lầu x 10 phòng).');
    }
  }
}

module.exports = { ensureSystemHospital, getSystemHospitalId };

