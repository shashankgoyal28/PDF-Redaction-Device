// import React, { useState } from "react";
// import "../styles/resultsPage.css";
// import { useNavigate, useLocation } from "react-router-dom";

// export default function ResultsPage() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Data passed from InputPage (backend response)
//   const {
//     original_text = "No original text received.",
//     redacted_text = "No redacted text received.",
//     summary = { counts: {}, items: [] },
//     file = null,
//   } = location.state || {};

//   const [activeTab, setActiveTab] = useState<
//     "original" | "redacted" | "summary" | "file"
//   >("original");

//   return (
//     <div className="results-container">
//       <h1 className="results-title">Redaction Results</h1>

//       {/* ------------------------- Tabs ------------------------- */}
//       <div className="tabs">
//         <button
//           className={activeTab === "original" ? "tab active" : "tab"}
//           onClick={() => setActiveTab("original")}
//         >
//           Original
//         </button>

//         <button
//           className={activeTab === "redacted" ? "tab active" : "tab"}
//           onClick={() => setActiveTab("redacted")}
//         >
//           Redacted
//         </button>

//         <button
//           className={activeTab === "summary" ? "tab active" : "tab"}
//           onClick={() => setActiveTab("summary")}
//         >
//           Summary
//         </button>

//         {/* Show FILE tab only if file preview URL exists */}
//         {file?.url && (
//           <button
//             className={activeTab === "file" ? "tab active" : "tab"}
//             onClick={() => setActiveTab("file")}
//           >
//             File Preview
//           </button>
//         )}
//       </div>

//       {/* ------------------------- Content ------------------------- */}
//       <div className="results-box">
//         {/* ORIGINAL */}
//         {activeTab === "original" && (
//           <pre className="text-box">{original_text}</pre>
//         )}

//         {/* REDACTED */}
//         {activeTab === "redacted" && (
//           <pre className="text-box">{redacted_text}</pre>
//         )}

//         {/* SUMMARY */}
//         {activeTab === "summary" && (
//           <div className="summary-box">
//             <h3>Summary of Redaction</h3>

//             <h4>Counts</h4>
//             <ul>
//               {Object.entries(summary.counts).map(([key, value]) => (
//                 <li key={key}>
//                   <strong>{key}</strong>: {value}
//                 </li>
//               ))}
//             </ul>

//             <h4>Redacted Items</h4>
//             <ul>
//               {summary.items.map((item: any, index: number) => (
//                 <li key={index}>
//                   <strong>{item.type}</strong>: {item.original} →{" "}
//                   <span className="label">{item.label}</span>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {/* FILE PREVIEW */}
//         {activeTab === "file" && file?.url && (
//           <div className="file-preview">
//             <h3>Uploaded File Preview</h3>

//             {file.type === "application/pdf" ? (
//               <iframe
//                 src={file.url}
//                 width="100%"
//                 height="500px"
//                 title="PDF Preview"
//               ></iframe>
//             ) : (
//               <img
//                 src={file.url}
//                 alt="Uploaded"
//                 className="preview-image"
//               />
//             )}
//           </div>
//         )}
//       </div>

//       <button className="back-btn" onClick={() => navigate("/")}>
//         Back
//       </button>
//     </div>
//   );
// }

// import React, { useState } from "react";
// import "../styles/resultsPage.css";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   downloadRedactedFile,
//   downloadRedactedFileFromPath,
// } from "../api/redact";

// const FALLBACK_LOCAL_PATH = "/mnt/data/Screenshot 2025-11-20 at 9.00.47 PM.png";

// export default function ResultsPage() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Data passed from InputPage (backend response)
//   const {
//     original_text = "No original text received.",
//     redacted_text = "No redacted text received.",
//     summary = { counts: {}, items: [] },
//     file = null,
//     options: passedOptions = null,
//     labelStyle: passedLabelStyle = null,
//     customLabel: passedCustomLabel = null,
//   } = (location.state as any) || {};

//   const [activeTab, setActiveTab] = useState<
//     "original" | "redacted" | "summary" | "file"
//   >("original");

