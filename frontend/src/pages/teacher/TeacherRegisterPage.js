import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Grid,
  Box,
  Typography,
  Paper,
  Checkbox,
  FormControlLabel,
  TextField,
  CssBaseline,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import styled from 'styled-components';
import axios from 'axios';

import bgpic from '../../assets/designlogin.jpg';
import { LightPurpleButton } from '../../components/buttonStyles';
import Popup from '../../components/Popup';

const defaultTheme = createTheme();

const TeacherRegisterPage = () => {
  const navigate = useNavigate();

  const [toggle, setToggle] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [school, setSchool] = useState('');
  const [teachSubject, setTeachSubject] = useState('');
  const [teachSclass, setTeachSclass] = useState('');

  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !school || !teachSclass) {
      setMessage('All required fields must be filled');
      setShowPopup(true);
      return;
    }

    const data = {
      name,
      email,
      password,
      school,
      teachSclass,
      ...(teachSubject && { teachSubject }), // Optional
    };

    try {
      setLoader(true);
      const response = await axios.post(
        'https://school-management-system-8atr.onrender.com/Teacherregister',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      setMessage(response.data.message || 'Teacher registered successfully');
      setShowPopup(true);
      setLoader(false);

      // Reset fields
      setName('');
      setEmail('');
      setPassword('');
      setSchool('');
      setTeachSubject('');
      setTeachSclass('');
    } catch (error) {
      console.error('❌ Error:', error.response?.data || error.message);
      setMessage(
        error.response?.data?.error ||
          error.response?.data?.message ||
          'Registration failed'
      );
      setShowPopup(true);
      setLoader(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    switch (name) {
      case 'name':
        setName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'school':
        setSchool(value);
        break;
      case 'teachSubject':
        setTeachSubject(value);
        break;
      case 'teachSclass':
        setTeachSclass(value);
        break;
      default:
        break;
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component='main' sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography variant='h4' sx={{ mb: 2, color: '#2c2143' }}>
              Teacher Register
            </Typography>
            <Typography variant='body2' sx={{ mb: 2 }}>
              Create your teacher account to manage classes and students.
            </Typography>

            <Box
              component='form'
              noValidate
              onSubmit={handleSubmit}
              sx={{ mt: 1 }}
            >
              <TextField
                margin='normal'
                required
                fullWidth
                id='name'
                label='Full Name'
                name='name'
                value={name}
                onChange={handleInputChange}
              />
              <TextField
                margin='normal'
                required
                fullWidth
                id='email'
                label='Email Address'
                name='email'
                value={email}
                onChange={handleInputChange}
              />
              <TextField
                margin='normal'
                required
                fullWidth
                name='password'
                label='Password'
                type={toggle ? 'text' : 'password'}
                id='password'
                value={password}
                onChange={handleInputChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={() => setToggle(!toggle)}>
                        {toggle ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin='normal'
                required
                fullWidth
                id='school'
                label='School ID (Admin)'
                name='school'
                value={school}
                onChange={handleInputChange}
                helperText='Enter MongoDB ObjectId of the school admin'
              />
              <TextField
                margin='normal'
                fullWidth
                id='teachSubject'
                label='Subject ID (optional)'
                name='teachSubject'
                value={teachSubject}
                onChange={handleInputChange}
                helperText='Enter MongoDB ObjectId of the subject (optional)'
              />
              <TextField
                margin='normal'
                required
                fullWidth
                id='teachSclass'
                label='Class ID'
                name='teachSclass'
                value={teachSclass}
                onChange={handleInputChange}
                helperText='Enter MongoDB ObjectId of the class'
              />

              <FormControlLabel
                control={<Checkbox value='remember' color='primary' />}
                label='Remember me'
              />

              <LightPurpleButton
                type='submit'
                fullWidth
                variant='contained'
                sx={{ mt: 3, mb: 2 }}
              >
                {loader ? (
                  <CircularProgress size={24} color='inherit' />
                ) : (
                  'Register'
                )}
              </LightPurpleButton>

              <Grid container justifyContent='flex-end'>
                <Grid item>
                  Already have an account?
                  <StyledLink to='/TeacherLogin'> Log in</StyledLink>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>

        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: `url(${bgpic})`,
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light'
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </Grid>

      <Popup
        message={message}
        showPopup={showPopup}
        setShowPopup={setShowPopup}
      />
    </ThemeProvider>
  );
};

export default TeacherRegisterPage;

const StyledLink = styled(Link)`
  margin-left: 6px;
  text-decoration: none;
  color: #7f56da;
`;
