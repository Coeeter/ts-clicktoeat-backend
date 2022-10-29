import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Box, useMediaQuery, useTheme } from '@mui/material';

import ErrorCard from './components/ErrorCard';
import ResetPasswordForm from './components/ResetPasswordForm';

export default function ResetPassword() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [searchParams] = useSearchParams();
  const email = searchParams.get('e');
  const credential = searchParams.get('c');

  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');

  const validateCredential = async () => {
    try {
      const response = await fetch(
        'https://clicktoeat.nasportfolio.com/api/users/validate-credential',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            credential,
          }),
        }
      );
      const body = await response.json();
      if (response.status == 401) return setError(body.error);
      setToken(body.token);
    } catch (e) {
      console.log(e);
    }
  };

  const getProfile = async () => {
    if (!token) return;
    try {
      const response = await fetch(
        'https://clicktoeat.nasportfolio.com/api/users/validate-token',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const body = await response.json();
      if (!response.ok)
        return setError(body.message ?? 'Unknown error has occurred');
      setUsername(body.username);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    validateCredential();
  }, []);

  useEffect(() => {
    getProfile();
  }, [token]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        padding: 'clamp(1rem, 2.5vw, 2rem)',
      }}
    >
      {error ? (
        <ErrorCard isMobile={isMobile} />
      ) : (
        <ResetPasswordForm
          isMobile={isMobile}
          username={username}
          token={token}
        />
      )}
    </Box>
  );
}
