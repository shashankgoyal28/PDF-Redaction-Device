// import React, { useState } from "react";
// import "../styles/inputPage.css";
// import FileUploader from "../components/FileUploader";
// import { useNavigate } from "react-router-dom";


// export default function InputPage() {
//     const navigate = useNavigate();
//   const [mode, setMode] = useState<"text" | "pdf">("text");
//   const [text, setText] = useState("");
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);

//   // Redaction options state
//   const [options, setOptions] = useState({
//     emails: true,
//     phones: true,
//     names: false,
//     addresses: false,
//   });

//   // Label style selection
//   const [labelStyle, setLabelStyle] = useState<"typed" | "blackbox" | "custom">("typed");
//   const [customLabel, setCustomLabel] = useState("");

//   function toggleOption(key: keyof typeof options) {
//     setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
//   }

//   function onRedact() {
//     console.log("Text:", text);
//     console.log("File:", selectedFile);
//     console.log("Options:", options);
//     console.log("Label Style:", labelStyle);
//     console.log("Custom Label:", customLabel);

//     alert("Redaction triggered! (Backend integration coming next)");
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

//       {/* Text Mode */}
//       {mode === "text" && (
//         <textarea
//           className="text-input"
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           placeholder="Paste your text here..."
//         />
//       )}

//       {/* PDF Upload Mode */}
//       {mode === "pdf" && (
//         <FileUploader onFileSelect={(f) => setSelectedFile(f)} />
//       )}

//       {/* Redaction Options */}
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

//       {/* Label Style Selection */}
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
//           [EMAIL_1], [PHONE_1]
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
//             value={customLabel}
//             onChange={(e) => setCustomLabel(e.target.value)}
//             className="custom-label-input"
//             placeholder="Enter custom label…"
//           />
//         )}
//       </div>

//       {/* Redact Button */}
//       <button className="redact-btn" onClick={onRedact}>
//         REDACT
//       </button>
//     </div>
//   );
// }
// import React, { useState } from "react";
// import "../styles/inputPage.css";
// import FileUploader from "../components/FileUploader";
// import { useNavigate } from "react-router-dom";

// export default function InputPage() {
//   const navigate = useNavigate();

//   const [mode, setMode] = useState<"text" | "pdf">("text");
//   const [text, setText] = useState("");
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);

//   // Redaction options state
//   const [options, setOptions] = useState({
//     emails: true,
//     phones: true,
//     names: false,
//     addresses: false,
//   });

//   // Label style selection
//   const [labelStyle, setLabelStyle] = useState<"typed" | "blackbox" | "custom">("typed");
//   const [customLabel, setCustomLabel] = useState("");

//   function toggleOption(key: keyof typeof options) {
//     setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
//   }

//   /**
//    * onRedact:
//    * - navigates to /results
//    * - passes state: original_text, redacted_text, summary
//    * - includes a file_url for PDF testing:
//    *     - If a file is selected, create an object URL to preview locally
//    *     - Otherwise use the local test file path provided earlier:
//    *       /mnt/data/Screenshot 2025-11-20 at 9.00.47 PM.png
//    */
//   function onRedact() {
//     // Build a simple mock redaction result for frontend testing
//     const mockRedacted = (input: string) =>
//       input
//         ? input
//             .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL_1]")
//             .replace(/(\+?\d{1,3}[\s-]?)?(\d{10}|\d{3}[\s-]\d{3}[\s-]\d{4})/g, "[PHONE_1]")
//         : "No text provided — redacted output will appear here when backend is connected.";

//     const original = mode === "text" ? text : "(PDF content - see file_url)";
//     const redacted = mode === "text" ? mockRedacted(text) : "(Redacted PDF content will appear here)";

//     // Determine a test file URL:
//     // - If user selected a file in-browser, expose an object URL for immediate preview.
//     // - Otherwise fallback to the local test file path available in this environment for backend tests.
//     const fallbackLocalFilePath = "/mnt/data/Screenshot 2025-11-20 at 9.00.47 PM.png";
//     const file_url = selectedFile ? URL.createObjectURL(selectedFile) : fallbackLocalFilePath;

