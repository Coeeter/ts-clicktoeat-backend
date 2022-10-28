import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import {
  Box,
  Button,
  Card,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';

type FormValues = {
  password: string;
};

export default function ResetPasswordForm({
  isMobile,
  username,
  token,
}: {
  isMobile: boolean;
  username: string;
  token: string;
}) {
  const [done, setDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = async data => {
    setIsLoading(true);
    const response = await fetch('http://localhost:8080/api/users', {
      method: 'PUT',
      body: JSON.stringify({ password: data.password }),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    setIsLoading(false);
    if (!response.ok) return console.log(await response.json());
    setDone(true);
  };

  return (
    <Card
      sx={{
        width: isMobile ? '75%' : '50%',
        padding: '1rem',
        marginInline: 'auto',
      }}
      elevation={5}
    >
      <Typography
        mb={done ? 0 : 2}
        textAlign="center"
        variant={done ? 'h5' : 'body1'}
      >
        {done
          ? 'You have reseted your password successfully. Login in using your new password now!'
          : `Reseting password for account with username ${username}`}
      </Typography>
      {done ? null : (
        <Box
          component="form"
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
          onSubmit={handleSubmit(onSubmit)}
        >
          <TextField
            label="Password"
            sx={{ width: '100%' }}
            type="password"
            key="password"
            {...register('password', {
              required: 'Password is required!',
              minLength: {
                value: 6,
                message: 'Password should be at least 6 characters long',
              },
            })}
            error={errors?.password != null}
            helperText={errors?.password ? errors.password.message : null}
            disabled={isLoading}
          />
          <Button variant="contained" type="submit" disabled={isLoading}>
            {isLoading ? (
              <CircularProgress color="secondary" size={25} />
            ) : null}
            {isLoading ? null : 'Submit'}
          </Button>
        </Box>
      )}
    </Card>
  );
}
