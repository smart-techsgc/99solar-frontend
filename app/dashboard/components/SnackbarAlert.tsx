import { Snackbar, Alert } from '@mui/material';

interface SnackbarAlertProps {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

export const SnackbarAlert = ({
  open,
  message,
  severity,
  onClose
}: SnackbarAlertProps) => (
  <Snackbar
    open={open}
    autoHideDuration={6000}
    onClose={onClose}
  >
    <Alert
      onClose={onClose}
      severity={severity}
      sx={{ width: '100%' }}
    >
      {message}
    </Alert>
  </Snackbar>
);