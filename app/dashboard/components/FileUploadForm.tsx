import { useState } from "react";
import { Button, Alert } from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import { SnackbarState } from "@/app/lots/type";

interface FileUploadFormProps {
  onUploadSuccess: () => void;
  showNotification: (message: string, severity: SnackbarState["severity"]) => void;
}

export default function FileUploadForm({ 
  onUploadSuccess, 
  showNotification 
}: FileUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validTypes = [
      "text/csv", 
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ];
    
    if (!validTypes.includes(selectedFile.type)) {
      setValidationError("Please upload a CSV or Excel file");
      return;
    }

    setFile(selectedFile);
    setValidationError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      showNotification("Please select a file", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", localStorage.getItem("userId") || "");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lots/upload`, {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!response.ok) throw new Error("Upload failed");
      
      setFile(null);
      onUploadSuccess();
      showNotification("File uploaded successfully!", "success");
    } catch {
      showNotification("Upload failed. Please try again.", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg shadow">
      <div className="flex-1">
        <Button
          variant="outlined"
          component="label"
          startIcon={<UploadIcon />}
          fullWidth
        >
          {file ? file.name : "Choose File"}
          <input type="file" hidden onChange={handleFileChange} />
        </Button>
        {validationError && <Alert severity="error" className="mt-2">{validationError}</Alert>}
      </div>
      
      <div className="flex gap-2">
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!file}
          startIcon={<UploadIcon />}
        >
          Upload
        </Button>
        
        {file && (
          <Button variant="outlined" onClick={() => setFile(null)}>
            Clear
          </Button>
        )}
      </div>
    </form>
  );
}