//   // Build current options (prefer what was passed from InputPage)
//   const currentOptions = {
//     redact_emails:
//       passedOptions?.emails ?? passedOptions?.redact_emails ?? true,
//     redact_phones:
//       passedOptions?.phones ?? passedOptions?.redact_phones ?? true,
//     redact_names:
//       passedOptions?.names ?? passedOptions?.redact_names ?? false,
//     redact_addresses:
//       passedOptions?.addresses ?? passedOptions?.redact_addresses ?? false,
//     label_style: passedLabelStyle ?? (passedOptions?.label_style ?? "typed"),
//     custom_label: passedCustomLabel ?? passedOptions?.custom_label ?? null,
//   };

//   // Helper to trigger browser download from blob
//   function downloadBlob(blob: Blob, filename = "redacted_file.pdf") {
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = filename;
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//     URL.revokeObjectURL(url);
//   }

//   // Download handler: tries (1) original File object -> backend, (2) server-local path fallback
//   async function handleDownloadRedactedPDF() {
//     try {
//       // If InputPage passed the actual File object (recommended) it should be available as file.originFile
//       const originalFile: File | undefined = file?.originFile ?? file?.fileObject ?? null;

//       if (originalFile) {
//         // call API that returns PDF bytes
//         const blob = await downloadRedactedFile(originalFile, {
//           redact_emails: currentOptions.redact_emails,
//           redact_phones: currentOptions.redact_phones,
//           redact_names: currentOptions.redact_names,
//           redact_addresses: currentOptions.redact_addresses,
//           label_style: currentOptions.label_style,
//           custom_label: currentOptions.custom_label,
//         });
//         downloadBlob(blob, `redacted_${originalFile.name || "file"}.pdf`);
//         return;
//       }

//       // fallback: if we only have a server-local path (developer-provided), use it
//       const fallbackPath =
//         file?.url ??
//         file?.path ??
//         (location.state && (location.state as any).file_url) ??
//         FALLBACK_LOCAL_PATH;

//       if (typeof fallbackPath === "string" && fallbackPath.startsWith("/mnt/")) {
//         // call API helper that accepts a server-local path (backend must support this endpoint/form field)
//         const blob = await downloadRedactedFileFromPath(fallbackPath, {
//           redact_emails: currentOptions.redact_emails,
//           redact_phones: currentOptions.redact_phones,
//           redact_names: currentOptions.redact_names,
//           redact_addresses: currentOptions.redact_addresses,
//           label_style: currentOptions.label_style,
//           custom_label: currentOptions.custom_label,
//         });
//         downloadBlob(blob, `redacted_local_file.pdf`);
//         return;
//       }

//       // final fallback: if backend already provided a download_url in location.state
//       const downloadUrl = (location.state as any)?.download_url;
//       if (downloadUrl) {
//         const apiBase = (await import("../api/redact")).API_BASE || "http://localhost:8000/api";
//         const fullUrl = downloadUrl.startsWith("http")
//           ? downloadUrl
//           : `${apiBase}${downloadUrl.startsWith("/") ? "" : "/"}${downloadUrl}`;
//         const res = await fetch(fullUrl);
//         if (!res.ok) throw new Error("Failed to fetch server redacted PDF");
//         const blob = await res.blob();
//         downloadBlob(blob, `redacted_download.pdf`);
//         return;
//       }

//       alert("No uploaded file available for download. Re-upload in PDF mode and try again.");
//     } catch (err: any) {
//       console.error("Download error:", err);
//       alert(err?.message || "Download failed. See console.");
//     }
//   }

//   return (
//     <div className="results-container">
//       <h1 className="results-title">Redaction Results</h1>

//       {/* ------------------------- Tabs ------------------------- */}
//       <div className="tabs">
//         <button
//           className={activeTab === "original" ? "tab active" : "tab"}
//           onClick={() => setActiveTab("original")}
//         >
//           Original
//         </button>

//         <button
//           className={activeTab === "redacted" ? "tab active" : "tab"}
//           onClick={() => setActiveTab("redacted")}
//         >
//           Redacted
//         </button>

//         <button
//           className={activeTab === "summary" ? "tab active" : "tab"}
//           onClick={() => setActiveTab("summary")}
//         >
//           Summary
//         </button>

//         {/* Show FILE tab only if file preview URL exists */}
//         {file?.url && (
//           <button
//             className={activeTab === "file" ? "tab active" : "tab"}
//             onClick={() => setActiveTab("file")}
//           >
//             File Preview
//           </button>
//         )}
//       </div>

