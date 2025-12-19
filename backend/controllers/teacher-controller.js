const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');
const School = require('../models/adminSchema.js');

require('dotenv').config();
const teacherRegister = async (req, res) => {
  try {
    const { name, email, password, school, teachSclass } = req.body;

    if (!name || !email || !password || !school || !teachSclass) {
      return res
        .status(400)
        .json({ error: 'All required fields must be provided' });
    }

    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(409).json({ error: 'Teacher already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newTeacher = new Teacher({
      name,
      email,
      password: hashedPassword,
      school: new mongoose.Types.ObjectId(school),
      teachSclass: new mongoose.Types.ObjectId(teachSclass),
    });

    await newTeacher.save();
    return res.status(201).json({ message: 'Teacher registered successfully' });
  } catch (error) {
    console.error('❌ Error in teacherRegister:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const teacherLogIn = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ email: req.body.email })
      .populate('teachSubject', 'subName sessions')
      .populate('school', 'schoolName')
      .populate('teachSclass', 'sclassName');

    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const validated = await bcrypt.compare(req.body.password, teacher.password);

    if (!validated)
      return res.status(401).json({ message: 'Invalid password' });

    teacher.password = undefined;

    const token = jwt.sign(
      { id: teacher._id, role: 'teacher' },
      process.env.JWT_SECRET || 'defaultSecret',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      teacher,
      token,
    });
  } catch (err) {
    console.error('❌ Error in teacherLogIn:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({ school: req.params.id })
      .populate('teachSubject', 'subName')
      .populate('teachSclass', 'sclassName')
      .populate('school', 'schoolName');

    if (!teachers.length)
      return res.status(404).json({ message: 'No teachers found' });

    const cleanTeachers = teachers.map((t) => ({
      ...t._doc,
      password: undefined,
    }));
    res.send(cleanTeachers);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getTeacherDetail = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('teachSubject', 'subName sessions')
      .populate('school', 'schoolName')
      .populate('teachSclass', 'sclassName');

    if (!teacher) return res.status(404).json({ message: 'No teacher found' });

    teacher.password = undefined;
    res.send(teacher);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updateTeacherSubject = async (req, res) => {
  const { teacherId, teachSubject } = req.body;
  try {
    const subjectExists = await Subject.findById(teachSubject);
    if (!subjectExists)
      return res.status(400).json({ error: 'Invalid subject ID' });

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      teacherId,
      { teachSubject },
      { new: true }
    );

    await Subject.findByIdAndUpdate(teachSubject, {
      teacher: updatedTeacher._id,
    });

    res.send(updatedTeacher);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);
    if (deletedTeacher) {
      await Subject.updateOne(
        { teacher: deletedTeacher._id },
        { $unset: { teacher: '' } }
      );
    }

    res.send(deletedTeacher);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const deleteTeachers = async (req, res) => {
  try {
    const deleted = await Teacher.deleteMany({ school: req.params.id });
    res.send(deleted);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const deleteTeachersByClass = async (req, res) => {
  try {
    const deleted = await Teacher.deleteMany({ teachSclass: req.params.id });
    res.send(deleted);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const teacherAttendance = async (req, res) => {
  const { date, presentCount, absentCount } = req.body;

  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const formattedDate = new Date(date).toISOString().split('T')[0];

    const existing = teacher.attendance.find(
      (a) => new Date(a.date).toISOString().split('T')[0] === formattedDate
    );

    if (existing) {
      existing.presentCount = presentCount;
      existing.absentCount = absentCount;
    } else {
      teacher.attendance.push({ date, presentCount, absentCount });
    }

    const result = await teacher.save();
    return res.send(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  teacherRegister,
  teacherLogIn,
  getTeachers,
  getTeacherDetail,
  updateTeacherSubject,
  deleteTeacher,
  deleteTeachers,
  deleteTeachersByClass,
  teacherAttendance,
};
