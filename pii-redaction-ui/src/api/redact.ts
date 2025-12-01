const API_BASE = "http://localhost:8000/api";
export type LabelStyle = "typed" | "blackbox" | "custom";
export interface RedactionItem {
  type: string;
  original: string;
  label: string;
  start: number;
  end: number;
}
export interface RedactionSummary {
  counts: Record<string, number>;
  items: RedactionItem[];
}

export interface RedactionResponse {
  message?: string | null;
  download_url?: string | null;
  original_text: string;
  redacted_text: string;
  summary: RedactionSummary;
}

export interface RedactOptions {
  redact_emails: boolean;
  redact_phones: boolean;
  redact_names: boolean;
  redact_addresses: boolean;
  label_style: LabelStyle;
  custom_label?: string | null;
}
export async function redactText(payload: {
  text: string;
  redact_emails: boolean;
  redact_phones: boolean;
  redact_names: boolean;
  redact_addresses: boolean;
  label_style: LabelStyle;
  custom_label?: string | null;
}): Promise<RedactionResponse> {
  const res = await fetch(`${API_BASE}/redact-text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Text redaction failed: ${res.status} ${res.statusText} ${text}`);
  }

  const data = (await res.json()) as RedactionResponse;
  return data;
}
export async function redactFile(
  file: File,
  options: RedactOptions
): Promise<RedactionResponse> {
  const form = new FormData();
  form.append("file", file);

  form.append("redact_emails", String(options.redact_emails));
  form.append("redact_phones", String(options.redact_phones));
  form.append("redact_names", String(options.redact_names));
  form.append("redact_addresses", String(options.redact_addresses));
  form.append("label_style", options.label_style);

  if (options.custom_label) {
    form.append("custom_label", options.custom_label);
  }

  const res = await fetch(`${API_BASE}/redact-file`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`File redaction failed: ${res.status} ${res.statusText} ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(`Unexpected response type from /redact-file: ${contentType}`);
  }

  const data = (await res.json()) as RedactionResponse;
  return data;
}
export async function downloadRedactedFileByUrl(downloadUrl: string): Promise<Blob> {
  // If the backend sends a relative URL like "/api/download/xyz",
  // make sure we call the FastAPI server on port 8000, not Vite (5173).
  const url = downloadUrl.startsWith("http")
    ? downloadUrl
    : `http://localhost:8000${downloadUrl}`;

  const res = await fetch(url, {
    method: "GET",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Download failed: ${res.status} ${res.statusText} ${text}`);
  }

  return await res.blob();
}

