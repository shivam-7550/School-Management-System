import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import axios from 'axios';

const StudentSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    rollNum: '',
    password: '',
    sclassName: '',
    school: '',
  });

  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, rollNum, password, sclassName, school } = formData;

    // Validation
    if (!name || !rollNum || !password || !sclassName || !school) {
      setMessage('All fields are required');
      setSuccess(false);
      return;
    }

    try {
      const payload = {
        name,
        rollNum: parseInt(rollNum), // Ensure rollNum is a number
        password,
        sclassName, // assumed to be a MongoDB ObjectId string
        school, // assumed to be a MongoDB ObjectId string
      };

      const res = await axios.post(
        'https://school-management-system-8atr.onrender.com/Studentregister',
        payload
      );

      setMessage(res.data.message || 'Student registered successfully');
      setSuccess(true);

      setFormData({
        name: '',
        rollNum: '',
        password: '',
        sclassName: '',
        school: '',
      });
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.error || 'Something went wrong. Please try again.';
      setMessage(errorMsg);
      setSuccess(false);
    }
  };

  return (
    <Container maxWidth='sm'>
      <Box sx={{ mt: 4 }}>
        <Typography variant='h4' gutterBottom>
          Student Signup
        </Typography>

        {message && (
          <Alert severity={success ? 'success' : 'error'} sx={{ my: 2 }}>
            {message}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label='Name'
            name='name'
            value={formData.name}
            onChange={handleChange}
            margin='normal'
          />
          <TextField
            fullWidth
            label='Roll Number'
            name='rollNum'
            type='number'
            value={formData.rollNum}
            onChange={handleChange}
            margin='normal'
          />
          <TextField
            fullWidth
            label='Password'
            name='password'
            type='password'
            value={formData.password}
            onChange={handleChange}
            margin='normal'
          />
          <TextField
            fullWidth
            label='Class ID (sclassName)'
            name='sclassName'
            value={formData.sclassName}
            onChange={handleChange}
            margin='normal'
            helperText='Enter valid MongoDB ObjectId for Class'
          />
          <TextField
            fullWidth
            label='School ID'
            name='school'
            value={formData.school}
            onChange={handleChange}
            margin='normal'
            helperText='Enter valid MongoDB ObjectId for School'
          />
          <Button type='submit' variant='contained' fullWidth sx={{ mt: 3 }}>
            Register
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default StudentSignup;
