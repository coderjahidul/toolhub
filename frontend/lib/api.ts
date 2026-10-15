import { getToken } from "@/lib/auth";
import { apiUrl } from "@/lib/format";

export class UploadError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "UploadError";
  }
}

export type UploadResult = {
  blob: Blob;
  filename: string;
  dailyLimit: number | null;
  dailyRemaining: number | null;
};

function filenameFromDisposition(header: string | null, fallback: string): string {
  if (!header) {
    return fallback;
  }

  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (encoded?.[1]) {
    try {
      return decodeURIComponent(encoded[1]);
    } catch {
      return fallback;
    }
  }

  const quoted = /filename="([^"]+)"/i.exec(header);
  if (quoted?.[1]) {
    return quoted[1];
  }

  return fallback;
}

function messageFromPayload(text: string, status: number): string {
  if (status === 413) {
    return "That file is too large for the server.";
  }

  try {
    const body = JSON.parse(text) as {
      message?: string;
      errors?: Record<string, string[]>;
    };
    const firstError = body.errors ? Object.values(body.errors)[0]?.[0] : undefined;
    if (firstError) {
      return firstError;
    }
    if (body.message) {
      return body.message;
    }
  } catch {
    return status === 429
      ? "Daily free limit reached (20 operations)."
      : "The file could not be processed.";
  }

  return "The file could not be processed.";
}

export function uploadForm(
  path: string,
  form: FormData,
  onProgress: (ratio: number) => void,
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", apiUrl(path));
    xhr.responseType = "blob";
    const token = getToken();
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        onProgress(event.loaded / event.total);
      }
    };

    xhr.upload.onload = () => {
      onProgress(1);
    };

    xhr.onload = () => {
      const blob = xhr.response instanceof Blob ? xhr.response : new Blob();

      if (xhr.status >= 200 && xhr.status < 300) {
        const limit = xhr.getResponseHeader("X-Daily-Limit");
        const remaining = xhr.getResponseHeader("X-Daily-Remaining");
        resolve({
          blob,
          filename: filenameFromDisposition(xhr.getResponseHeader("Content-Disposition"), "download"),
          dailyLimit: limit ? Number(limit) : null,
          dailyRemaining: remaining ? Number(remaining) : null,
        });
        return;
      }

      blob.text().then((text) => {
        reject(new UploadError(messageFromPayload(text, xhr.status), xhr.status));
      });
    };

    xhr.onerror = () => {
      reject(new UploadError("Network error. Start the Laravel API and try again.", 0));
    };

    xhr.send(form);
  });
}
