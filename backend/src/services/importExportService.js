import xlsx from 'xlsx';
import Teacher from '../models/teacherModel.js';
import Subject from '../models/subjectModel.js';
import Room from '../models/roomModel.js';
import Department from '../models/departmentModel.js';

/**
 * Excel Bulk Import & Export Service
 */
const importTeachersFromExcel = async (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  let importedCount = 0;
  const errors = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    try {
      if (!row.Name || !row['Employee ID'] || !row.Email || !row.Department) {
        errors.push(`Row ${i + 2}: Missing required fields (Name, Employee ID, Email, Department)`);
        continue;
      }

      // Find department by code or name
      let dept = await Department.findOne({
        $or: [{ code: row.Department.toUpperCase() }, { name: row.Department }],
      });
      if (!dept) {
        dept = await Department.create({
          name: row.Department,
          code: row.Department.substring(0, 4).toUpperCase(),
        });
      }

      await Teacher.findOneAndUpdate(
        { employeeId: String(row['Employee ID']) },
        {
          name: row.Name,
          employeeId: String(row['Employee ID']),
          email: row.Email,
          phone: row.Phone || '',
          qualification: row.Qualification || 'M.Tech / Ph.D',
          experience: Number(row.Experience) || 5,
          department: dept._id,
          maxDailyPeriods: Number(row['Max Daily Periods']) || 4,
          maxWeeklyPeriods: Number(row['Max Weekly Periods']) || 20,
        },
        { upsert: true, returnDocument: 'after' }
      );
      importedCount++;
    } catch (err) {
      errors.push(`Row ${i + 2}: ${err.message}`);
    }
  }

  return { importedCount, errors };
};

const importSubjectsFromExcel = async (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  let importedCount = 0;
  const errors = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    try {
      if (!row['Subject Name'] || !row['Subject Code'] || !row.Department) {
        errors.push(`Row ${i + 2}: Missing required fields (Subject Name, Subject Code, Department)`);
        continue;
      }

      let dept = await Department.findOne({
        $or: [{ code: row.Department.toUpperCase() }, { name: row.Department }],
      });
      if (!dept) {
        dept = await Department.create({
          name: row.Department,
          code: row.Department.substring(0, 4).toUpperCase(),
        });
      }

      await Subject.findOneAndUpdate(
        { code: String(row['Subject Code']).toUpperCase() },
        {
          name: row['Subject Name'],
          code: String(row['Subject Code']).toUpperCase(),
          department: dept._id,
          credits: Number(row.Credits) || 3,
          weeklyRequiredPeriods: Number(row['Weekly Periods']) || 4,
          type: row.Type || 'Theory',
          color: row.Color || 'indigo',
        },
        { upsert: true, returnDocument: 'after' }
      );
      importedCount++;
    } catch (err) {
      errors.push(`Row ${i + 2}: ${err.message}`);
    }
  }

  return { importedCount, errors };
};

const importRoomsFromExcel = async (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  let importedCount = 0;
  const errors = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    try {
      if (!row['Room Number']) {
        errors.push(`Row ${i + 2}: Missing Room Number`);
        continue;
      }

      await Room.findOneAndUpdate(
        { roomNumber: String(row['Room Number']) },
        {
          roomNumber: String(row['Room Number']),
          capacity: Number(row.Capacity) || 60,
          type: row.Type || 'Classroom',
          building: row.Building || 'Main Block',
          floor: row.Floor || '1st Floor',
        },
        { upsert: true, returnDocument: 'after' }
      );
      importedCount++;
    } catch (err) {
      errors.push(`Row ${i + 2}: ${err.message}`);
    }
  }

  return { importedCount, errors };
};

export {
  importTeachersFromExcel,
  importSubjectsFromExcel,
  importRoomsFromExcel,
};
