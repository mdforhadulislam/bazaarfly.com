export type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  bytes: number;
  width?: number;
  height?: number;
  format?: string;
};

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function uploadImageToCloudinarySigned(
  file: File,
  opts?: {
    folder?: string;
    onProgress?: (pct: number) => void;
  }
): Promise<CloudinaryUploadResult> {
  // 1) Get signature
  const sigRes = await fetch("/api/cloudinary/signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ folder: opts?.folder || "bazaarfly/products" }),
  });

  const sigJson = await safeJson(sigRes);
  if (!sigRes.ok) throw new Error(sigJson?.message || "Failed to get signature");

  const { timestamp, signature, folder, cloudName, apiKey } = sigJson.data;

  // 2) Upload direct to Cloudinary
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);
  form.append("folder", folder);

  return await new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadUrl);

    xhr.upload.onprogress = (evt) => {
      if (!evt.lengthComputable) return;
      const pct = Math.round((evt.loaded / evt.total) * 100);
      opts?.onProgress?.(pct);
    };

    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(json);
        else reject(new Error(json?.error?.message || "Cloudinary upload failed"));
      } catch {
        reject(new Error("Invalid Cloudinary response"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(form);
  });
}
