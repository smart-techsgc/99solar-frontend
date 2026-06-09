"use client";
import React, { useState } from 'react';
import axios from 'axios';

const FileUploader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
    setDownloadUrl(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(
        'http://localhost:1000/api/files/upload',
        formData,
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Upload Verizon CSV</h2>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!selectedFile || isLoading}>
        {isLoading ? 'Processing...' : 'Upload & Convert'}
      </button>

      {downloadUrl && (
        <a href={downloadUrl} download="cleaned-verizon.xlsx">
          Download Cleaned Excel
        </a>
      )}
    </div>
  );
};

export default FileUploader;
