/* this is the Code for the Older UI */
// // src/pages/InputPage.tsx - use case 1 
// import React, { useState } from "react";
// import "../styles/inputPage.css";
// import FileUploader from "../components/FileUploader";
// import { useNavigate } from "react-router-dom";
// import { redactText, redactFile } from "../api/redact";
// import type { LabelStyle } from "../api/redact";

// export default function InputPage() {
//   const navigate = useNavigate();

//   const [mode, setMode] = useState<"text" | "pdf">("text");
//   const [text, setText] = useState("");
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const [options, setOptions] = useState({
//     emails: true,
//     phones: true,
//     names: false,
//     addresses: false,
//   });

//   const [labelStyle, setLabelStyle] = useState<LabelStyle>("typed");
//   const [customLabel, setCustomLabel] = useState("");

//   const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg"];

//   function toggleOption(key: keyof typeof options) {
//     setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
//   }

//   async function onRedact() {
//     setIsSubmitting(true);

//     try {
//       if (mode === "text") {
//         const payload = {
//           text,
//           redact_emails: options.emails,
//           redact_phones: options.phones,
//           redact_names: options.names,
//           redact_addresses: options.addresses,
//           label_style: labelStyle,
//           custom_label: customLabel || null,
//         };

//         let textResp;
//         try {
//           textResp = await redactText(payload);
//         } catch (err: any) {
//           console.error("Text redaction error:", err);
//           alert(err?.message || "Text redaction failed. Check backend logs.");
//           return;
//         }

//         navigate("/results", {
//           state: {
//             ...textResp,
//             file: null,
//             options: payload, 
//             labelStyle,
//             customLabel,
//           },
//         });

//         return;
//       }

//       if (!selectedFile) {
//         alert("Please upload a PDF or image.");
//         return;
//       }

//       if (!ALLOWED_TYPES.includes(selectedFile.type)) {
//         alert(`Unsupported file type: ${selectedFile.type}`);
//         return;
//       }

//       const payloadOptions = {
//         redact_emails: options.emails,
//         redact_phones: options.phones,
//         redact_names: options.names,
//         redact_addresses: options.addresses,
//         label_style: labelStyle,
//         custom_label: customLabel || null,
//       };

//       let response;
//       try {
//         response = await redactFile(selectedFile, payloadOptions);
//       } catch (err: any) {
//         console.error("PDF redaction error:", err);
//         alert(err?.message || "PDF redaction failed. Check backend logs.");
//         return;
//       }

//       const previewUrl = URL.createObjectURL(selectedFile);

//       navigate("/results", {
//         state: {
//           ...response, 
//           file: {
//             name: selectedFile.name,
//             size: selectedFile.size,
//             type: selectedFile.type,
//             url: previewUrl, 
//             originFile: selectedFile,
//           },
//           options: payloadOptions,
//           labelStyle,
//           customLabel,
//         },
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   }

//   return (
//     <div className="container">
//       <h1 className="title">PII Redaction Tool</h1>

//       {/* Mode Switch */}
//       <div className="mode-toggle">
//         <button
//           className={mode === "text" ? "toggle active" : "toggle"}
//           onClick={() => setMode("text")}
//         >
//           Text Mode
//         </button>
//         <button
//           className={mode === "pdf" ? "toggle active" : "toggle"}
//           onClick={() => setMode("pdf")}
//         >
//           PDF Mode
//         </button>
//       </div>

//       {/* TEXT INPUT */}
//       {mode === "text" && (
//         <textarea
//           className="text-input"
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           placeholder="Paste your text here..."
//         />
//       )}

//       {/* PDF UPLOADER */}
//       {mode === "pdf" && (
//         <FileUploader
//           onFileSelect={(file) => {
//             if (file && !ALLOWED_TYPES.includes(file.type)) {
//               alert(`Unsupported file type: ${file.type}`);
//               setSelectedFile(null);
//               return;
//             }
//             setSelectedFile(file);
//           }}
//         />
//       )}

//       {/* Options */}
//       <div className="options">
//         <h2>Redaction Options</h2>

//         <label>
//           <input
//             type="checkbox"
//             checked={options.emails}
//             onChange={() => toggleOption("emails")}
//           />
//           Emails
//         </label>
//         <label>
//           <input
//             type="checkbox"
//             checked={options.phones}
//             onChange={() => toggleOption("phones")}
//           />
//           Phone Numbers
//         </label>
//         <label>
//           <input
//             type="checkbox"
//             checked={options.names}
//             onChange={() => toggleOption("names")}
//           />
//           Names
//         </label>
//         <label>
//           <input
//             type="checkbox"
//             checked={options.addresses}
//             onChange={() => toggleOption("addresses")}
//           />
//           Addresses
//         </label>
//       </div>

//       {/* Label style */}
//       <div className="label-style">
//         <h2>Label Style</h2>

//         <label>
//           <input
//             type="radio"
//             name="label"
//             value="typed"
//             checked={labelStyle === "typed"}
//             onChange={() => setLabelStyle("typed")}
//           />
//           Typed ([EMAIL_1])
//         </label>

//         <label>
//           <input
//             type="radio"
//             name="label"
//             value="blackbox"
//             checked={labelStyle === "blackbox"}
//             onChange={() => setLabelStyle("blackbox")}
//           />
//           Black Box ██████
//         </label>

//         <label>
//           <input
//             type="radio"
//             name="label"
//             value="custom"
//             checked={labelStyle === "custom"}
//             onChange={() => setLabelStyle("custom")}
//           />
//           Custom Label
//         </label>

//         {labelStyle === "custom" && (
//           <input
//             type="text"
//             className="custom-label-input"
//             value={customLabel}
//             onChange={(e) => setCustomLabel(e.target.value)}
//             placeholder="Enter custom label…"
//           />
//         )}
//       </div>

//       <button className="redact-btn" onClick={onRedact} disabled={isSubmitting}>
//         {isSubmitting ? "Processing…" : "REDACT"}
//       </button>
//     </div>
//   );
// }



// src/pages/InputPage.tsx
import React, { useState } from "react";
import "../styles/inputPage.css";
import FileUploader from "../components/FileUploader";
import { useNavigate } from "react-router-dom";
import { redactText, redactFile } from "../api/redact";
import type { LabelStyle } from "../api/redact";

export default function InputPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<"text" | "pdf">("text");
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [options, setOptions] = useState({
    emails: true,
    phones: true,
    names: false,
    addresses: false,
  });

  const [labelStyle, setLabelStyle] = useState<LabelStyle>("typed");
  const [customLabel, setCustomLabel] = useState("");

  const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg"];

  function toggleOption(key: keyof typeof options) {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function onRedact() {
    setIsSubmitting(true);

    try {
      /* ---------- TEXT MODE ---------- */
      if (mode === "text") {
        const payload = {
          text,
          redact_emails: options.emails,
          redact_phones: options.phones,
          redact_names: options.names,
          redact_addresses: options.addresses,
          label_style: labelStyle,
          custom_label: customLabel || null,
        };

        let textResp;
        try {
          textResp = await redactText(payload);
        } catch (err: any) {
          console.error("Text redaction error:", err);
          alert(err?.message || "Text redaction failed. Check backend logs.");
          return;
        }

        navigate("/results", {
          state: {
            ...textResp,
            file: null,
            options: payload,
            labelStyle,
            customLabel,
          },
        });

        return;
      }

      /* ---------- PDF MODE ---------- */
      if (!selectedFile) {
        alert("Please upload a PDF or image.");
        return;
      }

      if (!ALLOWED_TYPES.includes(selectedFile.type)) {
        alert(`Unsupported file type: ${selectedFile.type}`);
        return;
      }

      const payloadOptions = {
        redact_emails: options.emails,
        redact_phones: options.phones,
        redact_names: options.names,
        redact_addresses: options.addresses,
        label_style: labelStyle,
        custom_label: customLabel || null,
      };

      let response;
      try {
        response = await redactFile(selectedFile, payloadOptions);
      } catch (err: any) {
        console.error("PDF redaction error:", err);
        alert(err?.message || "PDF redaction failed. Check backend logs.");
        return;
      }

      const previewUrl = URL.createObjectURL(selectedFile);

      navigate("/results", {
        state: {
          ...response, // { message, download_url, original_text, redacted_text, summary }
          file: {
            name: selectedFile.name,
            size: selectedFile.size,
            type: selectedFile.type,
            url: previewUrl, // only for preview
            originFile: selectedFile,
          },
          options: payloadOptions,
          labelStyle,
          customLabel,
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container">
      <header className="page-header">
        <div>
          <h1 className="title">PII Redaction Tool</h1>
          <p className="subtitle">
            Automatically detect and remove sensitive information from text or PDF documents
            before sharing them.
          </p>
        </div>
        <div className="badge-pill">Secure · Fast · Regex-based</div>
      </header>

      {/* Mode Switch */}
      <div className="mode-toggle">
        <button
          className={mode === "text" ? "toggle active" : "toggle"}
          onClick={() => setMode("text")}
        >
          ✏️ Text Mode
        </button>
        <button
          className={mode === "pdf" ? "toggle active" : "toggle"}
          onClick={() => setMode("pdf")}
        >
          📄 PDF / Image Mode
        </button>
      </div>
      <p className="mode-hint">
        {mode === "text"
          ? "Paste raw text to quickly test the redaction logic."
          : "Upload a PDF or image. PDFs with selectable text will be fully redacted."}
      </p>

      {/* TEXT INPUT */}
      {mode === "text" && (
        <section className="panel">
          <div className="panel-header">
            <h2>Input Text</h2>
            <p className="panel-subtitle">
              Paste any content containing emails, phone numbers, names or addresses.
            </p>
          </div>
          <textarea
            className="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text here…"
          />
        </section>
      )}

      {/* PDF UPLOADER */}
      {mode === "pdf" && (
        <section className="panel">
          <div className="panel-header">
            <h2>Upload Document</h2>
            <p className="panel-subtitle">
              Supported: PDF, PNG, JPEG. For best results, use PDFs with selectable text (not
              scanned-only).
            </p>
          </div>
          <FileUploader
            onFileSelect={(file) => {
              if (file && !ALLOWED_TYPES.includes(file.type)) {
                alert(`Unsupported file type: ${file.type}`);
                setSelectedFile(null);
                return;
              }
              setSelectedFile(file);
            }}
          />
          {selectedFile && (
            <div className="file-meta-row">
              <span className="file-meta-label">Selected file:</span>
              <span className="file-meta-name">{selectedFile.name}</span>
              <span className="file-meta-size">
                {(selectedFile.size / 1024).toFixed(1)} KB · {selectedFile.type}
              </span>
            </div>
          )}
        </section>
      )}

      {/* Options */}
      <section className="panel mt-compact">
        <div className="panel-header">
          <h2>What should be redacted?</h2>
          <p className="panel-subtitle">
            Choose which categories of PII you want to remove. You can mix and match as needed.
          </p>
        </div>

        <div className="options two-column">
          <label>
            <input
              type="checkbox"
              checked={options.emails}
              onChange={() => toggleOption("emails")}
            />
            <span className="option-label">Emails</span>
            <span className="option-description">example@domain.com</span>
          </label>

          <label>
            <input
              type="checkbox"
              checked={options.phones}
              onChange={() => toggleOption("phones")}
            />
            <span className="option-label">Phone Numbers</span>
            <span className="option-description">Mobile or landline numbers</span>
          </label>

          <label>
            <input
              type="checkbox"
              checked={options.names}
              onChange={() => toggleOption("names")}
            />
            <span className="option-label">Names</span>
            <span className="option-description">
              Person names like &ldquo;John Doe&rdquo;
            </span>
          </label>

          <label>
            <input
              type="checkbox"
              checked={options.addresses}
              onChange={() => toggleOption("addresses")}
            />
            <span className="option-label">Addresses</span>
            <span className="option-description">
              Street-style addresses detected via patterns
            </span>
          </label>
        </div>
      </section>

      {/* Label style */}
      <section className="panel mt-compact">
        <div className="panel-header">
          <h2>How should redactions look?</h2>
          <p className="panel-subtitle">
            Choose a redaction style. Typed labels are helpful for analysis, while black boxes are
            better for final sharing.
          </p>
        </div>

        <div className="label-style">
          <label>
            <input
              type="radio"
              name="label"
              value="typed"
              checked={labelStyle === "typed"}
              onChange={() => setLabelStyle("typed")}
            />
            <div className="label-option">
              <div className="label-option-title">Typed label</div>
              <div className="label-option-example">[EMAIL_1], [PHONE_2], …</div>
              <div className="label-option-desc">
                Replaces PII with descriptive tokens. Great for debugging and reviewing.
              </div>
            </div>
          </label>

          <label>
            <input
              type="radio"
              name="label"
              value="blackbox"
              checked={labelStyle === "blackbox"}
              onChange={() => setLabelStyle("blackbox")}
            />
            <div className="label-option">
              <div className="label-option-title">Black box</div>
              <div className="label-option-example">██████</div>
              <div className="label-option-desc">
                Solid blocks that fully hide the content. Useful for final documents.
              </div>
            </div>
          </label>

          <label>
            <input
              type="radio"
              name="label"
              value="custom"
              checked={labelStyle === "custom"}
              onChange={() => setLabelStyle("custom")}
            />
            <div className="label-option">
              <div className="label-option-title">Custom label</div>
              <div className="label-option-example">&ldquo;[REMOVED]&rdquo;, &ldquo;[PRIVATE]&rdquo;, …</div>
              <div className="label-option-desc">
                Use your own replacement text for every redacted span.
              </div>
            </div>
          </label>

          {labelStyle === "custom" && (
            <input
              type="text"
              className="custom-label-input"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="Enter custom label, e.g. [REDACTED]"
            />
          )}
        </div>
      </section>

      <div className="cta-row">
        <button className="redact-btn" onClick={onRedact} disabled={isSubmitting}>
          {isSubmitting ? "Processing…" : "Run Redaction"}
        </button>
        <p className="cta-hint">
          Your document is processed locally on this backend and the redacted version is returned
          for download.
        </p>
      </div>
    </div>
  );
}