//       {/* ------------------------- Content ------------------------- */}
//       <div className="results-box">
//         {/* ORIGINAL */}
//         {activeTab === "original" && (
//           <pre className="text-box">{original_text}</pre>
//         )}

//         {/* REDACTED */}
//         {activeTab === "redacted" && (
//           <pre className="text-box">{redacted_text}</pre>
//         )}

//         {/* SUMMARY */}
//         {activeTab === "summary" && (
//           <div className="summary-box">
//             <h3>Summary of Redaction</h3>

//             <h4>Counts</h4>
//             <ul>
//               {Object.entries((summary && summary.counts) || {}).map(
//                 ([key, value]) => (
//                   <li key={key}>
//                     <strong>{key}</strong>: {value as any}
//                   </li>
//                 )
//               )}
//             </ul>

//             <h4>Redacted Items</h4>
//             <ul>
//               {(summary && summary.items ? summary.items : []).map(
//                 (item: any, index: number) => (
//                   <li key={index}>
//                     <strong>{item.type}</strong>: {item.original} →{" "}
//                     <span className="label">{item.label}</span>
//                   </li>
//                 )
//               )}
//             </ul>
//           </div>
//         )}

//         {/* FILE PREVIEW */}
//         {activeTab === "file" && file?.url && (
//           <div className="file-preview">
//             <h3>Uploaded File Preview</h3>

//             {file.type === "application/pdf" ? (
//               <iframe
//                 src={file.url}
//                 width="100%"
//                 height="500px"
//                 title="PDF Preview"
//               ></iframe>
//             ) : (
//               <img src={file.url} alt="Uploaded" className="preview-image" />
//             )}

//             {/* Download button shown under preview */}
//             <div style={{ marginTop: 12 }}>
//               <button className="download-btn" onClick={handleDownloadRedactedPDF}>
//                 Download Redacted PDF
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       <div style={{ marginTop: 16 }}>
//         {/* If file exists but preview tab not active (or no preview), still show Download button */}
//         {!file?.url && file && (
//           <button className="download-btn" onClick={handleDownloadRedactedPDF}>
//             Download Redacted PDF
//           </button>
//         )}
//       </div>

//       <button className="back-btn" onClick={() => navigate("/")}>
//         Back
//       </button>
//     </div>
//   );
// }

// src/api/redact.ts
// export const API_BASE =
//   (process.env.REACT_APP_API_BASE as string) || "http://localhost:8000/api";

// /**
//  * Uploads a File object to the backend redaction endpoint and returns the redacted PDF as a Blob.
//  *
//  * Backend: POST ${API_BASE}/redact-file
//  * Body: multipart/form-data with field "file" and optional JSON "options"
//  */
// export async function downloadRedactedFile(
//   file: File,
//   options: Record<string, any> = {}
// ): Promise<Blob> {
//   const form = new FormData();
//   form.append("file", file);

//   // If your backend expects options as form fields, you can append individually.
//   form.append("options", JSON.stringify(options));

//   const res = await fetch(`${API_BASE}/redact-file`, {
//     method: "POST",
//     body: form,
//     // NOTE: Do NOT set Content-Type header when using FormData; browser will set boundary.
//   });

//   if (!res.ok) {
//     const text = await res.text().catch(() => "");
//     throw new Error(
//       `Redaction failed (${res.status} ${res.statusText}) ${text ? `: ${text}` : ""}`
//     );
//   }

//   return await res.blob();
// }

// /**
//  * Requests backend to open a server-local path and return a redacted PDF as a Blob.
//  *
//  * Backend: POST ${API_BASE}/redact-from-path
//  * Body: JSON { path: string, options: {...} }
//  *
//  * WARNING: This endpoint must be implemented server-side — the browser cannot read server filesystem paths.
//  */
// export async function downloadRedactedFileFromPath(
//   path: string,
//   options: Record<string, any> = {}
// ): Promise<Blob> {
//   const res = await fetch(`${API_BASE}/redact-from-path`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ path, options }),
//   });

//   if (!res.ok) {
//     const text = await res.text().catch(() => "");
//     throw new Error(
//       `Redaction from path failed (${res.status} ${res.statusText}) ${text ? `: ${text}` : ""}`
//     );
//   }

//   return await res.blob();
// }



