import React, { useState } from "react";
import "../styles/resultsPage.css";
import { useNavigate, useLocation } from "react-router-dom";
import { downloadRedactedFileByUrl } from "../api/redact";

export default function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    original_text = "No original text received.",
    redacted_text = "No redacted text received.",
    summary = { counts: {}, items: [] },
    file = null,
    download_url = null,
    // These are mostly for future display / debugging if needed
    options = {
      redact_emails: true,
      redact_phones: true,
      redact_names: false,
      redact_addresses: false,
    },
    labelStyle = "typed",
    customLabel = null,
  } = (location.state as any) || {};

  const [activeTab, setActiveTab] = useState<"original" | "redacted" | "summary" | "file">(
    "original"
  );
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    try {
      if (!download_url) {
        alert("No download URL available. Try re-running the redaction.");
        return;
      }

      setDownloading(true);

      // This calls the backend's /api/download/... endpoint via the helper
      const blob = await downloadRedactedFileByUrl(download_url);

      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = file?.name ? `redacted_${file.name}` : "redacted_output.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download redacted PDF. Check backend logs.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleCopySummary() {
    const lines = [
      "Redaction Summary",
      `Counts: ${Object.entries(summary.counts)
        .map(([k, v]) => `${k}:${v}`)
        .join(" • ")}`,
      "",
      "Items:",
      ...summary.items.map(
        (it: any, i: number) => `${i + 1}. ${it.type}: "${it.original}" → ${it.label}`
      ),
    ];
    const text = lines.join("\n");
    try {
      await navigator.clipboard.writeText(text);
      alert("Summary copied to clipboard");
    } catch {
      alert("Copy failed — your browser might block clipboard access.");
    }
  }

  return (
    <div className="results-root">
      <div className="results-card">
        <h1 className="results-heading">Redaction Results</h1>

        <div className="tabs-row" role="tablist" aria-label="Results tabs">
          <button
            role="tab"
            aria-selected={activeTab === "original"}
            className={`tab ${activeTab === "original" ? "active" : ""}`}
            onClick={() => setActiveTab("original")}
          >
            Original
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "redacted"}
            className={`tab ${activeTab === "redacted" ? "active" : ""}`}
            onClick={() => setActiveTab("redacted")}
          >
            Redacted
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "summary"}
            className={`tab ${activeTab === "summary" ? "active" : ""}`}
            onClick={() => setActiveTab("summary")}
          >
            Summary
          </button>
          {file?.url && (
            <button
              role="tab"
              aria-selected={activeTab === "file"}
              className={`tab ${activeTab === "file" ? "active" : ""}`}
              onClick={() => setActiveTab("file")}
            >
              File Preview
            </button>
          )}
        </div>

        <div className="content-row">
          <div className="main-column">
            {activeTab === "original" && (
              <pre className="text-box" aria-label="Original text">
                {original_text}
              </pre>
            )}

            {activeTab === "redacted" && (
              <pre className="text-box" aria-label="Redacted text">
                {redacted_text}
              </pre>
            )}

            {activeTab === "summary" && (
              <div className="summary-view">
                <h3>Summary of Redaction</h3>

                <div className="stats-row">
                  {["NAME", "EMAIL", "PHONE", "ADDRESS"].map((k) => (
                    <div key={k} className="stat-card" aria-hidden>
                      <div className="stat-title">{k}</div>
                      <div className="stat-value">{summary.counts[k] ?? 0}</div>
                    </div>
                  ))}
                </div>

                <div className="summary-list">
                  <h4>Redacted Items</h4>
                  <ul>
                    {summary.items.map((item: any, idx: number) => (
                      <li key={idx} className="summary-item">
                        <div className="item-left">
                          <span className="item-type">{item.type}</span>
                          <code className="item-original"> {item.original}</code>
                        </div>
                        <div className="item-right">
                          <span className="item-label">{item.label}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "file" && file?.url && (
              <div className="file-preview">
                <h3>Uploaded File Preview</h3>
                {file.type === "application/pdf" ? (
                  <iframe src={file.url} title="PDF preview" className="pdf-iframe" />
                ) : (
                  <img src={file.url} alt="uploaded preview" className="preview-image" />
                )}
              </div>
            )}

            <div className="actions-row">
              <button className="btn btn-secondary" onClick={() => navigate("/")}>
                Back
              </button>

              <div style={{ flex: 1 }} />

              <button className="btn btn-ghost" onClick={handleCopySummary}>
                Copy Summary
              </button>

              <button
                className="btn btn-primary"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? "Downloading…" : "Download Redacted PDF"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

