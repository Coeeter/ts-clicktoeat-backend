import { GitHub } from '@mui/icons-material';
import {
  Box,
  Button,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import image from '../assets/clicktoeat_v2_logo_round.svg';

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        display: 'flex',
        padding: '2rem',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: '3rem',
      }}
    >
      <img
        src={image}
        className="logo"
        style={
          isMobile
            ? {
                width: '75%',
              }
            : {}
        }
      />
      <Stack alignItems="center">
        <Typography variant={'h4'} mb={2}>
          ClickToEat V2 API
        </Typography>
        <Button
          LinkComponent={'a'}
          href="https://github.com/Coeeter/ts-clicktoeat-backend"
        >
          <GitHub sx={{ fontSize: '3rem' }} />
        </Button>
      </Stack>
    </Box>
  );
}