// // src/pages/ResultsPage.tsx
// import React, { useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   downloadRedactedFile,
//   downloadRedactedFileFromPath,
// } from "../api/redact"; // assuming these functions exist in src/api/redact.ts

// const FALLBACK_LOCAL_PATH = "/mnt/data/Screenshot 2025-11-20 at 9.00.47 PM.png";

// export default function ResultsPage() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Data passed from InputPage (backend response)
//   const {
//     original_text = "No original text received.",
//     redacted_text = "No redacted text received.",
//     summary = { counts: {}, items: [] },
//     file = null,
//     options: passedOptions = null,
//     labelStyle: passedLabelStyle = null,
//     customLabel: passedCustomLabel = null,
//   } = (location.state as any) || {};

//   const [activeTab, setActiveTab] = useState<
//     "original" | "redacted" | "summary" | "file"
//   >("original");

//   // Build current options (prefer what was passed from InputPage)
//   const currentOptions = {
//     redact_emails:
//       passedOptions?.emails ?? passedOptions?.redact_emails ?? true,
//     redact_phones:
//       passedOptions?.phones ?? passedOptions?.redact_phones ?? true,
//     redact_names:
//       passedOptions?.names ?? passedOptions?.redact_names ?? false,
//     redact_addresses:
//       passedOptions?.addresses ?? passedOptions?.redact_addresses ?? false,
//     label_style: passedLabelStyle ?? (passedOptions?.label_style ?? "typed"),
//     custom_label: passedCustomLabel ?? passedOptions?.custom_label ?? null,
//   };

//   // Helper to trigger browser download from blob
//   function downloadBlob(blob: Blob, filename = "redacted_file.pdf") {
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = filename;
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//     URL.revokeObjectURL(url);
//   }

//   // Download handler: tries (1) original File object -> backend, (2) server-local path fallback
//   async function handleDownloadRedactedPDF() {
//     try {
//       // If InputPage passed the actual File object (recommended) it should be available as file.originFile
//       const originalFile: File | undefined = file?.originFile ?? file?.fileObject ?? null;

//       if (originalFile) {
//         // call API that returns PDF bytes
//         const blob = await downloadRedactedFile(originalFile, {
//           redact_emails: currentOptions.redact_emails,
//           redact_phones: currentOptions.redact_phones,
//           redact_names: currentOptions.redact_names,
//           redact_addresses: currentOptions.redact_addresses,
//           label_style: currentOptions.label_style,
//           custom_label: currentOptions.custom_label,
//         });
//         downloadBlob(blob, `redacted_${originalFile.name || "file"}.pdf`);
//         return;
//       }

//       // fallback: if we only have a server-local path (developer-provided), use it
//       const fallbackPath =
//         file?.url ??
//         file?.path ??
//         (location.state && (location.state as any).file_url) ??
//         FALLBACK_LOCAL_PATH;

//       if (typeof fallbackPath === "string" && fallbackPath.startsWith("/mnt/")) {
//         // call API helper that accepts a server-local path (backend must support this endpoint/form field)
//         const blob = await downloadRedactedFileFromPath(fallbackPath, {
//           redact_emails: currentOptions.redact_emails,
//           redact_phones: currentOptions.redact_phones,
//           redact_names: currentOptions.redact_names,
//           redact_addresses: currentOptions.redact_addresses,
//           label_style: currentOptions.label_style,
//           custom_label: currentOptions.custom_label,
//         });
//         downloadBlob(blob, `redacted_local_file.pdf`);
//         return;
//       }

//       // final fallback: if backend already provided a download_url in location.state
//       const downloadUrl = (location.state as any)?.download_url;
//       if (downloadUrl) {
//         const apiBase = (await import("../api/redact")).API_BASE || "http://localhost:8000/api";
//         const fullUrl = downloadUrl.startsWith("http")
//           ? downloadUrl
//           : `${apiBase}${downloadUrl.startsWith("/") ? "" : "/"}${downloadUrl}`;
//         const res = await fetch(fullUrl);
//         if (!res.ok) throw new Error("Failed to fetch server redacted PDF");
//         const blob = await res.blob();
//         downloadBlob(blob, `redacted_download.pdf`);
//         return;
//       }

//       alert("No uploaded file available for download. Re-upload in PDF mode and try again.");
//     } catch (err: any) {
//       console.error("Download error:", err);
//       alert(err?.message || "Download failed. See console.");
//     }
//   }

