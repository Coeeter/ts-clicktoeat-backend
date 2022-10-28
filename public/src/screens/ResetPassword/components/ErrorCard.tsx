import { Card, Typography } from '@mui/material';

export default function ErrorCard({ isMobile }: { isMobile: boolean }) {
  return (
    <Card
      sx={{
        width: isMobile ? '75%' : '50%',
        padding: '1rem',
        marginInline: 'auto',
      }}
      elevation={5}
    >
      <Typography textAlign="center" variant="h5">
        Invalid password reset link
      </Typography>
    </Card>
  );
}
