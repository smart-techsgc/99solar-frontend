import { ChangeEvent } from 'react';
import { Button, CircularProgress, TextField } from '@mui/material';
import PublishIcon from '@mui/icons-material/Publish';
import DescriptionIcon from '@mui/icons-material/Description';

interface FileUploaderProps {
  files: File[];
  processing: boolean;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onClearFiles: () => void;
  onProcessFiles: () => void;
  fileCommissions?: Record<string, string>;
  onCommissionChange?: (fileName: string, value: string) => void;
  accept?: string;
}

const isDecimalInput = (value: string) => value === '' || /^\d*\.?\d*$/.test(value);

export const FileUploader = ({
  files,
  processing,
  onFileChange,
  onClearFiles,
  onProcessFiles,
  fileCommissions,
  onCommissionChange,
}: FileUploaderProps) => (
  <div>
    <div className="mb-6">
      <label className="block text-lg font-medium text-gray-700 mb-3">
        Upload Excel Files
      </label>
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <PublishIcon className="w-12 h-12 text-gray-400 mb-3" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              {fileCommissions && onCommissionChange
                ? 'Upload one file per company, then set how much to deduct for each'
                : 'files upload (multiple allowed)'}
            </p>
          </div>
          <input 
            type="file" 
            className="hidden"
            accept=".xlsx,.xls,.csv"
            multiple
            onChange={onFileChange}
          />
        </label>
      </div>
    </div>
    
    {files.length > 0 && (
      <div className="mt-4">
        <h3 className="font-medium text-gray-700 mb-2">Selected Files:</h3>
        <div className="max-h-64 overflow-y-auto border rounded-lg p-2 bg-gray-50">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="flex items-center gap-3 py-2 border-b last:border-b-0">
              <DescriptionIcon className="text-gray-500 flex-shrink-0" />
              <span className="text-sm truncate flex-1 min-w-0">{file.name}</span>
              {fileCommissions && onCommissionChange && (
                <TextField
                  label="Deduct ($)"
                  size="small"
                  value={fileCommissions[file.name] ?? ''}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (!isDecimalInput(raw)) return;
                    onCommissionChange(file.name, raw);
                  }}
                  disabled={processing}
                  sx={{ width: 140 }}
                  inputProps={{ inputMode: 'decimal' }}
                />
              )}
              <span className="text-xs text-gray-500 w-16 text-right">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
          ))}
        </div>
      </div>
    )}
    
    <div className="flex flex-wrap gap-3 mt-6">
      <Button
        variant="contained"
        color="primary"
        onClick={onProcessFiles}
        disabled={processing || files.length === 0}
        className="min-w-[150px]"
      >
        {processing ? <CircularProgress size={24} /> : 'Process Files'}
      </Button>
      
      <Button
        variant="outlined"
        color="secondary"
        onClick={onClearFiles}
        disabled={processing}
      >
        Clear Files
      </Button>
    </div>
  </div>
);