//     // Build a simple summary (mock) — real summary will come from backend
//     const summary = {
//       counts: {
//         EMAIL: options.emails ? (text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []).length : 0,
//         PHONE: options.phones ? (text.match(/(\+?\d{1,3}[\s-]?)?(\d{10}|\d{3}[\s-]\d{3}[\s-]\d{4})/g) || []).length : 0,
//         NAME: options.names ? 0 : 0, // placeholder
//         ADDRESS: options.addresses ? 0 : 0, // placeholder
//       },
//       items: [
//         // mock items for demonstration; real items will be generated by backend
//         ...(options.emails ? [{ type: "EMAIL", original: "john.doe@example.com", label: "[EMAIL_1]" }] : []),
//         ...(options.phones ? [{ type: "PHONE", original: "+1 555-123-4567", label: "[PHONE_1]" }] : []),
//       ],
//     };

//     // Navigate to results and pass the data in location.state
//     navigate("/results", {
//       state: {
//         original_text: original,
//         redacted_text: redacted,
//         summary,
//         // pass file info so ResultsPage (or backend call) can use it
//         file: {
//           name: selectedFile?.name || null,
//           size: selectedFile?.size || null,
//           type: selectedFile?.type || null,
//           // this is either a blob URL (for immediate preview) or the fallback local path for backend tests
//           url: file_url,
//         },
//         // include the chosen redaction options & label preferences so backend can use them
//         options,
//         labelStyle,
//         customLabel,
//       },
//     });
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

//       {/* Text Mode */}
//       {mode === "text" && (
//         <textarea
//           className="text-input"
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           placeholder="Paste your text here..."
//         />
//       )}

//       {/* PDF Upload Mode */}
//       {mode === "pdf" && <FileUploader onFileSelect={(f) => setSelectedFile(f)} />}

//       {/* Redaction Options */}
//       <div className="options">
//         <h2>Redaction Options</h2>

//         <label>
//           <input type="checkbox" checked={options.emails} onChange={() => toggleOption("emails")} />
//           Emails
//         </label>

//         <label>
//           <input type="checkbox" checked={options.phones} onChange={() => toggleOption("phones")} />
//           Phone Numbers
//         </label>

//         <label>
//           <input type="checkbox" checked={options.names} onChange={() => toggleOption("names")} />
//           Names
//         </label>

//         <label>
//           <input type="checkbox" checked={options.addresses} onChange={() => toggleOption("addresses")} />
//           Addresses
//         </label>
//       </div>

//       {/* Label Style Selection */}
//       <div className="label-style">
//         <h2>Label Style</h2>

//         <label>
//           <input type="radio" name="label" value="typed" checked={labelStyle === "typed"} onChange={() => setLabelStyle("typed")} />
//           [EMAIL_1], [PHONE_1]
//         </label>

//         <label>
//           <input type="radio" name="label" value="blackbox" checked={labelStyle === "blackbox"} onChange={() => setLabelStyle("blackbox")} />
//           Black Box ██████
//         </label>

//         <label>
//           <input type="radio" name="label" value="custom" checked={labelStyle === "custom"} onChange={() => setLabelStyle("custom")} />
//           Custom Label
//         </label>

//         {labelStyle === "custom" && (
//           <input
//             type="text"
//             value={customLabel}
//             onChange={(e) => setCustomLabel(e.target.value)}
//             className="custom-label-input"
//             placeholder="Enter custom label…"
//           />
//         )}
//       </div>

//       {/* Redact Button */}
//       <button className="redact-btn" onClick={onRedact}>
//         REDACT
//       </button>
//     </div>
//   );
// }

// import React, { useState } from "react";
// import "../styles/inputPage.css";
// import FileUploader from "../components/FileUploader";
// import { useNavigate } from "react-router-dom";
// import { redactText } from "../api/redact";

