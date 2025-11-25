const API_BASE = "http://localhost:8000/api";

export async function redactText(data: any) {
  const res = await fetch(`${API_BASE}/redact-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Redaction failed: ${res.status} ${res.statusText} ${text}`);
  }
  return await res.json();
}

export async function redactFile(
  file: File,
  options: {
    redact_emails: boolean;
    redact_phones: boolean;
    redact_names: boolean;
    redact_addresses: boolean;
    label_style: string;
    custom_label?: string | null;
  }
) {
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

  return await res.json();
}

export async function downloadRedactedFile(
  file: File,
  options: {
    redact_emails: boolean;
    redact_phones: boolean;
    redact_names: boolean;
    redact_addresses: boolean;
    label_style: string;
    custom_label?: string | null;
  }
) {
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

  const res = await fetch(`${API_BASE}/redact-file?download=1`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Download failed: ${res.status} ${res.statusText} ${text}`);
  }

  return await res.blob();
}

export async function downloadRedactedFileFromPath(
  path: string,
  options: {
    redact_emails: boolean;
    redact_phones: boolean;
    redact_names: boolean;
    redact_addresses: boolean;
    label_style: string;
    custom_label?: string | null;
  }
) {
  try {
    const res = await fetch(`${API_BASE}/redact-from-path?download=1`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path, options }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Download failed: ${res.status} ${res.statusText} ${text}`);
    }
    return await res.blob();
  } catch (error) {
    console.error("Error downloading redacted file from path:", error);
    throw new Error("Failed to fetch redacted file from path. See console for details.");
  }
}