//   return (
//     <div className="results-container">
//       <h1 className="results-title">Redaction Results</h1>

//       {/* ------------------------- Tabs ------------------------- */}
//       <div className="tabs">
//         <button
//           className={activeTab === "original" ? "tab active" : "tab"}
//           onClick={() => setActiveTab("original")}
//         >
//           Original
//         </button>

//         <button
//           className={activeTab === "redacted" ? "tab active" : "tab"}
//           onClick={() => setActiveTab("redacted")}
//         >
//           Redacted
//         </button>

//         <button
//           className={activeTab === "summary" ? "tab active" : "tab"}
//           onClick={() => setActiveTab("summary")}
//         >
//           Summary
//         </button>

//         {/* Show FILE tab only if file preview URL exists */}
//         {file?.url && (
//           <button
//             className={activeTab === "file" ? "tab active" : "tab"}
//             onClick={() => setActiveTab("file")}
//           >
//             File Preview
//           </button>
//         )}
//       </div>

//       {/* ------------------------- Content ------------------------- */}
//       <div className="results-box">
//         {/* ORIGINAL */}
//         {activeTab === "original" && (
//           <pre className="text-box">{original_text}</pre>
//         )}

//         {/* REDACTED */}
//         {activeTab === "redacted" && (
//           <pre className="text-box">{redacted_text}</pre>
//         )}

//         {/* SUMMARY */}
//         {activeTab === "summary" && (
//           <div className="summary-box">
//             <h3>Summary of Redaction</h3>

//             <h4>Counts</h4>
//             <ul>
//               {Object.entries((summary && summary.counts) || {}).map(
//                 ([key, value]) => (
//                   <li key={key}>
//                     <strong>{key}</strong>: {value as any}
//                   </li>
//                 )
//               )}
//             </ul>

//             <h4>Redacted Items</h4>
//             <ul>
//               {(summary && summary.items ? summary.items : []).map(
//                 (item: any, index: number) => (
//                   <li key={index}>
//                     <strong>{item.type}</strong>: {item.original} →{" "}
//                     <span className="label">{item.label}</span>
//                   </li>
//                 )
//               )}
//             </ul>
//           </div>
//         )}

//         {/* FILE PREVIEW */}
//         {activeTab === "file" && file?.url && (
//           <div className="file-preview">
//             <h3>Uploaded File Preview</h3>

//             {file.type === "application/pdf" ? (
//               <iframe
//                 src={file.url}
//                 width="100%"
//                 height="500px"
//                 title="PDF Preview"
//               ></iframe>
//             ) : (
//               <img src={file.url} alt="Uploaded" className="preview-image" />
//             )}

//             {/* Download button shown under preview */}
//             <div style={{ marginTop: 12 }}>
//               <button className="download-btn" onClick={handleDownloadRedactedPDF}>
//                 Download Redacted PDF
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       <div style={{ marginTop: 16 }}>
//         {/* If file exists but preview tab not active (or no preview), still show Download button */}
//         {!file?.url && file && (
//           <button className="download-btn" onClick={handleDownloadRedactedPDF}>
//             Download Redacted PDF
//           </button>
//         )}
//       </div>

//       <button className="back-btn" onClick={() => navigate("/")}>
//         Back
//       </button>
//     </div>
//   );
// }

// src/pages/ResultsPage.tsx
// import React, { useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   downloadRedactedFile,
//   downloadRedactedFileFromPath,
// } from "../api/redact"; // assuming these functions exist in src/api/redact.ts

// const FALLBACK_LOCAL_PATH = "/mnt/data/Screenshot 2025-11-20 at 9.00.47 PM.png";

// export default function ResultsPage() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const {
//     original_text = "No original text received.",
//     redacted_text = "No redacted text received.",
//     summary = { counts: {}, items: [] },
//     file = null,
//     options: passedOptions = null,
//     labelStyle: passedLabelStyle = null,
//     customLabel: passedCustomLabel = null,
//   } = (location.state as any) || {};

//   const [activeTab, setActiveTab] = useState<"original" | "redacted" | "summary" | "file">("original");