// export default function InputPage() {
//   const navigate = useNavigate();

//   const [mode, setMode] = useState<"text" | "pdf">("text");
//   const [text, setText] = useState("");
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);

//   const [options, setOptions] = useState({
//     emails: true,
//     phones: true,
//     names: false,
//     addresses: false,
//   });

//   const [labelStyle, setLabelStyle] = useState<"typed" | "blackbox" | "custom">(
//     "typed"
//   );
//   const [customLabel, setCustomLabel] = useState("");

//   function toggleOption(key: keyof typeof options) {
//     setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
//   }

//   // --------------------------------------------------------------------
//   // 🔥 REAL REDACT BUTTON — Calls FastAPI backend
//   // --------------------------------------------------------------------
//   async function onRedact() {
//     try {
//       if (mode === "pdf") {
//         alert("PDF redaction coming next. Use TEXT mode now.");
//         return;
//       }

//       // ---------- Build backend payload ----------
//       const payload = {
//         text,
//         redact_emails: options.emails,
//         redact_phones: options.phones,
//         redact_names: options.names,
//         redact_addresses: options.addresses,
//         label_style: labelStyle,
//         custom_label: customLabel || null,
//       };

//       // ---------- API CALL ----------
//       const response = await redactText(payload);

//       // ---------- Navigate to results ----------
//       navigate("/results", {
//         state: {
//           ...response,
//           file: selectedFile
//             ? {
//                 name: selectedFile.name,
//                 size: selectedFile.size,
//                 type: selectedFile.type,
//                 url: URL.createObjectURL(selectedFile),
//               }
//             : null,
//         },
//       });
//     } catch (err) {
//       console.error(err);
//       alert("Error during redaction — check backend logs.");
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

//       {/* Text Mode */}
//       {mode === "text" && (
//         <textarea
//           className="text-input"
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           placeholder="Paste your text here..."
//         />
//       )}

//       {/* PDF Upload */}
//       {mode === "pdf" && (
//         <FileUploader onFileSelect={(file) => setSelectedFile(file)} />
//       )}

//       {/* Redaction Options */}
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

//       {/* Label Style */}
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
//           Typed Label ([EMAIL_1])
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

//       {/* Redact Button */}
//       <button className="redact-btn" onClick={onRedact}>
//         REDACT
//       </button>
//     </div>
//   );
// }




// import React, { useState } from "react";
// import "../styles/inputPage.css";
// import FileUploader from "../components/FileUploader";
// import { useNavigate } from "react-router-dom";
// import { redactText, redactFile } from "../api/redact";

// export default function InputPage() {
//   const navigate = useNavigate();

//   const [mode, setMode] = useState<"text" | "pdf">("text");
//   const [text, setText] = useState("");
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);

//   const [options, setOptions] = useState({
//     emails: true,
//     phones: true,
//     names: false,
//     addresses: false,
//   });

//   const [labelStyle, setLabelStyle] = useState<"typed" | "blackbox" | "custom">(
//     "typed"
//   );
//   const [customLabel, setCustomLabel] = useState("");

//   function toggleOption(key: keyof typeof options) {
//     setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
//   }

//   // local fallback file path available in this environment (developer-provided)
//   const FALLBACK_LOCAL_FILE = "/mnt/data/Screenshot 2025-11-20 at 9.00.47 PM.png";

//   // --------------------------------------------------------------------
//   // 🔥 REAL REDACT BUTTON — Calls FastAPI backend, handles PDF uploads
//   // --------------------------------------------------------------------
//   async function onRedact() {
//     try {
//       // ---------------- PDF MODE ----------------
//       if (mode === "pdf") {
//         // If no file chosen, use fallback preview only (no backend POST)
//         if (!selectedFile) {
//           // We cannot POST a local server path as a File from client,
//           // so for quick local preview we navigate with the local path.
//           // When testing file upload, choose a file and the code below will POST it.
//           const fakeResponse = {
//             original_text: "(PDF extraction not performed locally) - preview only",
//             redacted_text: "(Redacted PDF content will appear here)",
//             summary: { counts: {}, items: [] },
//           };

