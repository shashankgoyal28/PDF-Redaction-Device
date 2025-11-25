import React from "react";
import "../styles/fileUploader.css";

interface Props {
  onFileSelect: (file: File | null) => void;
}

export default function FileUploader({ onFileSelect }: Props) {
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    onFileSelect(file);
  }

  return (
    <div className="file-upload-box">
      <p>Click to choose a PDF file</p>
      <input
        type="file"
        accept="application/pdf"
        className="file-input"
        onChange={handleFileChange}
      />
    </div>
  );
}