//   const currentOptions = {
//     redact_emails: passedOptions?.emails ?? passedOptions?.redact_emails ?? true,
//     redact_phones: passedOptions?.phones ?? passedOptions?.redact_phones ?? true,
//     redact_names: passedOptions?.names ?? passedOptions?.redact_names ?? false,
//     redact_addresses: passedOptions?.addresses ?? passedOptions?.redact_addresses ?? false,
//     label_style: passedLabelStyle ?? (passedOptions?.label_style ?? "typed"),
//     custom_label: passedCustomLabel ?? passedOptions?.custom_label ?? null,
//   };

//   // Helper to trigger browser download from blob
//   function downloadBlob(blob: Blob, filename = "redacted_file.pdf") {
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = filename;
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//     URL.revokeObjectURL(url);
//   }

//   // Download handler: tries (1) original File object -> backend, (2) server-local path fallback
//   async function handleDownloadRedactedPDF() {
//     try {
//       const originalFile: File | undefined = file?.originFile ?? file?.fileObject ?? null;

//       if (originalFile) {
//         const blob = await downloadRedactedFile(originalFile, {
//           redact_emails: currentOptions.redact_emails,
//           redact_phones: currentOptions.redact_phones,
//           redact_names: currentOptions.redact_names,
//           redact_addresses: currentOptions.redact_addresses,
//           label_style: currentOptions.label_style,
//           custom_label: currentOptions.custom_label,
//         });
//         downloadBlob(blob, `redacted_${originalFile.name || "file"}.pdf`);
//         return;
//       }

//       const fallbackPath =
//         file?.url ??
//         file?.path ??
//         (location.state && (location.state as any).file_url) ??
//         FALLBACK_LOCAL_PATH;

//       if (typeof fallbackPath === "string" && fallbackPath.startsWith("/mnt/")) {
//         // Ensure the backend handles this correctly.
//         const blob = await downloadRedactedFileFromPath(fallbackPath, {
//           redact_emails: currentOptions.redact_emails,
//           redact_phones: currentOptions.redact_phones,
//           redact_names: currentOptions.redact_names,
//           redact_addresses: currentOptions.redact_addresses,
//           label_style: currentOptions.label_style,
//           custom_label: currentOptions.custom_label,
//         });
//         downloadBlob(blob, `redacted_local_file.pdf`);
//         return;
//       }

//       const downloadUrl = (location.state as any)?.download_url;
//       if (downloadUrl) {
//         const apiBase = (await import("../api/redact")).API_BASE || "http://localhost:8000/api";
//         const fullUrl = downloadUrl.startsWith("http")
//           ? downloadUrl
//           : `${apiBase}${downloadUrl.startsWith("/") ? "" : "/"}${downloadUrl}`;
//         const res = await fetch(fullUrl);
//         if (!res.ok) throw new Error("Failed to fetch server redacted PDF");
//         const blob = await res.blob();
//         downloadBlob(blob, `redacted_download.pdf`);
//         return;
//       }

//       alert("No uploaded file available for download. Re-upload in PDF mode and try again.");
//     } catch (err: any) {
//       console.error("Download error:", err);
//       alert(err?.message || "Download failed. See console.");
//     }
//   }

//   return (
//     <div className="results-container">
//       <h1 className="results-title">Redaction Results</h1>

//       <div className="tabs">
//         <button
//           className={activeTab === "original" ? "tab active" : "tab"}
//           onClick={() => setActiveTab("original")}
//         >
//           Original
//         </button>

//         <button
//           className={activeTab === "redacted" ? "tab active" : "tab"}
//           onClick={() => setActiveTab("redacted")}
//         >
//           Redacted
//         </button>

//         <button
//           className={activeTab === "summary" ? "tab active" : "tab"}
//           onClick={() => setActiveTab("summary")}
//         >
//           Summary
//         </button>

//         {file?.url && (
//           <button
//             className={activeTab === "file" ? "tab active" : "tab"}
//             onClick={() => setActiveTab("file")}
//           >
//             File Preview
//           </button>
//         )}
//       </div>

//       <div className="results-box">
//         {activeTab === "original" && <pre className="text-box">{original_text}</pre>}
//         {activeTab === "redacted" && <pre className="text-box">{redacted_text}</pre>}