//           navigate("/results", {
//             state: {
//               ...fakeResponse,
//               file: {
//                 name: "local-fallback.png",
//                 size: null,
//                 type: "image/png",
//                 url: FALLBACK_LOCAL_FILE,
//               },
//             },
//           });
//           return;
//         }

//         // If a file is selected, send to backend via redactFile (FormData)
//         const payloadOptions = {
//           redact_emails: options.emails,
//           redact_phones: options.phones,
//           redact_names: options.names,
//           redact_addresses: options.addresses,
//           label_style: labelStyle,
//           custom_label: customLabel || null,
//         };

//         const response = await redactFile(selectedFile, payloadOptions);

//         // Navigate to results, include a blob preview URL for the uploaded file
//         navigate("/results", {
//           state: {
//             ...response,
//             file: {
//               name: selectedFile.name,
//               size: selectedFile.size,
//               type: selectedFile.type,
//               url: URL.createObjectURL(selectedFile),
//             },
//           },
//         });
//         return;
//       }

//       // ---------------- TEXT MODE ----------------
//       const payload = {
//         text,
//         redact_emails: options.emails,
//         redact_phones: options.phones,
//         redact_names: options.names,
//         redact_addresses: options.addresses,
//         label_style: labelStyle,
//         custom_label: customLabel || null,
//       };

//       const response = await redactText(payload);

//       navigate("/results", {
//         state: {
//           ...response,
//           file: null,
//         },
//       });
//     } catch (err: any) {
//       console.error("Redaction error:", err);
//       alert(err?.message || "Error during redaction — check backend logs.");
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

//       {/* Text Mode */}
//       {mode === "text" && (
//         <textarea
//           className="text-input"
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           placeholder="Paste your text here..."
//         />
//       )}

//       {/* PDF Upload */}
//       {mode === "pdf" && (
//         <FileUploader onFileSelect={(file) => setSelectedFile(file)} />
//       )}

//       {/* Redaction Options */}
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

//       {/* Label Style */}
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
//           Typed Label ([EMAIL_1])
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

