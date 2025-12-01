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
          ...response, 
          file: {
            name: selectedFile.name,
            size: selectedFile.size,
            type: selectedFile.type,
            url: previewUrl, 
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

      {/* TEXT INPUT */}
      {mode === "text" && (
        <textarea
          className="text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your text here..."
        />
      )}

      {/* PDF UPLOADER */}
      {mode === "pdf" && (
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
      )}

      {/* Options */}
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

      {/* Label style */}
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
          Typed ([EMAIL_1])
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

      <button className="redact-btn" onClick={onRedact} disabled={isSubmitting}>
        {isSubmitting ? "Processing…" : "REDACT"}
      </button>
    </div>
  );
}