//         {activeTab === "summary" && (
//           <div className="summary-box">
//             <h3>Summary of Redaction</h3>
//             <h4>Counts</h4>
//             <ul>
//               {Object.entries((summary && summary.counts) || {}).map(([key, value]) => (
//                 <li key={key}>
//                   <strong>{key}</strong>: {value as any}
//                 </li>
//               ))}
//             </ul>

//             <h4>Redacted Items</h4>
//             <ul>
//               {(summary && summary.items ? summary.items : []).map((item: any, index: number) => (
//                 <li key={index}>
//                   <strong>{item.type}</strong>: {item.original} →{" "}
//                   <span className="label">{item.label}</span>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {activeTab === "file" && file?.url && (
//           <div className="file-preview">
//             <h3>Uploaded File Preview</h3>
//             {file.type === "application/pdf" ? (
//               <iframe
//                 src={file.url}
//                 width="100%"
//                 height="500px"
//                 title="PDF Preview"
//               ></iframe>
//             ) : (
//               <img src={file.url} alt="Uploaded" className="preview-image" />
//             )}

//             <div style={{ marginTop: 12 }}>
//               <button className="download-btn" onClick={handleDownloadRedactedPDF}>
//                 Download Redacted PDF
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       <div style={{ marginTop: 16 }}>
//         {!file?.url && file && (
//           <button className="download-btn" onClick={handleDownloadRedactedPDF}>
//             Download Redacted PDF
//           </button>
//         )}
//       </div>

//       <button className="back-btn" onClick={() => navigate("/")}>
//         Back
//       </button>
//     </div>
//   );
// }


// src/pages/ResultsPage.tsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  downloadRedactedFile,
  downloadRedactedFileFromPath,
} from "../api/redact";

const FALLBACK_LOCAL_PATH = "/mnt/data/Screenshot 2025-11-20 at 9.00.47 PM.png";

