import { TextField, Button, CircularProgress } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';

interface DateSelectorProps {
  date: string;
  loading: boolean;
  onDateChange: (date: string) => void;
  onLoadReports: () => void;
}

export const DateSelector = ({
  date,
  loading,
  onDateChange,
  onLoadReports
}: DateSelectorProps) => (
  <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
    <h2 className="text-xl font-semibold text-gray-700">Report Date</h2>
    <div className="flex items-center gap-4">
      <TextField
        label="Select Date"
        type="date"
        value={date}
        onChange={(e) => onDateChange(e.target.value)}
        InputLabelProps={{ shrink: true }}
        className="w-48"
      />
      <Button
        variant="contained"
        color="primary"
        startIcon={<HistoryIcon />}
        onClick={onLoadReports}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Load Reports'}
      </Button>
    </div>
  </div>
);