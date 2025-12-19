const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Student = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema.js');

require('dotenv').config();

const studentRegister = async (req, res) => {
  try {
    const { name, rollNum, password, sclassName, school } = req.body;

    if (!name || !rollNum || !password || !sclassName || !school) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = new Student({
      name,
      rollNum,
      password: hashedPassword,
      sclassName,
      school,
    });

    await newStudent.save();

    return res.status(201).json({ message: 'Student registered successfully' });
  } catch (error) {
    console.error('❌ Error in studentRegister:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const studentLogIn = async (req, res) => {
  try {
    const student = await Student.findOne({
      rollNum: req.body.rollNum,
      name: req.body.name,
    })
      .populate('school', 'schoolName')
      .populate('sclassName', 'sclassName');

    if (!student) return res.status(404).json({ message: 'Student not found' });

    const validated = await bcrypt.compare(req.body.password, student.password);

    if (!validated)
      return res.status(401).json({ message: 'Invalid password' });

    student.password = undefined;
    student.examResult = undefined;
    student.attendance = undefined;

    const token = jwt.sign(
      { id: student._id, role: 'student' },
      process.env.JWT_SECRET || 'defaultSecret',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      student,
      token,
    });
  } catch (err) {
    console.error('❌ Error in studentLogIn:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getStudents = async (req, res) => {
  try {
    let students = await Student.find({ school: req.params.id }).populate(
      'sclassName',
      'sclassName'
    );

    if (!students.length) {
      return res.status(404).json({ message: 'No students found' });
    }

    const clean = students.map((s) => ({
      ...s._doc,
      password: undefined,
    }));

    res.send(clean);
  } catch (err) {
    res.status(500).json(err);
  }
};

const getStudentDetail = async (req, res) => {
  try {
    let student = await Student.findById(req.params.id)
      .populate('school', 'schoolName')
      .populate('sclassName', 'sclassName')
      .populate('examResult.subName', 'subName')
      .populate('attendance.subName', 'subName sessions');

    if (!student) {
      return res.status(404).json({ message: 'No student found' });
    }

    student.password = undefined;
    res.send(student);
  } catch (err) {
    res.status(500).json(err);
  }
};

const deleteStudent = async (req, res) => {
  try {
    const result = await Student.findByIdAndDelete(req.params.id);
    res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteStudents = async (req, res) => {
  try {
    const result = await Student.deleteMany({ school: req.params.id });
    if (!result.deletedCount) {
      return res.send({ message: 'No students found to delete' });
    }
    res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteStudentsByClass = async (req, res) => {
  try {
    const result = await Student.deleteMany({ sclassName: req.params.id });
    if (!result.deletedCount) {
      return res.send({ message: 'No students found to delete' });
    }
    res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const updateStudent = async (req, res) => {
  try {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    let result = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    result.password = undefined;
    res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const updateExamResult = async (req, res) => {
  const { subName, marksObtained } = req.body;
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.send({ message: 'Student not found' });

    const existingResult = student.examResult.find(
      (result) => result.subName.toString() === subName
    );
    if (existingResult) {
      existingResult.marksObtained = marksObtained;
    } else {
      student.examResult.push({ subName, marksObtained });
    }

    const result = await student.save();
    return res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const studentAttendance = async (req, res) => {
  const { subName, status, date } = req.body;
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.send({ message: 'Student not found' });

    const subject = await Subject.findById(subName);

    const existingAttendance = student.attendance.find(
      (a) =>
        a.date.toDateString() === new Date(date).toDateString() &&
        a.subName.toString() === subName
    );

    if (existingAttendance) {
      existingAttendance.status = status;
    } else {
      const attendedSessions = student.attendance.filter(
        (a) => a.subName.toString() === subName
      ).length;
      if (attendedSessions >= subject.sessions) {
        return res.send({ message: 'Maximum attendance limit reached' });
      }
      student.attendance.push({ date, status, subName });
    }

    const result = await student.save();
    return res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const clearAllStudentsAttendanceBySubject = async (req, res) => {
  const subName = req.params.id;
  try {
    const result = await Student.updateMany(
      { 'attendance.subName': subName },
      { $pull: { attendance: { subName } } }
    );
    return res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const clearAllStudentsAttendance = async (req, res) => {
  const schoolId = req.params.id;
  try {
    const result = await Student.updateMany(
      { school: schoolId },
      { $set: { attendance: [] } }
    );
    return res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const removeStudentAttendanceBySubject = async (req, res) => {
  const studentId = req.params.id;
  const subName = req.body.subId;
  try {
    const result = await Student.updateOne(
      { _id: studentId },
      { $pull: { attendance: { subName: subName } } }
    );
    return res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const removeStudentAttendance = async (req, res) => {
  const studentId = req.params.id;
  try {
    const result = await Student.updateOne(
      { _id: studentId },
      { $set: { attendance: [] } }
    );
    return res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  studentRegister,
  studentLogIn,
  getStudents,
  getStudentDetail,
  deleteStudents,
  deleteStudent,
  updateStudent,
  studentAttendance,
  deleteStudentsByClass,
  updateExamResult,
  clearAllStudentsAttendanceBySubject,
  clearAllStudentsAttendance,
  removeStudentAttendanceBySubject,
  removeStudentAttendance,
};