export default function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    original_text = "No original text received.",
    redacted_text = "No redacted text received.",
    summary = { counts: {}, items: [] },
    file = null,
    options: passedOptions = null,
    labelStyle: passedLabelStyle = null,
    customLabel: passedCustomLabel = null,
  } = (location.state as any) || {};

  const [activeTab, setActiveTab] = useState<
    "original" | "redacted" | "summary" | "file"
  >("original");

  const currentOptions = {
    redact_emails: passedOptions?.emails ?? passedOptions?.redact_emails ?? true,
    redact_phones: passedOptions?.phones ?? passedOptions?.redact_phones ?? true,
    redact_names: passedOptions?.names ?? passedOptions?.redact_names ?? false,
    redact_addresses:
      passedOptions?.addresses ?? passedOptions?.redact_addresses ?? false,
    label_style: passedLabelStyle ?? (passedOptions?.label_style ?? "typed"),
    custom_label: passedCustomLabel ?? passedOptions?.custom_label ?? null,
  };

  // Helper to trigger browser download from blob
  function downloadBlob(blob: Blob, filename = "redacted_file.pdf") {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Download handler: tries (1) original File object -> backend, (2) server-local path fallback, (3) download_url
  async function handleDownloadRedactedPDF() {
    try {
      const originalFile: File | undefined =
        file?.originFile ?? file?.fileObject ?? null;

      if (originalFile) {
        const blob = await downloadRedactedFile(originalFile, {
          redact_emails: currentOptions.redact_emails,
          redact_phones: currentOptions.redact_phones,
          redact_names: currentOptions.redact_names,
          redact_addresses: currentOptions.redact_addresses,
          label_style: currentOptions.label_style,
          custom_label: currentOptions.custom_label,
        });
        downloadBlob(blob, `redacted_${originalFile.name || "file"}.pdf`);
        return;
      }

      const fallbackPath =
        file?.url ??
        file?.path ??
        (location.state && (location.state as any).file_url) ??
        FALLBACK_LOCAL_PATH;

      if (typeof fallbackPath === "string" && fallbackPath.startsWith("/mnt/")) {
        // call backend helper that accepts a server-local path (backend must support this endpoint)
        const blob = await downloadRedactedFileFromPath(fallbackPath, {
          redact_emails: currentOptions.redact_emails,
          redact_phones: currentOptions.redact_phones,
          redact_names: currentOptions.redact_names,
          redact_addresses: currentOptions.redact_addresses,
          label_style: currentOptions.label_style,
          custom_label: currentOptions.custom_label,
        });
        downloadBlob(blob, `redacted_local_file.pdf`);
        return;
      }

      // final fallback: if backend provided a download_url in location.state
      const downloadUrl = (location.state as any)?.download_url;
      if (downloadUrl) {
        // import API_BASE from api module to use as base for relative URLs
        const apiModule = await import("../api/redact");
        const apiBase = apiModule.API_BASE || "http://localhost:8000/api";

        // build absolute URL robustly (handles absolute or relative downloadUrl)
        const fullUrl = downloadUrl.startsWith("http")
          ? downloadUrl
          : new URL(downloadUrl, apiBase).toString();

        const res = await fetch(fullUrl);
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(
            `Failed to fetch server redacted PDF: ${res.status} ${res.statusText} ${text}`
          );
        }

        const blob = await res.blob();

        // Try to read filename from Content-Disposition header, fallback to sensible defaults
        const contentDisposition = res.headers.get("content-disposition") || "";
        let filename = "redacted_download.pdf";

        // Try to parse filename*=UTF-8''... or filename="..."
        const filenameMatch =
          /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/.exec(
            contentDisposition
          );
        if (filenameMatch) {
          // prefer RFC5987 encoded filename (first capture) otherwise second
          const rawName = decodeURIComponent(
            (filenameMatch[1] || filenameMatch[2] || filename).replace(
              /(^"|"$)/g,
              ""
            )
          );
          filename = rawName;
        } else if ((location.state as any)?.file?.name) {
          // preserve original uploaded filename if available
          filename = `redacted_${(location.state as any).file.name}`;
        }

        downloadBlob(blob, filename);
        return;
      }

      alert("No uploaded file available for download. Re-upload in PDF mode and try again.");
    } catch (err: any) {
      console.error("Download error:", err);
      alert(err?.message || "Download failed. See console.");
    }
  }

  return (
    <div className="results-container">
      <h1 className="results-title">Redaction Results</h1>

      <div className="tabs">
        <button
          className={activeTab === "original" ? "tab active" : "tab"}
          onClick={() => setActiveTab("original")}
        >
          Original
        </button>

        <button
          className={activeTab === "redacted" ? "tab active" : "tab"}
          onClick={() => setActiveTab("redacted")}
        >
          Redacted
        </button>

        <button
          className={activeTab === "summary" ? "tab active" : "tab"}
          onClick={() => setActiveTab("summary")}
        >
          Summary
        </button>

        {file?.url && (
          <button
            className={activeTab === "file" ? "tab active" : "tab"}
            onClick={() => setActiveTab("file")}
          >
            File Preview
          </button>
        )}
      </div>

      <div className="results-box">
        {activeTab === "original" && (
          <pre className="text-box">{original_text}</pre>
        )}
        {activeTab === "redacted" && (
          <pre className="text-box">{redacted_text}</pre>
        )}

        {activeTab === "summary" && (
          <div className="summary-box">
            <h3>Summary of Redaction</h3>
            <h4>Counts</h4>
            <ul>
              {Object.entries((summary && summary.counts) || {}).map(
                ([key, value]) => (
                  <li key={key}>
                    <strong>{key}</strong>: {value as any}
                  </li>
                )
              )}
            </ul>

            <h4>Redacted Items</h4>
            <ul>
              {(summary && summary.items ? summary.items : []).map(
                (item: any, index: number) => (
                  <li key={index}>
                    <strong>{item.type}</strong>: {item.original} →{" "}
                    <span className="label">{item.label}</span>
                  </li>
                )
              )}
            </ul>
          </div>
        )}

        {activeTab === "file" && file?.url && (
          <div className="file-preview">
            <h3>Uploaded File Preview</h3>
            {file.type === "application/pdf" ? (
              <iframe
                src={file.url}
                width="100%"
                height="500px"
                title="PDF Preview"
              ></iframe>
            ) : (
              <img src={file.url} alt="Uploaded" className="preview-image" />
            )}

            <div style={{ marginTop: 12 }}>
              <button className="download-btn" onClick={handleDownloadRedactedPDF}>
                Download Redacted PDF
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        {!file?.url && file && (
          <button className="download-btn" onClick={handleDownloadRedactedPDF}>
            Download Redacted PDF
          </button>
        )}
      </div>

      <button className="back-btn" onClick={() => navigate("/")}>
        Back
      </button>
    </div>
  );
}