//       {/* Redact Button */}
//       <button className="redact-btn" onClick={onRedact}>
//         REDACT
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

  const [labelStyle, setLabelStyle] = useState<"typed" | "blackbox" | "custom">(
    "typed"
  );
  const [customLabel, setCustomLabel] = useState("");

  function toggleOption(key: keyof typeof options) {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  // local fallback file path available in this environment (developer-provided)
  const FALLBACK_LOCAL_FILE = "/mnt/data/Screenshot 2025-11-20 at 9.00.47 PM.png";

  // Allowed mime types for upload
  const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg"];

  // --------------------------------------------------------------------
  // 🔥 REAL REDACT BUTTON — Calls FastAPI backend, handles PDF uploads
  // --------------------------------------------------------------------
  async function onRedact() {
    setIsSubmitting(true);
    try {
      // ---------------- PDF MODE ----------------
      if (mode === "pdf") {
        // If no file chosen, use fallback preview only (no backend POST)
        if (!selectedFile) {
          const fakeResponse = {
            original_text: "(PDF extraction not performed locally) - preview only",
            redacted_text: "(Redacted PDF content will appear here)",
            summary: { counts: {}, items: [] },
          };

          navigate("/results", {
            state: {
              ...fakeResponse,
              file: {
                name: "local-fallback.png",
                size: null,
                type: "image/png",
                url: FALLBACK_LOCAL_FILE,
              },
            },
          });
          return;
        }

        // Validate file type before sending to backend
        if (!ALLOWED_TYPES.includes(selectedFile.type)) {
          alert(
            `Unsupported file type: ${selectedFile.type}. Please upload a PDF or PNG/JPEG image.`
          );
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

        // Call backend - redactFile returns JSON (message, download_url, summary, etc.)
        let response;
        try {
          response = await redactFile(selectedFile, payloadOptions);
        } catch (err: any) {
          // Try to surface backend error detail
          console.error("redactFile error:", err);
          alert(
            err?.message ||
              "File redaction failed. Check backend logs and ensure the file is a valid PDF."
          );
          return;
        }

        // response expected shape (from your backend): { message, download_url, summary, original_text?, redacted_text? }
        // Create preview URL from the uploaded file for client-side preview
        const previewUrl = URL.createObjectURL(selectedFile);

        navigate("/results", {
          state: {
            ...response,
            file: {
              name: selectedFile.name,
              size: selectedFile.size,
              type: selectedFile.type,
              url: previewUrl,
              // originFile could be passed to ResultsPage if you want to directly download using the same File object
              originFile: selectedFile,
            },
            // Also pass the options so ResultsPage can reuse them for download-from-path if needed
            options: payloadOptions,
            labelStyle,
            customLabel,
          },
        });

        return;
      }

      // ---------------- TEXT MODE ----------------
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
        console.error("redactText error:", err);
        alert(err?.message || "Text redaction failed. Check backend logs.");
        return;
      }

      navigate("/results", {
        state: {
          ...textResp,
          file: null,
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container">
      <h1 className="title">PII Redaction Tool</h1>

      {/* Mode Switch */}
      <div className="mode-toggle">
        <button
          className={mode === "text" ? "toggle active" : "toggle"}
          onClick={() => setMode("text")}
        >
          Text Mode
        </button>

        <button
          className={mode === "pdf" ? "toggle active" : "toggle"}
          onClick={() => setMode("pdf")}
        >
          PDF Mode
        </button>
      </div>

      {/* Text Mode */}
      {mode === "text" && (
        <textarea
          className="text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your text here..."
        />
      )}

      {/* PDF Upload */}
      {mode === "pdf" && (
        <FileUploader
          onFileSelect={(file) => {
            // runtime defensive check in case FileUploader allows other types
            if (file && !ALLOWED_TYPES.includes(file.type)) {
              alert(
                `Unsupported file type selected: ${file.type}. Please choose a PDF or PNG/JPEG.`
              );
              setSelectedFile(null);
              return;
            }
            setSelectedFile(file);
          }}
        />
      )}

      {/* Redaction Options */}
      <div className="options">
        <h2>Redaction Options</h2>

        <label>
          <input
            type="checkbox"
            checked={options.emails}
            onChange={() => toggleOption("emails")}
          />
          Emails
        </label>

        <label>
          <input
            type="checkbox"
            checked={options.phones}
            onChange={() => toggleOption("phones")}
          />
          Phone Numbers
        </label>

        <label>
          <input
            type="checkbox"
            checked={options.names}
            onChange={() => toggleOption("names")}
          />
          Names
        </label>

        <label>
          <input
            type="checkbox"
            checked={options.addresses}
            onChange={() => toggleOption("addresses")}
          />
          Addresses
        </label>
      </div>

      {/* Label Style */}
      <div className="label-style">
        <h2>Label Style</h2>

        <label>
          <input
            type="radio"
            name="label"
            value="typed"
            checked={labelStyle === "typed"}
            onChange={() => setLabelStyle("typed")}
          />
          Typed Label ([EMAIL_1])
        </label>

        <label>
          <input
            type="radio"
            name="label"
            value="blackbox"
            checked={labelStyle === "blackbox"}
            onChange={() => setLabelStyle("blackbox")}
          />
          Black Box ██████
        </label>

        <label>
          <input
            type="radio"
            name="label"
            value="custom"
            checked={labelStyle === "custom"}
            onChange={() => setLabelStyle("custom")}
          />
          Custom Label
        </label>

        {labelStyle === "custom" && (
          <input
            type="text"
            className="custom-label-input"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="Enter custom label…"
          />
        )}
      </div>

      {/* Redact Button */}
      <button
        className="redact-btn"
        onClick={onRedact}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Processing…" : "REDACT"}
      </button>
    </div>
  );
}

