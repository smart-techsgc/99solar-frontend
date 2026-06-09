import { 
  Select, 
  MenuItem, 
  TextField, 
  InputAdornment,
  Button 
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import { BidFilters } from "@/app/lots/bids/type";

interface FiltersSectionProps {
  filters: BidFilters;
  onFilterChange: (filters: BidFilters) => void;
  onClear: () => void;
  onApply: () => void;
}

export default function FiltersSection({
  filters,
  onFilterChange,
  onClear,
  onApply,
}: FiltersSectionProps) {
  const handleChange = (field: keyof BidFilters, value: string) => {
    onFilterChange({ ...filters, [field]: value, page: 1 });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg shadow">
      <Select
        value={filters.status}
        onChange={(e) => handleChange("status", e.target.value)}
        displayEmpty
        className="w-full md:w-1/4"
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        }
      >
        <MenuItem value="">All Statuses</MenuItem>
        <MenuItem value="pending">Pending</MenuItem>
        <MenuItem value="awarded">Awarded</MenuItem>
        <MenuItem value="rejected">Rejected</MenuItem>
      </Select>

      <TextField
        label="Lot ID"
        value={filters.lot_id}
        onChange={(e) => handleChange("lot_id", e.target.value)}
        className="w-full md:w-1/4"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        label="User ID"
        value={filters.user_id}
        onChange={(e) => handleChange("user_id", e.target.value)}
        className="w-full md:w-1/4"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <div className="flex gap-2 items-center">
        <Button
          variant="contained"
          color="primary"
          onClick={onApply}
          className="h-full"
        >
          Apply
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<RefreshIcon />}
          onClick={onClear}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}