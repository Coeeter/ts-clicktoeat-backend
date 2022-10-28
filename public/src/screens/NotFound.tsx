import { Box, Typography } from '@mui/material';
import React from 'react';

export default function NotFound() {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100vh"
    >
      <Typography textAlign="center" variant="h3" my={3}>
        Not Found
      </Typography>
    </Box>
  );
}
