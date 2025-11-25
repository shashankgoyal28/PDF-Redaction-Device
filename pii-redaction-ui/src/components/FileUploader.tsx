// import React from "react";
// import "../styles/fileUploader.css";

// interface Props {
//   onFileSelect: (file: File | null) => void;
// }

// export default function FileUploader({ onFileSelect }: Props) {
//   function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
//     const file = e.target.files?.[0] || null;
//     onFileSelect(file);
//   }

//   return (
//     <div className="file-upload-box">
//       <p>Click to choose a PDF file</p>
//       <input
//         type="file"
//         accept="application/pdf"
//         className="file-input"
//         onChange={handleFileChange}
//       />
//     </div>
//   );
// }

import React, { useRef, useState } from "react";

const FALLBACK_FILE_URL = "/mnt/data/Screenshot 2025-11-20 at 9.00.47 PM.png"; // dev-only preview path

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
        // small preview if it's an image, otherwise show hint (iframe preview might be heavy here)
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
