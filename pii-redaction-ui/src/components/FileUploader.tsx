import React, { useRef, useState } from "react";

const FALLBACK_FILE_URL = "/mnt/data/Screenshot 2025-11-20 at 9.00.47 PM.png"; 

export default function FileUploader({ onFileSelect }: { onFileSelect: (f: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(FALLBACK_FILE_URL);

  function openDialog() {
    inputRef.current?.click();
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0];
    if (f) {
      setPreviewUrl(URL.createObjectURL(f));
      onFileSelect(f);
    } else {
      setPreviewUrl(FALLBACK_FILE_URL);
      onFileSelect(null);
    }
  }

  return (
    <div className="pdf-dropzone" onClick={openDialog} role="button" tabIndex={0}>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/*"
        style={{ display: "none" }}
        onChange={onChange}
      />
      {previewUrl ? (
        previewUrl.endsWith(".png") || previewUrl.endsWith(".jpg") || previewUrl.endsWith(".jpeg") ? (
          <img src={previewUrl} alt="preview" className="preview" />
        ) : (
          <div className="hint">Click to choose a PDF file</div>
        )
      ) : (
        <div className="hint">Click to choose a PDF file</div>
      )}
    </div>
  );
}
